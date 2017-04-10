import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'

export default StyleSheet.create({
    basic:{
        backgroundColor:'rgba(0,0,0,.85)',
        alignItems:"center",
        justifyContent:"center",
        borderRadius:2,
        paddingHorizontal:15,
        paddingVertical:5,
    },
    copy:{
        fontSize:9,
        color:Colors.white,
        marginTop:3.5,
        margin:0,
        lineHeight:9,
        fontFamily:Fonts.type.bodyCopy,
        letterSpacing:1
    }
})
