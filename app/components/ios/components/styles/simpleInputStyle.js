import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'

export default StyleSheet.create({
    inputField: {
        backgroundColor: Colors.white,
        alignItems:"flex-start",
        flexDirection:"column",
        justifyContent:"flex-start",
    },
    inputText: {
        margin: 0,
        color: Colors.darkPlaceholder,
        marginLeft:0
    }
})
