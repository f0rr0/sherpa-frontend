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
import styles from './styles/headerStyle'

class Header extends Component {
    constructor(props) {
        super(props);

        this.state={
            "arrowImage":this.props.color==="black"?require("image!nav-arrow-black"):require("image!nav-arrow-white"),
            "dotsImage":this.props.color==="black"?require('image!nav-dots-black'):require('image!nav-dots-white'),
            "routeName":this.props.routeName
        }
    }

    updateRouteName(routeName){
        this.setState({routeName});
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

Header.defaultProps = {
    color:"white",
    routeName:"",
    goBack:function(){},
    hideBack:false,
    hideNav:false,
    opaque:false,
    topShadow:false
};


export default Header;