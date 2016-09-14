import {
    View,
    TouchableOpacity,
    Image,
    Text,
    StyleSheet
} from 'react-native';
import React, { Component } from 'react';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

var styles=StyleSheet.create({
    navigationContainer:{top:0,left:0,flexDirection:"row",width:windowSize.width,flex:1,alignItems:"center",justifyContent:"space-between",right:0,height:70,position:"absolute"},
    navigationBack:{padding:20,marginLeft:5,top:0},
    navigationBackImage:{width:11,height:11,backgroundColor:'transparent'},
    navigationTitle:{fontSize:14,position:'absolute',left:windowSize.width*.1,width:windowSize.width*.8,marginTop:30,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"},
    dotsMoreContainer:{padding:20,marginRight:5,position:'absolute',right:5,top:10},
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

        var backButton=this.props.hideBack?null:
            <TouchableOpacity underlayColor="#ececec" style={[styles.navigationBack]} onPress={() => {this.props.goBack();}}>
                <Image style={styles.navigationBackImage} source={this.state.arrowImage} resizeMode="contain" />
            </TouchableOpacity>;

        var navButton=this.props.hideNav?null:
            <TouchableOpacity  underlayColor="#ececec" onPress={()=>{this.props.toggleNav()}} style={[styles.dotsMoreContainer]}>
                <Image style={styles.dotsMoreImage} source={this.state.dotsImage} resizeMode="contain" />
            </TouchableOpacity>;

        var topShadow=this.props.topShadow?<Image style={{position:'absolute',top:0,left:0,width:windowSize.width,height:140}} resizeMode="cover" source={require('../../../Images/shadow-top.png')}></Image>:null;

        return (
            <View ref="navigation" style={[styles.navigationContainer,{backgroundColor:this.props.opaque?'white':'transparent'}]}>
                {topShadow}
                {backButton}
                <Text style={[{color:this.props.color},styles.navigationTitle]}>{title}</Text>
                {navButton}
            </View>
        );
    }
}

Navigation.defaultProps = {
    color:"white",
    routeName:"",
    goBack:function(){},
    hideBack:false,
    hideNav:false,
    opaque:false,
    topShadow:false
};


export default Navigation;