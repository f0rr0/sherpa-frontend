import { connect } from 'react-redux';
import countries from '../../../data/countries'
import moment from 'moment';
//import Mapbox from "react-native-mapbox-gl";
import {removeMomentFromSuitcase,addMomentToSuitcase,checkSuitcased} from '../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import PopOver from './popOver';
import UserImage from './userImage';
import StickyHeader from './stickyHeader';
import WikipediaInfoBox from './wikipediaInfoBox';
import FoursquareInfoBox from './foursquareInfoBox';
import SimpleButton from './simpleButton';
import config from '../../../data/config';
import { Fonts, Colors } from '../../../Themes/'
import {loadFeed,getFeed} from '../../../actions/feed.actions';
import Header from './header'
import MapView from 'react-native-maps'
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    TouchableHighlight,
    Linking,
    TouchableOpacity,
    PanResponder,
    Animated
} from 'react-native';
import React, { Component } from 'react';

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        height:500,
    },
    tripDataFootnoteIcon:{height:10,marginTop:5,marginLeft:-3},
});

class TripDetail extends React.Component{
    constructor(props){
        super();
        this.state= {
            suitcased: props.trip?props.trip.suitcased:false,
            momentData: null,
            routeName:"TRIP",
            offsetTop:new Animated.Value(0),
            directionLockDistance:0,
            direction:'x'
        }

        this.direction='x';


        getFeed(props.momentID,1,'moment').then((moment)=>{
            console.log('get feed',moment);
            this.setState({
                momentData: moment.data,
                routeName: moment.data.venue
            })
        })


    }


    componentDidMount(){
        console.log('trip detail page')
    }

    showUserProfile(trip){
        this.props.navigator.push({
            id: "profile",
            data:trip
        });
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    suitecaseMoment(){
        this.setState({suitcased:true});
        addMomentToSuitcase(this.props.momentID);
    }

    unsuitecaseMoment(){
        this.setState({suitcased:false});
        removeMomentFromSuitcase(this.props.momentID);
    }


    reset(){
        return true;
    }

    _renderSuitcaseButton(){
        return(
            <Animated.View style={{marginTop:this.props.gap,marginBottom:this.props.gap,borderRadius:this.props.borderRadius,overflow:'hidden'}}>
                <SimpleButton icon="is-suitcased-button"  style={{marginTop:0,backgroundColor:Colors.white,borderRadius:0}} textStyle={{color:Colors.highlight}} onPress={()=>{this.props.unSuiteCaseTrip()}} text="ADDED TO YOUR SUITCASE"></SimpleButton>
                <SimpleButton icon="suitcase-button" style={{marginTop:-55,opacity:this.state.suitcased?0:1}} onPress={()=>{this.props.suiteCaseTrip()}} text="ADD TO YOUR SUITCASE"></SimpleButton>
            </Animated.View>
        )
    }


    render(){
        var momentData=this.state.momentData;
        if(!momentData)return null;

        var timeAgo=moment(new Date(momentData.date*1000)).fromNow();
        var description=momentData.caption&&momentData.caption.length>0?<Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:12,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={2}>{momentData.caption}</Text>:null;

        var profilePic= momentData.profile.serviceProfilePicture?
            <View style={{height:windowSize.width,
            position:'absolute',top:0,flex:1,justifyContent:'flex-end',alignItems:'flex-start'}}>
                <Image style={{position:'absolute',bottom:0,left:0,width:windowSize.width,height:200}} resizeMode="cover" source={require('../../../Images/shadow-bottom.png')}></Image>
                <View style={{alignItems:'flex-start',flexDirection:'row',marginBottom:20,marginLeft:20}}>
                    <UserImage onPress={()=>{this.showUserProfile({owner:momentData.profile})}} radius={30} userID={momentData.profile.id} imageURL={momentData.profile.serviceProfilePicture}></UserImage>
                    <View style={{marginLeft:20,}}>
                        <TouchableOpacity onPress={()=>{
                            Linking.openURL(momentData.serviceJson.link)
                        }}>
                            {description}
                        </TouchableOpacity>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Image source={require('./../../../Images/icons/clock.png')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                            <Text style={{backgroundColor:'transparent',color:'white', marginTop:6,fontFamily:'Akkurat',fontSize:10,opacity:.8,marginLeft:3}}>{timeAgo.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </View>:null;
        return (
            <Animated.View style={[{backgroundColor:this.state.isDetailMode?'#CCC':'transparent'},this.props.style,{top:this.state.offsetTop,borderTopRightRadius:this.props.borderRadius,overflow:'hidden'}]}>
                <View style={{flex:1}} bounces={true} scrollEnabled={this.props.isDetailMode}>

                    <ImageProgress
                        style={{height:windowSize.width}}
                        resizeMode="cover"
                        indicator={Progress.Circle}
                        indicatorProps={{
                            color: 'rgba(150, 150, 150, 1)',
                            unfilledColor: 'rgba(200, 200, 200, 0.2)'
                        }}
                        source={{uri:momentData.mediaUrl}}
                    >
                    </ImageProgress>


                        {profilePic}
                        {this._renderSuitcaseButton()}
                        <WikipediaInfoBox countryCode={momentData.country} location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></WikipediaInfoBox>
                        <FoursquareInfoBox location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></FoursquareInfoBox>

                        <View style={{height:500,left:0,flex:1}} >
                            <MapView
                                style={styles.map} ref={ref => { this.map = ref; }}
                                initialRegion={{
                                    latitude: parseFloat(momentData.lat),
                                    longitude: parseFloat(momentData.lng),
                                    latitudeDelta: 1,
                                    longitudeDelta: 1,
                                }}
                            >
                                <MapView.Marker coordinate={{latitude:parseFloat(momentData.lat),longitude:parseFloat(momentData.lng)}}>
                                    <View style={{width:45,height:45,borderRadius:45,backgroundColor:'white'}}>
                                        <Image
                                            style={{width:39,height:39,borderRadius:20,marginLeft:3,marginTop:3}}
                                            source={{uri:momentData.mediaUrl}}
                                        ></Image>
                                    </View>
                                </MapView.Marker>
                            </MapView>
                        </View>
                    </View>
                    {<PopOver enableNavigator={this.props.enableNavigator} ref="popover" shareURL={config.shareBaseURL+"trip/"+momentData.trip+"/"+this.props.user.sherpaToken} showShare={true} reportPhoto={true} momentID={momentData.id}></PopOver>}
            </Animated.View>

        )
    }
}

export default TripDetail;