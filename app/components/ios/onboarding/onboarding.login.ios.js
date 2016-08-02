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
    AlertIOS,
    Image,
    Animated
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
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    copyButton:{
        marginTop:12
    },
    button:{
        backgroundColor:'#8ad78d',
        height:50,
        justifyContent:'center',
        alignItems:'center'
    }
});

class Login extends Component {
    constructor(props){
        super(props);
        this.state={email:"",inviteCode:"EVEREST",inputBottomMargin: new Animated.Value(0),copyOpacity:new Animated.Value(1)};
    }
    componentDidMount(){

    }

    connectWithService(){
        console.log('connect with service');
        this.props.dispatch(updateUserDBState("waiting"));
        this.props.dispatch(updateUserData({email:this.state.email,inviteCode:this.state.inviteCode}));
        this.props.dispatch(signupUser());
    }

    requestInvite(){
        AlertIOS.alert("you can't request invites yet");
    }

    moveUp(){
        Animated.spring(
            this.state.inputBottomMargin,
            {
                toValue: 308,
                friction:6
            }
        ).start();

        Animated.spring(
            this.state.copyOpacity,
            {
                toValue:0,
                friction:6
            }
        ).start();
    }

    moveDown(){
        Animated.spring(
            this.state.inputBottomMargin,
            {
                toValue: 50,
                friction:6
            }
        ).start();

        Animated.spring(
            this.state.copyOpacity,
            {
                toValue:1,
                friction:6
            }
        ).start();
    }

    render() {
        return (
            <View style={styles.container}>
                <Image
                    style={styles.bg}
                    source={require('./../../../images/sherpa-home.png')}
                    resizeMode="cover"
                />

                <View style={styles.login}>
                    <TouchableHighlight style={styles.button} underlayColor="white" onPress={this.connectWithService.bind(this)}>
                            <Text style={styles.copyLarge}>CONNECT WITH INSTAGRAM</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}



function select(state) {
    return {
        user: state.userReducer
    };
}

export default connect(select)(Login);