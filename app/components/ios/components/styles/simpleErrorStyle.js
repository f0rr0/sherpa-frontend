import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'

export default StyleSheet.create({
    errorContainer:{
        position:'absolute',
        top:0,
        flex:1,
        left:0,
        right:0,
        height:45,
        backgroundColor:Colors.error,
        flexDirection:'row',
        alignItems:'center',
    },
    errorMessage: {
        color: Colors.white,
        fontFamily:Fonts.type.headline,
        fontSize:Fonts.size.tiny,
        marginLeft:12,
        letterSpacing:Fonts.letterSpacing.small
    },
    errorX:{
        position:'absolute',
        right:10,
        width:8,
        top:15
    }
})
