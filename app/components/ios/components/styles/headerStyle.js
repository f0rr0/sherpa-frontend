import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

export default StyleSheet.create({
    navigationContainer:{top:0,left:0,flexDirection:"row",width:windowSize.width,flex:1,alignItems:"center",justifyContent:"space-between",right:0,height:70,position:'absolute'},
    navigationBack:{padding:25,marginLeft:0,top:3,paddingRight:35,paddingBottom:35,zIndex:1},
    navigationBackImage:{width:11,height:11,backgroundColor:'transparent'},
    navigationTitle:{fontSize:14,position:'absolute',left:windowSize.width*.1,width:windowSize.width*.8,marginTop:30,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"},
    dotsMoreContainer:{padding:20,marginRight:5,position:'absolute',right:5,top:6},
    dotsMoreImage:{width:11,height:13,backgroundColor:'transparent'}
})