import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, ImageBackground,PermissionsAndroid, Platform } from 'react-native';
import DotHorizontalList from '../../components/molecules/DotHorizontalList';
import { useGetAppThemeDataMutation } from '../../apiServices/appTheme/AppThemeApi';
import { useSelector, useDispatch } from 'react-redux'
import { setPrimaryThemeColor, setSecondaryThemeColor, setIcon, setIconDrawer, setTernaryThemeColor, setOptLogin, setPasswordLogin, setButtonThemeColor, setColorShades, setKycOptions,setIsOnlineVeriification,setSocials, setWebsite, setCustomerSupportMail, setCustomerSupportMobile, setExtraFeatures } from '../../../redux/slices/appThemeSlice';
import { setManualApproval, setAutoApproval, setRegistrationRequired } from '../../../redux/slices/appUserSlice';
import { setPointSharing } from '../../../redux/slices/pointSharingSlice';
import { useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAppUserType, setAppUserName, setAppUserId, setUserData, setId} from '../../../redux/slices/appUserDataSlice';
import messaging from '@react-native-firebase/messaging';    
import { setFcmToken } from '../../../redux/slices/fcmTokenSlice';
import { setAppUsers,setAppUsersData } from '../../../redux/slices/appUserSlice';
import { useGetAppUsersDataMutation } from '../../apiServices/appUsers/AppUsersApi';
import Geolocation from '@react-native-community/geolocation';
import InternetModal from '../../components/modals/InternetModal';
import ErrorModal from '../../components/modals/ErrorModal';


const Splash = ({ navigation }) => {
  const dispatch = useDispatch()
  const focused = useIsFocused()
  const [connected, setConnected] = useState(true)
  const [isSlowInternet, setIsSlowInternet] = useState(false)
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [isAlreadyIntroduced, setIsAlreadyIntroduced] = useState(null);
  const [gotLoginData, setGotLoginData] = useState()
  const isConnected = useSelector(state => state.internet.isConnected);
  


  const gifUri = Image.resolveAssetSource(require('../../../assets/gif/ozoStars.gif')).uri;
  // generating functions and constants for API use cases---------------------
  const [
    getAppTheme,
    {
      data: getAppThemeData,
      error: getAppThemeError,
      isLoading: getAppThemeIsLoading,
      isError: getAppThemeIsError,
    }
  ] = useGetAppThemeDataMutation();
  const [
    getUsers,
    {
      data: getUsersData,
      error: getUsersError,
      isLoading: getUsersDataIsLoading,
      isError: getUsersDataIsError,
    },
  ] = useGetAppUsersDataMutation();

  useEffect(()=>{
    getUsers();
    getAppTheme("ozone")
    const checkToken = async () => {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
         console.log("fcmToken",fcmToken);
         dispatch(setFcmToken(fcmToken))
      } 
     }
     checkToken()
    const requestLocationPermission = async () => {
      try {
        if(Platform.OS==="android")
        {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Geolocation Permission',
              message: 'Can we access your location?',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          console.log('granted', granted);
          if (granted === 'granted') {
            console.log('You can use Geolocation');
            return true;
          } else {
            console.log('You cannot use Geolocation');
            return false;
          }
        }
        else{
          Geolocation.requestAuthorization()
        }
        
      } catch (err) {
        return false;
      }
    };
    requestLocationPermission()
    dispatch({ type: 'NETWORK_REQUEST' });
  },[])

  useEffect(()=>{
    if(isConnected)
    {
      console.log("internet status",isConnected)
      setConnected(isConnected.isConnected)
      setIsSlowInternet(isConnected.isInternetReachable ? false : true)
      console.log("is connected",isConnected.isInternetReachable)
    }

  },[isConnected])
  
  useEffect(() => {
    if (getUsersData) {
      // console.log("type of users",getUsersData?.body);
      const appUsers = getUsersData?.body.map((item,index)=>{
        return item.name
      })
      const appUsersData = getUsersData?.body.map((item,index)=>{
        return {"name":item.name,
      "id":item.user_type_id
      }
      })
      // console.log("appUsers",appUsers,appUsersData)
      dispatch(setAppUsers(appUsers))
      dispatch(setAppUsersData(appUsersData))

    } else if(getUsersError) {
      console.log("getUsersError",getUsersError);
    }
  }, [getUsersData, getUsersError]);

 
  
 
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('loginData');
        const parsedJsonValue = JSON.parse(jsonValue)

        const value = await AsyncStorage.getItem('isAlreadyIntroduced');

      if (value != null && jsonValue!=null ) {
        // value previously stored
        console.log("asynch value",value,jsonValue)
        try{
          console.log("Trying to dispatch",parsedJsonValue.user_type_id)
          dispatch(setAppUserId(parsedJsonValue.user_type_id))
          dispatch(setAppUserName(parsedJsonValue.name))
          dispatch(setAppUserType(parsedJsonValue.user_type))
          dispatch(setUserData(parsedJsonValue))
          dispatch(setId(parsedJsonValue.id))
          
          navigation.navigate('Dashboard');

         
        }
        catch(e)
        {
          console.log("Error in dispatch", e)
        }

          // console.log("isAlreadyIntroduced",isAlreadyIntroduced)
        }
        else 
        {
          if(value==="Yes")
          {
            navigation.navigate('SelectUser');

          }
          else{
            navigation.navigate('Introduction')
          }
          // console.log("isAlreadyIntroduced",isAlreadyIntroduced,gotLoginData)
    
          
           
       
    
        }

      }
        
       
        
        
       catch (e) {
        console.log("Error is reading loginData",e)
      }
    };
   
  
  
    useEffect(() => {
      // Dispatch the NETWORK_REQUEST action on component mount
      dispatch({ type: 'NETWORK_REQUEST' });
    }, []);
  
  
  // calling API to fetch themes for the app
  

  // fetching data and checking for errors from the API-----------------------
  useEffect(() => {
    if (getAppThemeData) {
      console.log("getAppThemeData", JSON.stringify(getAppThemeData?.body))
      dispatch(setPrimaryThemeColor(getAppThemeData?.body?.theme?.color_shades["600"]))
      dispatch(setSecondaryThemeColor(getAppThemeData?.body?.theme?.color_shades["400"]))
      dispatch(setTernaryThemeColor(getAppThemeData?.body?.theme?.color_shades["700"]))
      dispatch(setIcon(getAppThemeData?.body?.logo[0]))
      dispatch(setIconDrawer(getAppThemeData?.body?.logo[0]))
      dispatch(setOptLogin(getAppThemeData?.body?.login_options?.Otp.users))
      dispatch(setPasswordLogin(getAppThemeData?.body?.login_options?.Password.users))
      dispatch(setButtonThemeColor(getAppThemeData?.body?.theme?.color_shades["700"]))
      dispatch(setManualApproval(getAppThemeData?.body?.approval_flow_options?.Manual.users))
      dispatch(setAutoApproval(getAppThemeData?.body?.approval_flow_options?.AutoApproval.users))
      dispatch(setRegistrationRequired(getAppThemeData?.body?.registration_options?.Registration?.users))
      dispatch(setColorShades(getAppThemeData?.body?.theme.color_shades))
      dispatch(setKycOptions(getAppThemeData?.body?.kyc_options))
      dispatch(setPointSharing(getAppThemeData?.body?.points_sharing))
      dispatch(setSocials(getAppThemeData?.body?.socials))
      dispatch(setWebsite(getAppThemeData?.body?.website))
      dispatch(setCustomerSupportMail(getAppThemeData?.body?.customer_support_email))
      dispatch(setCustomerSupportMobile(getAppThemeData?.body?.customer_support_mobile))
      dispatch(setExtraFeatures(getAppThemeData?.body?.addon_features))
      if(getAppThemeData?.body?.addon_features?.kyc_online_verification!==undefined)
      {
        if(getAppThemeData?.body?.addon_features?.kyc_online_verification)
        {
          dispatch(setIsOnlineVeriification())
        }
      }
      console.log("isAlreadyIntro", isAlreadyIntroduced)
      getData()
    }
    else if(getAppThemeError){
      console.log("getAppThemeIsError", getAppThemeIsError)
      console.log("getAppThemeError", getAppThemeError)
    }
   
  }, [getAppThemeData,getAppThemeError])

  const modalClose = () => {
    setError(false);
  };
  const NoInternetComp = ()=>{
    return (
      <View style={{alignItems:'center',justifyContent:'center',width:'90%'}}>
        <Text style={{color:'black'}}>No Internet Connection</Text>
          <Text style={{color:'black'}}>Please check your internet connection and try again.</Text>
      </View>
    )
  }
  const SlowInternetComp  = ()=>{
    return (
      <View style={{alignItems:'center',justifyContent:'center',width:'90%'}}>
        <Text style={{color:'black'}}>Slow Internet Connection Detected</Text>
          <Text style={{color:'black'}}>Please check your internet connection. </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground resizeMode='stretch' style={{ flex: 1, height: '100%', width: '100%', }} source={require('../../../assets/images/splash2.png')}>
      {!connected &&  <InternetModal comp = {NoInternetComp} />}
      {isSlowInternet && <InternetModal comp = {SlowInternetComp} /> }
      
      {error &&  <ErrorModal
          modalClose={modalClose}

          message={message}
          openModal={error}></ErrorModal>}
        {/* <Image  style={{ width: 200, height: 200,  }}  source={require('../../../assets/gif/ozonegif.gif')} /> */}
        {/* <FastImage
          style={{ width: 250, height: 250, marginTop:'auto',alignSelf:'center' }}
          source={{
            uri: gifUri, // Update the path to your GIF
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}
        /> */}

      </ImageBackground>

    </View>


  );
}

const styles = StyleSheet.create({})

export default Splash;