import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, ImageBackground,PermissionsAndroid, Platform,BackHandler,Alert,Linking } from 'react-native';
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
import { user_type_option } from '../../utils/usertTypeOption';
import { useCheckSalesBoosterMutation } from '../../apiServices/salesBooster/SalesBoosterApi';
import { setLocation } from '../../../redux/slices/userLocationSlice';
import {GoogleMapsKey} from "@env"
import { request, PERMISSIONS } from 'react-native-permissions';
import VersionCheck from 'react-native-version-check';
import { useCheckVersionSupportMutation } from '../../apiServices/minVersion/minVersionApi';


const Splash = ({ navigation }) => {
  const dispatch = useDispatch()
  const focused = useIsFocused()
  const [connected, setConnected] = useState(true)
  const [isSlowInternet, setIsSlowInternet] = useState(false)
  const [listUsers, setListUsers] = useState([]);
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [isAlreadyIntroduced, setIsAlreadyIntroduced] = useState(null);
  const [gotLoginData, setGotLoginData] = useState()
  const isConnected = useSelector(state => state.internet.isConnected);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(null)

  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const status = await requestCameraPermission();
      console.log('Camera Permission Status:', status);
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking camera permission:', error);
    }
  };


  const requestCameraPermission = async () => {
    try {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      return result;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return 'denied';
    }
  };



  const gifUri = Image.resolveAssetSource(require('../../../assets/gif/ozoStars.gif')).uri;
  const registrationRequired = useSelector(state => state.appusers.registrationRequired)
  const manualApproval = useSelector(state => state.appusers.manualApproval)
  const otpLogin = useSelector(state => state.apptheme.otpLogin)

  // generating functions and constants for API use cases---------------------
  const [checkSalesBoosterFunc,{
    data:checkSalesBoosterData,
    error:checkSalesBoosterError,
    isLoading:checkSalesBoosterIsLoading,
    isError:checkSalesBoosterIsError
  }] = useCheckSalesBoosterMutation()

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


  
  const [
    getMinVersionSupportFunc,
    {
      data : getMinVersionSupportData,
      error:getMinVersionSupportError,
      isLoading:getMinVersionSupportIsLoading,
      isError:getMinVersionSupportIsError
    }
  ] = useCheckVersionSupportMutation()

  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        { text: 'Exit', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);
 
  useEffect(() => {

    let lat = ''
    let lon = ''

    const openSettings = () => {
      if (Platform.OS === 'android') {
        Linking.openSettings();
      } else {
        Linking.openURL('app-settings:');
      }
    };
    const enableLocation = () => {
      Alert.alert(
        'Enable Location Services',
        'Location services are disabled. Do you want to enable them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: openSettings },
        ],
      );
    };
    const intervalId= setInterval(() => {
      try{
        Geolocation.getCurrentPosition((res) => {
          setLocationEnabled(true)
          console.log("res", res)
          lat = res.coords.latitude
          lon = res.coords.longitude
          // getLocation(JSON.stringify(lat),JSON.stringify(lon))
          console.log("latlong", lat, lon)
          var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${res?.coords?.latitude},${res?.coords?.longitude}
              &location_type=ROOFTOP&result_type=street_address&key=${GoogleMapsKey}`
    
          fetch(url).then(response => response.json()).then(json => {
            // console.log("location address=>", JSON.stringify(json));
            const formattedAddress = json?.results[0]?.formatted_address
            const formattedAddressArray = formattedAddress?.split(',')
    
            let locationJson = {
    
              lat: json?.results[0]?.geometry?.location?.lat === undefined ? "N/A" : json?.results[0]?.geometry?.location?.lat,
              lon: json?.results[0]?.geometry?.location?.lng === undefined ? "N/A" : json?.results[0]?.geometry?.location?.lng,
              address: formattedAddress === undefined ? "N/A" : formattedAddress
    
            }
    
            const addressComponent = json?.results[0]?.address_components
            // console.log("addressComponent", addressComponent)
            for (let i = 0; i <= addressComponent.length; i++) {
              if (i === addressComponent.length) {
                dispatch(setLocation(locationJson))
    
              }
              else {
                if (addressComponent[i].types.includes("postal_code")) {
                  console.log("inside if")
    
                  console.log(addressComponent[i]?.long_name)
                  locationJson["postcode"] = addressComponent[i]?.long_name
                }
                else if (addressComponent[i]?.types.includes("country")) {
                  console.log(addressComponent[i]?.long_name)
    
                  locationJson["country"] = addressComponent[i]?.long_name
                }
                else if (addressComponent[i]?.types.includes("administrative_area_level_1")) {
                  console.log(addressComponent[i]?.long_name)
    
                  locationJson["state"] = addressComponent[i]?.long_name
                }
                else if (addressComponent[i]?.types.includes("administrative_area_level_3")) {
                  console.log(addressComponent[i]?.long_name)
    
                  locationJson["district"] = addressComponent[i]?.long_name
                }
                else if (addressComponent[i]?.types.includes("locality")) {
                  console.log(addressComponent[i]?.long_name)
    
                  locationJson["city"] = addressComponent[i]?.long_name
                }
              }
    
            }
    
    
            console.log("formattedAddressArray", locationJson)
    
          })
        },(error) => {
          setLocationEnabled(false)
          console.log("error", error)
          if (error.code === 1) {
            // Permission Denied
            Geolocation.requestAuthorization()
  
          } else if (error.code === 2) {
            // Position Unavailable
            enableLocation()
  
          } else {
            // Other errors
            Alert.alert(
              "Error",
              "An error occurred while fetching your location.",
              [
                { text: "OK", onPress: () => console.log("OK Pressed") }
              ],
              { cancelable: false }
            );
          }
        })
    
      }
      catch(e){
        console.log("error in fetching location",e)
      }
    }, 5000);
    
    return ()=> clearInterval(intervalId)
   
  }, [navigation])
  useEffect(()=>{
    getUsers();
    getAppTheme("tibcon")
    const currentVersion = VersionCheck.getCurrentVersion();
    console.log("currentVersion",currentVersion)
    getMinVersionSupportFunc(currentVersion)
    checkSalesBoosterFunc({token:"tokensadgfasgdasdfasggd"})
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

  useEffect(() => {
    // console.log("list user ki ==========>", isUserLoggedIn)
    if (user_type_option == "single") {
      isUserLoggedIn !== null && !isUserLoggedIn && checkRegistrationRequired(listUsers)
    }

  }, [listUsers?.[0]?.user_type, isUserLoggedIn])

  useEffect(()=>{
    if(isConnected)
    {
      console.log("internet status",isConnected)
      setConnected(isConnected.isConnected)
      setIsSlowInternet(isConnected.isInternetReachable ? false : true)
      console.log("is connected",isConnected.isInternetReachable)
    }

  },[isConnected])
  
  useEffect(()=>{
    if(checkSalesBoosterData)
    {
      console.log("checkSalesBoosterData",checkSalesBoosterData)
    }
    else if(checkSalesBoosterError){
      console.log("checkSalesBoosterError",checkSalesBoosterError)
    }
  },[])


  useEffect(()=>{
    if(getMinVersionSupportData)
    {
      console.log("getMinVersionSupportData",getMinVersionSupportData)
    }
    else if(getMinVersionSupportError)
    {
      console.log("getMinVersionSupportError",getMinVersionSupportError)
    }
  },[getMinVersionSupportData,getMinVersionSupportError])

  useEffect(() => {
    if (getUsersData) {
      console.log("type of users", getUsersData.body);
      const appUsers = getUsersData.body.map((item, index) => {
        return item.name
      })
      const appUsersData = getUsersData.body.map((item, index) => {
        return {
          "name": item.name,
          "id": item.user_type_id
        }
      })
      console.log("appUsers", appUsersData)

      dispatch(setAppUsers(appUsers))
      dispatch(setAppUsersData(appUsersData))
      setTimeout(() => {
        setListUsers(getUsersData.body);
      }, 2000)

    } else if (getUsersError) {
      console.log("getUsersError", getUsersError);
    }
  }, [getUsersData, getUsersError]);

  const checkApprovalFlow = (registrationRequired) => {
    if (manualApproval.includes(getUsersData?.body?.[0].user_type)) {
    listUsers &&  handleNavigationBaseddOnUser(true, registrationRequired)
    }
    else {
     listUsers && handleNavigationBaseddOnUser(false, registrationRequired)
    }
  }

  const handleNavigationBaseddOnUser = (needsApproval, registrationRequired) => {
    console.log("Needs Approval", needsApproval)
    if (otpLogin.includes(getUsersData?.body?.[0].user_type)
    ) {
   

        setTimeout(()=>{
          // listUsers && navigation.reset({ index: '0', routes: [{ name: 'OtpLogin',params:{needsApproval: needsApproval, userType: listUsers[0]?.user_type, userId: listUsers[0]?.user_type_id, registrationRequired: registrationRequired }}] })
        // listUsers && navigation.reset('OtpLogin', { needsApproval: needsApproval, userType: listUsers[0]?.user_type, userId: listUsers[0]?.user_type_id, registrationRequired: registrationRequired })
        locationEnabled && listUsers && navigation.navigate('OtpLogin', { needsApproval: needsApproval, userType: listUsers[0]?.user_type, userId: listUsers[0]?.user_type_id, registrationRequired: registrationRequired })


        },5000)


    }
    else {
      setTimeout(() => {
        locationEnabled && listUsers && navigation.navigate('OtpLogin', { needsApproval: needsApproval, userType: listUsers[0]?.user_type, userId: listUsers[0]?.user_type_id, registrationRequired: registrationRequired })
      // listUsers &&  navigation.reset({ index: '0', routes: [{ name: 'OtpLogin',params:{needsApproval: needsApproval, userType: listUsers[0]?.user_type, userId: listUsers[0]?.user_type_id, registrationRequired: registrationRequired }}] })       


      }, 4000)
      // console.log("Password Login", props.content, props.id, registrationRequired, needsApproval)
    }
  }


  const checkRegistrationRequired = (listUsers) => {
    console.log("checkRegistrationRequired pe list user---------------->", listUsers[0])

    if (registrationRequired.includes(listUsers?.[0]?.user_type)) {
      checkApprovalFlow(true)
      console.log("registration required")
    }
    else {
      checkApprovalFlow(false)
      console.log("registration not required")

    }


  }

 
  
 
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
          
          // navigation.navigate('Dashboard');
         locationEnabled &&  navigation.reset({ index: '0', routes: [{ name: 'Dashboard' }] })     

         
        }
        catch(e)
        {
          console.log("Error in dispatch", e)
        }

          // console.log("isAlreadyIntroduced",isAlreadyIntroduced)
        }
        else {
          setIsUserLoggedIn(false)
          if (value === "Yes") {
            if (user_type_option == "single") {
              checkRegistrationRequired()
            }
            else {
              setTimeout(()=>{
                locationEnabled &&  navigation.navigate('SelectUser');  
              // navigation.reset({ index: '0', routes: [{ name: 'OtpLogin' }] })
   
  
              },1000)
            }
  
          }
          else {
           
            locationEnabled &&  navigation.navigate('Introduction')
  
      
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
   
  }, [getAppThemeData,getAppThemeError,locationEnabled])

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