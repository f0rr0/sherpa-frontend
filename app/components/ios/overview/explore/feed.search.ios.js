'use strict';

import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import states from './../../../../data/states';

import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import { connect } from 'react-redux';
import config from '../../../../data/config';
import store from 'react-native-simple-store';
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../../actions/user.actions';
import {loadFeed} from '../../../../actions/feed.actions';
import StickyHeader from '../../components/stickyHeader';

const {sherpa}=config.auth[config.environment];
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight,
    TextInput
} from 'react-native';
import React, { Component } from 'react';



import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');



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
        paddingBottom:20
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:30
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
    }
});
const msg_empty="Search for countries, cities or continents. We'll display the photos that match your result.";
const msg_noresults="No results found for this search query";
const msg_loading="Loading";


class Search extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;
        this.state = {
            searchQuery: "",
            backendSearchQuery:undefined,
            searchType:"places",
            reRender:false,
            moments:[],
            momentIDs:[],
            searchEmptyMessage:msg_empty
        };
    }

    componentDidMount(){
    }

    suiteCaseTrip(trip){
        addMomentToSuitcase(trip.id);
    }

    unSuiteCaseTrip(trip){
        removeMomentFromSuitcase(trip.id);
    }

    reset(){
        this.refs.listview.refs.listview.scrollTo({y:0,animated:true});
    }

    componentDidUpdate(prevProps){
        if( prevProps.feed.feedState!='ready'&&this.props.feed.feedState==='ready'&&this.props.feed.searchResults[this.props.feed.feedPage]){
            //strip moments out of trips :: unpacking start
            var searchResults=this.props.feed.searchResults[this.props.feed.feedPage];
            var momentIDs=[];
            for(var i=0;i<searchResults.length;i++){
                momentIDs.push(searchResults[i].id);
            }

            return store.get('user').then((user) => {
                if (user) {
                    var sherpaHeaders = new Headers();
                    sherpaHeaders.append("token", user.sherpaToken);
                    sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                    const {endpoint,version} = sherpa;
                    fetch(endpoint + version + "/moment/batchsuitcasedby/" + this.props.user.sherpaID, {
                        method: 'post',
                        headers: sherpaHeaders,
                        body: encodeQueryData({
                            moments: JSON.stringify(momentIDs)
                        })
                    }).then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                        var suitcaseInfo = JSON.parse(response);
                        for (var i = 0; i < suitcaseInfo.length; i++) {
                            searchResults[i].suitcased = suitcaseInfo[i].suitcased;
                        }

                        this.itemsLoadedCallback(searchResults);
                        if(searchResults.length==0)this.setState({"searchEmptyMessage":msg_noresults})
                    }).catch(err=>console.log(err));
                }
            })

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
        if(this.state.backendSearchQuery)this.state.backendSearchQuery['page']=page;
        this.props.dispatch(loadFeed(this.state.backendSearchQuery,this.props.user.sherpaToken,page,"search-"+this.state.searchType));
    }

    render(){
        return(
            <View style={{flex:1}}>
                <GiftedListView
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    emptyView={this._emptyView.bind(this)}
                    firstLoader={false} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    initialLoad={false}
                    onEndReached={(event)=>{
                        if(event&&event.nativeEvent.contentOffset.y>200){
                                this.refs.listview._onPaginate();
                        }
                    }}
                    ref="listview"
                    headerView={this._renderHeader.bind(this)}
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
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>

        )
    }

    _emptyView(){
        return(
            <View style={{flex:1,justifyContent: 'center', height:400,alignItems: 'center'}}>
                <Text style={{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>{this.state.searchEmptyMessage}</Text>
            </View>
        )
    }

    updateSearchQuery(searchQuery,detailed){
        var needle=searchQuery || "---";
        var standalone=!detailed;
        var country;

        if(standalone){
            country = countries.filter(function(country) {
                return searchQuery.toLowerCase().indexOf(country["name"].toLowerCase())>-1;
            })[0];
        }

        if(standalone&&country){
            this.setState({searchQuery,backendSearchQuery:{type:'country',country:country['alpha-2']}});
        }else if(!standalone&&searchQuery.state){
            this.setState({searchQuery:searchQuery.query,backendSearchQuery:{type:'location',location:searchQuery.location,country:searchQuery.country,state:searchQuery.state}});
        }if(!standalone&&searchQuery.country){
            this.setState({searchQuery:searchQuery.query,backendSearchQuery:{type:'location',location:searchQuery.location,country:searchQuery.country}});
        }else{
            this.setState({searchQuery,backendSearchQuery:{needle}});
        }

    }

    _renderHeader(){
        var me=this;
        return (
            <View style={{flex:1}}>
                <View style={{flex:1, alignItems:'center',justifyContent:'center',width:windowSize.width,marginTop:70}}>

                    <View>
                        <Image
                            style={{width:18,height:18,bottom:18,position:"absolute",top:10,left:0}}
                            resizeMode="contain"
                            source={require('./../../../../images/icon-explore-dark.png')}
                        />
                        <GooglePlacesAutocomplete
                            placeholder='Search'
                            ref="googleSearch"
                            textInputProps={{
                               onChangeText:(searchQuery) => {
                                    me.updateSearchQuery(searchQuery);
                               },
                               onSubmitEditing:(event)=>{
                                    me.refs.listview.refs.listview.refs.googleSearch._onBlur()
                                    me.updateSearchQuery(event.nativeEvent.text);

                                    this.setState({"searchEmptyMessage":msg_loading});
                                    me._onFetch(1, me.refs.listview._refresh);
                               }
                            }}

                            minLength={2} // minimum length of text to search
                            autoFocus={false}
                            fetchDetails={true}
                            onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                                var result=details.address_components;
                                var info=[];
                                for(var i=0;i<result.length;++i){
                                    if(result[i].types[0]=="administrative_area_level_1"){info.state=result[i].long_name}
                                    if(result[i].types[0]=="locality"){info.location=result[i].long_name}
                                    if(result[i].types[0]=="country"){info.country=result[i].short_name}
                                }

                                info.query=details.formatted_address;

                                me.updateSearchQuery(info,true);
                                this.setState({"searchEmptyMessage":msg_loading});
                                me._onFetch(1, me.refs.listview._refresh)
                            }}
                            query={{
                                 key: 'AIzaSyAyiaituPu_vKF5CB50o3XrQw8PLy1QFMY',
                                 language: 'en', // language of the results
                                 types: 'geocode', // default: 'geocode'
                             }}
                            styles={{
                                 description: {
                                     fontWeight: 'normal',
                                     fontFamily:"TSTAR-bold"
                                 },
                                     predefinedPlacesDescription: {
                                     color: '#FFFFFF',
                                 },
                                 poweredContainer: {
                                     justifyContent: 'center',
                                     alignItems: 'center',
                                     opacity:0
                                 },
                                 container:{
                                    width:windowSize.width-80
                                 },
                                 textInputContainer: {
                                     backgroundColor:'transparent',
                                     borderTopColor: 'transparent',
                                     borderLeftColor:"transparent",
                                     borderRightColor:"transparent",
                                     borderBottomColor: '#001645',
                                     borderBottomWidth: 1,
                                     top:0,
                                     paddingLeft:10
                                 },
                                 textInput: {
                                     backgroundColor: 'transparent',
                                     borderRadius: 0,
                                     width:windowSize.width-80,
                                     fontSize: 25,
                                     color:'#001645',
                                     height:60,
                                     marginTop:-10,
                                     borderTopWidth:0,
                                     fontFamily:"TSTAR"
                                 },
                                 separator: {
                                     height: 0,
                                     backgroundColor: 'transparent'
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
                            //filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                        />

                    </View>

                </View>

                {this.props.navigation.default}


            </View>
        )
    }

    _renderRow(tripData) {
        return (
            <View style={styles.listItem} style={styles.listItemContainer}>
                <TouchableHighlight onPress={()=>{
                        this.showTripDetail(tripData,tripData.profile);
                    }}>
                    <Image
                        style={{position:"absolute",top:0,left:0,height:windowSize.width-30,width:windowSize.width-30,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.mediaUrl}}
                    />
                </TouchableHighlight>
                <View style={{position:"absolute",bottom:-30,left:0,flex:1,width:windowSize.width-30,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
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


export default Search;