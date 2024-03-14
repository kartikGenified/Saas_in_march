import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, Image } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const ErrorModal = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const productData = props.productData;
  const type = props.type
  const title = props.title
  const navigation = useNavigation()
  const ternaryThemeColor = useSelector(
    state => state.apptheme.ternaryThemeColor,
  )
    ? useSelector(state => state.apptheme.ternaryThemeColor)
    : 'grey';
  const navigateTo = props.navigateTo

  console.log("product data in report an issue", productData)

  
  useEffect(() => {
    if (props.openModal === true) {
      setModalVisible(true)
    }
    else {
      setModalVisible(false)
    }
  }, [])
  useEffect(()=>{
    // navigation.navigate(navigateTo)
  },[navigateTo])
  const closeModal = () => {
    console.log("navigateTo",navigateTo)
   
    if (navigateTo !== undefined) {
      navigation.navigate(navigateTo)
    }
    props.modalClose()
    setModalVisible(!modalVisible)
  }

  const reportAndNavigate= () => {
    setModalVisible(!modalVisible)
    // props.modalClose()

   productData && navigation.navigate("ReportAndIssue", { productData: productData })

  }




  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          props.modalClose()
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={{ ...styles.modalView, borderWidth: 2, borderColor: ternaryThemeColor }}>
            {/* <Image style={{ width: 80, height: 80, resizeMode: 'contain' }} source={require('../../../assets/images/failed.png')}></Image> */}
            {title && <Text style={{ color: '#FF5D5D', fontSize: 24, fontWeight: '700' }}>{title}</Text>}
            {!title && <Text style={{ color: '#FF5D5D', fontSize: 24, fontWeight: '700' }}>Sorry</Text>}

            <Text style={{ ...styles.modalText, fontSize: 20, fontWeight: '600', color: 'black' }}>{props.message}</Text>
            <Pressable
              style={{ ...styles.button, backgroundColor: '#FF5D5D', width: 100 }}
              onPress={() => closeModal()}>
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>

            {props.isReportable &&
              <Pressable
                style={{ ...styles.button, backgroundColor: '#FF5D5D', width: 100, marginTop: 10 }}
                onPress={() => reportAndNavigate()}>
                <Text style={styles.textStyle}>Report</Text>
              </Pressable>
            }

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  modalView: {

    backgroundColor: 'white',
    borderRadius: 20,
    padding: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

  },
  button: {
    borderRadius: 4,
    padding: 10,
    elevation: 2,
    marginTop: 10
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },

  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ErrorModal;