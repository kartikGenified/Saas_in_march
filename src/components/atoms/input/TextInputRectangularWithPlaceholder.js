import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView } from 'react-native';
import PoppinsTextMedium from '../../electrons/customFonts/PoppinsTextMedium';
import PoppinsTextLeftMedium from '../../electrons/customFonts/PoppinsTextLeftMedium';
import { useIsFocused } from '@react-navigation/native';


const TextInputRectangularWithPlaceholder = (props) => {
    const [value, setValue] = useState(props.value)
    const [keyboardType, setKeyboardType] = useState(props.keyboardType)
    const [maxLength, setMaxlength] = useState(props.maxLength)
    const [error, setError] = useState(false);
    console.log("value", props)
    const placeHolder = props.placeHolder
    const required = props.jsonData?.required
    const specialChar = props.specialCharValidation
    const title  = props.title
    const from = props.from

    const focused = useIsFocused()

    useEffect(() => {
        setValue(props.value)
        props.handleData(props.value,props.title)
    }, [props.value])

    useEffect(()=>{
        console.log("from", from)
          from == "OTPLogin"  &&  setValue("")
        
    },[focused])

    useEffect(() => {
        if (placeHolder === "Mobile No") {
            setKeyboardType('numeric')
            setMaxlength(10)
        }
        if(title?.split("_").includes("mobile"))
        {
            setKeyboardType('numeric')
            setMaxlength(10)

        }
    }, [])

    const handleInput = (text, placeHolder) => {
        if (specialChar) {
            const nameRegex = /^[a-zA-Z\s-]+$/;
            if (nameRegex.test(text)) {
                setValue(text)
                props.handleData(text, props.title)
                setError(false)
            }
            else {
                setValue("")
                if (text != "") {
                    setError(true)
                }else{
                    setError(false)
                }
            }

        }
        else {
            setValue(text)
            props.handleData(text, props.title)
        }

    }
    const handleInputEnd = (text, placeHolder) => {
        //    console.log(text)
        props.handleData(text, props.title)
    }

    return (
        <KeyboardAvoidingView style={{width:"100%", alignItems:'center'}}>
            <View style={{ height: 60, width: '86%', borderColor: '#DDDDDD', alignItems: "center", justifyContent: "center", backgroundColor: 'white', margin: 10, borderWidth: 0.6 }}>
                <View style={{ alignItems: "center", justifyContent: 'center', backgroundColor: 'white', position: "absolute", top: -15, left: 16 }}>
                    <PoppinsTextMedium style={{ color: "#919191", padding: 4, fontSize: 18 }} content={placeHolder}></PoppinsTextMedium>
                </View>
                <TextInput secureTextEntry={keyboardType=="password" ? true : false}  editable={props.editable} keyboardType={keyboardType} maxLength={maxLength} onEndEditing={() => { handleInputEnd(value, placeHolder) }} style={{ height: 50, width: '100%', alignItems: "center", justifyContent: "flex-start", fontWeight: '500', marginLeft: 32, letterSpacing: 1, fontSize: 16, color: 'black' }} placeholderTextColor="#808080" onChangeText={(text) => { handleInput(text, placeHolder) }} value={placeHolder.toLowerCase() =="username" ? value?.toUpperCase() : value} placeholder={ placeHolder ? required ? `${placeHolder} *` : `${placeHolder}`:"No Data"}></TextInput>
            </View>
            {specialChar && error && <PoppinsTextLeftMedium content="Special Charaters are not allowed" style={{ color: 'red' }}></PoppinsTextLeftMedium>}
        </KeyboardAvoidingView>

    );
}

const styles = StyleSheet.create({})

export default TextInputRectangularWithPlaceholder;