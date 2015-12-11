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


var {
    StyleSheet,
    Component,
    View,
    Text,
    Image,
    TouchableHighlight
    } = React;

class FeedLocation extends Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;
    }

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.trips[this.props.feed.feedPage]){
            this.itemsLoadedCallback(this.props.feed.trips[this.props.feed.feedPage])
        }else if(this.props.feed.feedState==='reset'){
            this.refs.listview._refresh()
        }
    }
    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            trip
        });
    }

    _onFetch(page=1,callback){
        this.itemsLoadedCallback=callback;
        this.props.dispatch(loadFeed(this.props.trip.location,this.props.user.sherpaToken,page,"location"));
    }

    render(){
        return(
            <GiftedListView
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                firstLoader={true} // display a loader for the first fetching
                pagination={true} // enable infinite scrolling using touch to load more
                refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false} // enable sections
                renderCustomHeader={this._renderHeader.bind(this)}
                ref="listview"
                customStyles={{
                    contentContainerStyle:styles.listView
                }}
            />
        )
    }


    _renderHeader(){
        var tripData=this.props.trip;
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        var timeAgoStart=moment(new Date(tripData.dateStart*1000));
        var timeAgoEnd=moment(new Date(tripData.dateEnd*1000));
        var tripDuration=timeAgoEnd.diff(timeAgoStart,'days')+1;
        var visitorS=tripDuration>1?"VISITORS":"VISITOR";
        var photoOrPhotos=tripData.moments.length>1?"PHOTOS":"PHOTO";
        var countryOrState=(tripData.country.toUpperCase()==="US")?tripData.state:country.name;
        var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+this.props.trip.moments[0].lng+","+this.props.trip.moments[0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw";
        return (
            <View>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FAFAFA', height:550, width:380, marginBottom:-200,alignItems:'center',flex:1}} >

                    <Image
                        style={{height:602,width:380,left:0,opacity:.5,backgroundColor:'black',flex:1,position:'absolute',top:0}}
                        source={{uri:mapURI}}
                    >

                    </Image>


                    <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',position:'absolute',top:125,left:0,right:0,height:20}}>
                        <View>
                            <Text style={{color:"#282b33",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.trip.location.toUpperCase()}</Text>
                        </View>
                        <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                            <Text style={{color:"#282b33",fontSize:12,  marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{countryOrState.toUpperCase()}</Text>
                            <Text style={{color:"#282b33",fontSize:12, fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>/</Text>
                            <Text style={{color:"#282b33",fontSize:12, marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{tripData.continent.toUpperCase()}</Text>
                        </View>
                    </View>
                </MaskedView>

                <View style={{bottom:20,backgroundColor:'white',flex:1,alignItems:'center',width:350,justifyContent:'center',flexDirection:'row',position:'absolute',height:50,left:15,top:285,borderColor:"#cccccc",borderWidth:.5,borderStyle:"solid"}}>
                    <Image source={require('image!icon-visitors')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripDuration} {visitorS}</Text>

                    <Image source={require('image!icon-divider')} style={{height:25,marginLeft:35,marginRight:25}} resizeMode="contain"></Image>

                    <Image source={require('image!icon-images-negative')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length} {photoOrPhotos}</Text>

                    <Image source={require('image!icon-divider')} style={{height:25,marginLeft:25,marginRight:25}} resizeMode="contain"></Image>

                    <Image source={require('image!icon-suitcase-negative')} style={{height:9,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>5 TRIPS</Text>
                </View>

                {this.props.navigation}

            </View>
        )
    }

    _renderRow(tripData) {
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        //if country code not in ISO, don't resolve country. i.e. Kosovo uses XK but is not in ISO yet
        if(!country)country={name:tripData.country}

        var timeAgo=moment(new Date(tripData.dateStart*1000)).fromNow();
        return (
            <TouchableHighlight style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:.7}}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    />

                    <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"800",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", marginTop:20}}>{tripData.owner.serviceUsername.toUpperCase()}'S TRIP</Text>

                    <View style={{position:'absolute',top:120,left:0,right:0,flex:1,alignItems:'center',backgroundColor:'transparent'}}>
                        <Image
                            style={{height:90,width:90,opacity:1,borderRadius:45}}
                            resizeMode="cover"
                            source={{uri:tripData.owner.serviceProfilePicture}}
                        />
                    </View>

                    <View style={{position:'absolute',bottom:20,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',left:0,right:0}}>
                        <Image source={require('image!icon-images')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length}</Text>
                        <Image source={require('image!icon-watch')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{timeAgo.toUpperCase()}</Text>
                    </View>

                </View>
            </TouchableHighlight>
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
        alignItems:'center'
    },
    listView:{
        alignItems:'center',
        justifyContent:"center"
    },
    listItemContainer:{
        flex:1,
        width:350,
        height:350,
        marginBottom:15
    },

    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    }
});

export default FeedLocation;