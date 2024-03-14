import React from 'react';
import {View, StyleSheet,Image} from 'react-native';
import PoppinsTextMedium from '../electrons/customFonts/PoppinsTextMedium';

const DisplayOnlyTextInput = (props) => {
    const photo  = props.photo
    const title = props.title
    const data = props.data
    console.log("DisplayOnlyTextInput",title,data)
    return (
        <View style={{width:"90%",alignItems:"flex-start",justifyContent:"center",borderBottomWidth:1,marginBottom:4,paddingBottom:10,borderColor:'#DDDDDD',marginTop:10}}>
            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"center"}}>
                
                <PoppinsTextMedium style={{fontSize:16,fontWeight:'600',color:'grey',marginLeft:10}} content={title}></PoppinsTextMedium>
            </View>
            <PoppinsTextMedium style={{marginRight:10,fontSize:16,color:'#171717',marginLeft:14,marginTop:10}} content={data}></PoppinsTextMedium>
        </View>
    );
}

const styles = StyleSheet.create({})

export default DisplayOnlyTextInput;
