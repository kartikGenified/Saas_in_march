import React from 'react';
import { View, StyleSheet, Image, Text, Platform, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import PoppinsTextMedium from '../electrons/customFonts/PoppinsTextMedium';
import { SvgUri } from 'react-native-svg';
import ZoomViewAnimations from '../animations/ZoomViewAnimations';
import { dashMenu_type } from '../../utils/UiTypes';

const MenuItems = (props) => {
    const colorShades = useSelector(state => state.apptheme.colorShades)
    const image = props.image
    const content = props.content
    const platformFontSize = Platform.OS === 'ios' ? 10 : 12
    const platformFontWeight = Platform.OS === 'ios' ? '500' : '600'

    const ternaryThemeColor = useSelector(
        state => state.apptheme.ternaryThemeColor,
    )
        ? useSelector(state => state.apptheme.ternaryThemeColor)
        : '#FFB533';


    const handlePress = () => {
        console.log(content)
        props.handlePress(content)
    }

    console.log(image)
    return (
        <>
            {dashMenu_type !== "Big" ?
                <View style={{ alignItems: "center", justifyContent: "center", width: 100, margin: 6, marginTop: 20 }}>

                    <TouchableOpacity onPress={() => { handlePress() }} style={{ height: 69, width: 69, backgroundColor: colorShades[100], alignItems: "center", justifyContent: "center", borderRadius: props?.type != "rectangular" ? 34.5 : 0, opacity: 0.6 }}>

                        <Image style={{ height: 69, width: 69 }} source={{ uri: image }}></Image>
                    </TouchableOpacity>
                    <PoppinsTextMedium content={content} style={{ width: 80, marginTop: 6, color: 'black', fontSize: platformFontSize, fontWeight: platformFontWeight }}></PoppinsTextMedium>
                </View>

                :
                <View style={{ justifyContent: "space-between", width: '45%', margin: 6, }}>

                    <TouchableOpacity onPress={() => { handlePress() }} style={{ height: 160, width: 150, backgroundColor: "#ffe4e4", alignItems: "center", justifyContent: "center", borderRadius: 10, opacity: 1, }}>

                        <Image style={{ height: 105, width: 105 }} source={{ uri: image }}></Image>
                        <PoppinsTextMedium content={content} style={{ width: '100%', alignSelf: "center", marginTop: 2, color: 'black', fontSize: platformFontSize, fontWeight: platformFontWeight, backgroundColor: "#ffe4e4", fontWeight: 'bold', marginTop: 20, fontSize: 14 }}></PoppinsTextMedium>

                    </TouchableOpacity>


                </View>
            }

        </>

    )




}

const styles = StyleSheet.create({})

export default MenuItems;
