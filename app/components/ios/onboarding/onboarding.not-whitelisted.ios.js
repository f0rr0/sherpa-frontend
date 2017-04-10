'use strict';

import {addNotificationsDeviceToken} from '../../../actions/user.actions';
import {getFeed} from '../../../actions/feed.actions';
import {updateUserData,signupUser,updateUserDBState} from '../../../actions/user.actions';
import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import SafariView from "react-native-safari-view";
import SimpleButton from '../components/simpleButton';
import Swiper from 'react-native-swiper';
import { Fonts, Colors } from '../../../Themes/'
var KDSocialShare = require('NativeModules').KDSocialShare;
import NotificationsIOS from 'react-native-notifications';
import moment from 'moment';
import UserImage from '../components/userImage';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    Image,
    Linking,
    TouchableOpacity,
Animated
} from 'react-native';
import React, { Component } from 'react';



var styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        position:'absolute',
        alignItems:"flex-end",
        height:windowSize.height,
        width:windowSize.width,
        top:0,
        left:0,
    },
    bg:{
        position:'absolute',
        left:0,
        top:0,
        width:windowSize.width,
        height:windowSize.height
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

    login:{
        flex:1,
        padding:20,
        justifyContent:'center',
        marginTop:60
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
    },
    tripDataFootnoteIcon:{height:10,marginTop:5,marginLeft:-3},

});

class NotWhitelisted extends Component {
    constructor(props){
        super(props);
        //populate later
        this.state={featuredMoments:[],barProgress:new Animated.Value(0),slideshowTitleOpacity:new Animated.Value(1),slideshowStarted:false}
    }

    componentDidMount(){
        this._requestFeaturedMoments();
    }

    allowNotifications() {
        NotificationsIOS.addEventListener('remoteNotificationsRegistered', this._onRegister.bind(this));
        NotificationsIOS.requestPermissions();
    }

    _onRegister(deviceToken){
        if(deviceToken&&typeof deviceToken==='string'){
            this.props.dispatch(addNotificationsDeviceToken(deviceToken,this.props.user.sherpaToken))
        }

        this.refs.onboardingSlider.scrollBy(1)
    }

    _requestFeaturedMoments(){

        getFeed(this.props.user.sherpaID,1,'feed').then((result)=>{
            //result verarbeiten
            var maxMoments=5;
            var featuredMoments=[];
            for(var tripIndex in result.trips){
                var currTrip=result.trips[tripIndex];
                    featuredMoments.push(currTrip);
                    if(featuredMoments.length==maxMoments)break;
            }
            //console.log('featured moments',featuredMoments);
            this.setState({featuredMoments})
        }).catch((err)=>{
            //error logging
        });

    }

    cycleAnimation() {
        Animated.sequence([
            Animated.timing(this.state.barProgress, {
                toValue: windowSize.width,
                duration: 4000,
                delay: 1000
            }),
            Animated.timing(this.state.barProgress, {
                toValue: 0,
                duration: 0
            })
        ]).start(() => {
            this.cycleAnimation();
            if(this.refs.featuredMomentsGallery)this.refs.featuredMomentsGallery.scrollBy(1)
        });
    }

    startSlideshow(){
        if(!this.state.slideshowStarted){
            this.setState({slideshowStarted:true});
            //Animated.timing(this.state.slideshowTitleOpacity, {
            //    toValue: .1,
            //    duration: 30000
            //}).start();
            this.cycleAnimation();
        }
    }

    _tweet(){
        KDSocialShare.tweet({
            'text':'Can I get an invite to @trysherpa? #Instagram #TravelGuide http://www.trysherpa.com'},
            (res)=>{
                if(res=='success'){
                    this.refs.onboardingSlider.scrollBy(1);
                    this.startSlideshow();
                }
            }
        );
    }


    render() {
        return (
            <Swiper ref="onboardingSlider" showsPagination={false} scrollEnabled={false} showsButtons={false} loop={false} bounces={true} dot={<View style={styles.dot} />} activeDot={<View style={[styles.dot,styles.dotHover]} />}>
                <View style={styles.container}>
                    <Image
                        style={styles.bg}
                        source={require('./../../../Images/onboarding-req-1.png')}
                        resizeMode="cover"
                    />

                    <View style={styles.login}>
                        <SimpleButton onPress={()=>{this.allowNotifications()}} text="Enable notifications"></SimpleButton>
                        <TouchableOpacity onPress={()=>{this.refs.onboardingSlider.scrollBy(1)}}>
                            <Text style={{fontFamily:"TSTAR-bold",fontSize:10,letterSpacing:1,fontWeight:"600",marginTop:10,textAlign:'center',color:'white',backgroundColor:'transparent'}}>SKIP NOTIFICATIONS</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={styles.container}>
                    <Image
                        style={styles.bg}
                        source={require('./../../../Images/onboarding-req-2.png')}
                        resizeMode="cover"
                    />

                    <View style={styles.login}>
                        <SimpleButton icon="twitter" style={{backgroundColor:Colors.white}} textStyle={{color:Colors.twitterBlue}} onPress={this._tweet.bind(this)} text="REQUEST ON TWITTER"></SimpleButton>
                        <TouchableOpacity onPress={()=>{this.refs.onboardingSlider.scrollBy(1);this.startSlideshow()}}>
                            <Text style={{fontFamily:"TSTAR-bold",fontSize:10,letterSpacing:1,fontWeight:"600",marginTop:10,textAlign:'center',color:'white',backgroundColor:'transparent'}}>SKIP THIS STEP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.container]}>

                    <Swiper ref="featuredMomentsGallery" automaticallyAdjustContentInsets={true} style={styles.wrapper} showsPagination={false} scrollEnabled={false} showsButtons={false} loop={true} bounces={true} dot={<View style={styles.dot} />} activeDot={<View style={[styles.dot,styles.dotHover]} />}>

                        {this.state.featuredMoments.map(function(trip){
                            var timeAgo=moment(new Date(trip.dateEnd*1000)).fromNow();
                            var description=<Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:10,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={2}>TOOK A TRIP {trip.moments[0].location.toUpperCase()+", "+trip.moments[0].continent.toUpperCase()}</Text>;

                            return(
                                <View style={styles.container} key={trip.id}>
                                    <ImageProgress
                                        resizeMode="cover"
                                        indicator={Progress.Circle}
                                        indicatorProps={{
                                            color: 'rgba(150, 150, 150, 1)',
                                            unfilledColor: 'rgba(200, 200, 200, 0.2)'
                                        }}
                                        style={styles.bg}
                                        source={{uri:trip.moments[0].mediaUrl}}
                                        onLoad={() => {}}
                                        onError={()=>{}}
                                    />
                                    <View style={[styles.container,{backgroundColor:"rgba(0,0,0,.45)"}]}></View>


                                    <View style={{height:50,alignItems:'flex-start',flexDirection:'row',marginBottom:20,marginLeft:20}}>
                                        <UserImage style={{position:'absolute',top:0}} radius={30} userID={trip.owner.id} imageURL={trip.owner.serviceProfilePicture}></UserImage>
                                        <View style={{marginLeft:50,}}>
                                            <TouchableOpacity onPress={()=>{
                                                Linking.openURL(trip.serviceJson.link)
                                            }}>

                                                <Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:12,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={2}>{trip.owner.serviceUsername}</Text>
                                                {description}
                                            </TouchableOpacity>
                                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                                <Image source={require('image!icon-watch')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                                                <Text style={{backgroundColor:'transparent',color:'white', marginTop:6,fontFamily:'Akkurat',fontSize:10,opacity:.8,marginLeft:3}}>{timeAgo.toUpperCase()}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>)
                        })}
                    </Swiper>

                    <Animated.View style={[styles.container,{alignItems:"center",justifyContent:"center",opacity:this.state.slideshowTitleOpacity}]}>
                        <Text style={{fontSize:30,fontFamily:"TSTAR-bold",width:windowSize.width*.7,textAlign:"center",color:"white"}}>YOUR INVITATION IS PENDING</Text>
                    </Animated.View>

                    <Animated.View ref="progressLine" style={{width:this.state.barProgress,position:"absolute",bottom:0,left:0,height:3,backgroundColor:"white"}}></Animated.View>

                </View>
            </Swiper>
        );
    }
}

export default NotWhitelisted;