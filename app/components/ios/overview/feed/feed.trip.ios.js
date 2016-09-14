'use strict';

import FeedLocation from "./feed.location.ios";
import FeedProfile from "./feed.profile.ios";
import countries from "./../../../../data/countries";
import Mapbox from "react-native-mapbox-gl";
import MaskedView from "react-native-masked-view";
import moment from 'moment';
import {loadFeed} from '../../../../actions/feed.actions';
import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../../actions/user.actions';
import {udpateFeedState} from '../../../../actions/feed.actions';
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import config from '../../../../data/config';
import store from 'react-native-simple-store';
import StickyHeader from '../../components/stickyHeader';
import PopOver from '../../components/popOver';
import TripSubtitle from '../../components/tripSubtitle'
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
const {sherpa}=config.auth[config.environment];
import UserImage from '../../components/userImage'
import SimpleButton from '../../components/simpleButton'



import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight
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
        paddingBottom:20,
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:38,
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-15,
        marginBottom:13,
        marginLeft:15,
        marginRight:15,
        width:windowSize.width-30,
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    listViewContainer:{flex:1,backgroundColor:'white'},
    headerContainer:{flex:1,height:900},
    headerMaskedView:{height:660, width:windowSize.width,alignItems:'center',flex:1},
    headerDarkBG:{position:"absolute",top:0,left:0,flex:1,height:610,width:windowSize.width,opacity:1,backgroundColor:'black' },
    headerImage:{position:"absolute",top:0,left:0,flex:1,height:610,width:windowSize.width,opacity:.6 },
    headerTripTo:{color:"#FFFFFF",fontSize:14,letterSpacing:.5,marginTop:15,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800"},
    headerTripName:{color:"#FFFFFF",fontSize:35,marginTop:3, lineHeight:28,paddingTop:7,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1.5,backgroundColor:"transparent"},
    subTitleContainer:{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',position:'absolute',bottom:260,left:0,right:0,height:20,marginTop:-5}
});

class FeedTrip extends Component {
    constructor(props){
        super(props);
         this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state= {
            dataSource: this.ds.cloneWithRows(props.trip.moments),
            annotations:[],
            moments:props.trip.moments,
            shouldUpdate:true,
            isCurrentUsersTrip:false
        };
    }

    toggleNav(){
       this.refs.popover._setAnimation("toggle");
    }

    componentDidMount(){
        var markers=[];
        var momentIDs=[];


        for (var i=0;i<this.state.moments.length;i++){

            markers.push({
                coordinates: [this.state.moments[i].lat, this.state.moments[i].lng],
                type: 'point',
                title:this.state.moments[i].venue,
                annotationImage: {
                    url: 'image!icon-pin',
                    height: 7,
                    width: 7
                },
                id:"markers"+i
            });

            momentIDs.push(this.state.moments[i].id);
        }

        store.get('user').then((user) => {
            if (user) {
                var newMoments = this.state.moments.slice();
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                const {endpoint,version} = sherpa;

                this.setState({isCurrentUsersTrip:this.props.trip.owner.id===user.sherpaID,sherpaToken:user.sherpaToken})


                fetch(endpoint + version + "/moment/batchsuitcasedby/" + this.props.user.serviceID, {
                    method: 'post',
                    headers: sherpaHeaders,
                    body: encodeQueryData({
                        moments: JSON.stringify(momentIDs)
                    })
                }).then((rawServiceResponse)=> {
                    return rawServiceResponse.text();
                }).then((response)=> {
                    //console.log('feed trip')
                    var suitcaseInfo = JSON.parse(response);
                    for (var i = 0; i < suitcaseInfo.length; i++) {
                        newMoments[i].suitcased = suitcaseInfo[i].suitcased;
                    }

                    this.setState({
                        momentIDs,
                        annotations: markers,
                        moments: newMoments,
                        dataSource: this.ds.cloneWithRows(newMoments)
                    });
                }).catch(err=>console.log(err));
            }
        })
    }

    render(){
        return(
            <View style={styles.listViewContainer}>
                <ListView
                    enableEmptySections={false}
                   dataSource={this.state.dataSource}
                   renderRow={this._renderRow.bind(this)}
                   contentContainerStyle={styles.listView}
                   renderHeader={this._renderHeader.bind(this)}
                   ref="listview"
                   onScroll={(event)=>{
                         var currentOffset = event.nativeEvent.contentOffset.y;
                         var direction = currentOffset > this.offset ? 'down' : 'up';
                         this.offset = currentOffset;
                         if(direction=='down'||currentOffset<30){
                            this.refs.stickyHeader._setAnimation(false);
                         }else{
                            this.refs.stickyHeader._setAnimation(true);
                         }
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <PopOver ref="popover" shareURL={config.shareBaseURL+"/trip/"+this.props.trip.id+"/"+this.state.sherpaToken}></PopOver>
            </View>
        )
    }


    suiteCaseTrip(trip){
        addMomentToSuitcase(trip.id);
    }

    unSuiteCaseTrip(trip){
        removeMomentFromSuitcase(trip.id);
    }

    showUserProfile(trip){
        this.props.dispatch(udpateFeedState("reset"));

        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    showTripDetail(trip,owner){
        this.props.dispatch(udpateFeedState("reset"));

        var tripDetails={trip,owner,group:this.props.trip};
        this.props.navigator.push({
            id: "tripDetail",
            tripDetails
        });
    }

    showTripLocation(trip){
        this.props.navigator.push({
            id: "location",
            trip
        });
    }

    getTripLocation(tripData){

        var country = countries.filter(function(country) {
            return country["name"].toLowerCase() === tripData.name.toLowerCase();
        })[0];

        var tripLocation=tripData.name;
        return {location:tripLocation,country:country};
    }


    _renderHeader(){
        var tripData=this.props.trip;
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();
        var photoOrPhotos=tripData.moments.length>1?"PHOTOS":"PHOTO";

        var tripLocation=this.props.trip[this.props.trip.type];

        var country = countries.filter(function(country) {
            return country["alpha-2"].toLowerCase() === tripLocation.toLowerCase();
        })[0];

        if(country)tripLocation=country.name;

        return (
            <View style={styles.headerContainer}>
                <View maskImage='mask-test' style={[styles.headerMaskedView,{height:windowSize.height}]} >
                    <View
                        style={styles.headerDarkBG}
                    />

                        <Image
                            style={styles.headerImage}
                            resizeMode="cover"
                            source={{uri:this.state.moments[0].mediaUrl}}
                        />

                        <View style={{ justifyContent:'center',alignItems:'center',height:windowSize.height*.86}}>

                            <UserImage radius={40} userID={this.props.trip.owner.id} imageURL={this.props.trip.owner.serviceProfilePicture} onPress={() => this.showUserProfile(this.props.trip)}></UserImage>
                            <Text style={styles.headerTripTo}>{this.state.isCurrentUsersTrip?"YOUR TRIP TO":this.props.trip.owner.serviceUsername.toUpperCase()+'S TRIP'}</Text>
                            <TouchableHighlight onPress={() => this.showTripLocation(this.props.trip)}>
                                <Text style={styles.headerTripName}>{tripData.name.toUpperCase()}</Text>
                            </TouchableHighlight>
                            </View>

                        <View style={styles.subTitleContainer}>
                            <TripSubtitle tripData={this.props.trip}></TripSubtitle>
                        </View>
                </View>
                <View style={{height:260,width:windowSize.width-30,left:15,backgroundColor:'black',flex:1,position:'absolute',top:windowSize.height-90}}>
                    <Mapbox
                        style={{borderRadius:2,flex:1,top:0,left:0,bottom:0,right:0,fontSize:10,position:'absolute',fontFamily:"TSTAR", fontWeight:"500"}}
                        styleURL={'mapbox://styles/mapbox/streets-v9'}
                        accessToken={'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw'}
                        centerCoordinate={{latitude: this.state.moments[0].lat,longitude: this.state.moments[0].lng}}
                        zoomLevel={6}
                        annotations={this.state.annotations}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    />
                    <View style={{flex:1,top:0,left:0,bottom:0,right:0,backgroundColor:'transparent'}}></View>
                </View>

                <SimpleButton style={{width:windowSize.width-30,marginLeft:15,marginBottom:15}} onPress={()=>{this.showTripLocation(this.props.trip)}} text={"explore "+tripLocation}></SimpleButton>

                {this.props.navigation.default}
            </View>
        )
    }

    _renderRow(tripData,sectionID,rowID) {
        if(tripData.type!=='image')return(<View></View>);
        return (
            <View style={styles.listItem} style={styles.listItemContainer}>
                    <TouchableHighlight onPress={()=>{
                        this.showTripDetail(tripData,this.props.trip.owner);
                    }}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:windowSize.width-30,width:windowSize.width-30,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.mediaUrl}}
                    />
                    </TouchableHighlight>
                    <View style={{position:"absolute",bottom:-30,left:0,flex:1,width:windowSize.width-30,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                        <TouchableHighlight>
                            <Text style={{color:"#282b33",fontSize:12,fontFamily:"Akkurat", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{width:18,height:18}} onPress={()=>{
                            tripData.suitcased=!tripData.suitcased;
                            if(tripData.suitcased){
                                this.suiteCaseTrip(tripData);
                            }else{
                                this.unSuiteCaseTrip(tripData);
                            }
                            var newMoments=this.state.moments.slice();
                            newMoments[rowID].suitCased=tripData.suitcased;
                            this.setState({moments:newMoments,dataSource:this.ds.cloneWithRows(newMoments)})
                        }}>
                        <View>
                            <Image
                                style={{width:18,height:18,top:0,position:"absolute",opacity:tripData.suitcased?.5:1}}
                                resizeMode="contain"
                                source={require('./../../../../Images/suitcase.png')}
                            />
                            <Image
                                style={{width:10,height:10,left:5,top:5,opacity:tripData.suitcased?1:0,position:"absolute"}}
                                resizeMode="contain"
                                source={require('./../../../../Images/suitcase-check.png')}
                            />
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}


export default FeedTrip;