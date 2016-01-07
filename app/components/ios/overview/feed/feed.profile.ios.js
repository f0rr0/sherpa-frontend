'use strict';

import React from "react-native";
import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'

import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';
import { connect } from 'react-redux/native';


var {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight
    } = React;


var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
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

class FeedProfile extends React.Component {
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
        this.props.dispatch(loadFeed(this.props.trip.owner.id,this.props.user.sherpaToken,page,"profile"));
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
                ref="listview"
                renderCustomHeader={this._renderHeader.bind(this)}
                customStyles={{
                    contentContainerStyle:styles.listView
                }}
            />
        )
    }

    _renderHeader(){
        if(Object.keys(this.props.feed.trips).length==0)return;
        var tripData=this.props.trip;


        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];


        var trips=this.props.feed.trips["1"];
        var tripDuration=trips.length;
        var citieS=tripDuration>1?"LOCATIONS":"LOCATION";
        var moments=0;
        for(var i=0;i<trips.length;i++){
            moments+=trips[i].moments.length;
        }
        var photoOrPhotos=moments>1?"PHOTOS":"PHOTO";

        var countryOrState=(tripData.country.toUpperCase()==="US")?tripData.state:country.name;

        return (
            <View>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FAFAFA', height:550, width:380, marginBottom:-200}} >
                    <View style={{flex:1,alignItems:'center',justifyContent:'center',position:'absolute',left:0,top:0,height:300,width:380}}>
                        <Image
                            style={{height:80,width:80,opacity:1,borderRadius:40}}
                            resizeMode="cover"
                            source={{uri:this.props.trip.owner.serviceProfilePicture}}
                        />
                        <Text style={{color:"#282b33",fontSize:20,marginBottom:15, marginTop:30,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.trip.owner.serviceUsername.toUpperCase()}</Text>
                    </View>
                </MaskedView>

                <View style={{bottom:20,backgroundColor:'white',flex:1,alignItems:'center',width:350,justifyContent:'center',flexDirection:'row',position:'absolute',height:50,left:15,top:285,borderColor:"#cccccc",borderWidth:.5,borderStyle:"solid"}}>
                    <Image source={require('image!icon-countries-negative')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripDuration} {citieS}</Text>

                    <Image source={require('image!icon-divider')} style={{height:25,marginLeft:35,marginRight:25}} resizeMode="contain"></Image>

                    <Image source={require('image!icon-images-negative')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length} {photoOrPhotos}</Text>

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
        tripData.owner=this.props.trip.owner;
        return (
            <TouchableHighlight style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:.7}}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    />

                    <Text style={{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent"}}>{tripData.location.toUpperCase()}</Text>
                    <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", marginTop:5}}>{country.name.toUpperCase()}</Text>

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


export default FeedProfile;