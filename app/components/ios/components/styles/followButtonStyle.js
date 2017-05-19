import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'

export default StyleSheet.create({
    button: {
        backgroundColor: 'transparent',
        borderRadius:30,
        alignItems:"center",
        flexDirection:"row",
        justifyContent:"center",
        borderWidth:.5,
        borderColor:'rgba(255,255,255,.5)',
        height:30,
        marginLeft:10,
        marginBottom:10
    },
    buttonText: {
        marginLeft:6,
        marginTop:3,
        marginRight:15,
        textAlign: 'center',
        color: Colors.white,
        fontFamily: Fonts.type.headline,
        fontSize: Fonts.size.tiny,
        letterSpacing:Fonts.letterSpacing.small
    },
    buttonIcon:{
        height:20,
        marginLeft:15
    }
})
