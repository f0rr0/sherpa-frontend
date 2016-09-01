import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'

export default StyleSheet.create({
    button: {
        backgroundColor: Colors.highlight,
        borderRadius:2,
        alignItems:"center",
        flexDirection:"row",
        justifyContent:"center",
        height:55,
        marginTop:13
    },
    buttonText: {
        margin: 18,
        marginLeft:10,
        marginTop:20,
        textAlign: 'center',
        color: Colors.white,
        fontFamily: Fonts.type.headline,
        fontSize: Fonts.size.button,
        letterSpacing:Fonts.letterSpacing.small
    },
    buttonIcon:{
        height:20,
        marginLeft:8
    }
})
