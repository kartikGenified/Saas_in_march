// import React, { useEffect, useState } from "react";
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   FlatList,
// } from "react-native";
// import PoppinsText from "../../components/electrons/customFonts/PoppinsText";
// import PoppinsTextMedium from "../../components/electrons/customFonts/PoppinsTextMedium";
// import { useSelector } from "react-redux";
// import * as Keychain from "react-native-keychain";
// import { useFetchCashbackEnteriesOfUserMutation } from "../../apiServices/workflow/rewards/GetCashbackApi";
// import DataNotFound from "../data not found/DataNotFound";
// import AnimatedDots from "../../components/animations/AnimatedDots";
// import { useGetCashTransactionsMutation } from "../../apiServices/cashback/CashbackRedeemApi";
// import moment from "moment";

// const CashbackHistory = ({ navigation }) => {
//   const [showNoDataFound, setShowNoDataFound] = useState(false);
//   const [totalCashbackEarned, setTotalCashbackEarned] = useState(0)
  
//   const userId = useSelector((state) => state.appusersdata.userId);
//   const userData = useSelector((state) => state.appusersdata.userData);

//   const ternaryThemeColor = useSelector(
//     (state) => state.apptheme.ternaryThemeColor
//   )
//     ? useSelector((state) => state.apptheme.ternaryThemeColor)
//     : "#FFB533";

//   console.log(userId);

//   // const [fetchCashbackEnteriesFunc, {
//   //     data: fetchCashbackEnteriesData,
//   //     error: fetchCashbackEnteriesError,
//   //     isLoading: fetchCashbackEnteriesIsLoading,
//   //     isError: fetchCashbackEnteriesIsError
//   // }] = useFetchCashbackEnteriesOfUserMutation()

//   const [
//     getCashTransactionsFunc,
//     {
//       data: getCashTransactionsData,
//       error: getCashTransactionsError,
//       isLoading: getCashTransactionsIsLoading,
//       isError: getCashTransactionsIsError,
//     },
//   ] = useGetCashTransactionsMutation();

//   useEffect(() => {
//     const getData = async () => {
//       const credentials = await Keychain.getGenericPassword();
//       if (credentials) {
//         console.log(
//           "Credentials successfully loaded for user " + credentials.username
//         );
//         const token = credentials.username;
//         const params = { token: token, appUserId: userData.id };
//         getCashTransactionsFunc(params);
//       }
//     };
//     getData();
//   }, []);

//   useEffect(() => {
//     if (getCashTransactionsData) {
//         let cashback = 0
//       console.log(
//         "getCashTransactionsData",
//         JSON.stringify(getCashTransactionsData)
//       );
//       if(getCashTransactionsData.body)
//       {
//         for(var i=0;i<getCashTransactionsData.body?.data?.length;i++)
//         {
            
//           if(getCashTransactionsData.body.data[i].approval_status==="1")
//           {           
//             cashback = cashback+ Number(getCashTransactionsData.body.data[i].cash)
//             console.log("getCashTransactionsData",getCashTransactionsData.body.data[i].cash,cashback)
//           }
//         }
//         setTotalCashbackEarned(cashback)
//       }
   
//     } else if (getCashTransactionsError) {
//       console.log("getCashTransactionsError", getCashTransactionsError);
//     }
//   }, [getCashTransactionsData, getCashTransactionsError]);

//   const Header = () => {
//     return (
//       <View
//         style={{
//           height: 40,
//           width: "100%",
//           backgroundColor: "#DDDDDD",
//           alignItems: "center",
//           justifyContent: "center",
//           flexDirection: "row",
//           marginTop: 20,
//         }}
//       >
//         <PoppinsTextMedium
//           style={{
//             marginLeft: 20,
//             fontSize: 16,
//             position: "absolute",
//             left: 10,
//             color: "black",
//           }}
//           content="Cashback Ledger"
//         ></PoppinsTextMedium>
//         {/* <View style={{ position: "absolute", right: 20 }}>
//           <Image style={{ height: 22, width: 22, resizeMode: "contain" }} source={require('../../../assets/images/settings.png')}></Image>
//           <Image
//             style={{ height: 22, width: 22, resizeMode: "contain" }}
//             source={require("../../../assets/images/list.png")}
//           ></Image>
//         </View> */}
//       </View>
//     );
//   };
//   const CashbackListItem = (props) => {
//     const amount = props.items.cash;
//     console.log("amount details", amount);
//     return (
//       <TouchableOpacity
//         onPress={() => {
//           navigation.navigate("CashbackDetails",{"data":props.items});
//         }}
//         style={{
//           alignItems: "flex-start",
//           justifyContent: "center",
//           width: "100%",
//           borderBottomWidth: 1,
//           borderColor: "#DDDDDD",
//           padding: 4,
//           height: 100,
//           flexDirection:'row'
//         }}
//       >
//         <View
//           style={{
//             width: "80%",
//             alignItems: "flex-start",
//             justifyContent: "center",
//             padding:8
//           }}
//         >
//           <PoppinsTextMedium
//             style={{ color: props.items.approval_status === "1" ? "green" : "red", fontWeight: "600", fontSize: 18 }}
//             content={
//               props.items.approval_status === "1"
//                 ? "Credited to cash balance"
//                 : "Declined from the panel"
//             }
//           ></PoppinsTextMedium>

//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "flex-start",
//               justifyContent: "center",
//               marginTop: 4,
//             }}
//           >
//             <Image
//               style={{ height: 30, width: 30, resizeMode: "contain" }}
//               source={require("../../../assets/images/greenRupee.png")}
//             ></Image>
//             <View
//               style={{
//                 alignItems: "flex-start",
//                 justifyContent: "center",
//                 marginLeft: 10,
//               }}
//             >
//               <PoppinsTextMedium
//                 style={{ color: "black", fontWeight: "600", fontSize: 14 }}
//                 content={`Beneficiary Details : ${props.items?.bene_details?.bene_name} `}
//               ></PoppinsTextMedium>
//               <PoppinsTextMedium
//                 style={{ color: "black", fontWeight: "600", fontSize: 14 }}
//                 content={`Beneficiary Account : ${props.items?.bene_details?.upi_id} `}
//               ></PoppinsTextMedium>
//               <PoppinsTextMedium
//                 style={{ color: "#91B406", fontWeight: "600", fontSize: 14 }}
//                 content={
//                   moment(props.items.transaction_on).format("DD-MMM-YYYY") +
//                   " " +
//                   moment(props.items.transaction_on).format("HH:mm a")
//                 }
//               ></PoppinsTextMedium>
//             </View>
//           </View>
//         </View>
//         <View style={{width:'20%',alignItems:'center',justifyContent:'center',height:'100%'}}>
//             <PoppinsTextMedium style={{color:'black'}} content={"₹ "+props.items.cash}></PoppinsTextMedium>
//         </View>
//       </TouchableOpacity>
//     );
//   };
//   return (
//     <View style={{ alignItems: "center", justifyContent: "flex-start" }}>
//       <View
//         style={{
//           alignItems: "center",
//           justifyContent: "flex-start",
//           flexDirection: "row",
//           width: "100%",
//           marginTop: 10,
//           height: 40,
//           marginLeft: 20,
//         }}
//       >
//         <TouchableOpacity
//           onPress={() => {
//             navigation.goBack();
//           }}
//         >
//           <Image
//             style={{
//               height: 24,
//               width: 24,
//               resizeMode: "contain",
//               marginLeft: 10,
//             }}
//             source={require("../../../assets/images/blackBack.png")}
//           ></Image>
//         </TouchableOpacity>
//         <PoppinsTextMedium
//           content="Cashback History"
//           style={{
//             marginLeft: 10,
//             fontSize: 16,
//             fontWeight: "600",
//             color: "#171717",
//           }}
//         ></PoppinsTextMedium>
//         {/* <TouchableOpacity style={{ marginLeft: 160 }}>
//                     <Image style={{ height: 30, width: 30, resizeMode: 'contain' }} source={require('../../../assets/images/notificationOn.png')}></Image>
//                 </TouchableOpacity> */}
//       </View>
//       <View
//         style={{
//           padding: 14,
//           alignItems: "flex-start",
//           justifyContent: "flex-start",
//           width: "100%",
//         }}
//       >
//         <View style={{ flexDirection: "row",alignItems:'center',justifyContent:'center' }}>
//           <Image
//             style={{
//               height: 30,
//               width: 30,
//               resizeMode: "contain",
             
//             }}
//             source={require("../../../assets/images/wallet.png")}
//           ></Image>
//     <PoppinsTextMedium
//           style={{
//             marginLeft: 10,
//             fontSize: 15,
//             fontWeight: "700",
//             color: "#6E6E6E",
//           }}
//           content={"Total cashback earned till date ₹ " + totalCashbackEarned }
//         ></PoppinsTextMedium>
//           {/* <PoppinsText style={{ marginLeft: 10, fontSize: 34, fontWeight: '600', color: 'black' }} content={fetchCashbackEnteriesData?.body?.total != undefined ?  `${fetchCashbackEnteriesData?.body?.total}` : <AnimatedDots color={'black'}/>}></PoppinsText> */}
//         </View>

//         {/* <PoppinsTextMedium style={{marginLeft:10,fontSize:20,fontWeight:'600',color:'#6E6E6E'}} content="Cashback"></PoppinsTextMedium> */}
//         {/* <PoppinsTextMedium
//           style={{
//             marginLeft: 10,
//             fontSize: 20,
//             fontWeight: "600",
//             color: "#6E6E6E",
//           }}
//           content="Cashbacks are now instantly credited"
//         ></PoppinsTextMedium> */}
        
//       </View>
//       <Header></Header>

//       {getCashTransactionsData?.body?.length!==0 && <FlatList
//         initialNumToRender={20}
//         contentContainerStyle={{
//           alignItems: "flex-start",
//           justifyContent: "center",
//         }}
//         style={{ width: "100%" }}
//         data={getCashTransactionsData?.body?.data}
//         renderItem={({ item, index }) => (
//           <CashbackListItem items={item}></CashbackListItem>
//         )}
//         keyExtractor={(item, index) => index}
//       />}
//       {
//         getCashTransactionsData?.body?.length===0 && <View style={{marginBottom:300,width:'100%'}}>
//             <DataNotFound></DataNotFound>
//         </View>
//       }

//     </View>
//   );
// };

// const styles = StyleSheet.create({});

// export default CashbackHistory;
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import PoppinsText from "../../components/electrons/customFonts/PoppinsText";
import PoppinsTextMedium from "../../components/electrons/customFonts/PoppinsTextMedium";
import { useSelector } from "react-redux";
import * as Keychain from "react-native-keychain";
import { useFetchCashbackEnteriesOfUserMutation, useFetchUserCashbackByAppUserIdMutation } from "../../apiServices/workflow/rewards/GetCashbackApi";
import DataNotFound from "../data not found/DataNotFound";
import AnimatedDots from "../../components/animations/AnimatedDots";
import { useGetCashTransactionsMutation } from "../../apiServices/cashback/CashbackRedeemApi";
import moment from "moment";
import { useIsFocused } from '@react-navigation/native';



const CashbackHistory = ({ navigation }) => {
  const [showNoDataFound, setShowNoDataFound] = useState(false);
  const [totalCashbackEarned, setTotalCashbackEarned] = useState(0)
  const focused = useIsFocused()

  const userId = useSelector((state) => state.appusersdata.userId);
  const userData = useSelector((state) => state.appusersdata.userData);

  const ternaryThemeColor = useSelector(
    (state) => state.apptheme.ternaryThemeColor
  )
    ? useSelector((state) => state.apptheme.ternaryThemeColor)
    : "#FFB533";

  console.log(userId);

  // const [fetchCashbackEnteriesFunc, {
  //     data: fetchCashbackEnteriesData,
  //     error: fetchCashbackEnteriesError,
  //     isLoading: fetchCashbackEnteriesIsLoading,
  //     isError: fetchCashbackEnteriesIsError
  // }] = useFetchCashbackEnteriesOfUserMutation()

  const [
    getCashTransactionsFunc,
    {
      data: getCashTransactionsData,
      error: getCashTransactionsError,
      isLoading: getCashTransactionsIsLoading,
      isError: getCashTransactionsIsError,
    },
  ] = useFetchCashbackEnteriesOfUserMutation();

  const [fetchCashbackEnteriesFunc, {
    data: fetchCashbackEnteriesData,
    error: fetchCashbackEnteriesError,
    isLoading: fetchCashbackEnteriesIsLoading,
    isError: fetchCashbackEnteriesIsError
  }] = useGetCashTransactionsMutation()

  useEffect(() => {
    const getData = async () => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log(
          "Credentials successfully loaded for user " + credentials.username
        );
        const token = credentials.username;
        // const params = { token: token, appUserId: userData.id };
        const params = { token: token, appUserId: userData.id };

        // getCashTransactionsFunc(params);
        fetchCashbackEnteriesFunc(params)
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const getData = async () => {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log(
          "Credentials successfully loaded for user " + credentials.username
        );
        const token = credentials.username;
        // const params = { token: token, appUserId: userData.id };
        const params = { token: token, appUserId: userData.id };

        // getCashTransactionsFunc(params);
        fetchCashbackEnteriesFunc(params)
      }
    };
    getData();
  }, [focused ]);



  useEffect(() => {
    if (fetchCashbackEnteriesData) {
      let cashback = 0
      console.log(
        "fetchCashbackEnteriesData",
        JSON.stringify(fetchCashbackEnteriesData)
      );
      if (fetchCashbackEnteriesData.body) {
        for (var i = 0; i < fetchCashbackEnteriesData.body?.data?.length; i++) {

          if (fetchCashbackEnteriesData.body.data[i].status === "1") {
            cashback = cashback + Number(fetchCashbackEnteriesData.body.data[i].cash)
            console.log("fetchCashbackEnteriesData", fetchCashbackEnteriesData.body.data[i].cash)
          }
        }
        setTotalCashbackEarned(cashback)
      }

    } else if (fetchCashbackEnteriesError) {
      console.log("fetchCashbackEnteriesError", fetchCashbackEnteriesError);
    }
  }, [fetchCashbackEnteriesData, fetchCashbackEnteriesError]);

  const Header = () => {
    return (
      <View
        style={{
          height: 40,
          width: "100%",
          backgroundColor: "#DDDDDD",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          marginTop: 20,
        }}
      >
        <PoppinsTextMedium
          style={{
            marginLeft: 20,
            fontSize: 16,
            position: "absolute",
            left: 10,
            color: "black",
          }}
          content="Cashback Ledger"
        ></PoppinsTextMedium>
        {/* <View style={{ position: "absolute", right: 20 }}>
          <Image style={{ height: 22, width: 22, resizeMode: "contain" }} source={require('../../../assets/images/settings.png')}></Image>
          <Image
            style={{ height: 22, width: 22, resizeMode: "contain" }}
            source={require("../../../assets/images/list.png")}
          ></Image>
        </View> */}
      </View>
    );
  };
  const CashbackListItem = (props) => {
    const amount = props.items.cash;
    console.log("amount details", props);
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("CashbackDetails", { "data": props.items });
        }}
        style={{
          alignItems: "flex-start",
          justifyContent: "center",
          width: "100%",
          borderBottomWidth: 1,
          borderColor: "#DDDDDD",
          padding: 4,
          height: 130,
          flexDirection: 'row'
        }}
      >
        <View
          style={{
            width: "80%",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: 8
          }}
        >
          {console.log("item of item", props)}
          <PoppinsTextMedium
            style={{ color:   props.items.status === "0"? "red" : "green", fontWeight: "600", fontSize: 18 }}
            
            content={
             props.items.status === "0"
                ? "Declined from the panel"
                :    "Credited to cash balance"

             
            }
          ></PoppinsTextMedium>

          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "center",
              marginTop: 4,
            }}
          >
            <Image
              style={{ height: 30, width: 30, resizeMode: "contain" }}
              source={require("../../../assets/images/greenRupee.png")}
            ></Image>
            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "center",
                marginLeft: 10,
              }}
            >
              <PoppinsTextMedium
                style={{ color: "black", fontWeight: "600", fontSize: 14 }}
                content={`To :  ${props.items?.bene_details?.name} `}
              ></PoppinsTextMedium>
              <PoppinsTextMedium
                style={{ color: "black", fontWeight: "600", fontSize: 14 }}
                content={`Transfer mode : ${props.items?.transfer_mode} `}
              ></PoppinsTextMedium>
              <PoppinsTextMedium
                style={{ color: "black", fontWeight: "600", fontSize: 14 }}
                content={` ${props.items?.transfer_mode} :  ${props.items?.transfer_mode == "upi" ? props.items?.bene_details?.vpa : props.items?.bene_details?.bankAccount}  `}
              ></PoppinsTextMedium>

                {
                   props.items?.bene_details?.ifsc &&
                   <PoppinsTextMedium
                   style={{ color: "black", fontWeight: "600", fontSize: 14 }}
                   content={`IFSC :  ${props.items?.transfer_mode !== "upi" &&  props.items?.bene_details?.ifsc}  `}
                 ></PoppinsTextMedium>
   
                }
           
              <PoppinsTextMedium
                style={{ color: "black", fontWeight: "600", fontSize: 14 }}
                content={
                  moment(props.items.transaction_on).format("DD-MMM-YYYY") +
                  " " +
                  moment(props.items.transaction_on).format("HH:mm a")
                }
              ></PoppinsTextMedium>
            </View>
          </View>
        </View>
        <View style={{ width: '20%', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <PoppinsTextMedium style={{ color: 'black' }} content={"₹ " + props.items.cash}></PoppinsTextMedium>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <View
        style={{
          alignItems: "center",
          justifyContent: "flex-start",
          flexDirection: "row",
          width: "100%",
          marginTop: 10,
          height: 40,
          marginLeft: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Passbook")
          }}
        >
          <Image
            style={{
              height: 24,
              width: 24,
              resizeMode: "contain",
              marginLeft: 10,
            }}
            source={require("../../../assets/images/blackBack.png")}
          ></Image>
        </TouchableOpacity>
        <PoppinsTextMedium
          content="Cashback History"
          style={{
            marginLeft: 10,
            fontSize: 16,
            fontWeight: "600",
            color: "#171717",
          }}
        ></PoppinsTextMedium>
        {/* <TouchableOpacity style={{ marginLeft: 160 }}>
                    <Image style={{ height: 30, width: 30, resizeMode: 'contain' }} source={require('../../../assets/images/notificationOn.png')}></Image>
                </TouchableOpacity> */}
      </View>
      <View
        style={{
          padding: 14,
          alignItems: "flex-start",
          justifyContent: "flex-start",
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center' }}>
          <Image
            style={{
              height: 30,
              width: 30,
              resizeMode: "contain",

            }}
            source={require("../../../assets/images/wallet.png")}
          ></Image>
          <PoppinsTextMedium
            style={{
              marginLeft: 10,
              fontSize: 15,
              fontWeight: "700",
              color: "#6E6E6E",
            }}
            content={"Total cashback earned till date ₹ " + totalCashbackEarned}
          ></PoppinsTextMedium>
          {/* <PoppinsText style={{ marginLeft: 10, fontSize: 34, fontWeight: '600', color: 'black' }} content={fetchCashbackEnteriesData?.body?.total != undefined ?  `${fetchCashbackEnteriesData?.body?.total}` : <AnimatedDots color={'black'}/>}></PoppinsText> */}
        </View>

        {/* <PoppinsTextMedium style={{marginLeft:10,fontSize:20,fontWeight:'600',color:'#6E6E6E'}} content="Cashback"></PoppinsTextMedium> */}
        {/* <PoppinsTextMedium
          style={{
            marginLeft: 10,
            fontSize: 20,
            fontWeight: "600",
            color: "#6E6E6E",
          }}
          content="Cashbacks are now instantly credited"
        ></PoppinsTextMedium> */}

      </View>
      <Header></Header>

      {fetchCashbackEnteriesData && <FlatList
        initialNumToRender={20}
        contentContainerStyle={{
          alignItems: "flex-start",
          justifyContent: "center",
          
        }}
        style={{ width: "100%",height:'78%' }}
        data={fetchCashbackEnteriesData?.body?.data}
        renderItem={({ item, index }) => (
          <CashbackListItem items={item}></CashbackListItem>
        )}
        keyExtractor={(item, index) => index}
      />}
      {
        fetchCashbackEnteriesData?.body?.count === 0 && <View style={{ position:'absolute', width: '100%',height:'78%' ,bottom:0}}>
          <DataNotFound></DataNotFound>
        </View>
      }

    </View>
  );
};

const styles = StyleSheet.create({});

export default CashbackHistory;