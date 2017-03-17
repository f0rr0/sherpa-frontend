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
import Swiper from 'react-native-swiper';


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
        justifyContent:'center',
        alignItems:'center',
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
    },
    dot:{
        width: 4,
        height: 4,
        borderRadius: 2,
        marginLeft: 2,
        marginRight: 2,
        marginTop: 2,
        marginBottom: 2,
        backgroundColor:Colors.white
    },
    dotHover:{
        backgroundColor: Colors.highlight
    }
});

class Login extends Component {
    constructor(props){
        super(props);
        this.state={
            showErrorEmail:false,
            showErrorInvite:false,
            isEmailValid:false,
            isInviteValid:false,

            inviteCode:"",
            email:"",
            deniedMessage:"You're not invited yet",

            inputBottomMargin: new Animated.Value(0),
            overlayOpacity:new Animated.Value(0),
            headlineOpacity:new Animated.Value(1)
        };

        this.isRequest=false;
    }

    onSubmit = () => {

        var validateInvite = this.isRequest?true:this.validate(this.state.inviteCode,'invite');
        var validateEmail  = this.validate(this.state.email,'email');


        if(validateInvite&&validateEmail){
            this.connectWithService.bind(this)(this.isRequest);
            this.refs.emailError.hide();
            this.refs.inviteError.hide();
            return;
        }

        if(!validateInvite){
            this.refs.inviteError.show();
        }

        if(!validateEmail){
            this.refs.emailError.show();
        }
    }

    validate = (content,type) =>{
        var isValid=false;
        switch(type){
            case 'email':
                if (this.validateEmail(content)) {
                    this.setState({email:content,isEmailValid:true,showErrorEmail:false})
                    isValid=true;
                }else{
                    this.setState({email:content,isEmailValid:false,showErrorEmail:true})
                }
            break;
            case 'invite':
                if (content.length>0) {
                    this.setState({inviteCode:content,isInviteValid:true,showErrorInvite:false})
                    isValid=true;
                }else{
                    this.setState({inviteCode:content,isInviteValid:false,showErrorInvite:true})
                }
            break;
            default:
        }
        return isValid;
    }

    connectWithService(isRequest){
        this.props.dispatch(updateUserDBState("waiting"));
        this.props.dispatch(updateUserData({email:this.state.email,inviteCode:this.state.inviteCode,intent:isRequest?"request-invite":"login"}));
        this.props.dispatch(signupUser());
    }

    moveUp(){
        Animated.spring(this.state.inputBottomMargin, {toValue: 260, friction:8}).start();
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
        if(this.props.denied){
            //this.refs.loginslider.scrollBy(1)
            this.refs.inviteError.show();
        }


        switch(this.props.user.invite){
            case "invalid":
                this.setState({deniedMessage:"Not a valid invite code"})
            break;
            case "expired":
                this.setState({deniedMessage:"That invite code has expired"})
            break;
            case "not-invited":
                this.setState({deniedMessage:"Your are not invited yet,please request an invite code."})
            break;
            default:
                this.setState({deniedMessage:"A valid invite code is required"})
        }
    }

    alreadyInvited(){
        this.isRequest=false;

        this.props.dispatch(updateUserData({
            isExistingLogin:true,
            intent:"login",
            serviceID:-1,
            sherpaID:-1,
            fullName:"",
            profilePicture:"",
            email:"rag@wild.as",
            bio:"",
            website:"",
            serviceToken:"",
            inviteCode:"",
            invite:"",
            username:"",
            jobID:"",
            hometown:"",
            serviceObject:"",
            service:"instagram",
            signupState:"",
            userDBState:"none", //none, empty, available,
            whiteListed:false,
            notificationToken:"",
            profileID:-1,
            usedSuitcase:false,
            usedAddTrip:false
        }));
        this.props.dispatch(updateUserDBState("waiting"));
        this.props.dispatch(signupUser());
    }

    _renderLoginDetailPage(){
        const requestInvite=
            <View style={styles.container}>
                <Image
                    style={styles.bg}
                    source={require('./../../../Images/request-invite-bg.png')}
                    resizeMode="cover"
                />


                <Animated.Text style={{opacity:this.state.headlineOpacity,color:'white',fontFamily:"TSTAR-bold",fontSize:36,position:'absolute',top:230,width:windowSize.width,textAlign:'center'}}>
                    REQUEST{"\n"}AN INVITE
                </Animated.Text>


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

                <Animated.View style={[styles.login,{marginBottom:this.state.inputBottomMargin,flex:1}]}>
                    <View style={{width:windowSize.width-30,marginBottom:15}}>
                        <SimpleInput keyboardType='email-address' ref="emailInput" onStart={this.moveUp.bind(this)} onEnd={this.moveDown.bind(this)} onChange={(text)=>{this.validate(text,'email')}} placeholder="Enter your email" style={{color:this.state.showErrorEmail?Colors.error:Colors.darkPlaceholder,marginTop:13}}></SimpleInput>
                        <SimpleButton onPress={()=>{this.isRequest=true;this.onSubmit()}} icon="instagram" text="Request an invite"></SimpleButton>
                    </View>
                </Animated.View>
                <TouchableOpacity
                    onPress={()=>{this.isRequest=false;this.refs.loginslider.scrollBy(-1)}}
                    style={{position:'absolute',top:0,left:0,padding:25}}
                >

                    <Image
                        source={require('./../../../Images/icons/back.png')}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View>;

        const signupWithInviteCode=
            <View style={styles.container}>
                <Image
                    style={styles.bg}
                    source={require('./../../../Images/signup-bg.png')}
                    resizeMode="cover"
                />

                <Animated.Text style={{opacity:this.state.headlineOpacity,color:'white',fontFamily:"TSTAR-bold",fontSize:36,position:'absolute',top:230,width:windowSize.width,textAlign:'center'}}>
                    GOT AN{"\n"}INVITE CODE?
                </Animated.Text>

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

                <Animated.View style={[styles.login,{marginBottom:this.state.inputBottomMargin,flex:1}]}>
                    <View style={{width:windowSize.width-30,marginBottom:15}}>
                        <SimpleInput key="a" ref="inviteCodeInput" onStart={this.moveUp.bind(this)} onChange={(text)=>{this.validate(text,'invite')}} placeholder="Your invite code" style={{color:this.state.showErrorInvite?Colors.error:Colors.darkPlaceholder}}></SimpleInput>
                        <SimpleInput key="b" ref="emailInput" keyboardType='email-address' onStart={this.moveUp.bind(this)} onChange={(text)=>{this.validate(text,'email')}} placeholder="Enter your email" style={{color:this.state.showErrorEmail?Colors.error:Colors.darkPlaceholder,marginTop:13}}></SimpleInput>
                        <SimpleButton onPress={()=>{this.isRequest=false;this.onSubmit()}} icon="instagram" text="sign up with instagram"></SimpleButton>
                    </View>
                </Animated.View>
                <TouchableOpacity
                    onPress={()=>{this.isRequest=false;this.refs.loginslider.scrollBy(-1)}}
                    style={{position:'absolute',top:0,left:0,padding:25}}
                >

                    <Image
                        source={require('./../../../Images/icons/back.png')}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
            </View>;

        let inviteDetailView;

        switch(this.state.detailViewType){
            case 'request':
                inviteDetailView=requestInvite;
            break;
            case 'signup':
                inviteDetailView=signupWithInviteCode;
            break;
        }

        return inviteDetailView;
    }

    requestInvite(){
        this.setState({detailViewType:'request'})
        this.refs.loginslider.scrollBy(1)
    }

    signupWithInvite(){
        this.setState({detailViewType:'signup'})
        this.refs.loginslider.scrollBy(1)
    }



    render() {
        return (
            <View>
            <Swiper ref="loginslider" style={styles.wrapper} showsPagination={false} scrollEnabled={false} showsButtons={false} loop={false} bounces={true} dot={<View style={styles.dot} />} activeDot={<View style={[styles.dot,styles.dotHover]} />}>
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

                    <Animated.View style={[styles.login,{marginBottom:this.state.inputBottomMargin,flex:1}]}>
                        <View style={{width:windowSize.width-30}}>
                            <SimpleButton onPress={()=>{this.requestInvite()}} text="Request an invite"></SimpleButton>
                            <SimpleButton onPress={()=>{this.signupWithInvite()}} text="Sign up with Invite code"></SimpleButton>
                        </View>
                        <View style={{flexDirection:"row"}}>
                            <TouchableOpacity activeOpacity={1} style={{borderTopWidth:1,borderRightWidth:1,borderColor:'rgba(255,255,255,.2)',width:windowSize.width,marginTop:15}} onPress={()=>{this.isRequest=false;this.alreadyInvited.bind(this)()}}>
                                <Text style={{color:'white',fontFamily:"TSTAR-bold",marginVertical:21,fontWeight:"800",fontSize:10,letterSpacing:.6,textAlign:"center",borderBottomWidth:.5,borderBottomColor:'rgba(255,255,255,.4)'}}>{"Already invited? Login via Instagram.".toUpperCase()}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                </View>

                {this._renderLoginDetailPage()}
            </Swiper>
                <SimpleError ref="emailError" errorMessage="Valid email address is required"></SimpleError>
                <SimpleError ref="inviteError" errorMessage={this.state.deniedMessage}></SimpleError>
            </View>
        );
    }
}

Login.defaultProps= {
    denied: false,
}


export default Login;