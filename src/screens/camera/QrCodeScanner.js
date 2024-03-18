import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  Image,
  ScrollView,
  FlatList,
  Vibration
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import PoppinsText from '../../components/electrons/customFonts/PoppinsText';
import PoppinsTextMedium from '../../components/electrons/customFonts/PoppinsTextMedium';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ScannedListItem from '../../components/atoms/ScannedListItem';
import * as Keychain from 'react-native-keychain';
import { useVerifyQrMutation } from '../../apiServices/qrScan/VerifyQrApi';
import ErrorModal from '../../components/modals/ErrorModal';
import ButtonProceed from '../../components/atoms/buttons/ButtonProceed';
import { useAddQrMutation } from '../../apiServices/qrScan/AddQrApi';
import { useSelector, useDispatch } from 'react-redux';
import { setQrData, setQrIdList } from '../../../redux/slices/qrCodeDataSlice';
import { useCheckGenuinityMutation } from '../../apiServices/workflow/genuinity/GetGenuinityApi';
import { useCheckWarrantyMutation } from '../../apiServices/workflow/warranty/ActivateWarrantyApi';
import { useGetProductDataMutation } from '../../apiServices/product/productApi';
import { setProductData } from '../../../redux/slices/getProductSlice';
import { useFetchAllQrScanedListMutation } from '../../apiServices/qrScan/AddQrApi';
import { useAddRegistrationBonusMutation } from '../../apiServices/pointSharing/pointSharingApi';
import { useAddBulkQrMutation } from '../../apiServices/bulkScan/BulkScanApi';
import { slug } from '../../utils/Slug';
import MessageModal from '../../components/modals/MessageModal';
import ModalWithBorder from '../../components/modals/ModalWithBorder';
import Close from 'react-native-vector-icons/Ionicons';
import RNQRGenerator from 'rn-qr-generator';
import { useCashPerPointMutation } from '../../apiServices/workflow/rewards/GetPointsApi';
import { useVerifyBarDistributorMutation, useVerifyBarMutation } from '../../apiServices/barCodeApi/VerifyBarCodeApi';
import { scannerType } from '../../utils/ScannerType';
import { useCameraDevice } from 'react-native-vision-camera';
// import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import { Camera } from 'react-native-vision-camera';
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { request, PERMISSIONS } from 'react-native-permissions';


const QrCodeScanner = ({ navigation }) => {
  const [zoom, setZoom] = useState(0);
  const [zoomText, setZoomText] = useState('1');
  const [flash, setFlash] = useState(false);
  const [addedQrList, setAddedQrList] = useState([]);
  const [addedQrProductId, setAddedQrProductId] = useState([])
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState();
  const [error, setError] = useState(false);
  const [savedToken, setSavedToken] = useState();
  const [productId, setProductId] = useState();
  const [qr_id, setQr_id] = useState();
  const [registrationBonus, setRegistrationBonus] = useState()
  const [helpModal, setHelpModal] = useState(false);
  const [isFirstScan, setIsFirstScan] = useState(false)
  const [isReportable, setIsReportable] = useState(false)

  const userId = useSelector(state => state.appusersdata.userId);
  const userData = useSelector(state => state.appusersdata.userData)
  const userType = useSelector(state => state.appusersdata.userType);
  const userName = useSelector(state => state.appusersdata.name);
  const workflowProgram = useSelector(state => state.appWorkflow.program);
  const location = useSelector(state => state.userLocation.location)
  const shouldSharePoints = useSelector(state => state.pointSharing.shouldSharePoints)
  const appUserData = useSelector(state => state.appusers.value)
  const ternaryThemeColor = useSelector(
    state => state.apptheme.ternaryThemeColor,
  )
    ? useSelector(state => state.apptheme.ternaryThemeColor)
    : 'grey';
  const dispatch = useDispatch();
  console.log('Workflow Program is ', workflowProgram, shouldSharePoints, location, userData);

  const isDistributor = userData?.user_type_id == 3
  console.log("Selector state", userData)

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

  // Render the camera component if permission is granted

  // if (hasPermission === false) {
  //   return (
  //     <View style={{width:'100%', alignItems:'center'}}>
  //       <Text style={{ alignSelf: 'center', justifyContent: 'center', color: 'black', marginTop: '90%', fontSize: 17 }}>No access to camera Please Give Permission</Text>
  //       <TouchableOpacity style={{height:40, width:120, backgroundColor:ternaryThemeColor,alignItems:'center', justifyContent:'center', marginTop:30}} onPress={requestCameraPermission}>
  //         <PoppinsTextMedium style={{ borderRadius:5,color:'white', fontWeight:'bold' }} content={"Give Permission"}></PoppinsTextMedium>
  //       </TouchableOpacity>
  //     </View>
  //   )
  // }


  // mutations ----------------------------------------
  const [
    verifyQrFunc,
    {
      data: verifyQrData,
      error: verifyQrError,
      isLoading: verifyQrIsLoading,
      isError: verifyQrIsError,
    },
  ] = useVerifyQrMutation();

  const [
    verifyQrDistributorFunc,
    {
      data: verifyQrDistributorData,
      error: verifyQDistributorrError,
      isLoading: verifyQrDistributorIsLoading,
      isError: verifyQrDistributorIsError,
    },
  ] = useVerifyBarDistributorMutation();

  const [verifyBarScannerFunc,
    {
      data: verifyBarData,
      error: verifyBarError,
      isLoading: verifyBarIsLoading,
      isError: verifyBarIsError,
    },
  ] = useVerifyBarMutation();

  const [cashPerPointFunc, {
    data: cashPerPointData,
    error: cashPerPointError,
    isLoading: cashPerPointIsLoading,
    isError: cashPerPointIsError
  }] = useCashPerPointMutation()
  const [
    addQrFunc,
    {
      data: addQrData,
      error: addQrError,
      isLoading: addQrIsLoading,
      isError: addQrIsError,
    },
  ] = useAddQrMutation();

  const [
    checkGenuinityFunc,
    {
      data: checkGenuinityData,
      error: checkGenuinityError,
      isLoading: checkGenuinityIsLoading,
      isError: checkGenuinityIsError,
    },
  ] = useCheckGenuinityMutation();

  const [checkWarrantyFunc, {
    data: checkWarrantyData,
    error: checkWarrantyError,
    isLoading: checkWarrantyIsLoading,
    isError: checkWarrantyIsError
  }] = useCheckWarrantyMutation()

  const [
    productDataFunc,
    {
      data: productDataData,
      error: productDataError,
      isLoading: productDataIsLoading,
      isError: productDataIsError,
    },
  ] = useGetProductDataMutation();

  const [
    addRegistrationBonusFunc,
    {
      data: addRegistrationBonusData,
      isLoading: addRegistrationBonusIsLoading,
      error: addRegistrationBonusError,
      isError: addRegistrationBonusIsError,
    },
  ] = useAddRegistrationBonusMutation();

  const [
    fetchAllQrScanedList,
    {
      data: fetchAllQrScanedListData,
      isLoading: fetchAllQrScanedListIsLoading,
      error: fetchAllQrScanedListError,
      isError: fetchAllQrScanedListIsError,
    },
  ] = useFetchAllQrScanedListMutation();

  const [addBulkQrFunc, {
    data: addBulkQrData,
    error: addBulkQrError,
    isLoading: addBulkQrIsLoading,
    isError: addBulkQrIsError
  }] = useAddBulkQrMutation()




  useEffect(() => {
    if (addBulkQrData) {
      console.log("addBulkQrData", addBulkQrData)
      if (addBulkQrData.success) {
        isFirstScan && checkFirstScan()
        isFirstScan && setTimeout(() => {
          handleWorkflowNavigation("Genuinity", "Warranty")
        }, 3000);
        !isFirstScan && handleWorkflowNavigation("Genuinity", "Warranty")

      }
    }

    else if (addBulkQrError) {
      console.log("addBulkQrError", addBulkQrError)
    }
  }, [addBulkQrData, addBulkQrError])
  useEffect(() => {
    if (cashPerPointData) {
      console.log("cashPerPointData", cashPerPointData)
      if (cashPerPointData.success) {
        setRegistrationBonus(Number(cashPerPointData.body.registration_bonus))

      }
    }
    else if (cashPerPointError) {
      console.log("cashPerPointError", cashPerPointError)

    }
  }, [cashPerPointData, cashPerPointError])
  // ----------------------------------------------------
  const height = Dimensions.get('window').height;
  const platform = Platform.OS === 'ios' ? '1' : '2';
  const platformMargin = Platform.OS === 'ios' ? -60 : -160;
  const toDate = undefined
  var fromDate = undefined




  useEffect(() => {
    if (addQrData) {
      console.log("addQrData", addQrData)
      if (addQrData.success) {
        isFirstScan && checkFirstScan()
        // isFirstScan && handleWorkflowNavigation("Genuinity","Warranty")

      }

    }

  }, [addQrData]);

  useEffect(() => {
    if (verifyQrDistributorData) {
      //reverse logic as retailer
      console.log('verifyQrDistributorData', verifyQrDistributorData);
      if (verifyQrDistributorData.body?.qr_status === "2") {
        addQrDataToListDistributor(verifyQrDistributorData.body);
      }
      if (verifyQrDistributorData.body?.qr_status === "1" && verifyQrDistributorData.status === 201) {

        setError(true);
        setMessage(verifyQrDistributorData.message);
      }
      if (verifyQrDistributorData.body?.qr_status === "2" && verifyQrDistributorData.status === 202) {
        setIsReportable(true)
        setError(true);
        setMessage(verifyQrDistributorData.message);
      }
    }
    else if (verifyQDistributorrError) {
      if (verifyQDistributorrError === undefined) {

        setError(true)
        setMessage("This QR is not activated yet")
      }
      else {
        setError(true)
        setMessage(verifyQDistributorrError?.data?.message);

      }
      
      console.log('Verify qr error', verifyQDistributorrError);

    }
  }, [verifyQrDistributorData, verifyQDistributorrError]);

  useEffect(() => {


    (async () => {
      const credentials = await Keychain.getGenericPassword();
      const token = credentials.username;
      getScannedHistory()
      cashPerPointFunc(token)

    })();
  }, [])

  const getScannedHistory = async () => {
    (async () => {
      const credentials = await Keychain.getGenericPassword();
      const token = credentials.username;
      let queryParams = `?user_type_id=${userData.user_type_id
        }&app_user_id=${userData.id}`;
      if (fromDate && toDate) {
        queryParams += `&from_date=${moment(fromDate).format('YYYY-MM-DD')}&to_date=${moment(toDate).format('YYYY-MM-DD')}`;
      } else if (fromDate) {
        queryParams += `&from_date=${fromDate}`;
      }

      console.log("queryParams", queryParams);
      if (shouldSharePoints) {
        fetchAllQrScanedList({
          token: token,
          query_params: queryParams,
        });
      }

    })();
  }

  const codeScanner = {
    // codeTypes: ["code-128" | "code-39" | "code-93" | "codabar" | "ean-13" | "ean-8" | "itf" | "upc-e" | "qr" | "pdf-417" | "aztec" | "data-matrix"],
    codeTypes: ['code-128'],
    onCodeScanned: (codes) => {
      console.log(`Scanned ${codes.length} codes!`, JSON.stringify(codes[0]))
      let e = {
        data: codes[0].value
      }
      if (isDistributor) {
        OnReturedCheck(e)
      }
      else {
        onSuccessBar(e)

      }
    }
  }

  const checkFirstScan = async () => {


    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      console.log(
        'Credentials successfully loaded for user ' + credentials.username
      );
      console.log("First scan")
      const token = credentials.username
      const body = {
        tenant_id: slug,
        token: token,
        data: {
          point_earned_through_type: "registration_bonus",
          points: registrationBonus,
          platform_id: Number(platform),
          pincode: location.postcode === undefined ? "N/A" : location.postcode,
          platform: 'mobile',
          state: location.state === undefined ? "N/A" : location.state,
          district: location.district === undefined ? "N/A" : location.district,
          city: location.city === undefined ? "N/A" : location.city,
          area: location.district === undefined ? "N/A" : location.district,
          known_name: location.city === undefined ? "N/A" : location.city,
          lat: location.lat === undefined ? "N/A" : (String(location.lat)).substring(0, 10),
          log: location.lon === undefined ? "N/A" : (String(location.lon)).substring(0, 10),
          method_id: "1",
          method: "registration bonus",
        },

      }
      console.log("Registration Bouns", data)
      addRegistrationBonusFunc(body)
    }

  }


  useEffect(() => {
    if (addRegistrationBonusData) {
      console.log("addRegistrationBonusData", addRegistrationBonusData)
      if (addRegistrationBonusData.success) {
        setSuccess(true)
        setMessage(addRegistrationBonusData.message)
      }
    }
    else if (addRegistrationBonusError) {
      console.log("addRegistrationBonusError", addRegistrationBonusError)
    }
  }, [addRegistrationBonusData, addRegistrationBonusError])

  useEffect(() => {
    if (fetchAllQrScanedListData) {
      // console.log("fetchAllQrScanedListData", fetchAllQrScanedListData.body.data)
      // checkFirstScan(fetchAllQrScanedListData.body.data)
      if (fetchAllQrScanedListData.body.data.length === 0) {
        setIsFirstScan(true)
      }

    }
    else if (fetchAllQrScanedListError) {
      console.log("fetchAllQrScanedListError", fetchAllQrScanedListError)
    }
  }, [fetchAllQrScanedListData, fetchAllQrScanedListError])
  useEffect(() => {
    if (checkGenuinityData) {
      console.log('genuinity check', checkGenuinityData);
    } else if (checkGenuinityError) {
      console.log('Error', checkGenuinityError);
    }
  }, [checkGenuinityData, checkGenuinityError]);

  useEffect(() => {
    if (checkWarrantyData) {
      console.log('warranty check', checkWarrantyData);
    } else if (checkWarrantyError) {
      console.log('warranty Error', checkWarrantyError);
    }
  }, [checkWarrantyData, checkWarrantyError]);

  useEffect(() => {
    if (productDataData) {
      const form_type = '2';
      const token = savedToken
      console.log('Product Data is ', productDataData.body);

      if (productDataData.body.products.length !== 0) {
        const body = { product_id: productDataData.body.products[0].product_id, qr_id: qr_id };
        console.log("productdata", token, body)
        dispatch(setProductData(productDataData.body.products[0]));
        setProductId(productDataData.body.product_id);

        checkWarrantyFunc({ form_type, token, body })
      }
      else {


        setError(true)
        setMessage("Product data not available.")
      }


    } else if (productDataError) {
      console.log('pr Error', productDataError);
      setError(true)
      setMessage(productDataError.message)
    }
  }, [productDataData, productDataError]);

  const modalClose = () => {
    setError(false);
    setSuccess(false)
    setIsReportable(false)
  };

  const onSuccessBar = e => {
    console.log('Qr data is ------------------>', e);

    Vibration.vibrate([1000, 500, 1000]);

    if (e.data === undefined) {
      setError(true)
      setMessage("Please scan a valid QR")
    }
    else {
      Vibration.vibrate([1000, 500, 1000]);
      const requestData = { unique_code: e.data };
      const verifyQR = async data => {
        // console.log('qrData', data);
        try {
          // Retrieve the credentials

          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            console.log(
              'Credentials successfully loaded for user ' + credentials.username, data
            );
            setSavedToken(credentials.username);
            const token = credentials.username;

            const obj = {
              body: {
                unique_code: e?.data,
                platform_id: 1,
                scanned_by_name: userData.name
              },
              token: token
            }
            console.log("token from file", token)
            data && verifyBarScannerFunc(obj);

          } else {
            console.log('No credentials stored');
          }
        } catch (error) {
          console.log("Keychain couldn't be accessed!", error);
        }
      };

      verifyQR(requestData);
    }

  };


  const OnReturedCheck = e => {

    console.log("eee", e)
    if (e.data === undefined) {
      setError(true)
      setMessage("Please scan a valid QR")
    }
    else {
      Vibration.vibrate([1000, 500, 1000]);
      const requestData = { unique_code: e.data };
      const verifyQrDistributor = async data => {
        // console.log('qrData', data);
        try {
          // Retrieve the credentials

          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            console.log(
              'Credentials successfully loaded for user ' + credentials.username, data
            );
            setSavedToken(credentials.username);
            const token = credentials.username;

            const obj = {
              body: {
                unique_code: e?.data,
                platform_id: 1,
                scanned_by_name: userData.name
              },
              token: token
            }
            console.log("token from file", token)
            data && verifyQrDistributorFunc(obj);

          } else {
            console.log('No credentials stored');
          }
        } catch (error) {
          console.log("Keychain couldn't be accessed!", error);
        }
      };

      verifyQrDistributor(requestData);
    }


  }


  // function called on successfull scan --------------------------------------
  const onSuccess = e => {
    console.log('Qr data is ------', e.data);

    if (e.data === undefined) {
      setError(true)
      setMessage("Please scan a valid QR")
    }
    else {
      const qrData = e.data.split('=')[1];
      console.log("qrData", qrData);

      const requestData = { unique_code: qrData };
      const verifyQR = async data => {
        // console.log('qrData', data);
        try {
          // Retrieve the credentials

          const credentials = await Keychain.getGenericPassword();
          if (credentials) {
            console.log(
              'Credentials successfully loaded for user ' + credentials.username, data
            );
            setSavedToken(credentials.username);
            const token = credentials.username;

            data && verifyQrFunc({ token, data });
          } else {
            console.log('No credentials stored');
          }
        } catch (error) {
          console.log("Keychain couldn't be accessed!", error);
        }
      };
      verifyQR(requestData);
    }

  };

  // add qr to the list of qr--------------------------------------
  const addQrDataToList = data => {
    console.log("addQrDataToList", data)
    console.log("Scanner Type ", scannerType, data.id )
    const qrId =  (scannerType == "QR") ? data.id : data.qr_id;
    console.log("Qr id",qrId, addedQrList)
    
    setQr_id(data.id);

    
    const token = savedToken;
    const productCode = data.product_code;


    workflowProgram.includes("Genunity") && checkGenuinityFunc({ qrId, token });

    productDataFunc({ productCode, userType, token });
    console.log("ProductDataFunc", { productCode, userType, token })

    if (addedQrList.length === 0) {
      setAddedQrList([...addedQrList, data]);
    } else {
      const existingObject = addedQrList.find(
        obj => obj.unique_code === data.unique_code,
      );
      if (!existingObject) {
        setAddedQrList([...addedQrList, data]);
      } else {

        setError(true);
        setMessage('Sorry This Barcode is already added to the list');
      }
    }
  };




  const addQrDataToListDistributor = data => {
    console.log("addQrDataToListDistributor", data)
    const qrId = Number(data.id);
    setQr_id(qrId);
    const token = savedToken;
    const productCode = data.product_code;


    workflowProgram?.includes("Genunity") && checkGenuinityFunc({ qrId, token });

    productDataFunc({ productCode, userType, token });
    console.log("ProductDataFunc", { productCode, userType, token })

    if (addedQrList.length === 0) {
      setAddedQrList([...addedQrList, data]);
    } else {
      const existingObject = addedQrList.find(
        obj => obj.unique_code === data.unique_code,
      );
      if (!existingObject) {
        setAddedQrList([...addedQrList, data]);
      } else {
        setError(true);
        setMessage('Sorry This Barcode is already added to the list');
      }
    }
  };




  // --------------------------------------------------------

  // delete qr from list of qr-------------------------------------
  const deleteQrFromList = code => {
    const removedList = addedQrList.filter((item, index) => {
      return item.unique_code !== code;
    });
    setAddedQrList(removedList);

  };
  // --------------------------------------------------------

  // function to handle workflow navigation-----------------------
  const handleWorkflowNavigation = (item1, item2, item3) => {
    console.log('success');
    console.log("Items are", item1, item2, item3);

    const itemsToRemove = [item1, item2, item3];
    const updatedWorkflowProgram = workflowProgram.filter(item => !itemsToRemove.includes(item));

    if (updatedWorkflowProgram[0] === 'Static Coupon') {
      console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate('CongratulateOnScan', {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0]
      });
    } else if (updatedWorkflowProgram[0] === 'Warranty') {
      console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate('ActivateWarranty', {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0]

      });
    } else if (updatedWorkflowProgram[0] === 'Points On Product' || updatedWorkflowProgram[0] === 'Cashback' || updatedWorkflowProgram[0] === 'Wheel') {
      console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate('CongratulateOnScan', {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0]

      });
    } else if (updatedWorkflowProgram[0] === 'Genuinity+') {
      console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate('GenuinityScratch', {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0]
      });
    } else if (updatedWorkflowProgram[0] === 'Genuinity') {
      console.log(updatedWorkflowProgram.slice(1));
      navigation.navigate('Genuinity', {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0]
      });
    }

    else if (updatedWorkflowProgram[0] === "barcode revert") {
      navigation.navigate('CongratulateOnScan', {
        workflowProgram: updatedWorkflowProgram.slice(1),
        rewardType: updatedWorkflowProgram[0]

      });
    }

    else {
      console.log("You have completed the workflow")
    }
  };

  // --------------------------------------------------------
  //check if warranty is claimed
  // useEffect(() => {
  //   if (checkWarrantyData) {
  //     console.log("Check Warranty Is Already Claimed",checkWarrantyData.body);

  //   } else {
  //     console.log(checkWarrantyError);
  //   }
  // }, [checkWarrantyData, checkWarrantyError]);
  // --------------------------------------------------------

  // getting verify qr data --------------------------
  useEffect(() => {
    if (verifyQrData) {
      console.log('Verify qr data', verifyQrData);
      if (verifyQrData.body?.qr?.qr_status === "1") {
        addQrDataToList(verifyQrData.body.qr);
      }
      if (verifyQrData.body?.qr?.qr_status === "2" && verifyQrData.status === 201) {

        setError(true);
        setMessage(verifyQrData.message);
      }
      if (verifyQrData.body?.qr?.qr_status === "2" && verifyQrData.status === 202) {
        setIsReportable(true)
        setError(true);
        setMessage(verifyQrData.message);
      }
    }
    else if (verifyQrError) {
      if (verifyQrError === undefined) {

        setError(true)
        setMessage("This QR is not activated yet")
      }
      else {
        setError(true)
        setMessage(verifyQrError.data?.message);

      }
      console.log('Verify qr error', verifyQrError.data.Error);

    }
  }, [verifyQrData, verifyQrError]);






  // --------------------------------------------------------
  useEffect(() => {
    if (verifyBarData) {
      addQrDataToList(verifyBarData.body);
      

      console.log('Verify bar data', verifyBarData);
      if (verifyBarData.body?.status === "1") {
        addQrDataToList(verifyBarData.body);
      }
      if (verifyBarData.body?.status === "2" && verifyBarData.status === 201) {

        setError(true);
        setMessage(verifyBarData.message);
      }
      if (verifyBarData.body?.status === "2" && verifyBarData.status === 202) {
        setIsReportable(true)
        setError(true);
        setMessage(verifyBarData.message);
      }
    }
    else if (verifyBarError) {
      if (verifyBarError === undefined) {

        setError(true)
        setMessage("This QR is not activated yet")
      }
      else {
        if (verifyBarError.status !== 409) {
          setError(true)
          setMessage(JSON.stringify(verifyBarError));
        }

        else{
          setError(true)
          setMessage(verifyBarError?.data?.message);
        }

      }
      console.log('Verify qr error', verifyBarError);

    }
  }, [verifyBarData, verifyBarError]);

  //getting add qr data ------------------------------------
  useEffect(() => {
    if (addQrData) {
      console.log('Add qr data', addQrData.body);
      if (addQrData.success) {  
        dispatch(setQrData(addQrData.body));
        console.log("check Genuinity and warranty", checkGenuinityData, checkWarrantyData)

        if (checkGenuinityData) {

          if (checkGenuinityData.body) {
            console.log("check warranty data", checkWarrantyData)
            if (checkWarrantyError) {
              if (checkWarrantyError.data.body) {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+", "Warranty")
                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Genuinity+", "Warranty")
              }
              else {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+")

                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Genuinity+")

              }
            }
            else if (checkWarrantyData) {
              if (checkWarrantyData.body) {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+", "Warranty")
                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Genuinity+", "Warranty")
              }
              else {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+")

                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Genuinity+")
              }
            }
          }
          else {
            if (checkWarrantyError) {
              console.log("Check warranty error")
              if (checkWarrantyError.data.body) {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Warranty")

                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Warranty")
              }
              else {
                handleWorkflowNavigation()
              }
            }
            else if (checkWarrantyData) {
              console.log("in else if CheckwarantyData")
              if (checkWarrantyData.body) {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Warranty")

                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Warranty")
              }
              else {
                console.log("else1")
                isFirstScan &&
                  setTimeout(() => {
                    handleWorkflowNavigation()

                  }, 3000);
                !isFirstScan && handleWorkflowNavigation()
              }
            }
            else {
              console.log("else2")
              isFirstScan &&
                setTimeout(() => {
                  handleWorkflowNavigation()

                }, 3000);
              !isFirstScan && handleWorkflowNavigation()
            }
          }
        }
        else if (checkWarrantyError) {
          console.log("IN CHeckwarranty error", checkWarrantyError)
          if (checkWarrantyError.data.body) {
            
            if (checkGenuinityData) {
              if (checkGenuinityData.body) {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Genuinity+", "Warranty")
                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Genuinity+", "Warranty")
              }
              else {
                isFirstScan && setTimeout(() => {
                  handleWorkflowNavigation("Warranty")

                }, 3000);
                !isFirstScan && handleWorkflowNavigation("Warranty")
              }
            }

          }
        }
        else {
          console.log("else")
          isFirstScan &&
            setTimeout(() => {
              handleWorkflowNavigation()

            }, 3000);
          !isFirstScan && handleWorkflowNavigation()
        }

      }
    } else if (addQrError) {
      console.log("Last")
      console.log("addQrError", addQrError);
    }
  }, [addQrData, addQrError]);
  // --------------------------------------------------------

  // handle camera functions --------------------------------------

  const handleFlash = () => {
    setFlash(!flash);
  };

  const handleZoom = () => {
    if (zoom === 0) {
      setZoom(0.5);
      setZoomText('2');
    } else {
      setZoom(0);
      setZoomText('1');
    }
  };

  const handleOpenImageGallery = async () => {
    const result = await launchImageLibrary();
    console.log("result", result)
    RNQRGenerator.detect({
      uri: result.assets[0].uri
    })
      .then(response => {
        const { values } = response; // Array of detected QR code values. Empty if nothing found.
        console.log("From gallery", response.values[0])
        // const requestData = {unique_code: response.values[0].split("=")[1]};
        const requestData = response.values[0]
        onSuccess({ data: requestData })
        console.log(requestData)

      })
      .catch((error) => {
        console.log('Cannot detect QR code in image', error)

      });
  };

  // --------------------------------------------------------

  // function to call add qr api -------------------------------


  const handleAddBar = () => {
    let addedbarcodesId = []
    console.log("list of added barcodes",addedQrList)
    for (var i = 0; i < addedQrList.length; i++) {
      addedbarcodesId.push(addedQrList[i].qr_id)
    }

    console.log("list of added barcodes2", addedbarcodesId, addedQrList.length)
    if (addedQrList.length <= 1) {
      console.log("qr list is less than 1", addedQrList)
      dispatch(setQrIdList(addedbarcodesId))
    }
    else if (addedQrList.length > 1) {
      console.log("qr list is greater than 1", addedQrList)
      dispatch(setQrIdList(addedbarcodesId))
    }

    handleWorkflowNavigation()
  }

  const handleReturnBar = () => {
    let addedbarcodesId = []
    console.log("list of added barcodes", addedQrList)
    for (var i = 0; i < addedQrList.length; i++) {
      addedbarcodesId.push(addedQrList[i]?.id)
    }

    console.log("list of added barcodes", addedbarcodesId)
    if (addedQrList.length <= 1) {
      console.log("qr list is less than 1", addedQrList)
      dispatch(setQrIdList(addedbarcodesId))
    }
    else if (addedQrList.length > 1) {
      console.log("qr list is greater than 1", addedQrList)
      dispatch(setQrIdList(addedbarcodesId));
    }

    handleWorkflowNavigation()
  }



  const handleAddQr = () => {
    console.log("Entered with addedqrlist", addedQrList)
    const token = savedToken;
    if (addedQrList.length > 1) {

      const addedQrID = addedQrList.map((item, index) => {
        return item.id
      })
      const params = {
        token: token,
        data: {
          "qrs": addedQrID,
          "platform_id": 1,
          "name": userData.name
        }
      }
      addBulkQrFunc(params)
      dispatch(setQrIdList(addedQrID))
      console.log("hry",addedQrID, addedQrList)
    }
    else {
      if (productDataData) {
        addedQrList.length !== 0 &&
          addedQrList.map((item, index) => {
            const requestData = {
              qr_id: item.id,
              user_type_id: userId,
              user_type: userType,
              platform_id: platform,
              scanned_by_name: userName,
              address: location.address,
              state: location.state,
              district: location.district,
              city: location.city,
              lat: location.lat,
              log: location.lon
            };
            // dispatch(setQrIdList([item.id]))
            token && addQrFunc({ token, requestData });
          });
      }

    }



  };
  const device = useCameraDevice('back')


  // --------------------------------------------------------
  const helpModalComp = () => {
    return (
      <View style={{ width: 340, height: 320, alignItems: "center", justifyContent: "center" }}>
        {scannerType == "QR" ?
          <Image style={{ height: 370, width: 390, }} source={(require('../../../assets/images/howToScan.png'))}></Image>
          :
          <Image style={{ height: 370, width: 390, }} source={(require('../../../assets/images/howtobar.png'))}></Image>

        }
        <TouchableOpacity style={[{
          backgroundColor: ternaryThemeColor, padding: 6, borderRadius: 5, position: 'absolute', top: -10, right: -10,
        }]} onPress={() => setHelpModal(false)} >
          <Close name="close" size={17} color="#ffffff" />
        </TouchableOpacity>

      </View>
    )
  }


  return (
    scannerType == "QR" ?
      <QRCodeScanner
        onRead={onSuccess}
        reactivate={true}
        vibrate={true}
        reactivateTimeout={2000}
        fadeIn={true}
        flashMode={
          !flash
            ? RNCamera.Constants.FlashMode.off
            : RNCamera.Constants.FlashMode.torch
        }
        customMarker={
          <View style={{ height: '100%', width: '100%', flexDirection: 'row' }}>
            <View
              style={{
                height: '36%',
                width: '80%',
                position: 'absolute',
                top: 10,
                alignItems: 'center',
                justifyContent: 'center',
                left: 0,
              }}>
              <PoppinsText
                style={{
                  fontSize: 20,
                  color: 'white',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                }}
                content="Scan Product QR Code"></PoppinsText>
              <View
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 4,
                  borderColor: '#305CB8',
                  height: 200,
                  width: 240,
                  borderRadius: 20,
                  position: 'absolute',
                  right: 0,
                  top: 40,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}>
                <View
                  style={{
                    height: 40,
                    width: 80,
                    backgroundColor: '#58585A',
                    borderRadius: 20,
                    marginBottom: 8,
                    flexDirection: 'row',
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      setHelpModal(true)
                    }}
                    style={{
                      backgroundColor: 'black',
                      height: 34,
                      width: 34,
                      borderRadius: 17,
                      position: 'absolute',
                      left: 5,
                      top: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Image
                      style={{ height: 16, width: 16, resizeMode: 'contain' }}
                      source={require('../../../assets/images/qrQuestionMark.png')}></Image>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleZoom();
                    }}
                    style={{
                      backgroundColor: 'black',
                      height: 34,
                      width: 34,
                      borderRadius: 17,
                      position: 'absolute',
                      right: 5,
                      top: 3,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text style={{ fontSize: 14, color: '#FB774F' }}>
                      {zoomText}X
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View
              style={{
                width: '20%',
                height: '36%',
                position: 'absolute',
                right: 0,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Dashboard');
                }}
                style={{ height: 34, width: 34, margin: 10, left: 20 }}>
                <Image
                  style={{ height: 34, width: 34, resizeMode: 'contain' }}
                  source={require('../../../assets/images/qrCancel.png')}></Image>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleFlash();
                }}
                style={{ height: 44, width: 44, margin: 20 }}>
                <Image
                  style={{ height: 44, width: 44, resizeMode: 'contain' }}
                  source={require('../../../assets/images/qrTorch.png')}></Image>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleOpenImageGallery();
                }}
                style={{ height: 44, width: 44, margin: 20 }}>
                <Image
                  style={{ height: 44, width: 44, resizeMode: 'contain' }}
                  source={require('../../../assets/images/qrGallery.png')}></Image>
              </TouchableOpacity>
            </View>
          </View>
        }
        showMarker={true}
        cameraStyle={{ height: '100%' }}
        cameraProps={{ zoom: zoom }}
        bottomContent={
          <View
            style={{
              height: height - 100,
              backgroundColor: 'white',
              width: '100%',
              top: platformMargin,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
            {error && verifyQrData && (
              <ErrorModal
                modalClose={modalClose}
                productData={verifyQrData.body?.qr}
                message={message}
                isReportable={isReportable}
                openModal={error}></ErrorModal>
            )}
            {error && (
              <ErrorModal
                modalClose={modalClose}
                isReportable={isReportable}
                message={message}

                openModal={error}></ErrorModal>
            )}
            {
              success && (
                <MessageModal
                  modalClose={modalClose}
                  title="Success"
                  message={message}
                  openModal={success}></MessageModal>
              )
            }
            {addedQrList.length === 0 ? (
              <View
                style={{
                  height: '100%',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                <ScrollView contentContainerStyle={{ alignItems: "center", justifyContent: 'center', width: '80%', marginTop: 60 }}>
                  <Image
                    style={{ height: 300, width: 300, resizeMode: 'contain' }}
                    source={require('../../../assets/images/qrHowTo.png')}></Image>
                  {/* <PoppinsTextMedium
                    style={{ color: 'grey', fontWeight: '700', fontSize: 20 }}
                    content="Please start scanning by pointing the camera towards the Bar Code"></PoppinsTextMedium> */}
                </ScrollView>
              </View>
            ) : (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <FlatList
                  style={{ width: '100%', height: 400 }}
                  data={addedQrList}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {console.log("the Item =================>", item)}
                      {!error && (
                        <ScannedListItem
                          handleDelete={deleteQrFromList}
                          unique_code={item.unique_code}
                          index={index}
                          serialNo={item.batch_running_code}
                          productName={item.created_by_name}
                          productCode={item.product_code}
                          barcode={item.barcode}
                          mrp={item.mrp}
                          batchCode={item.batch_code}></ScannedListItem>
                      )}
                    </View>
                  )}
                  keyExtractor={item => item.id}
                />
              </View>
            )}
            {
              productDataData && productDataData.body.products.length !== 0 &&
              <ButtonProceed
                handleOperation={handleAddQr}
                style={{ color: 'white' }}
                content={isDistributor ? "Revert Bar & Points" : "Proceed"}
                navigateTo={'QrCodeScanner'}></ButtonProceed>
            }


            {helpModal && <ModalWithBorder
              modalClose={() => { setHelpModal(!helpModal) }}
              // message={message}
              openModal={helpModal}
              // navigateTo="WarrantyClaimDetails"
              // parameters={{ warrantyItemData: data, afterClaimData: warrantyClaimData }}
              comp={helpModalComp}></ModalWithBorder>}
          </View>
        }
      />
      :
      // <GestureHandlerRootView></GestureHandlerRootView>
      <View style={{ height: '100%', width: '100%' }}>
        {/* <Camera
          onBarCodeRead={onSuccessBar}
      //     onBarCodeRead={(e)=>{
      //            if (!barcodeRead) {
      //      setBarcodeRead(true) 
      //       // Do your work
      //       onSuccessBar(e)
      //       console.log("barcode scan,",e)
      //  }
       
           
      //     }}
     
      <View style={{ flex: 1, }}>
        <RNCamera
          //     onBarCodeRead={(e)=>{
          onBarCodeRead={!isDistributor ? onSuccessBar : OnReturedCheck}
          //            if (!barcodeRead) {
          //      setBarcodeRead(true) 
          //       // Do your work
          //       onSuccessBar(e)
          //       console.log("barcode scan,",e)
          //  }


          //     }}

          flashMode={
            flash
              ? RNCamera.Constants.FlashMode.torch
              : RNCamera.Constants.FlashMode.off
          }
          ref={cameraRef}
          style={{ height: '60%' }}
        > */}

        <Camera
          codeScanner={codeScanner}
          focusable={true}
          // frameProcessor={frameProcessor}
          // frameProcessorFps={5}
          style={{ height: '60%' }}
          device={device}
          isActive={true}
          torch={flash ? "on" : "off"}
        // format={}
        >

        </Camera>


        <View style={{ width: '100%', flexDirection: 'row', position: 'absolute', top: 0, right: 0 }}>

          <View
            style={{
              height: '36%',
              width: '80%',
              alignItems: 'center',
              justifyContent: 'center',

            }}>
            <PoppinsTextMedium
              style={{
                fontSize: 20,
                color: 'white',
                marginLeft: 75
              }}
              content="Scan Product Bar Code"></PoppinsTextMedium>
            <View
              style={{
                backgroundColor: 'transparent',
                borderWidth: 4,
                borderColor: '#305CB8',
                height: 200,
                width: 240,
                alignSelf: 'center',
                position: 'absolute',
                right: 0,
                top: 60,

                alignItems: 'center',
                justifyContent: 'flex-end',

              }}>
              <View
                style={{
                  height: 40,
                  width: 80,
                  backgroundColor: '#58585A',
                  borderRadius: 20,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setHelpModal(true)
                  }}
                  style={{
                    backgroundColor: 'black',
                    height: 34,
                    width: 34,
                    borderRadius: 17,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Image
                    style={{ height: 16, width: 16, resizeMode: 'contain', alignSelf: 'center' }}
                    source={require('../../../assets/images/qrQuestionMark.png')}></Image>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  onPress={() => {
                    handleZoom();
                  }}
                  style={{
                    backgroundColor: 'black',
                    height: 34,
                    width: 34,
                    borderRadius: 17,
                    position: 'absolute',
                    right: 5,
                    top: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ fontSize: 14, color: '#FB774F' }}>
                    {zoomText}X
                  </Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </View>
          <View
            style={{
              width: '20%',
              height: '36%',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Dashboard');
              }}
              style={{ height: 34, width: 34, margin: 10, left: 20 }}>
              <Image
                style={{ height: 34, width: 34, resizeMode: 'contain' }}
                source={require('../../../assets/images/qrCancel.png')}></Image>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                handleFlash();
              }}
              style={{ height: 44, width: 44, margin: 20, marginTop: 80 }}>
              <Image
                style={{ height: 44, width: 44, resizeMode: 'contain', }}
                source={require('../../../assets/images/qrTorch.png')}></Image>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => {
                handleOpenImageGallery();
              }}
              style={{ height: 44, width: 44, margin: 20 }}>
              <Image
                style={{ height: 44, width: 44, resizeMode: 'contain' }}
                source={require('../../../assets/images/qrGallery.png')}></Image>
            </TouchableOpacity> */}
          </View>
        </View>

        <View>

          <View
            style={{
              height: height - 100,
              backgroundColor: 'white',
              width: '100%',
              top: platformMargin,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
            {error && verifyQrData && (
              <ErrorModal
                modalClose={modalClose}
                productData={verifyQrData.body?.qr}
                message={message}
                isReportable={isReportable}
                openModal={error}></ErrorModal>
            )}
            {error && (
              <ErrorModal
                modalClose={modalClose}
                isReportable={isReportable}
                message={message}

                openModal={error}></ErrorModal>
            )}
            {
              success && (
                <MessageModal
                  modalClose={modalClose}
                  title="Success"
                  message={message}
                  openModal={success}></MessageModal>
              )
            }
            {addedQrList.length === 0 ? (
              <View
                style={{
                  height: '100%',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                {console.log("addede QRLIST", addedQrList)}
                <ScrollView contentContainerStyle={{ alignItems: "center", justifyContent: 'center', width: '80%', marginTop: 60 }}>
                  <Image
                    style={{ height: 300, width: 300, resizeMode: 'contain' }}
                    source={require('../../../assets/images/barHowTo.png')}></Image>
                  {/* <PoppinsTextMedium
style={{ color: 'grey', fontWeight: '700', fontSize: 20 }}
content="Please start scanning by pointing the camera towards the Bar Code"></PoppinsTextMedium> */}
                </ScrollView>
              </View>
            ) : (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {console.log("addede QRLIST", addedQrList)}
                <FlatList
                  style={{ width: '100%', height: 400 }}
                  data={addedQrList}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {!error && (
                        <ScannedListItem
                          handleDelete={deleteQrFromList}
                          unique_code={item.unique_code}
                          index={index}
                          serialNo={item.batch_code}
                          productName={item.product_name}
                          productCode={item.product_code}
                          mrp={item.mrp}
                          barcode={item.unique_code}
                          batchCode={item.batch_code}></ScannedListItem>
                      )}
                    </View>
                  )}
                  keyExtractor={item => item.id}
                />
              </View>
            )}
            {
              productDataData && productDataData.body.products.length !== 0 &&
              <ButtonProceed
                handleOperation={isDistributor ? handleReturnBar : handleAddBar}
                style={{ color: 'white' }}
                // content="Proceed"
                content={isDistributor ? "Revert Bar & Points" : "Proceed"}

                navigateTo={'QrCodeScanner'}></ButtonProceed>
            }
          </View>
        </View>



        {helpModal && <ModalWithBorder
          modalClose={() => { setHelpModal(!helpModal) }}
          // message={message}
          openModal={helpModal}
          // navigateTo="WarrantyClaimDetails"
          // parameters={{ warrantyItemData: data, afterClaimData: warrantyClaimData }}
          comp={helpModalComp}></ModalWithBorder>}



      </View>
  );
};

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'black',
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default QrCodeScanner;