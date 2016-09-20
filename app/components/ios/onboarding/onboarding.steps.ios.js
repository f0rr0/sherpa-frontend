'use strict';

import {addNotificationsDeviceToken,setUserHometown,updateUserData,updateUserDBState} from '../../../actions/user.actions';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Swiper from 'react-native-swiper';
import OnboardingScreen from './onboarding.screen.ios';
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
        width:windowSize.width*.8
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
        fontSize:30,
        letterSpacing:2,
        fontFamily:"TSTAR-bold",
        color:'white',
        textAlign:'center'
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
            hometownBG:{uri:""}
        }
    }

    componentDidMount(){
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", this.props.user.sherpaToken);
            const {endpoint,version,user_uri} = sherpa;

            fetch(endpoint+"v1/profile/"+this.props.user.serviceID+"/moments/lasthometownmoment/",{
                method:'get',
                headers:sherpaHeaders
            }).then((rawServiceResponse)=>{
                return rawServiceResponse.text();
            }).then((rawSherpaResponse)=>{
                var parsedResponse=JSON.parse(rawSherpaResponse);
                this.setState({hometownBG:{uri:parsedResponse.mediaUrl}})
            });
    }

    allowNotifications() {
        if(this.props.user.notificationToken==""){
            NotificationsIOS.addEventListener('remoteNotificationsRegistered', this._onRegister.bind(this));
            NotificationsIOS.requestPermissions();
        }else{
            this._onRegister();
        }
    }

    _onRegister(deviceToken){
        console.log(deviceToken,' device token', typeof deviceToken);
        if(deviceToken&&typeof deviceToken==='string'){
            this.props.dispatch(addNotificationsDeviceToken(deviceToken))
        }else{
            this.props.dispatch(updateUserDBState("available-existing"));
        }
    }

    render() {
        var me=this;
        return (
            <Swiper ref="onboardingSlider" style={styles.wrapper} showsPagination={false} scrollEnabled={false} showsButtons={false} loop={false} bounces={true} dot={<View style={styles.dot} />} activeDot={<View style={[styles.dot,styles.dotHover]} />}>
                <OnboardingScreen
                    darken={true}
                    backgroundImage={this.state.hometownBG}
                        continueButton={<SimpleButton style={{width:windowSize.width*.8}} onPress={()=>{this.props.user.notificationToken==""?this.refs.onboardingSlider.scrollBy(1):this._onRegister.bind(this)()}} text="ok let's go"></SimpleButton>}
                        mainComponent={
                        <View>
                            <View style={{ padding:40, marginTop:80,position:'absolute', top:180,width:windowSize.width}}>
                                 <GooglePlacesAutocomplete
                                     placeholder='Search'
                                     ref="googlesearch"
                                     minLength={2} // minimum length of text to search
                                     autoFocus={false}


                                     textInputProps={{
                                        //onEndEditing:()=>{
                                        //},
                                        onBlur:(e)=>{
                                        e.preventDefault();
                                           //this.refs.googlesearch.setAddressText(this.state.hometown.name)
                                        }
                                     }}

                                     fetchDetails={true}
                                     onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true

                                        var hometownObject={
                                            lat:details.geometry.location.lat,
                                            lng:details.geometry.location.lng,
                                            name:details.name
                                        }

                                        this.setState({hometown:hometownObject});

                                        this.props.dispatch(setUserHometown(hometownObject));
                                        this.props.dispatch(updateUserData({hometown:hometownObject.name}));
                                     }}
                                     getDefaultValue={() => {
                                        return this.state.hometown.name; // text input default value
                                     }}
                                     query={{
                                         key: 'AIzaSyAyiaituPu_vKF5CB50o3XrQw8PLy1QFMY',
                                         language: 'en', // language of the results
                                         types: '(cities)', // default: 'geocode'
                                     }}
                                     styles={{
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
                                     }}

                                     currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                                     currentLocationLabel="Current location"
                                     nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                                     GoogleReverseGeocodingQuery={{
                                     }}
                                     GooglePlacesSearchQuery={{
                                        rankby: 'distance'
                                     }}

                                     filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                                 />
                             </View>
                             <View style={{position:"absolute",top:130,flex:1,width:windowSize.width*.8,left:windowSize.width*.1}}>
                                <Text style={styles.textStyleNormal}>IS THIS YOUR HOMETOWN?</Text>
                                <Text style={[styles.textStyleNormal,{fontSize:9,marginTop:2,letterSpacing:.8,opacity:.8}]}>EDIT HOMETOWN BELOW</Text>
                             </View>
                         </View>
                        }

                    />


                    <OnboardingScreen
                        backgroundImage={require('./../../../Images/onboarding-notification.png')}
                        continueButton={
                            <View style={{flex:1,flexDirection:"row",alignItems:"center"}}>
                                <SimpleButton style={[styles.buttonHalf,{marginRight:5,backgroundColor:'#bcbec4'}]} onPress={this._onRegister.bind(me)} text="maybe later"></SimpleButton>
                                <SimpleButton style={[styles.buttonHalf]} onPress={this.allowNotifications.bind(me)} text="ok got it"></SimpleButton>
                            </View>
                        }

                    />
                </Swiper>


        );
    }
}

export default OnboardingSteps;