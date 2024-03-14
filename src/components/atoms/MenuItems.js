import React from 'react';
import {View, StyleSheet,Image,Text,Platform, TouchableOpacity} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import PoppinsTextMedium from '../electrons/customFonts/PoppinsTextMedium';
import { SvgUri } from 'react-native-svg';
import ZoomViewAnimations from '../animations/ZoomViewAnimations';

const MenuItems = (props) => {
  const colorShades = useSelector(state=>state.apptheme.colorShades)
    const image= props.image
    const content = props.content
    const platformFontSize = Platform.OS === 'ios' ? 10 :12
    const platformFontWeight = Platform.OS === 'ios' ? '500' :'600'
    console.log("menu item images", image)
    const handlePress=()=>{
        console.log(content)
        props.handlePress(content)
    }

    console.log(image)
    return (
            
                <View style={{alignItems:"center",justifyContent:"center",width:100,margin:6}}>
           
            <TouchableOpacity onPress={()=>{handlePress()}} style={{height:69,width:69,backgroundColor:colorShades[100],alignItems:"center",justifyContent:"center",borderRadius:34.5,opacity:0.6}}>
            {/* <SvgUri width={69} height={69} uri={image}></SvgUri> */}
            <Image style={{height:69,width:69}} source={{uri:image}}></Image>
            </TouchableOpacity>
            <PoppinsTextMedium content={content} style={{width:80,marginTop:6,color:'black',fontSize:platformFontSize,fontWeight:platformFontWeight}}></PoppinsTextMedium>
        </View>
            )
       
        
       
   
}

const styles = StyleSheet.create({})

export default MenuItems;
