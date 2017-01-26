'use strict';

import { connect } from 'react-redux';
import Overview from '../overview/overview.ios';
import Login from './onboarding.login.ios';

import {
    StyleSheet,
    View,
    Text,
    Image,
    Animated
} from 'react-native';
import React, { Component } from 'react';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

var styles = StyleSheet.create({
    copy: {
        color:'#001545',
        fontFamily:"TSTAR-bold",
        fontSize:14,
        marginTop:20
    },
    container: {
        flex: 1,
        justifyContent:'center',
        //alignItems:'center',
        backgroundColor:"white"
    },
    loaderGIF:{width: windowSize.width, height: 350}
})

class Loading extends Component {
    constructor(props){
        super(props);
        this.state={
            opacity:new Animated.Value(0)
        }
    }

    componentDidMount(){
        setTimeout(()=>{
            Animated.timing(this.state.opacity,{toValue:1}).start()
        },300)
    }


    render() {
        return (
            <Animated.View style={[styles.container]}>
                <Animated.View style={[styles.container,{opacity:this.state.opacity}]}>
                    <Image style={styles.loaderGIF} source={ require('./../../../Images/splash.png')} />
                    <Image style={{width: 20, height: 20,position:'absolute',left:windowSize.width/2-10,top:windowSize.height*.6}} source={require('./../../../Images/loader@2x.gif')} />
                </Animated.View>
            </Animated.View>
        );
    }
}

export default Loading;