'use strict';

import {addNotificationsDeviceToken,setUserHometown,updateUserData,updateUserDBState,enableScraping} from '../../../actions/user.actions';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
import Swiper from 'react-native-swiper';
import OnboardingScreen from './onboarding.screen.ios';
import ChooseHometown from '../components/chooseHometown.js';
import SimpleButton from '../components/simpleButton';
import React, { Component } from 'react';
import NotificationsIOS from 'react-native-notifications';
import { Fonts, Colors } from '../../../Themes/'
import store from 'react-native-simple-store';
import config from '../../../data/config';
const {instagram,sherpa}=config.auth[config.environment];

import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableHighlight,
} from 'react-native';

var windowSize=Dimensions.get('window');

var styles = StyleSheet.create({
    container: {
        flexDirection:'column',
        flex:1,
        backgroundColor:'transparent'
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
    copyIntro:{
        color:'#001545',
        fontFamily:"TSTAR-bold",
        fontSize:15,
        paddingLeft:15,
        paddingRight:15,
        marginBottom:15,
        textAlign:"center"
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
        backgroundColor:'#001545',
        height:50,
        alignItems:'center',
        justifyContent:'center',
        width:windowSize.width-30
    },
    buttonHalf:{
        width:windowSize.width*.4
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
    },
    baseText:{
        color:"#011e5c",
        textAlign:"center"
    },
    buttonText:{
        fontFamily:"TSTAR-bold",
        color:"#FFFFFF"
    },
    textStyleNormal:{
        fontSize:32,
        letterSpacing:2,
        fontFamily:"TSTAR-bold",
        color:'white',
        textAlign:'center',
        left:0,
    },
    textStyleHighlight:{
        color:Colors.highlight
    }
});

class OnboardingSteps extends Component {
    constructor(props){
        super(props);
        this.state={
            hometown:{'name':this.props.user.hometown},
            hometownBG:{uri:this.props.user.hometownImage},
            darken:false
        }
    }

    componentDidMount(){
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", this.props.user.sherpaToken);
            const {endpoint,version,user_uri} = sherpa;

            fetch(endpoint+"v1/profile/"+this.props.user.serviceID+"/moments/most-liked/",{
                method:'get',
                headers:sherpaHeaders
            }).then((rawServiceResponse)=>{
                //console.log('raw sercvice response',rawServiceResponse)
                return rawServiceResponse.text();
            }).then((rawSherpaResponse)=>{
                var parsedResponse=JSON.parse(rawSherpaResponse);
                //console.log(parsedResponse);
                //this.setState({hometownBG:{uri:parsedResponse.highresUrl||parsedResponse.mediaUrl},darken:true})
            });
    }

    allowNotifications() {
        //console.log('allow notifications');
        if(this.props.user.notificationToken==""){
            NotificationsIOS.addEventListener('remoteNotificationsRegistered', this._onRegister.bind(this));
            NotificationsIOS.requestPermissions();
        }else{
            this._onRegister();
        }
    }

    _onRegister(deviceToken){
        //console.log('on register');
        if(deviceToken&&typeof deviceToken==='string'){
            this.props.dispatch(addNotificationsDeviceToken(deviceToken))
        }else{
            this.props.dispatch(updateUserDBState("available-existing"));
        }
    }

    _enableScraping(enable){
        //console.log('enable scraping',enable)
        //this.props.dispatch(enableScraping(enable));
    }

    _renderScrapingPermission(){

    }

    _renderNotificationPermission(){

    }

    _renderHometownSelection(){

    }


    render() {
        var me=this;



        return (
            <Swiper ref="onboardingSlider" style={styles.wrapper} showsPagination={false} scrollEnabled={false}  dot={<View style={styles.dot} />} showsButtons={false} loop={false} bounces={true} activeDot={<View style={[styles.dot,styles.dotHover]} />}>

                <OnboardingScreen
                    darken={true}
                    backgroundImage={{uri:this.props.user.hometownImage}}
                        continueButton={<SimpleButton style={{width:windowSize.width-30,marginBottom:15}} onPress={()=>{this.props.user.notificationToken==""?this.refs.onboardingSlider.scrollBy(1):this._onRegister.bind(this)()}} text="ok let's go"></SimpleButton>}
                        mainComponent={
                        <View>
                            <View style={{ padding:40, marginTop:80,position:'absolute', top:180,width:windowSize.width}}>
                                 <ChooseHometown user={this.props.user} rescrapeOnChange={true} dispatch={this.props.dispatch} placeholder='Search' styles={{
                                     description: {
                                         fontFamily: Fonts.type.bodyCopy,
                                         fontSize: Fonts.size.input,
                                         letterSpacing:Fonts.letterSpacing.small,
                                         color:'white'
                                     },
                                     predefinedPlacesDescription: {
                                         color: '#FFFFFF',
                                     },
                                     poweredContainer: {
                                         justifyContent: 'center',
                                         alignItems: 'center',
                                         opacity:0
                                     },
                                     textInput: {
                                         backgroundColor: '#FFFFFF',
                                         height: 42,
                                         borderRadius: 0,
                                         paddingTop:0,
                                         paddingBottom:0,
                                         fontWeight:'normal',
                                         fontFamily: Fonts.type.bodyCopy,
                                         fontSize: Fonts.size.input,
                                         letterSpacing:Fonts.letterSpacing.small
                                     },
                                     textInputContainer: {
                                         backgroundColor: '#FFFFFF',
                                         height:55,
                                         borderRadius:2,
                                         borderTopWidth: 0,
                                         borderLeftWidth:0,
                                         borderRightWidth:0,
                                         borderBottomWidth: 0
                                     },
                                     separator: {
                                         height: 0,
                                         backgroundColor: '#FFFFFF'
                                     }
                                 }}/>
                             </View>
                             <View style={{position:"absolute",top:130,flex:1,width:windowSize.width-30,left:15}}>
                                <Text style={styles.textStyleNormal}>{"Is this your\nhome base?".toUpperCase()}</Text>
                                <Text style={[styles.textStyleNormal,{fontWeight:"900",fontSize:10,marginTop:2,letterSpacing:.8,opacity:.8}]}>EDIT HOMETOWN BELOW</Text>
                             </View>
                         </View>
                        }

                    />

                    <OnboardingScreen
                        darken={true}
                        topAreaStyle={{top:220}}
                        headline={"Share where\nyou've been"}
                        description="create your profile via instagram?"
                        backgroundImage={{uri:this.props.user.mostLikedImage}}
                        continueButton={
                            <View>
                                <SimpleButton style={{width:windowSize.width-30}} onPress={()=>{console.log('on press'); this.refs.onboardingSlider.scrollBy(1);this._enableScraping(true)}} text="yep, let's do this"></SimpleButton>
                                  <TouchableOpacity activeOpacity={1} style={{backgroundColor:'transparent'}} onPress={()=>{this._enableScraping.bind(this)(false)}}>
                                    <Text style={{color:'white',fontFamily:"TSTAR-bold",marginVertical:18,fontWeight:"800",fontSize:10,letterSpacing:.6,textAlign:"center",borderBottomWidth:.5,borderBottomColor:'rgba(255,255,255,.4)'}}>{"Maybe later".toUpperCase()}</Text>
                                </TouchableOpacity>
                            </View>
                        }>

                    </OnboardingScreen>


                    <OnboardingScreen
                        backgroundImage={require('./../../../Images/onboarding-notification_empty.png')}
                        continueButton={
                            <View style={{flex:1,flexDirection:"row",alignItems:"center"}}>
                                <View style={{left:0,right:0,top:-250,position:'absolute',alignItems:'center'}}>
                                    <Text style={{fontSize:33,letterSpacing:1,color:'white',fontFamily:"TSTAR",fontWeight:"800",textAlign:'center',width:300}}>SHERPA IS BETTER WITH NOTIFICATIONS</Text>
                                    <Text style={{fontSize:12,letterSpacing:1,color:'white',fontFamily:"TSTAR",fontWeight:"600",textAlign:'center',width:300}}>WE PROMISE NOT TO BLOW UP YOUR PHONE</Text>
                                </View>
                                <SimpleButton style={[styles.buttonHalf,{marginRight:5,backgroundColor:'#2E2F31'}]} onPress={this._onRegister.bind(me)} text="skip"></SimpleButton>
                                <SimpleButton style={[styles.buttonHalf]} onPress={this.allowNotifications.bind(me)} text="enable"></SimpleButton>
                            </View>
                        }
                    />
                </Swiper>


        );
    }
}

export default OnboardingSteps;