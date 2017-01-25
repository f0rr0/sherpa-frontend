import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'

export default StyleSheet.create({
    basic:{
        backgroundColor:'white',
        alignItems:"center",
        justifyContent:"center",
        borderRadius:52,
        paddingHorizontal:15,
        paddingVertical:10,
        shadowColor:'black',
        shadowRadius:2,
        shadowOpacity:.3,
        shadowOffset:{width:0,height:1},
    },
    iconContainer:{
        width:35,
        height:35,
        paddingHorizontal:0,
        paddingVertical:0,
        flex:1,
        borderRadius:35,
    },
    icon:{
        width:13,
        height:14,
        //position:'absolute',
        top:0,
    },
    copy:{
        fontSize:10,
        color:Colors.black,
        marginTop:3.5,
        margin:0,
        lineHeight:9,
        fontFamily:Fonts.type.headline,
        letterSpacing:1
    }
})
