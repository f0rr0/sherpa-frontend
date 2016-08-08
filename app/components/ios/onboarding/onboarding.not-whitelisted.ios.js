'use strict';

import {updateUserData,signupUser,updateUserDBState} from '../../../actions/user.actions';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    Image,
    Linking,
} from 'react-native';
import React, { Component } from 'react';



var styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        flex:1,
        backgroundColor:'blue',
        position:'absolute',
        alignItems:"flex-end",
        height:windowSize.height,
        width:windowSize.width
    },
    copy:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:10
    },
    copyCenter:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:9,
        textAlign:'center'
    },
    bg:{
        position:'absolute',
        left:0,
        top:0,
        width:windowSize.width,
        height:windowSize.height
    },
    login:{
        flex:1,
        padding:40,
        justifyContent:'center',
        marginTop:80
    },
    textInput:{
        height: 50,
        marginTop:3,
        marginBottom:10,
        backgroundColor:'white',
        padding:10,
        borderWidth: 0,
        fontSize:11,
        fontFamily:"TSTAR-bold"
    },

    imageContainer:{
        flex: 1,
        alignItems: 'stretch'
    },
    bgImage:{
        flex:1
    },
    copyLarge:{
        color:'#8ad78d',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    copyButton:{
        marginTop:12
    },
    button:{
        backgroundColor:'#FFFFFF',
        height:50,
        justifyContent:'center',
        alignItems:'center'
    }
});

class NotWhitelisted extends Component {
    constructor(props){
        super(props);
    }
    componentDidMount(){

    }

    connectWithService(){
        //console.log('connect with service');
        Linking.openURL("http://www.trysherpa.com");
    }

    render() {
        return (
            <View style={styles.container}>
                <Image
                    style={styles.bg}
                    source={require('./../../../images/sherpa-nowhitelist.png')}
                    resizeMode="cover"
                />

                <View style={styles.login}>
                    <TouchableHighlight style={styles.button} underlayColor="white" onPress={this.connectWithService.bind(this)}>
                        <Text style={styles.copyLarge}>APPLY AT TRYSHERPA.COM</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}

export default NotWhitelisted;