import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Dashboard from '../screens/dashboard/Dashboard';
import BottomNavigator from './BottomNavigator';
import RedeemRewardHistory from '../screens/historyPages/RedeemRewardHistory';
import AddBankAccountAndUpi from '../screens/payments/AddBankAccountAndUpi';
import Profile from '../screens/profile/Profile';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useGetAppDashboardDataMutation } from '../apiServices/dashboard/AppUserDashboardApi';
import { useGetAppMenuDataMutation } from '../apiServices/dashboard/AppUserDashboardMenuAPi.js';
import * as Keychain from 'react-native-keychain';
import { SvgUri } from 'react-native-svg';
import { ScrollView } from 'react-native-gesture-handler';
import { useGetActiveMembershipMutation } from '../apiServices/membership/AppMembershipApi';
import { useFetchProfileMutation } from '../apiServices/profile/profileApi';
import Share from 'react-native-share';
import { shareAppLink } from '../utils/ShareAppLink';
import PoppinsTextMedium from '../components/electrons/customFonts/PoppinsTextMedium';
import PoppinsTextLeftMedium from '../components/electrons/customFonts/PoppinsTextLeftMedium';
import { useFetchLegalsMutation } from '../apiServices/fetchLegal/FetchLegalApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorModal from '../components/modals/ErrorModal';

const Drawer = createDrawerNavigator();
const CustomDrawer = () => {
  const [profileImage, setProfileImage] = useState()
  const [drawerData, setDrawerData] = useState()
  const [myProgramVisible, setMyProgramVisibile] = useState(false);
  const [ozoneProductVisible, setOzoneProductVisible] = useState(false);
  const [communityVisible, setCommunityVisible] = useState(false);
  const [KnowledgeHubVisible, setKnowledgeHubVisible] = useState(false);
  const [message, setMessage] = useState();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);




  const ternaryThemeColor = useSelector(
    state => state.apptheme.ternaryThemeColor,
  )
    ? useSelector(state => state.apptheme.ternaryThemeColor)
    : 'grey';
  const primaryThemeColor = useSelector(
    state => state.apptheme.primaryThemeColor,
  )
    ? useSelector(state => state.apptheme.primaryThemeColor)
    : '#FF9B00';
  const userData = useSelector(state => state.appusersdata.userData)
  const kycData = useSelector(state => state.kycDataSlice.kycData)


  const [getTermsAndCondition, {
    data: getTermsData,
    error: getTermsError,
    isLoading: termsLoading,
    isError: termsIsError
  }] = useFetchLegalsMutation();

  const [getPolicies, {
    data: getPolicyData,
    error: getPolicyError,
    isLoading: policyLoading,
    isError: policyIsError
  }] = useFetchLegalsMutation();

  const [getFAQ, {
    data: getFAQData,
    error: getFAQError,
    isLoading: FAQLoading,
    isError: FAQIsError
  }] = useFetchLegalsMutation();


  console.log("kycCompleted", kycData)



  const navigation = useNavigation()

  const [
    fetchProfileFunc,
    {
      data: fetchProfileData,
      error: fetchProfileError,
      isLoading: fetchProfileIsLoading,
      isError: fetchProfileIsError,
    },
  ] = useFetchProfileMutation();

  const [getAppMenuFunc, {
    data: getAppMenuData,
    error: getAppMenuError,
    isLoading: getAppMenuIsLoading,
    isError: getAppMenuIsError
  }] = useGetAppMenuDataMutation()

  // console.log("getAppMenuData", getAppMenuData)

  const [getActiveMembershipFunc, {
    data: getActiveMembershipData,
    error: getActiveMembershipError,
    isLoading: getActiveMembershipIsLoading,
    isError: getActiveMembershipIsError
  }] = useGetActiveMembershipMutation()

  useEffect(() => {
    const fetchData = async () => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log(
          'Credentials successfully loaded for user ' + credentials.username,
        );
        const token = credentials.username;
        fetchProfileFunc(token);


      }
    };
    fetchData()
    getMembership()
    fetchTerms()
    fetchPolicies()
    fetchFaq()
  }, [])

  useEffect(()=>{
    if(getTermsData){
      console.log("getTermsData",getTermsData.body.data?.[0]?.files[0]);
    }
    else if(getTermsError){
      console.log("gettermserror", getTermsError)
    }
  },[getTermsData,getTermsError])

  useEffect(()=>{
    if(getPolicyData){
      console.log("getPolicyData123>>>>>>>>>>>>>>>>>>>",getPolicyData);
    
    }
    else if(getPolicyError){
      setError(true)
      setMessage(getPolicyError?.message)
      console.log("getPolicyError>>>>>>>>>>>>>>>", getPolicyError)
    }
  },[getPolicyData,getPolicyError])

  useEffect(()=>{
    if(getFAQData){
      console.log("getFAQData Here i am ",getFAQData.body.data?.[0]?.files[0]);
    }
    else if(getFAQError){
      console.log("getFAQError", getFAQError)
    }
  },[getFAQData,getFAQError]);

  const handleLogout=async()=>{
    
      try {
        await AsyncStorage.removeItem('loginData')
        navigation.reset({ index: '0', routes: [{ name: 'SelectUser' }] })
      } catch(e) {
        console.log("error deleting loginData",e)
      }
    
      console.log('Done.')
    
  }

  const fetchTerms = async () => {
    // const credentials = await Keychain.getGenericPassword();
    // const token = credentials.username;
    const params = {
      type:"term-and-condition"
    }
    getTermsAndCondition(params)
  }

  const fetchPolicies = async () => {
    // const credentials = await Keychain.getGenericPassword();
    // const token = credentials.username;
    const params = {
      type:"privacy-policy"
    }
    getPolicies(params)
  }

  
  const fetchFaq = async () => {
    // const credentials = await Keychain.getGenericPassword();
    // const token = credentials.username;
    const params = {
      type:"faq"
    }
    getFAQ(params)
  }



  const getMembership = async () => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log(
        'Credentials successfully loaded for user ' + credentials.username
      );
      const token = credentials.username
      getActiveMembershipFunc(token)
    }
  }

  


  useEffect(() => {
    if (fetchProfileData) {
      console.log('fetchProfileData', fetchProfileData);
      if (fetchProfileData.success) {
        setProfileImage(fetchProfileData.body.profile_pic)
      }
    } else if (fetchProfileError) {
      console.log('fetchProfileError', fetchProfileError);
    }
  }, [fetchProfileData, fetchProfileError]);

  useEffect(() => {
    if (getActiveMembershipData) {
      console.log("getActiveMembershipData", JSON.stringify(getActiveMembershipData))
    }
    else if (getActiveMembershipError) {
      console.log("getActiveMembershipError", getActiveMembershipError)
    }
  }, [getActiveMembershipData, getActiveMembershipError])

  useEffect(() => {
    const fetchMenu = async () => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log(
          'Credentials successfully loaded for user ' + credentials.username
        );
        const token = credentials.username
        getAppMenuFunc(token)
      }

    }
    fetchMenu()
    // fetchTerms();
  }, [])

  useEffect(()=>{
    if(getTermsData){
      console.log("getTermsData",getTermsData.body.data?.[0]?.files[0]);
    }
    else if(getTermsError){
      console.log("gettermserror", getTermsError)
    }
  },[getTermsData,getTermsError]);

  const modalClose = () => {
    setError(false);
  };
  
  useEffect(() => {
    if (getAppMenuData) {
      // console.log("usertype", userData.user_type)
      // console.log("getAppMenuData", JSON.stringify(getAppMenuData))
      const tempDrawerData = getAppMenuData.body.filter((item) => {
        return item.user_type === userData.user_type
      })
      // console.log("tempDrawerData", JSON.stringify(tempDrawerData))
      setDrawerData(tempDrawerData[0])
    }
    else if (getAppMenuError) {
      
      console.log("getAppMenuError", getAppMenuError)
    }
  }, [getAppMenuData, getAppMenuError])

  const DrawerItems = (props) => {
    const image = props.image
    const size = props.size
    console.log("image", image)
    return (
      <View
        style={{
          height: 54,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:"white",
          marginTop: 1,
          borderBottomWidth: 1,
          borderColor: '#DDDDDD',
        }}>
        <View
          style={{
            width: '20%',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            marginBottom: 4
          }}>
          {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
          {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
          <Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={{ uri: image }}></Image>
        </View>

        <View
          style={{

            width: '80%',
            alignItems: 'flex-start',
            justifyContent: 'center',

          }}>
          <TouchableOpacity
            onPress={() => {
              if (props.title === "Scan QR Code" || props.title === "Scan and Win") {
                navigation.navigate('QrCodeScanner')
              }
              else if (props.title.toLowerCase() === "passbook") {
                navigation.navigate("Passbook")
              }
              else if (props.title.toLowerCase() === "rewards") {
                navigation.navigate('RedeemRewardHistory')
              }
              else if (props.title.toLowerCase() === "gift catalogue") {
                navigation.navigate('GiftCatalogue')
              }
              else if (props.title.toLowerCase() === "bank details" || props.title.toLowerCase() === "bank account") {
                navigation.navigate('BankAccounts')
              }
              else if (props.title.toLowerCase() === "profile") {
                navigation.navigate('Profile')
              }
              else if (props.title.toLowerCase() === "refer and earn") {
                navigation.navigate('ReferAndEarn')
              }
              else if (props.title.toLowerCase() === "warranty list") {
                navigation.navigate('WarrantyHistory')
              }
              else if (props.title.toLowerCase() === "help and support") {
                navigation.navigate('HelpAndSupport')
              }
              else if (props.title.toLowerCase() === "product catalogue") {
                navigation.navigate('ProductCatalogue')
              }
              else if (props.title.toLowerCase() === "video" || props.title.toLowerCase() === "videos") {
                navigation.navigate('VideoGallery')
              }
              else if (props.title.toLowerCase() === "gallery") {
                navigation.navigate('ImageGallery')
              }
              else if (props.title.substring(0, 4).toLowerCase() === "scan" && (props.title).toLowerCase() !== "scan list") {
                navigation.navigate('QrCodeScanner')
              }
              else if (props.title.toLowerCase() === "scheme") {
                navigation.navigate('Scheme')
              }
              else if (props.title.toLowerCase() === "store locator") {
                navigation.navigate('ScanAndRedirectToWarranty')
              }
              else if (props.title.toLowerCase() === "scan list") {
                navigation.navigate('ScannedHistory')
              }
              else if (props.title.toLowerCase() === "add user") {
                navigation.navigate('ListUsers')
              }
              else if (props.title.toLowerCase() === "query list") {
                navigation.navigate('QueryList')
              }
              else if (props.title.toLowerCase() === "share app") {
                const options = {
                  title: "Share APP",
                  url: shareAppLink
                }
                Share.open(options)
                  .then((res) => {
                    console.log(res);
                  })
                  .catch((err) => {
                    err && console.log(err);
                  });
              }
            }}>
              {console.log("props.title", props.title)}
            <Text style={{ color: primaryThemeColor, fontSize: 15 }}>{props.title == "Passbook" ? "My Loyalty" : props.title == "Profile" ? "My Profile" : props.title == "Rewards" ? "My Rewards" : props.title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const DrawerSections = (props) => {
    const image = props.image
    const size = props.size
    console.log("image", image)
    return (
      <View
        style={{
          height: 54,
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          borderBottomWidth: 1,
          borderColor: '#DDDDDD',
        }}>
        <View
          style={{
            width: '20%',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            marginBottom: 4
          }}>
          {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
          {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
          <Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={{ uri: image }}></Image>
        </View>

        <View
          style={{

            width: '80%',
            alignItems: 'flex-start',
            justifyContent: 'center',

          }}>
          <TouchableOpacity
            onPress={() => {
              if (props.title == "My Program") {

              }
            }}>
            <Text style={{ color: primaryThemeColor, fontSize: 15 }}>{props.title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: '#DDDDDD',alignItems:"center",justifyContent:'center',width:'100%',height:'100%' }}>
       {error &&  <ErrorModal
          modalClose={modalClose}

          message={message}
          openModal={error}></ErrorModal>}
      <View
        style={{
          width:'100%',
          height: 125,
          backgroundColor: ternaryThemeColor,
          borderBottomLeftRadius: 30,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
      {profileImage ?
          <Image
            style={{
              height: 60,
              width: 60,
              borderRadius: 30,
              marginLeft: 10,
              position: 'absolute',
              left: 4,
              resizeMode: 'contain'
            }}
            source={{ uri: profileImage }}></Image>
          :
          <View style={{
        
            paddingHorizontal: 10,
            paddingVertical: 10,
            borderRadius: 30,
            marginLeft: 10,
            position: 'absolute',
            backgroundColor: 'white',
            left: 15,
            resizeMode: 'contain'
          }}>
            <Image
              style={{
                height: 40,
                width: 40,
                

              }}
              source={require('../../assets/images/userGrey.png')}></Image>
          </View>


        }
        <View style={{ justifyContent: 'center', marginLeft: 50 }}>
          {userData && <Text
            style={{
              color: 'white',
              margin: 0,
              fontWeight: '600',
              fontSize: 16,
            }}>
            {userData.name}
          </Text>}
          {userData && <Text style={{ color: 'white', margin: 0,textTransform:"capitalize" }}>{userData.user_type} Account</Text>}

          {!Object.values(kycData).includes(false) ? <View style={{ flexDirection: 'row', marginTop: 4 }}>
            <View
              style={{
                height: 22,
                width: 80,
                borderRadius: 20,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                marginTop: 2,
              }}>
              <Image style={{ height: 10, width: 10, resizeMode: 'contain' }} source={require('../../assets/images/tickBlue.png')}></Image>
              <Text style={{ marginLeft: 4, color: 'black', fontSize: 10, fontWeight: '500' }}>KYC Status</Text>
            </View>

          </View> :
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <View
                style={{
                  height: 22,
                  width: 80,
                  borderRadius: 20,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  marginTop: 2,
                }}>
                <Image style={{ height: 10, width: 10, resizeMode: 'contain' }} source={require('../../assets/images/cancel.png')}></Image>
                <Text style={{ marginLeft: 4, color: 'black', fontSize: 10, fontWeight: '500' }}>KYC Status</Text>
              </View>

            </View>
          }
        </View>
      </View>
      <ScrollView contentContainerStyle={{}} style={{ width: '100%',height:'100%'}} >

        {
          drawerData !== undefined && drawerData.app_menu.map((item, index) => {
            return (
              <DrawerItems
                key={index}
                title={item.name}
                image={item.icon}
                size={20}></DrawerItems>
            )

          })
        }

        {/* My Program Starting */}
        <View
          style={{
            minHeight: 54,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
            paddingBottom:10,
            // zIndex:1,
            borderBottomWidth: 1,
            borderColor: '#DDDDDD',
            backgroundColor:"white"
          }}>
          <TouchableOpacity
            onPress={() => {
              setMyProgramVisibile(!myProgramVisible)
            }}
            style={{
              width: '20%',
              alignItems: 'center',
              // justifyContent: 'center',
              height: '100%',
              marginTop:10
            }}>

            {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
            {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
            {!myProgramVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain',transform: [{ rotate: '270deg' }],marginTop:4 }} source={require('../../assets/images/arrowDown.png')}></Image>}
            {myProgramVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={require('../../assets/images/arrowDown.png')}></Image>}
          </TouchableOpacity>


          <View
            style={{
              width: '80%',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <TouchableOpacity
              onPress={() => {
                setMyProgramVisibile(!myProgramVisible)
              }}>
              <Text style={{ color: primaryThemeColor, fontSize: 15 }}>My Program</Text>
            </TouchableOpacity>

            {myProgramVisible &&
            <View style={{marginTop:5}}>
              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{navigation.navigate("Tutorial")}}>
                <Text onPress={()=>{
                    navigation.navigate("Tutorial")
                }} style={{  fontSize:15, color:ternaryThemeColor }}>Tutorial</Text>
              </TouchableOpacity>

              {getPolicyData && getPolicyData?.body.length!==0 && <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>[
               navigation.navigate("PdfComponent",{pdf: getPolicyData?.body?.data?.[0]?.files?.[0]})
              ]}>
                <Text  style={{  fontSize:15, color:ternaryThemeColor }}>Policies</Text>
              </TouchableOpacity>}

              {getTermsData && getTermsData.body.data.length!==0 && <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{
                 navigation.navigate('PdfComponent',{pdf:getTermsData.body.data?.[0]?.files[0]})
              }}>
                <Text  style={{  fontSize:15, color:ternaryThemeColor }}>T&C</Text>
              </TouchableOpacity>}

              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{
                navigation.navigate('FAQ');
              }}>
                <Text  style={{  fontSize:15, color:ternaryThemeColor }}>F&Q</Text>
              </TouchableOpacity>
              
              </View>
              
            }

          </View>
        </View>
        {/* My Program ending*/}

          {/* Ozone Products Starting */}
          <View
          style={{
            minHeight: 54,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
            paddingBottom:10,
            // zIndex:1,
            borderBottomWidth: 1,
            borderColor: '#DDDDDD',
            backgroundColor:"white"
          }}>
          <TouchableOpacity
            onPress={() => {
              setOzoneProductVisible(!ozoneProductVisible)
            }}
            style={{
              width: '20%',
              alignItems: 'center',
              // justifyContent: 'center',
              height: '100%',
              marginTop:10
            }}>

            {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
            {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
            {!ozoneProductVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain',transform: [{ rotate: '270deg' }],marginTop:4 }} source={require('../../assets/images/arrowDown.png')}></Image>}
            {ozoneProductVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={require('../../assets/images/arrowDown.png')}></Image>}
          </TouchableOpacity>


          <View
            style={{
              width: '80%',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <TouchableOpacity
              onPress={() => {
                setOzoneProductVisible(!ozoneProductVisible)
              }}>
              <Text style={{ color: primaryThemeColor, fontSize: 15 }}>Ozone Products</Text>
            </TouchableOpacity>

            {ozoneProductVisible &&
            <View style={{marginTop:5}}>
              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{
                navigation.navigate('ProductCatalogue')

              }}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>Product Catalogue</Text> 
              </TouchableOpacity>    

              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{Linking.openURL("https://www.ozone-india.com/")}}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>Jump to ozone website</Text> 
              </TouchableOpacity>   

              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{navigation.navigate("ProductCategory")}}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>Category wise product info</Text> 
              </TouchableOpacity>   
              </View>
              
            }

          </View>
        </View>
        {/* Ozone Products ending*/}

           {/* Community Starting */}
           <View
          style={{
            minHeight: 54,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
            paddingBottom:10,
            // zIndex:1,
            borderBottomWidth: 1,
            borderColor: '#DDDDDD',
            backgroundColor:"white"
          }}>
          <TouchableOpacity
            onPress={() => {
              setCommunityVisible(!communityVisible)
            }}
            style={{
              width: '20%',
              alignItems: 'center',
              // justifyContent: 'center',
              height: '100%',
              marginTop:10
            }}>

            {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
            {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
            {!communityVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain',transform: [{ rotate: '270deg' }],marginTop:4 }} source={require('../../assets/images/arrowDown.png')}></Image>}
            {communityVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={require('../../assets/images/arrowDown.png')}></Image>}
          </TouchableOpacity>


          <View
            style={{
              width: '80%',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <TouchableOpacity
              onPress={() => {
                setCommunityVisible(!communityVisible)
              }}>
              <Text style={{ color: primaryThemeColor, fontSize: 15 }}>Community</Text>
            </TouchableOpacity>

            {communityVisible &&
            <View style={{marginTop:5}}>
              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{
                navigation.navigate("WhatsNew")
              }}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>What's New</Text> 
              </TouchableOpacity>    

              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{
                console.log("images-1700639007902-188225481.pdf")
                navigation.navigate("PdfComponent",{pdf:"images-1700639007902-188225481.pdf"})
                
              //  getPolicyData && navigation.navigate("PdfComponent",{pdf: getPolicyData?.body?.data?.[0]?.files?.[0]})

              }}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>Program Content</Text> 
              </TouchableOpacity>

              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{navigation.navigate("TierDetails")}}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>Tier Details</Text> 
              </TouchableOpacity>    
              </View> 
            }

          </View>
        </View>
        {/* Community ending*/}

          {/* Knowledge Hub */}
          <View
          style={{
            minHeight: 54,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 1,
            paddingBottom:10,
            // zIndex:1,
            borderBottomWidth: 1,
            borderColor: '#DDDDDD',
            backgroundColor:'white'
          }}>
          <TouchableOpacity
            onPress={() => {
              setKnowledgeHubVisible(!KnowledgeHubVisible)
            }}
            style={{
              width: '20%',
              alignItems: 'center',
              // justifyContent: 'center',
              height: '100%',
              marginTop:10
            }}>

            {/* <SvgUri width={40} height={40} uri={image}></SvgUri> */}
            {/* <Icon size={size} name="bars" color={ternaryThemeColor}></Icon> */}
            {!KnowledgeHubVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain',transform: [{ rotate: '270deg' }],marginTop:4 }} source={require('../../assets/images/arrowDown.png')}></Image>}
            {KnowledgeHubVisible && <Image style={{ height: 20, width: 20, resizeMode: 'contain' }} source={require('../../assets/images/arrowDown.png')}></Image>}
          </TouchableOpacity>


          <View
            style={{
              width: '80%',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <TouchableOpacity
              onPress={() => {
                setKnowledgeHubVisible(!KnowledgeHubVisible)
              }}>
              <Text style={{ color: primaryThemeColor, fontSize: 15 }}>Knowledge Hub</Text>
            </TouchableOpacity>

            {KnowledgeHubVisible &&
            <View style={{marginTop:5}}>
              <TouchableOpacity onPress={()=>{
                navigation.navigate("InstallationVideo")
              }} style={{ marginTop:5,marginBottom:5 }}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>Installation Video</Text> 
              </TouchableOpacity>    
{/* 
              <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{
                navigation.navigate("ProductCatalogue")
              }}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>Product Guideline</Text> 
              </TouchableOpacity>     */}

                {/* <TouchableOpacity style={{ marginTop:5,marginBottom:5 }} onPress={()=>{navigation.navigate("ListAddress")}}>
                <Text style={{  fontSize:15, color:ternaryThemeColor }}>List Address</Text> 
              </TouchableOpacity>     */}
              </View> 
            }

          </View>
        </View>
        {/* Knowledge Hub*/}

        <TouchableOpacity style={{ backgroundColor: ternaryThemeColor, height: 50, justifyContent: 'center', width: '100%' }} onPress={() => {
         
          handleLogout()
          
          
        }}>
          <PoppinsTextLeftMedium style={{ color: 'white', marginLeft: 90 }} content="LOG OUT -->"></PoppinsTextLeftMedium>
        </TouchableOpacity>

      </ScrollView>



    </View>
  );
}
function DrawerNavigator() {

  return (
    <Drawer.Navigator drawerContent={() => <CustomDrawer />}>
     
      <Drawer.Screen options={{ headerShown: false }} name="DashboardDrawer" component={BottomNavigator} />
      <Drawer.Screen options={{ headerShown: false }} name="Redeem Reward" component={RedeemRewardHistory} />
      <Drawer.Screen options={{ headerShown: false }} name="Add BankAccount And Upi" component={AddBankAccountAndUpi} />
      <Drawer.Screen options={{ headerShown: false }} name="Profile" component={Profile} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator