import React, { useCallback, useEffect, useId, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions,
  Text
} from 'react-native';
import PoppinsTextMedium from '../../components/electrons/customFonts/PoppinsTextMedium';
import { useSelector, useDispatch } from 'react-redux';
import TextInputRectangleMandatory from '../../components/atoms/input/TextInputRectangleMandatory';
import TextInputRectangle from '../../components/atoms/input/TextInputRectangle';
import TextInputNumericRectangle from '../../components/atoms/input/TextInputNumericRectangle';
import InputDate from '../../components/atoms/input/InputDate';
import ImageInput from '../../components/atoms/input/ImageInput';
import * as Keychain from 'react-native-keychain';
import MessageModal from '../../components/modals/MessageModal';
import RegistrationProgress from '../../components/organisms/RegistrationProgress';
import { useGetFormAccordingToAppUserTypeMutation } from '../../apiServices/workflow/GetForms';
import ButtonOval from '../../components/atoms/buttons/ButtonOval';
import { useRegisterUserByBodyMutation, useUpdateProfileAtRegistrationMutation } from '../../apiServices/register/UserRegisterApi';
import TextInputAadhar from '../../components/atoms/input/TextInputAadhar';
import TextInputPan from '../../components/atoms/input/TextInputPan';
import TextInputGST from '../../components/atoms/input/TextInputGST';
import ErrorModal from '../../components/modals/ErrorModal';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import PrefilledTextInput from '../../components/atoms/input/PrefilledTextInput';
import { useGetLocationFromPinMutation } from '../../apiServices/location/getLocationFromPincode';
import PincodeTextInput from '../../components/atoms/input/PincodeTextInput';
import OtpInput from '../../components/organisms/OtpInput';
import PoppinsTextLeftMedium from '../../components/electrons/customFonts/PoppinsTextLeftMedium';
import { useGetLoginOtpMutation } from '../../apiServices/login/otpBased/SendOtpApi';
import { useGetAppLoginMutation } from '../../apiServices/login/otpBased/OtpLoginApi';
import { useVerifyOtpMutation } from '../../apiServices/login/otpBased/VerifyOtpApi';
import { useGetLoginOtpForVerificationMutation } from '../../apiServices/otp/GetOtpApi';
import { useVerifyOtpForNormalUseMutation } from '../../apiServices/otp/VerifyOtpForNormalUseApi';
import DropDownRegistration from '../../components/atoms/dropdown/DropDownRegistration';
import EmailTextInput from '../../components/atoms/input/EmailTextInput';
import { validatePathConfig } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {GoogleMapsKey} from "@env"


const BasicInfo = ({ navigation, route }) => {
  const [userName, setUserName] = useState(route.params.name)
  const [userMobile, setUserMobile] = useState(route.params.mobile)
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [registrationForm, setRegistrationForm] = useState([])
  const [responseArray, setResponseArray] = useState([]);
  const [isManuallyApproved, setIsManuallyApproved] = useState()
  const [modalTitle, setModalTitle] = useState()
  const [needsAadharVerification, setNeedsAadharVerification] = useState(false)
  const [location, setLocation] = useState()
  const [formFound, setFormFound] = useState(true)
  const [otp, setOtp] = useState("")
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpModal, setOtpModal] = useState(false)
  const [otpVisible, setOtpVisible] = useState(false)
  const [isValid, setIsValid] = useState(true)
  const [hideButton, setHideButton] = useState(false)
  const [timer, setTimer] = useState(0)

  const timeOutCallback = useCallback(() => setTimer(currTimer => currTimer - 1), []);
  const focused = useIsFocused()



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
  const isOnlineVerification = useSelector(state => state.apptheme.isOnlineVerification)
  const userData = useSelector(state => state.appusersdata.userData);
  const appUsers = useSelector(state => state.appusers.value)
  const manualApproval = useSelector(state => state.appusers.manualApproval)
  const userType = route.params.userType
  const userTypeId = route.params.userId
  const needsApproval = route.params.needsApproval
  const navigatingFrom = route.params.navigatingFrom
  const name = route.params?.name
  const mobile = route.params?.mobile
  console.log("appUsers", userType, userTypeId, isManuallyApproved, name, mobile)
  const width = Dimensions.get('window').width
  const height = Dimensions.get('window').height
  const gifUri = Image.resolveAssetSource(
    require("../../../assets/gif/loader.gif")
  ).uri;

  let timeoutId;

  const [getFormFunc, {
    data: getFormData,
    error: getFormError,
    isLoading: getFormIsLoading,
    isError: getFormIsError
  }] = useGetFormAccordingToAppUserTypeMutation()

  const [registerUserFunc,
    {
      data: registerUserData,
      error: registerUserError,
      isLoading: registerUserIsLoading,
      isError: registerUserIsError
    }] = useRegisterUserByBodyMutation()

  const [
    updateProfileAtRegistrationFunc, {
      data: updateProfileAtRegistrationData,
      error: updateProfileAtRegistrationError,
      isLoading: updateProfileAtRegistrationIsLoading,
      isError: updateProfileAtRegistrationIsError
    }
  ] = useUpdateProfileAtRegistrationMutation()

  const [getLocationFromPincodeFunc, {
    data: getLocationFormPincodeData,
    error: getLocationFormPincodeError,
    isLoading: getLocationFormPincodeIsLoading,
    isError: getLocationFromPincodeIsError
  }] = useGetLocationFromPinMutation()

  // send otp for login--------------------------------
  const [sendOtpFunc, {
    data: sendOtpData,
    error: sendOtpError,
    isLoading: sendOtpIsLoading,
    isError: sendOtpIsError
  }] = useGetLoginOtpForVerificationMutation()

  const [
    verifyOtpFunc,
    {
      data: verifyOtpData,
      error: verifyOtpError,
      isLoading: verifyOtpIsLoading,
      isError: verifyOtpIsError,
    },
  ] = useVerifyOtpForNormalUseMutation();

  useEffect(() => {
    if(timer > 0){
      timeoutId = setTimeout(timeOutCallback, 1000);
    } 
    return () => clearTimeout(timeoutId);
  }, [timer, timeOutCallback]);



  useEffect(() => {
    setUserName(route.params.name)
  }, [route.params.name])

  useEffect(() => {
    console.log("mobile number from use effect", route.params.mobile, navigatingFrom)
    setUserMobile(route.params.mobile)

  }, [route.params.mobile])

  useEffect(() => {

    const AppUserType = userType
    getFormFunc({ AppUserType })
    if (manualApproval.includes(userType)) {
      setIsManuallyApproved(true)
    }
    else {
      setIsManuallyApproved(false)
    }

  }, [])

  useEffect(()=>{
    setHideButton(false)
  },[focused])

  useEffect(() => {
    if (verifyOtpData?.success) {
      setOtpVerified(true)
      setOtpModal(true)
      console.log("verifyOtp", verifyOtpData)
      setMessage("OTP Verified")

    }
    else if (verifyOtpError) {
      console.log("verifyOtpError", verifyOtpError)
      setError(true)
      setMessage("Please Enter Correct OTP")
    }
  }, [verifyOtpData, verifyOtpError])
  useEffect(() => {
    let lat = ''
    let lon = ''
    Geolocation.getCurrentPosition((res) => {
      console.log("res", res)
      lat = res.coords.latitude
      lon = res.coords.longitude
      // getLocation(JSON.stringify(lat),JSON.stringify(lon))
      console.log("latlong", lat, lon)
      var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${res.coords.latitude},${res.coords.longitude}
        &location_type=ROOFTOP&result_type=street_address&key=${GoogleMapsKey}`

      fetch(url).then(response => response.json()).then(json => {
        console.log("location address=>", JSON.stringify(json));
        const formattedAddress = json.results[0].formatted_address
        const formattedAddressArray = formattedAddress?.split(',')

        let locationJson = {

          lat: json.results[0].geometry.location.lat === undefined ? "N/A" : json.results[0].geometry.location.lat,
          lon: json.results[0].geometry.location.lng === undefined ? "N/A" : json.results[0].geometry.location.lng,
          address: formattedAddress === undefined ? "N/A" : formattedAddress

        }

        const addressComponent = json.results[0].address_components
        console.log("addressComponent", addressComponent)
        for (let i = 0; i <= addressComponent.length; i++) {
          if (i === addressComponent.length) {
            dispatch(setLocation(locationJson))
            setLocation(locationJson)
          }
          else {
            if (addressComponent[i].types.includes("postal_code")) {
              console.log("inside if")

              console.log(addressComponent[i].long_name)
              locationJson["postcode"] = addressComponent[i].long_name
            }
            else if (addressComponent[i].types.includes("country")) {
              console.log(addressComponent[i].long_name)

              locationJson["country"] = addressComponent[i].long_name
            }
            else if (addressComponent[i].types.includes("administrative_area_level_1")) {
              console.log(addressComponent[i].long_name)

              locationJson["state"] = addressComponent[i].long_name
            }
            else if (addressComponent[i].types.includes("administrative_area_level_3")) {
              console.log(addressComponent[i].long_name)

              locationJson["district"] = addressComponent[i].long_name
            }
            else if (addressComponent[i].types.includes("locality")) {
              console.log(addressComponent[i].long_name)

              locationJson["city"] = addressComponent[i].long_name
            }
          }

        }


        console.log("formattedAddressArray", locationJson)

      })
    })

  }, [])
  useEffect(() => {
    if (getLocationFormPincodeData) {
      console.log("getLocationFormPincodeData", getLocationFormPincodeData)
      if (getLocationFormPincodeData.success) {
        const address = getLocationFormPincodeData.body[0].office + ", " + getLocationFormPincodeData.body[0].district + ", " + getLocationFormPincodeData.body[0].state + ", " + getLocationFormPincodeData.body[0].pincode
        let locationJson = {

          lat: "N/A",
          lon: "N/A",
          address: address,
          city: getLocationFormPincodeData.body[0].district,
          district: getLocationFormPincodeData.body[0].division,
          state: getLocationFormPincodeData.body[0].state,
          country: "N/A",
          postcode: getLocationFormPincodeData.body[0].pincode


        }
        console.log("getLocationFormPincodeDataLocationJson",locationJson)
        setLocation(locationJson)
      }
    }
    else if (getLocationFormPincodeError) {
      console.log("getLocationFormPincodeError", getLocationFormPincodeError)
      setError(true)
      setMessage(getLocationFormPincodeError.data.message)
    }
  }, [getLocationFormPincodeData, getLocationFormPincodeError])

  
  useEffect(() => {
    if (getFormData) {
      if (getFormData.message !== "Not Found") {
        console.log("Form Fields", JSON.stringify(getFormData))
        const values = Object.values(getFormData.body.template)
        setRegistrationForm(values)
      }
      else {
        setError(true)
        setMessage("Form can't be fetched")
        setFormFound(false)
      }

    }
    else if (getFormError) {
      console.log("Form Field Error", getFormError)
    }
  }, [getFormData, getFormError])

  useEffect(() => {
    if (registerUserData) {
      console.log("data after submitting form", registerUserData)
      if (registerUserData.success) {
        setSuccess(true)
        setMessage("Thank you for joining OZOSTARS Loyalty program, we will get back to you within 1-2 working days")
        setModalTitle("Greetings")
      }
      setHideButton(false)

      // const values = Object.values(registerUserData.body.template)
      // setRegistrationForm(values)
    }
    else if (registerUserError) {
      console.log("form submission error", registerUserError)
      setError(true)
      setMessage(registerUserError.data.message)
      setHideButton(false)

    }
  }, [registerUserData, registerUserError])

  useEffect(() => {
    if (updateProfileAtRegistrationData) {
      console.log("updateProfileAtRegistrationData", updateProfileAtRegistrationData)
      if (updateProfileAtRegistrationData.success) {
        setSuccess(true)
        setMessage(updateProfileAtRegistrationData.message)
        setModalTitle("WOW")
      }

      // const values = Object.values(updateProfileAtRegistrationData.body.template)
      // setRegistrationForm(values)
    }
    else if (updateProfileAtRegistrationError) {
      console.log("updateProfileAtRegistrationError", updateProfileAtRegistrationError)
      setError(true)
      // setMessage(updateProfileAtRegistrationError.data.message)

    }
  }, [updateProfileAtRegistrationData, updateProfileAtRegistrationError])
  useEffect(() => {
    if (sendOtpData) {
      console.log("sendOtpData", sendOtpData);
      setOtpVisible(true);
    }
    else {
      console.log("sendOtpError", sendOtpError)
    }
  }, [sendOtpData, sendOtpError])

  const handleTimer = () => {
    if(userMobile)
    {
      if(userMobile.length==10)
      {
        if(timer===60)
        {
          getOTPfunc()
          setOtpVisible(true)
        }
        if (timer===0 || timer===-1) {
          setTimer(60);
          getOTPfunc()
          setOtpVisible(true)
    
         
        }
      }
      else{
        setError(true)
        setMessage("Mobile number length must be 10")
      }
     
    }
    else{
      setError(true)
        setMessage("Kindly enter mobile number")
    }
    
  }


  const isValidEmail = (text) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(text);
  };

  const handleFetchPincode = (data) => {
    console.log("pincode is", data)
    getLocationFromPinCode(data)

  }


  const handleChildComponentData = data => {
console.log("handleChildComponentData", data)
    // setOtpVisible(true)
    if (data?.name === "name") {
      setUserName(data?.value)
    }
    // console.log("isValidEmail", isValidEmail(data.value))

    if (data?.name === "email") {
      console.log("from text input", data?.name);

      console.log("isValidEmail", isValidEmail(data?.value), isValid)

    }

   




    if (data?.name === "mobile") {
      setUserMobile(data?.value)
    }
    // Update the responseArray state with the new data
    setResponseArray(prevArray => {
      const existingIndex = prevArray.findIndex(
        item => item.name === data.name,
      );

      if (existingIndex !== -1) {
        // If an entry for the field already exists, update the value
        const updatedArray = [...prevArray];
        updatedArray[existingIndex] = {
          ...updatedArray[existingIndex],
          value: data?.value,
        };
        return updatedArray;
      } else {
        // If no entry exists for the field, add a new entry
        return [...prevArray, data];
      }
    });
  };

  console.log("responseArray", responseArray)
  const modalClose = () => {
    setError(false);
  };

  const getLocationFromPinCode =  (pin) => {
    console.log("getting location from pincode",pin)
    var url = `http://postalpincode.in/api/pincode/${pin}`

  fetch(url).then(response => response.json()).then(json => {
    console.log("location address=>", JSON.stringify(json));
    if(json.PostOffice===null)
    {
      setError(true)
      setMessage("Pincode data cannot be retrieved.")
    }
    else{
      const locationJson = {
        "postcode":pin,
        "district":json.PostOffice[0].District,
        "state":json.PostOffice[0].State,
        "country":json.PostOffice[0].Country,
        "city":json.PostOffice[0].Region
      }
      setLocation(locationJson)
    }
    

  })
}

  const getOtpFromComponent = value => {
    if (value.length === 6) {

      setOtp(value);


      const params = { mobile: userMobile, name: userName, otp: value, user_type_id: userTypeId, user_type: userType, }


      verifyOtpFunc(params);

    }
  };

  const getOTPfunc = () => {
    console.log("get user data", userData)

    console.log("ooooooo->>>>>>>>", { userName, userMobile, userTypeId, userType })
    const params = { mobile: userMobile, name: userName, user_type_id: userTypeId, user_type: userType,type:'login' }
    sendOtpFunc(params)
  }


  const handleRegistrationFormSubmission = () => {
    const inputFormData = {}
    inputFormData["user_type"] = userType;
    inputFormData["user_type_id"] = userTypeId;
    inputFormData["is_approved_needed"] = isManuallyApproved;
    inputFormData["name"] = name;
    inputFormData["mobile"] = mobile;



    for (var i = 0; i < responseArray.length; i++) {

      inputFormData[responseArray[i].name] = responseArray[i].value
    }
    const body = inputFormData

    if (otpVerified) {
      const keys = Object.keys(body)
      const values = Object.values(body)

      if (keys.includes('email')) {
        const index = keys.indexOf('email')
        if (isValidEmail(values[index])) {
          registerUserFunc(body)
          setHideButton(true)
        }
        else {
          setError(true)
          setMessage("Email isn't verified")
        }
      }
      else {
        registerUserFunc(body)
      }

      // make request according to the login type of user-----------------------

      // if(navigatingFrom==="PasswordLogin")
      // {
      // registerUserFunc(body)
      // }
      // else{
      //  inputFormData["is_online_verification"] = isOnlineVerification
      //   const params = {id:,body:body}
      //   updateProfileAtRegistrationFunc(params)
      // }

      // ---------------------------------------------------------------------


    }
    else {
      setError(true)
      setMessage("Otp isn't verified yet")
    }
    console.log("responseArraybody", body)
  }

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        backgroundColor: ternaryThemeColor,
        height: '100%',


      }}>
      {error && (
        <ErrorModal
          modalClose={modalClose}

          message={message}
          openModal={error}></ErrorModal>
      )}
      {success && (
        <MessageModal
          modalClose={modalClose}
          title={modalTitle}
          message={message}
          openModal={success}
          navigateTo={navigatingFrom === "PasswordLogin" ? "PasswordLogin" : "OtpLogin"}
          params={{ needsApproval: needsApproval, userType: userType, userId: userTypeId }}></MessageModal>
      )}

      {otpModal && (
        <MessageModal
          modalClose={() => { setOtpModal(false) }}
          title={modalTitle}
          message={message}
          openModal={otpModal}
          // navigateTo={navigatingFrom === "PasswordLogin" ? "PasswordLogin" : "OtpLogin"}
          params={{ needsApproval: needsApproval, userType: userType, userId: userTypeId }}></MessageModal>
      )}

      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '10%',





        }}>
        <TouchableOpacity
          style={{
            height: 24, width: 24,
            position: 'absolute',
            top: 20,
            left: 10
          }}
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
        <View style={{ alignItems: 'center', justifyContent: 'center', position: "absolute", top: 20, left: 50 }}>
          <PoppinsTextMedium
            content="Registration"
            style={{
              marginLeft: 10,
              fontSize: 16,
              fontWeight: '700',
              color: 'white',
            }}></PoppinsTextMedium>
        </View>
      </View>
      <ScrollView style={{ width: '100%' }}>

        <View style={{ width: width, backgroundColor: "white", alignItems: "center", justifyContent: 'flex-start', paddingTop: 20 }}>
          {formFound ? <PoppinsTextMedium style={{ color: 'black', fontWeight: '700', fontSize: 18, marginBottom: 40 }} content="Please Fill The Following Form To Register"></PoppinsTextMedium> : <PoppinsTextMedium style={{ color: 'black', fontWeight: '700', fontSize: 18, marginBottom: 40 }} content="No Form Available !!"></PoppinsTextMedium>}

          {/* <RegistrationProgress data={["Basic Info","Business Info","Manage Address","Other Info"]}></RegistrationProgress> */}
          {registrationForm &&
            registrationForm.map((item, index) => {
              if (item.type === 'text') {
                console.log("the user name", userName)
                if ((item.name === 'phone' || item.name === "mobile")) {
                  return (
                    <>

                      <View style={{ flexDirection: 'row', flex: 1 }}>

                        <View style={{ flex: 0.75 }}>
                          {navigatingFrom === "OtpLogin" && <TextInputNumericRectangle
                            jsonData={item}
                            key={index}
                            maxLength={10}
                            handleData={handleChildComponentData}
                            placeHolder={item.name}
                            value={userMobile}
                            label={item.label}
                            isEditable={false}
                          >
                            {' '}
                          </TextInputNumericRectangle>}
                          {navigatingFrom === "PasswordLogin" && <TextInputNumericRectangle
                            jsonData={item}
                            key={index}
                            maxLength={10}
                            handleData={handleChildComponentData}
                            placeHolder={item.name}
                            label={item.label}

                          >
                            {' '}
                          </TextInputNumericRectangle>}
                        </View>

                        {otpVerified ? <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <Image style={{ height: 30, width: 30, resizeMode: 'contain' }} source={require('../../../assets/images/greenTick.png')}></Image>
                        </View> : <TouchableOpacity style={{ flex: 0.15, marginTop: 6, backgroundColor: ternaryThemeColor, alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 5 }} onPress={()=>{
                          handleTimer()
                        }}>
                          <PoppinsTextLeftMedium style={{ color: 'white', fontWeight: '800', padding: 5 }} content="Get OTP"></PoppinsTextLeftMedium>
                        </TouchableOpacity>}
                        {sendOtpIsLoading && <FastImage
                style={{
                  width: 40,
                  height: 40,
                  alignSelf: "center",
                  
                }}
                source={{
                  uri: gifUri, // Update the path to your GIF
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />}
                      </View>



                      {console.log("conditions", otpVerified, otpVisible)}
                      {!otpVerified && otpVisible &&
                        <>

                          <PoppinsTextLeftMedium style={{ marginRight: '70%' }} content="OTP"></PoppinsTextLeftMedium>

                          <OtpInput
                            getOtpFromComponent={getOtpFromComponent}
                            color={'white'}></OtpInput>

                          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 }}>
                              <Image
                                style={{
                                  height: 20,
                                  width: 20,
                                  resizeMode: 'contain',

                                }}
                                source={require('../../../assets/images/clock.png')}></Image>
                              <Text style={{ color: ternaryThemeColor, marginLeft: 4 }}>{timer}</Text>
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{ color: ternaryThemeColor, marginTop: 10 }}>Didn't recieve any Code?</Text>

                              <Text onPress={()=>{handleTimer()}} style={{ color: ternaryThemeColor, marginTop: 6, fontWeight: '600', fontSize: 16 }}>Resend Code</Text>

                            </View>
                          </View>
                        </>
                      }
                    </>
                  );


                }


                else if ((item.name).trim().toLowerCase() === "name") {
                  return (
                    <PrefilledTextInput
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      value={userName}
                      label={item.label}
                      isEditable={false}
                    ></PrefilledTextInput>
                  )
                }


                else if ((item.name).trim().toLowerCase() === "email") {
                  return (
                    <EmailTextInput
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}

                      label={item.label}
                    // isValidEmail = {isValidEmail}
                    ></EmailTextInput>
                  )
                }

                // } 
                else if (item.name === 'aadhaar' || item.name === "aadhar") {
                  console.log("aadhar")
                  return (
                    <TextInputAadhar
                      required={item.required}
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      label={item.label}
                    >
                      {' '}
                    </TextInputAadhar>
                  );
                }
                else if (item.name === 'pan') {
                  console.log("pan")
                  return (
                    <TextInputPan
                      required={item.required}
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      label={item.label}
                    >
                      {' '}
                    </TextInputPan>
                  );
                }
                else if (item.name === 'gstin') {
                  console.log("gstin")
                  return (
                    <TextInputGST
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      label={item.label}>
                      {' '}
                    </TextInputGST>
                  );
                }
                else if ((item.name).trim().toLowerCase() === "city" ) {

                  return (
                    <PrefilledTextInput
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      value={location?.city}
                      label={item.label}
                    ></PrefilledTextInput>
                  )



                }
                else if ((item.name).trim().toLowerCase() === "pincode"   ) {
                 
                    return (
                      <PincodeTextInput
                        jsonData={item}
                        key={index}
                        handleData={handleChildComponentData}
                        handleFetchPincode={handleFetchPincode}
                        placeHolder={item.name}
                        value={location?.postcode}
                        label={item.label}
                        maxLength={6}
                      ></PincodeTextInput>
                    )
                  }
                
                  // else if ((item.name).trim().toLowerCase() === "pincode" ) {
                 
                  //   return (
                  //     <PincodeTextInput
                  //       jsonData={item}
                  //       key={index}
                  //       handleData={handleChildComponentData}
                  //       handleFetchPincode={handleFetchPincode}
                  //       placeHolder={item.name}

                  //       label={item.label}
                  //       maxLength={6}
                  //     ></PincodeTextInput>
                  //   )
                  // }
                
                else if ((item.name).trim().toLowerCase() === "state"  ) {
                  return (
                    <PrefilledTextInput
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      value={location?.state}
                      label={item.label}
                    ></PrefilledTextInput>
                  )
                }
                else if ((item.name).trim().toLowerCase() === "district"  ) {

                  return (
                    <PrefilledTextInput
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      value={location?.district}
                      label={item.label}
                    ></PrefilledTextInput>
                  )



                }
                else {
                  return (
                    <TextInputRectangle
                      jsonData={item}
                      key={index}
                      handleData={handleChildComponentData}
                      placeHolder={item.name}
                      label={item.label}>
                      {' '}
                    </TextInputRectangle>
                  );
                }
              } else if (item.type === 'file') {
                return (
                  <ImageInput
                    jsonData={item}
                    handleData={handleChildComponentData}
                    key={index}
                    data={item.name}
                    label={item.label}
                    action="Select File"></ImageInput>
                );
              }
              else if (item.type === "select") {
                return (
                  <DropDownRegistration

                    title={item.name}
                    header={item.options[0]}
                    jsonData={item}
                    data={item.options}
                    handleData={handleChildComponentData}
                  ></DropDownRegistration>
                )
              }
              else if (item.type === 'date') {
                return (
                  <InputDate
                    jsonData={item}
                    handleData={handleChildComponentData}
                    data={item.label}
                    key={index}></InputDate>
                );
              }
            })}

          {formFound && !hideButton && <ButtonOval
            handleOperation={() => {
              handleRegistrationFormSubmission();
            }}
            content="Submit"
            style={{
              paddingLeft: 30,
              paddingRight: 30,
              padding: 10,
              color: 'white',
              fontSize: 16,
            }}></ButtonOval>}
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({})

export default BasicInfo;