import react, {useState, useEffect} from 'react';
import {View, Text, Image,StyleSheet} from 'react-native';
import PoppinsTextMedium from '../electrons/customFonts/PoppinsTextMedium';
import { useSelector } from 'react-redux';


const ProgressBarSalesBooster = (props) => {
//   console.log("Progress bar",props.data);
//   const data = props.data;
//   const gap = 100 / data.length;
const primaryColor = props.primaryColor
const progressColor = props.progressColor
const triggerOn = props.triggerOn
const circleColor = props.circleColor
const progressBarHeader = props.progressBarHeader

const ternaryThemeColor = useSelector(
    state => state.apptheme.ternaryThemeColor,
)
    ? useSelector(state => state.apptheme.ternaryThemeColor)
    : '#FFB533';

const body = [
    {
        "sb_id": 68,
        "sbt_id": 14,
        "trigger_on": "target point",
        "trigger_value": 70,
        "offer": "point",
        "value": "F-10.2"
    },
    {
        "sb_id": 68,
        "sbt_id": 14,
        "trigger_on": "target point",
        "trigger_value": 100,
        "offer": "point",
        "value": "F-10.2"
    },
    {
        "sb_id": 68,
        "sbt_id": 14,
        "trigger_on": "target point",
        "trigger_value": 80,
        "offer": "point",
        "value": "F-10.2"
    }
];

function sortByTriggerValueAscending(data) {
    return data.sort((a, b) => a[triggerOn]- b[triggerOn]);
}

const sortedBody = sortByTriggerValueAscending(body);
console.log("Sorted", sortedBody);

const maxTarget = Number(sortedBody[sortedBody.length-1][triggerOn])
const currentTarget = props.currentTarget >= maxTarget ? maxTarget : props.currentTarget;

const progress = (currentTarget/maxTarget)*100;
console.log("progress percentage",progress,currentTarget,maxTarget)

//   const getProgressFromMilestone = () => {
//     for (var i = data.length - 1; i >= 0; i--) {
//       if (data[i].achieved === '1') {
//         return gap * i + 5;
//       }
//     }
//   };
//   const progress = getProgressFromMilestone();
//   console.log('Progress', progress);
//   const Triangle = (props) => {
//     return <View style={[styles.triangleDown, props.style]} />;
//   };
  
 
  return (
    <View style={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center',backgroundColor:"#F1F1F1",borderRadius:10,marginBottom:20,elevation:4}}>
        <View style={{width:'100%',alignItems:"center",justifyContent:'center',position:"absolute",top:10}}>
            <PoppinsTextMedium style={{color:ternaryThemeColor,fontWeight:'bold',fontSize:18}} content = {progressBarHeader}></PoppinsTextMedium>
        </View>
    <View style={{ flexDirection: 'row', height: 20, width: '90%', alignItems: 'center', justifyContent: 'center',marginTop:20}}>

      <View style={{ height: 20, width: '100%', backgroundColor: primaryColor, borderRadius: 10 }}></View>

      <View style={{alignItems:"center",justifyContent:'center', position: 'absolute', right: -10,bottom:-5}}>

      <PoppinsTextMedium style={{color:circleColor,zIndex:2,fontWeight:'bold',fontSize:14}} content={maxTarget}></PoppinsTextMedium>

      <View style={{zIndex: 1,alignItems:"center",justifyContent:'center' }}> 
        <View style={{ height: 30, width: 30, borderRadius: 15, backgroundColor: circleColor }}></View>
      </View>

      </View>

      <View style={{ height: 20, width: '100%', position: "absolute", left: 0 }}>
      <View style={{ height: 20, width: `${progress}%`, backgroundColor: progressColor, borderRadius: 10 }}></View>
    </View>
    </View>

   
  </View>
  );
};

const styles = StyleSheet.create({
   
        
       
     
})

export default ProgressBarSalesBooster;
