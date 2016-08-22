'use strict';

import {updateUserData,signupUser} from '../../../actions/user.actions';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');


import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableHighlight,
    Image
} from 'react-native';
import React, { Component } from 'react';



var styles = StyleSheet.create({
    baseText:{
        color:"#011e5c",
        textAlign:"center"
    },
    headline:{
        fontFamily:"TSTAR-bold",
        fontSize:13,
        marginTop:40,
        letterSpacing:.5
    },
    buttonText:{
        fontFamily:"TSTAR-bold",
        color:"#FFFFFF"
    },
    description:{
        fontFamily:"Avenir LT Std",
        fontSize:12,
        lineHeight:14,
        letterSpacing:.25,
        color:"#38383a",
        marginTop:15,
        width:windowSize.width*.7>400?400:windowSize.width*.7
    },
    topArea:{
        alignItems:"center",
        height:windowSize.height*.25,
    },
    middleArea:{
        height:windowSize.height*.5,
        width:windowSize.width,
    },
    slide:{
    },
    bottomArea:{
        alignItems:"center",
        justifyContent:"center",
        height:windowSize.height*.25
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        alignItems:'center',
        justifyContent:'center',
        width:windowSize.width*.8
    },
    mainComponent:{
        padding:40,
        marginTop:80,
        position:'absolute',
        top:180,
        width:windowSize.width
    },

    backgroundImage:{width:windowSize.width,height:windowSize.height,position:"absolute",top:0,left:0},
    middleImage:{width:windowSize.width,height:windowSize.height*.5}
});

class OnboardingScreen extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <View>
                {(()=>{if(this.props.backgroundImage){return(<Image source={this.props.backgroundImage} style={styles.backgroundImage} resizeMode="cover"></Image>)}})()}

                <View style={styles.topArea}>
                    <Text style={[styles.baseText,styles.headline]}>{this.props.headline}</Text>
                    <Text style={[styles.baseText,styles.description]}>{this.props.description}</Text>
                </View>

                <View style={styles.middleArea}>
                    {(()=>{if(this.props.middleImage){return(<Image source={this.props.middleImage} style={styles.middleImage} resizeMode="contain"></Image>)}})()}
                </View>

                <View style={styles.bottomArea}>
                    {this.props.continueButton}
                </View>

                <View style={styles.mainComponent}>
                    {this.props.mainComponent}
                </View>
            </View>
        );
    }
}



export default OnboardingScreen;