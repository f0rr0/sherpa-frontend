'use strict';

import React from "react-native";
import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import countries from "./../../../../data/countries";
import moment from 'moment';
import { connect } from 'react-redux/native';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';
import FeedTrip from './feed.trip.ios'
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../../actions/user.actions';
import config from '../../../../data/config';
const {sherpa}=config.auth[config.environment];
import StickyHeader from '../../components/stickyHeader';

var {
    StyleSheet,
    Component,
    View,
    Text,
    Image,
    TouchableHighlight
    } = React;

class FeedLocation extends Component {
    constructor(props){
        super();
        this.itemsLoadedCallback=null;
        this.moments=[];
        this.state={moments:[]}
    }

    suiteCaseTrip(trip){
        addMomentToSuitcase(trip.id);
    }

    unSuiteCaseTrip(trip){
        removeMomentFromSuitcase(trip.id);
    }

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.trips[this.props.feed.feedPage]){
            //strip moments out of trips :: unpacking start
            var unpackedResults=this.unpackTrips(this.props.feed.trips[this.props.feed.feedPage]);
            //:: unpacking end

            const {endpoint,version} = sherpa;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", this.props.user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            fetch(endpoint+version+"/moment/batchsuitcasedby/"+this.props.user.serviceID, {
                method: 'post',
                headers: sherpaHeaders,
                body:encodeQueryData({
                    moments:JSON.stringify(unpackedResults.momentIDs)
                })
            }).then((rawServiceResponse)=>{
                return rawServiceResponse.text();
            }).then((response)=>{
                var suitcaseInfo=JSON.parse(response);

                for(var i=0;i<suitcaseInfo.length;i++){
                    unpackedResults.moments[i].suitcased=suitcaseInfo[i].suitcased;
                }

                this.itemsLoadedCallback(unpackedResults.moments);
            }).catch(err=>console.log(err));

        }else if(this.props.feed.feedState==='reset'){
            this.refs.listview._refresh()
        }
    }

    unpackTrips(trips){
        var unpackedResults={moments:[],momentIDs:[]};
        for(var index in trips){
            var tripMoments=trips[index].moments;
            for(var i=0;i<tripMoments.length;i++){
                tripMoments[i].trip={
                    owner:trips[index].owner
                };

                unpackedResults.moments.push(tripMoments[i]);
                unpackedResults.momentIDs.push(tripMoments[i].id);
            }
        }
        return unpackedResults;
    }

    showTripDetail(trip,owner){
        var tripDetails={trip,owner};
        this.props.navigator.push({
            id: "tripDetail",
            tripDetails
        });
    }

    _onFetch(page=1,callback){
        this.itemsLoadedCallback=callback;
        console.log('is country',this.props.isCountry);
        this.props.dispatch(loadFeed(this.props.location,this.props.user.sherpaToken,page,this.props.isCountry?"location-country":"location"));
    }

    render(){
        return(
            <View style={{flex:1}}>
                <GiftedListView
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={false} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}
                    ref="listview"
                    onScroll={(event)=>{
                         var currentOffset = event.nativeEvent.contentOffset.y;
                         var direction = currentOffset > this.offset ? 'down' : 'up';
                         this.offset = currentOffset;
                         if(direction=='down'||currentOffset<100){
                            this.refs.stickyHeader._setAnimation(false);
                         }else{
                            this.refs.stickyHeader._setAnimation(true);
                         }
                    }}
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>
        )
    }


    _renderHeader(){
        if(Object.keys(this.props.feed.trips).length==0)return;


        var tripData=this.props.trip;
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        var timeAgoStart=moment(new Date(tripData.dateStart*1000));
        var timeAgoEnd=moment(new Date(tripData.dateEnd*1000));

        var trips=this.props.feed.trips["1"];
        var tripDuration=trips.length;
        var visitorS=tripDuration>1?"VISITORS":"VISITOR";
        var moments=0;
        for(var i=0;i<trips.length;i++){
            moments+=trips[i].moments.length;
        }
        var photoOrPhotos=moments>1?"PHOTOS":"PHOTO";
        var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+this.props.trip.moments[0].lng+","+this.props.trip.moments[0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw";
        return (
            <View>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FFFFFF', height:550, width:380, marginBottom:-200,alignItems:'center',flex:1}} >

                    <Image
                        style={{height:602,width:380,left:0,opacity:.5,backgroundColor:'black',flex:1,position:'absolute',top:0}}
                        source={{uri:mapURI}}
                    >

                    </Image>


                    <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',position:'absolute',top:125,left:0,right:0,height:20}}>
                        <View>
                            <Text style={{color:"#282b33",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{tripData.name.toUpperCase()}</Text>
                        </View>
                        <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                        </View>
                    </View>
                </MaskedView>

                <View style={{bottom:20,backgroundColor:'white',flex:1,alignItems:'center',width:350,justifyContent:'center',flexDirection:'row',position:'absolute',height:50,left:15,top:285,borderColor:"#cccccc",borderWidth:.5,borderStyle:"solid"}}>
                    <Image source={require('image!icon-visitors')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripDuration} {visitorS}</Text>

                    <Image source={require('image!icon-divider')} style={{height:25,marginLeft:35,marginRight:25}} resizeMode="contain"></Image>

                    <Image source={require('image!icon-images-negative')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{moments} {photoOrPhotos}</Text>

                </View>

                {this.props.navigation.default}

            </View>
        )
    }

    _renderRow(tripData,sectionID,rowID){
        return (
            <View style={styles.listItem} style={styles.listItemContainer}>
                <TouchableHighlight onPress={()=>{
                console.log(tripData);
                        this.showTripDetail(tripData,tripData.trip.owner);
                    }}>
                    <Image
                        style={{position:"absolute",top:0,left:0,height:350,width:350,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.mediaUrl}}
                    />
                </TouchableHighlight>
                <View style={{position:"absolute",bottom:-30,left:0,flex:1,width:350,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                    <TouchableHighlight>
                        <Text style={{color:"#282b33",fontSize:10,fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={{width:18,height:18}} onPress={()=>{
                        tripData.suitcased=!tripData.suitcased;
                        if(tripData.suitcased){
                            this.suiteCaseTrip(tripData);
                        }else{
                            this.unSuiteCaseTrip(tripData);
                        }
                        this.refs.listview._refresh()


                    }}>
                        <View>
                            <Image
                                style={{width:18,height:18,top:0,position:"absolute",opacity:tripData.suitcased?.5:1}}
                                resizeMode="contain"
                                source={require('./../../../../images/suitcase.png')}
                            />
                            <Image
                                style={{width:10,height:10,left:5,top:5,opacity:tripData.suitcased?1:0,position:"absolute"}}
                                resizeMode="contain"
                                source={require('./../../../../images/suitcase-check.png')}
                            />
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}

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
        width:350,
        height:350,
        marginBottom:30
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    }
});

export default FeedLocation;