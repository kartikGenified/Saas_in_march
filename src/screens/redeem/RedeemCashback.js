import React, {useEffect, useId, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import PoppinsText from '../../components/electrons/customFonts/PoppinsText';
import PoppinsTextMedium from '../../components/electrons/customFonts/PoppinsTextMedium';
import {useSelector,useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/Entypo';
import LinearGradient from 'react-native-linear-gradient';
import * as Keychain from 'react-native-keychain';
import ErrorModal from '../../components/modals/ErrorModal';
import { useCashPerPointMutation } from '../../apiServices/workflow/rewards/GetPointsApi';
import { useFetchUserPointsMutation } from '../../apiServices/workflow/rewards/GetPointsApi';
import MessageModal from '../../components/modals/MessageModal';
import { setPointConversionF,setCashConversionF } from '../../../redux/slices/redemptionDataSlice';
const RedeemCashback = ({navigation}) => {
  const [message, setMessage] = useState();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false)
  const [cashConversion,setCashConversion] = useState()
  const [pointsConversion, setPointsConversion] = useState(1)
  const dispatch = useDispatch()
  const ternaryThemeColor = useSelector(
    state => state.apptheme.ternaryThemeColor,
  )
    ? useSelector(state => state.apptheme.ternaryThemeColor)
    : 'grey';

  const secondaryThemeColor = useSelector(
    state => state.apptheme.secondaryThemeColor,
  )
    ? useSelector(state => state.apptheme.secondaryThemeColor)
    : '#FFB533';
  const userData = useSelector(state => state.appusersdata.userData);
  console.log("userData",userData)
  const modalClose = () => {
    setError(false);
  };

  const [userPointFunc,{
    data:userPointData,
    error:userPointError,
    isLoading:userPointIsLoading,
    isError:userPointIsError
}]= useFetchUserPointsMutation()

  const [cashPerPointFunc,{
    data:cashPerPointData,
    error:cashPerPointError,
    isLoading:cashPerPointIsLoading,
    isError:cashPerPointIsError
  }] = useCashPerPointMutation()

  

  const points =userPointData?.body.point_balance;
  const minPointsRedeemed = cashPerPointData?.body.min_point_redeem
  const height = Dimensions.get('window').height


  const redeemCashback = async () => {
if(Number(minPointsRedeemed)<=(pointsConversion))
{
  console.log("shjadjhashgdhjgasjgd", pointsConversion,points)
  if(Number(pointsConversion)>=Number(points))
  {
    setError(true)
  setMessage("You only have "+points+" points")
  }
  else{
    navigation.navigate('BankAccounts',{type:"Cashback"})

  }
}
else{
  setError(true)
  setMessage("Min Points required to redeem is "+minPointsRedeemed)
}
   

    // const credentials = await Keychain.getGenericPassword();
    // if (credentials) {
    //   console.log(
    //     'Credentials successfully loaded for user ' + credentials.username,
    //   );
    //   const token = credentials.username;
     
    // }
  };
  useEffect(()=>{
    if(cashPerPointData)
    {
     
      const conversionFactor = cashPerPointData.body.cash_per_point
      setCashConversion(pointsConversion*conversionFactor)  
      dispatch(setCashConversionF(pointsConversion*conversionFactor))
  }
  },[cashPerPointData,pointsConversion])
  useEffect(()=>{
    fetchToken(userData.id)
    console.log("userData from useeffect",userData.id)
  },[userData])

  const fetchToken=async(id)=>{
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log(
        'Credentials successfully loaded for user ' + credentials.username,
      );
      const token = credentials.username;
      
      const params = {userId:id,token:token}
      console.log("params",params)
      cashPerPointFunc(token)
      userPointFunc(params)
    }
  }
  useEffect(()=>{
    if(userPointData)
    {
        console.log("userPointData",JSON.stringify(userPointData))
    }
    else if(userPointError)
    {
        console.log("userPointError",userPointError)
    }

},[userPointData,userPointError])
  
  useEffect(()=>{
    if(cashPerPointData)
    {
        console.log("cashPerPointData",cashPerPointData)
    }
    else if(cashPerPointError){
        console.log("cashPerPointError",cashPerPointError)
        
    }
  },[cashPerPointData,cashPerPointError])

  
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: 'white',
        height: '100%',
      }}>
      <ScrollView style={{width:'100%',height:'100%'}}>

      {error && (
        <ErrorModal
          modalClose={modalClose}
          message={message}
          openModal={error}
          navigateTo="RedeemCashback"></ErrorModal>
      )}

      
      {  success && (
          <MessageModal
            modalClose={modalClose}
            message={message}
            openModal={success}></MessageModal>)
      }
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'flex-start',
          flexDirection: 'row',
          width: '100%',

          height: '10%',
          position: 'absolute',
          top: 0,
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <Image
            style={{
              height: 24,
              width: 24,
              resizeMode: 'contain',
              marginLeft: 10,
            }}
            source={require('../../../assets/images/blackBack.png')}></Image>
        </TouchableOpacity>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <PoppinsTextMedium
            content="Redeem Cashback"
            style={{
              marginLeft: 10,
              fontSize: 16,
              fontWeight: '700',
              color: 'black',
            }}></PoppinsTextMedium>
        </View>
      </View>
        <View style={{alignItems:"center",justifyContent:'center',width:'100%',marginTop:40}}>
      <View
        style={{alignItems: 'center', justifyContent: 'center', marginTop:40}}>
        <Image
          style={{height: 140, width: 140}}
          source={require('../../../assets/images/redeemCashback.png')}></Image>
        <PoppinsText
          style={{fontSize: 24, color: 'black', marginTop: 20}}
          content={points}></PoppinsText>
        <PoppinsTextMedium
          content="Available Points"
          style={{
            color: 'black',
            fontWeight: '600',
            marginBottom: 20,
          }}></PoppinsTextMedium>
        <PoppinsTextMedium
          content="Convert your Points to Cash"
          style={{
            color: '#909090',
            fontWeight: '600',
            fontSize: 16,
          }}></PoppinsTextMedium>
        <PoppinsTextMedium
          style={{color: 'black', fontWeight: '600'}}
          content={`${pointsConversion} Points = ${cashConversion} Rupees`}></PoppinsTextMedium>
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          marginTop: 20,
          paddingTop: 20,
        }}>
        <PoppinsTextMedium
          content="ENTER POINTS"
          style={{
            color: '#909090',
            fontWeight: '600',
            marginBottom: 20,
            position: 'absolute',
            left: 20,
            top: 0,
          }}></PoppinsTextMedium>
        <View
          style={{
            width: '90%',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 0.8,
            borderColor: '#DDDDDD',
            height: 70,
            borderRadius: 10,
            backgroundColor: '#F5F7F9',
            flexDirection: 'row',
            marginTop: 10,
          }}>
          <View
            style={{
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              borderRightWidth: 1,
              borderColor: '#DDDDDD',
              height:60
            }}>
            <PoppinsTextMedium
              content="Points"
              style={{
                color: '#909090',
                fontWeight: '600',
                fontSize: 14,
              }}></PoppinsTextMedium>
           <TextInput value={pointsConversion + ""} style={{color:'black',height:50, fontWeight:'bold', fontSize:14,width:'50%'}} onChangeText={(text)=>{setPointsConversion(text),dispatch(setPointConversionF(text))}} placeholder='Enter Points'></TextInput>
          </View>
          <Image
            style={{height: 24, width: 24, resizeMode: 'contain', right: 12}}
            source={require('../../../assets/images/goNext.png')}></Image>
          <View
            style={{
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: '#DDDDDD',
              height:60
            }}>
            <PoppinsTextMedium
              content="Cash"
              style={{
                color: '#909090',
                fontWeight: '600',
                fontSize: 14,
                marginBottom:12
              }}></PoppinsTextMedium>
            <PoppinsText
              style={{fontSize: 20, color: 'black'}}
              content={Math.round(cashConversion * 10) / 10}></PoppinsText>
          </View>
        </View>

        <View
          style={{
            width: '90%',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom:20
          }}>
          <PoppinsTextMedium
            content={`You need minimum ${minPointsRedeemed} points to redeem`}
            style={{
              color: 'black',
              fontWeight: '600',
              marginBottom: 20,
              position: 'absolute',
              left: 0,
              top: 4,
            }}></PoppinsTextMedium>
        </View>
      </View>
      <View style={{alignItems:"center", justifyContent:"center", width:"100%",marginTop:20,marginBottom:20}}>
      <TouchableOpacity
        onPress={() => {
          console.log('redeem'), redeemCashback();
        }}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '90%',
          backgroundColor: ternaryThemeColor,
          borderRadius: 6,
          height: 50,
          flexDirection: 'row',
          marginTop:20
        }}>
        <PoppinsTextMedium
          content="Redeem Now"
          style={{color: 'white', fontWeight: '600'}}></PoppinsTextMedium>
        <Image
          style={{height: 24, width: 24, resizeMode: 'contain', marginLeft: 10}}
          source={require('../../../assets/images/whiteArrowRight.png')}></Image>
      </TouchableOpacity>
     
      </View>
      
        </View>
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({});

export default RedeemCashback;
