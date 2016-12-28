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
import countries from './../../../data/countries'

class Header extends Component {
    constructor(props) {
        super(props);
        var navSettings={
            color:this.props.type=='fixed'?'black':(this.props.settings.navColor||'black'),
            routeName:this.props.settings.routeName || '',
            hideBack:this.props.settings.hideBack,
            opaque:this.props.type=='fixed'?true:this.props.settings.opaque,
            fixedHeader:this.props.settings.fixedHeader,
            hideNav:this.props.settings.hideNav,
            topShadow:this.props.settings.topShadow,
            topLeftImage:this.props.settings.topLeftImage,
            topRightImage:this.props.settings.topRightImage,
            topLeftImageStyle:this.props.settings.topLeftImageStyle,
            topRightImageStyle:this.props.settings.topRightImageStyle
        };


        let topLeftImage=navSettings.color==="black"?require("image!nav-arrow-black"):require("image!nav-arrow-white");
        let topRightImage=navSettings.color==="black"?require('image!nav-dots-black'):require('image!nav-dots-white');

        if(navSettings.topLeftImage)topLeftImage=navSettings.topLeftImage;
        if(navSettings.topRightImage)topRightImage=navSettings.topRightImage;

        this.state={
            topLeftImage,
            topRightImage,
            "routeName":navSettings.routeName,
            "settings":navSettings
        }

    }


    render() {

        let title={name:this.state.routeName};

        let country = countries.filter(function(country) {
            return country["alpha-2"] === title.name;
        })[0];

        if(!country)country={name:title.name};
        let countryOrState=(title.name.toUpperCase()==="US")?title.state:country.name;


        title=countryOrState.substring(0,30);
        if(this.state.routeName.length>30)title+="...";
        title=title.trim().toUpperCase();

        var backButton=this.state.settings.hideBack?null:
            <TouchableOpacity underlayColor="#ececec" style={[styles.navigationBack]} onPress={() => {this.props.goBack();}}>
                <Image style={[styles.navigationBackImage,this.state.settings.topLeftImageStyle]} source={this.state.topLeftImage} resizeMode="contain" />
            </TouchableOpacity>;

        var navButton=this.state.settings.hideNav?null:
            <TouchableOpacity  underlayColor="#ececec" disabled={this.props.rightDisabled}  onPress={()=>{this.props.navActionRight()}} style={[styles.dotsMoreContainer]}>
                <Image style={[styles.dotsMoreImage,this.state.settings.topRightImageStyle,{opacity:this.props.rightDisabled?.2:1}]} source={this.state.topRightImage} resizeMode="contain" />
            </TouchableOpacity>;

        var topShadow=this.state.settings.topShadow?<Image style={{position:'absolute',top:0,left:0,width:windowSize.width,height:140}} resizeMode="cover" source={require('../../../Images/shadow-top.png')}></Image>:null;

        return (
            <View ref="navigation" style={[styles.navigationContainer,{backgroundColor:this.state.settings.opaque?'white':'transparent'},this.props.style]}>
                {topShadow}
                {backButton}
                <Text style={[{color:this.state.settings.color},styles.navigationTitle]}>{title}</Text>
                {navButton}
            </View>
        );
    }
}

Header.defaultProps = {
    color:"white",
    routeName:"",
    goBack:function(){},
    settings:{}
};


export default Header;