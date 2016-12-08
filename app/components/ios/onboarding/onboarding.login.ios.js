'use strict';

import {updateUserData,signupUser,updateUserDBState,storeUser} from '../../../actions/user.actions';
import {getFeed} from '../../../actions/feed.actions';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
import SimpleButton from '../components/simpleButton';
import SimpleInput from '../components/simpleInput';
import SimpleError from '../components/simpleError';
var windowSize=Dimensions.get('window');
import dismissKeyboard from 'react-native-dismiss-keyboard';
import { Fonts, Colors } from '../../../Themes/'


import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    AlertIOS,
    Image,
    Animated
} from 'react-native';
import React, { Component } from 'react';


var styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        flex:1,
        position:'absolute',
        alignItems:"flex-end",
        height:windowSize.height,
        width:windowSize.width
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
        padding:15,
        justifyContent:'center'
    },
    overlay:{
        flex:1,
        top:0,
        bottom:0,
        left:0,
        right:0,
        position:'absolute'
    },
    logo:{

        width:80,
    },
    logoContainer:{
        position:'absolute',
        top:0,
        flex:1,
        right:0,
        left:0,
        alignItems:'center'
    }
});

class Login extends Component {
    constructor(props){
        super(props);
        this.state={showError:false,isValid:false,inviteCode:"everest",email:"",inputBottomMargin: new Animated.Value(0),overlayOpacity:new Animated.Value(0),headlineOpacity:new Animated.Value(1)};
    }

    onSubmit = () => {
        if(this.state.isValid){
            this.connectWithService.bind(this)();
            this.refs.emailError.hide();
        }else{
            this.setState({showError:true})
            this.refs.emailError.show();
        }
    }

    validate = (email) =>{
        if (this.validateEmail(email)) {
            this.setState({email,isValid:true,showError:false})
        }else{
            this.setState({email,isValid:false,showError:false})
        }
    }

    connectWithService(){
        this.props.dispatch(updateUserDBState("waiting"));
        this.props.dispatch(updateUserData({email:this.state.email,inviteCode:this.state.inviteCode}));
        this.props.dispatch(signupUser());
    }

    moveUp(){
        Animated.spring(this.state.inputBottomMargin, {toValue: 310, friction:8}).start();
        Animated.spring(this.state.overlayOpacity, {toValue: .5,friction:8}).start();
        Animated.spring(this.state.headlineOpacity, {toValue: 0,friction:8}).start();
    }

    moveDown(){
        dismissKeyboard();
        Animated.spring(this.state.inputBottomMargin, {toValue: 0,friction:8}).start();
        Animated.spring(this.state.overlayOpacity, {toValue: 0,friction:8}).start();
        Animated.spring(this.state.headlineOpacity, {toValue: 1,friction:8}).start();
    }

    validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    componentDidMount(){
        //console.log("user:: ",this.props.user);
        if(this.props.denied)this.refs.notInvitedError.show();
    }

    alreadyInvited(){
            //this.refs.notInvitedError.show();
        this.props.dispatch(updateUserData({isExistingLogin:true}));
        this.props.dispatch(updateUserDBState("waiting"));
        this.props.dispatch(signupUser());
    }

    render() {
        return (
            <View style={styles.container}>
                <Image
                    style={styles.bg}
                    source={require('./../../../Images/intro_bg.png')}
                    resizeMode="cover"
                />

                <Animated.Image
                    style={[styles.bg,{opacity:this.state.headlineOpacity}]}
                    source={require('./../../../Images/intro_title.png')}
                    resizeMode="contain"
                />

                <TouchableOpacity onPress={this.moveDown.bind(this)} style={styles.overlay}>
                    <Animated.View style={[styles.overlay,{opacity:this.state.overlayOpacity,backgroundColor:'black'}]}></Animated.View>
                </TouchableOpacity>

                <View style={styles.logoContainer}>
                    <Image
                        style={styles.logo}
                        source={require('./../../../Images/intro_logo.png')}
                        resizeMode="contain"
                    />
                </View>

                <Animated.View style={[styles.login,{marginBottom:this.state.inputBottomMargin}]}>
                    <SimpleInput ref="emailInput" onStart={this.moveUp.bind(this)} onEnd={this.moveDown.bind(this)} onChange={(text)=>{this.validate(text)}} placeholder="Enter your email" style={{color:this.state.showError?Colors.error:Colors.darkPlaceholder}}></SimpleInput>
                    <SimpleButton onPress={()=>{this.onSubmit()}} icon="instagram" text="Request an invite"></SimpleButton>
                    <SimpleButton text="I've been invited" onPress={()=>{this.alreadyInvited.bind(this)()}}>
                    </SimpleButton>
                </Animated.View>

                <SimpleError ref="emailError" errorMessage="Valid email address is required"></SimpleError>
                <SimpleError ref="notInvitedError" errorMessage="You're not invited yet"></SimpleError>
            </View>
        );
    }
}



export default Login;