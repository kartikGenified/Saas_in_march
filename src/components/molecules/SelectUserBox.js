import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import PoppinsTextMedium from '../electrons/customFonts/PoppinsTextMedium';
import { BaseUrlImages } from '../../utils/BaseUrlImages';
import { SvgUri } from 'react-native-svg';
import { useIsFocused } from '@react-navigation/native';
import Dashboard from '../../screens/dashboard/Dashboard';
import {select_userListType} from '../../utils/UiTypes'
const SelectUserBox = (props) => {
    const [boxColor, setBoxColor] = useState('white')
    const focused = useIsFocused()

    const image = BaseUrlImages + props.image
    // const image = 'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/atom.svg'
    // console.log(image)
    const color = props.color
    const otpLogin = props.otpLogin
    // const passwordLogin = props.passwordLogin
    // const autoApproval = props.autoApproval
    const manualApproval = props.manualApproval
    const registrationRequired = props.registrationRequired
    console.log(props.content, registrationRequired)

    useEffect(() => {
        setBoxColor("white")

    }, [focused])





    const checkRegistrationRequired = () => {
        setBoxColor(color)
        setTimeout(() => {
            if (registrationRequired.includes(props.content)) {
                checkApprovalFlow(true)
                console.log("registration required")
            }
            else {
                checkApprovalFlow(false)
                console.log("registration not required")

            }
        }, 400);

    }

    const checkApprovalFlow = (registrationRequired) => {
        if (manualApproval.includes(props.content)) {
            handleNavigation(true, registrationRequired)
        }
        else {
            handleNavigation(false, registrationRequired)
        }

    }

    const handleNavigation = (needsApproval, registrationRequired) => {
        console.log("props.content", props.content,otpLogin)
        console.log("Needs Approval", needsApproval, )
        if (otpLogin.includes(props.content)
        ) {
            props.navigation.navigate('OtpLogin', { needsApproval: needsApproval, userType: props.content, userId: props.id, registrationRequired: registrationRequired })
        }
        else {
            props.navigation.navigate('PasswordLogin', { needsApproval: needsApproval, userType: props.content, userId: props.id, registrationRequired: registrationRequired })
            console.log("Password Login", props.content, props.id, registrationRequired, needsApproval)
        }

    }

    console.log("select_userListType",select_userListType)

    return (
        <TouchableOpacity onPress={() => {
            checkRegistrationRequired()
        }} style={select_userListType == "grid" ? [styles.container, {backgroundColor: boxColor}] : [styles.listContainer, {backgroundColor: boxColor}]}>

            {image && <View style={{ height: 90, width: 90, borderRadius: 45, backgroundColor: "white", alignItems: "center", justifyContent: 'center' }}>
                <Image source={{ uri: image }} style={styles.image}></Image>
                {/* <SvgUri width={'100%'} height={'100%'} uri={image}></SvgUri> */}

            </View>}


            <PoppinsTextMedium style={{ color: '#B0B0B0', marginTop: 20, fontSize: 18, fontWeight: '700' }} content={(props.content).toUpperCase()}></PoppinsTextMedium>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 170,
        width: '42%',
        alignItems: "center",
        justifyContent: "center",
        margin: 10,
        elevation: 4,
        borderRadius: 10,
        borderWidth: 0.8,
        borderColor: '#DDDDDD'

    },
    listContainer: {
        height: 100,
        width: '90%',
        alignItems: "center",
        // justifyContent: 'center',
        flexDirection: "row",
        margin: 10,
        elevation: 4,
        borderRadius: 10,
        borderWidth: 0.8,
        borderColor: '#DDDDDD'

    },
    image: {
        height: 80,
        width: 80,
        marginBottom: 8, resizeMode: 'contain'


    }
})

export default SelectUserBox;
