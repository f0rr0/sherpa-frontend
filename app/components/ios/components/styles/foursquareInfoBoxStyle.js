import { StyleSheet } from 'react-native'
import { Fonts, Colors } from '../../../../Themes/'

export default StyleSheet.create({
    ratingContainer:{flex:1,flexDirection:'row',alignItems:'flex-start',justifyContent:'flex-end'},
    ratingNumber:{fontSize:8,marginTop:1,marginLeft:1},
    ratingCount:{fontSize:10,color:"#999"},

    pricingLight:{fontSize:12,color:"#333"},
    pricingDark:{fontSize:12,color:"#999"},
    pricingContainer:{marginLeft:8,flex:1,justifyContent:'center'},


    foursquareTitle:{marginTop:5,marginBottom:13,fontSize:10,color:"#999999"},

    venueContainer:{flex:1,flexDirection:'row',justifyContent:'space-between'},
    venueIconContainer:{width:30,height:30,backgroundColor:"#8ad78d",flex:1,alignItems:'center',justifyContent:'center',borderRadius:3},
    venueIcon:{height:16,width:16}
})
