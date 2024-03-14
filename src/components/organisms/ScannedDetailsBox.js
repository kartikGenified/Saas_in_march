import React from 'react';
import {View, StyleSheet,TouchableOpacity} from 'react-native';
import PoppinsTextMedium from '../electrons/customFonts/PoppinsTextMedium';
import { useSelector } from 'react-redux';
const ScannedDetailsBox = (props) => {
    const lastScannedDate = props.lastScannedDate
    const scanCount = props.scanCount
    const ternaryThemeColor = useSelector(
        state => state.apptheme.ternaryThemeColor,
      )
        ? useSelector(state => state.apptheme.ternaryThemeColor)
        : '#FFB533';
      
    return (
        <View style={{height:60,width:'90%',alignItems:'center',justifyContent:'center',flexDirection:'row',backgroundColor:ternaryThemeColor,borderRadius:10}}>
        <View style={{width:'50%',alignItems:'center',justifyContent:'center',borderRightWidth:1,borderColor:'#DDDDDD'}}>
        <PoppinsTextMedium style={{color:'white',fontSize:16}} content="Last Scanned Date"></PoppinsTextMedium>
        <PoppinsTextMedium style={{color:'white',fontSize:16}} content={lastScannedDate}></PoppinsTextMedium>

        </View>
        <View style={{width:'50%',alignItems:'center',justifyContent:'center'}}>
        <PoppinsTextMedium style={{color:'white',fontSize:16}} content="Scan Count"></PoppinsTextMedium>
        <PoppinsTextMedium style={{color:'white',fontSize:16}} content={scanCount}></PoppinsTextMedium>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({})

export default ScannedDetailsBox;
