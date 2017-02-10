import { connect } from 'react-redux';
import countries from './../../../../data/countries'
import moment from 'moment';
//import Mapbox from "react-native-mapbox-gl";
import {checkSuitcased} from '../../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import PopOver from '../../components/popOver';
import UserImage from '../../components/userImage';
import StickyHeader from '../../components/stickyHeader';
import WikipediaInfoBox from '../../components/wikipediaInfoBox';
import FoursquareInfoBox from '../../components/foursquareInfoBox';
import SimpleButton from '../../components/simpleButton';
import config from '../../../../data/config';
import { Fonts, Colors } from '../../../../Themes/'
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import Header from '../../components/header'
import MapView from 'react-native-maps'
import MarkerMap from '../../components/MarkerMap'
import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    TouchableHighlight,
Animated,
Linking,
TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center',
        paddingBottom:10,
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width,
        height:windowSize.width-30,
        marginBottom:30
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-5,
        marginBottom:0,
        justifyContent:'center',
        alignItems:'center'
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        height:250,width:windowSize.width
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    tripDataFootnoteIcon:{height:10,marginTop:5,marginLeft:-3},
});

class TripDetail extends React.Component{
    constructor(props){
        super();
        this.state= {
            suitcased: props.isSuitcased?true:(props.trip?props.trip.suitcased:false),
            momentData: null,
            routeName:"TRIP",
            scrollY:new Animated.Value(0)
        }


        getFeed(props.momentID,1,'moment').then((moment)=>{
            //console.log(moment,'moment')
            this.setState({
                momentData: moment.data,
                routeName: moment.data.venue
            })
        })

    }

    componentDidMount(){
    }

    showTripMap(momentData){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip:{moments:[momentData]},
            title:momentData.venue,
            sceneConfig:"bottom-nodrag",
            hideNav:true,
            disablePins:true
        });
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    showTripDetail(){
        //console.log('this is trip detail');
    }

    showUserProfile(trip){
        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    suitecaseMoment(){
        this.setState({suitcased:true});
        this.props.suiteCaseTrip();
    }

    unsuitecaseMoment(){
        this.setState({suitcased:false});
        this.props.unSuiteCaseTrip();
    }


    suiteCaseTrip(){
        //console.log('suitcase trip');

        this.setState({suitcased:!this.state.suitcased});
        if(!this.state.suitcased){
            this.props.suitcase?this.props.suitcase():this.suitecaseMoment();
        }else{
            this.props.unsuitcase?this.props.unsuitcase():this.unsuitecaseMoment();
        }
    }

    reset(){
        return true;
    }



    _renderSuitcaseButton(){
        //console.log('this state suitcase',this.state.suitcased);
        return(
            <View>
                <SimpleButton icon="is-suitcased-button"  style={{marginTop:0,backgroundColor:Colors.white}} textStyle={{color:Colors.highlight}} onPress={()=>{this.suiteCaseTrip()}} text="ADDED TO YOUR SUITCASE"></SimpleButton>
                <SimpleButton icon="suitcase-button" style={{marginTop:-55,opacity:this.state.suitcased?0:1}} onPress={()=>{this.suiteCaseTrip()}} text="ADD TO YOUR SUITCASE"></SimpleButton>
            </View>
        )
    }


    render(){
        var momentData=this.state.momentData;
        //console.log(momentData)
        if(!momentData)return <View style={{flex:1,backgroundColor:'white', justifyContent:'center',alignItems:'center'}}><Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} /></View>
        let windowHeight=windowSize.height;
        var timeAgo=moment(new Date(momentData.date*1000)).fromNow();
        var description=momentData.caption&&momentData.caption.length>0?<Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:12,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={3}>{momentData.caption}</Text>:null;
        var profilePic= momentData.profile.serviceProfilePicture?
            <View style={{height:windowSize.width,width:windowSize.width,position:'absolute',top:0,flex:1,justifyContent:'flex-end',alignItems:'flex-start'}}>
                    <Image style={{position:'absolute',bottom:0,left:0,width:windowSize.width,height:200}} resizeMode="cover" source={require('../../../../Images/shadow-bottom.png')}></Image>
                <View style={{alignItems:'flex-start',flexDirection:'row',marginBottom:20,marginLeft:20}}>
                    <UserImage onPress={()=>{this.showUserProfile({owner:momentData.profile})}} radius={30} userID={momentData.profile.id} imageURL={momentData.profile.serviceProfilePicture}></UserImage>
                    <View style={{marginLeft:20,}}>
                        <TouchableOpacity onPress={()=>{
                            Linking.openURL(momentData.serviceJson.link)
                        }}>
                            {description}
                        </TouchableOpacity>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Image source={require('image!icon-watch')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                            <Text style={{backgroundColor:'transparent',color:'white', marginTop:6,fontFamily:'Akkurat',fontSize:10,opacity:.8,marginLeft:3}}>{timeAgo.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </View>:null;
        return (
            <View style={{flex:1}}>
                <ScrollView  scrollEventThrottle={8} style={{flex:1,backgroundColor:'white'}} onScroll={(event)=>{
                 Animated.event(
                          [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
                        )(event);
                }}>

                    <Animated.Image
                        style={[{height:windowSize.width,width:windowSize.width },
                        {
                                transform: [,{
                        scale: this.state.scrollY.interpolate({
                            inputRange: [ -windowSize.width, 0],
                            outputRange: [3, 1.1],
                             extrapolate: 'clamp'
                        })
                    },{translateY:this.state.scrollY.interpolate({
                                                    inputRange: [ -windowSize.width,0],
                                                    outputRange: [-40, 0],
                                                    extrapolate: 'clamp',
                                                })}]
                                }]}
                        resizeMode="cover"
                        source={{uri:momentData.mediaUrl}}
                    />


                    {profilePic}
                    {this._renderSuitcaseButton()}
                    <WikipediaInfoBox data={momentData.wikipediaVenue} countryCode={momentData.country} location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></WikipediaInfoBox>
                    <FoursquareInfoBox data={momentData.foursquareVenue} location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></FoursquareInfoBox>

                    <TouchableOpacity style={{height:250,left:0,flex:1}}  onPress={()=>{this.showTripMap(momentData)}}>
                        <MarkerMap interactive={false} moments={[momentData]}> </MarkerMap>
                    </TouchableOpacity>

                </ScrollView>
                    <Header settings={{navColor:'white',routeName:this.state.routeName,topShadow:true,hideNav:false}} ref="navStatic" goBack={this.props.navigator.pop}  navActionRight={this.navActionRight.bind(this)}></Header>
                <PopOver ref="popover" shareURL={config.auth[config.environment].shareBaseURL+"trips/"+momentData.trip+"/moments/"+momentData.id} showShare={true} reportPhoto={true} momentID={momentData.id}></PopOver>
            </View>

        )
    }
}

export default TripDetail;