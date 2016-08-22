import {
    View,
    TouchableHighlight,
    Image,
    Text
} from 'react-native';
import React, { Component } from 'react';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

var styles=StyleSheet.create({
    navigationContainer:{top:0,left:0,flexDirection:"row",width:windowSize.width,flex:1,alignItems:"center",justifyContent:"space-between",right:0,backgroundColor:this.props.opaque?'white':'transparent',height:70,position:"absolute"},
    navigationBack:{padding:20,marginLeft:5,top:0,opacity:this.props.hideBack?0:1},
    navigationBackImage:{width:11,height:11,backgroundColor:'transparent'},
    navigationTitle:{color:this.props.color,fontSize:14, marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"},
    dotsMoreContainer:{padding:20,marginRight:5},
    dotsMoreImage:{width:11,height:13,backgroundColor:'transparent'}
})


class Navigation extends Component {
    constructor(props) {
        super(props);

        this.state={
            "arrowImage":this.props.color==="black"?require("image!nav-arrow-black"):require("image!nav-arrow-white"),
            "dotsImage":this.props.color==="black"?require('image!nav-dots-black'):require('image!nav-dots-white'),
            "routeName":this.props.routeName
        }
    }

    render() {

        var title=this.state.routeName.substring(0,30);
        if(this.state.routeName.length>30)title+="...";
        title=title.trim().toUpperCase();

        return (
            <View ref="navigation" style={styles.navigationContainer}>
                <TouchableHighlight underlayColor="#ececec" style={styles.navigationBack} onPress={
                    () => {
                        this.props.goBack();
                    }
                }>
                    <Image style={styles.navigationBackImage} source={this.state.arrowImage} resizeMode="contain" />
                </TouchableHighlight>
                <Text style={styles.navigationTitle}>{title}</Text>
                <TouchableHighlight  underlayColor="#ececec" onPress={()=>{this.props.toggleNav()}} style={[styles.dotsMoreContainer,{opacity:this.props.hideNav?0:1}]}>
                    <Image style={styles.dotsMoreImage} source={this.state.dotsImage} resizeMode="contain" />
                </TouchableHighlight>
            </View>
        );
    }
}

Navigation.defaultProps = {
    color:"white",
    routeName:"",
    goBack:function(){},
    hideBack:false,
    opaque:false
};


export default Navigation;