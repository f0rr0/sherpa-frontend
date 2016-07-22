'use strict';

import React from "react-native";
import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import countries from "./../../../../data/countries";
import moment from 'moment';
import { connect } from 'react-redux';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';
import FeedTrip from './feed.trip.ios'
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../../actions/user.actions';
import config from '../../../../data/config';
const {sherpa}=config.auth[config.environment];
import StickyHeader from '../../components/stickyHeader';
import PopOver from '../../components/popOver';
import WikpediaInfoBox from '../../components/wikipediaInfoBox';

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

    toggleNav(){
        this.refs.popover._setAnimation("toggle");
    }

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.searchResults[this.props.feed.feedPage]){
            //strip moments out of trips :: unpacking start
            //var unpackedResults=this.unpackTrips(this.props.feed.trips[this.props.feed.feedPage]);
            //:: unpacking end

            var unpackedResults=this.props.feed.searchResults[this.props.feed.feedPage];

            console.log(unpackedResults,'unpacked results');

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

                this.itemsLoadedCallback(unpackedResults);
            }).catch(err=>console.log(err));

        }else if(this.props.feed.feedState==='reset'){
            this.refs.listview._refresh()
        }
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
        var req={}
        if(this.props.isCountry){
            req={type:'country',country:this.props.location}
        }else{
            req={needle:this.props.location}
        }
        this.props.dispatch(loadFeed(req,this.props.user.sherpaToken,page,"location"));
    }

    render(){
        console.log('share url',config.shareBaseURL+"/location/"+this.props.trip.name+"/"+this.props.user.sherpaToken)
        return(
            <View style={{flex:1}}>
                <GiftedListView
                    enableEmptySections={true}
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
                <PopOver ref="popover" shareCopy="SHARE LOCATION" shareURL={config.shareBaseURL+"/location/"+this.props.trip.name+"/"+this.props.user.sherpaToken}></PopOver>

            </View>
        )
    }


    _renderHeader(){

        var tripData=this.props.trip;
        var moments=this.props.feed.searchResults[this.props.feed.feedPage];

        var photoOrPhotos=moments.length>1?moments.length+" PHOTOS":"1 PHOTO";
        var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+moments[0].lng+","+moments[0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw";
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

                <WikpediaInfoBox location={tripData.name}></WikpediaInfoBox>
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