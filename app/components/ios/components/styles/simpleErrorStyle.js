import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

export default StyleSheet.create({
    errorContainer:{
        position:'absolute',
        width:windowSize.width-10,
        backgroundColor:Colors.error,
        flexDirection:'row',
        left:5,
        top:5,
        height:50,
        alignItems:'center',
        //justifyContent:'center',
        borderRadius:3
    },
    errorMessage: {
        color: Colors.white,
        fontFamily:Fonts.type.headline,
        fontSize:Fonts.size.tiny,
        marginLeft:12,
        textAlign:'center',
        width:windowSize.width-35,
        //backgroundColor:'blue',
        letterSpacing:Fonts.letterSpacing.small
    },
    errorX:{
        position:'absolute',
        left:15,
        width:8,
        top:18,
    }
})
