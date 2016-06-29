'use strict';

import React from "react-native";
import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import { connect } from 'react-redux/native';
import config from '../../../../data/config';
import store from 'react-native-simple-store';
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../../actions/user.actions';
import {loadFeed} from '../../../../actions/feed.actions';

const {sherpa}=config.auth[config.environment];

var {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight,
    TextInput
    } = React;


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
    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-15,
        marginBottom:13,
        marginLeft:15,
        marginRight:15,
        width:350,
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


class Search extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;
        this.state = {
            searchQuery: "",
            backendSearchQuery:"",
            searchType:"places",
            reRender:false,
            moments:[],
            momentIDs:[]
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

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.searchResults[this.props.feed.feedPage]){
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
                    console.log(endpoint + version + "/moment/batchsuitcasedby/" + this.props.user.serviceID)
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
         this.props.dispatch(loadFeed(this.state.backendSearchQuery,this.props.user.sherpaToken,page,"search-"+this.state.searchType));
    }

    render(){
        return(
            <GiftedListView
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                emptyView={this._emptyView.bind(this)}
                firstLoader={false} // display a loader for the first fetching
                pagination={false} // enable infinite scrolling using touch to load more
                refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false} // enable sections
                ref="listview"
                headerView={this._renderHeader.bind(this)}
                customStyles={{
                    contentContainerStyle:styles.listView,
                    actionsLabel:{fontSize:12}
                }}
            />
        )
    }

    _emptyView(){
        return(
            <View style={{flex:1,justifyContent: 'center', height:400,alignItems: 'center'}}>
                <Text style={{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>Search for countries, cities or continents. We'll display the photos that match your result.</Text>
            </View>
        )
    }

    updateSearchQuery(searchQuery){
        var splittedQuery=searchQuery.split(",");
        searchQuery=splittedQuery.length>0?splittedQuery[0]:searchQuery;
        var country = countries.filter(function(country) {
            return country["name"].toLowerCase() === searchQuery.toLowerCase();
        })[0];

        var backendSearchQuery=country?country['alpha-2'] : searchQuery;
        console.log(backendSearchQuery,'search query')
        this.setState({searchQuery,backendSearchQuery});
    }

    _renderHeader(){
        var me=this;
        return (
            <View style={{flex:1}}>
                <View style={{flex:1, alignItems:'center',justifyContent:'center',width:380,marginTop:70}}>

                    <View>
                        {/*<TextInput
                            style={{height: 50,marginTop:20,width:280,left:10,fontSize:25, fontFamily:"TSTAR", color:"#001645", fontWeight:"500",letterSpacing:1,marginRight:20,marginLeft:20}}
                            onChangeText={(searchQuery) => {
                                 var country = countries.filter(function(country) {
                                    return country["name"].toLowerCase() === searchQuery.toLowerCase();
                                })[0];

                                var backendSearchQuery=country?country['alpha-2'] : searchQuery;
                                this.setState({searchQuery,backendSearchQuery});
                            }}
                            placeholder="WHERE TO?"
                            value={this.state.searchQuery}
                            keyboardType="web-search"
                            clearButtonMode="always"
                            onSubmitEditing={()=>this._onFetch(1, this.refs.listview._refresh)}
                        />*/}
                        <Image
                            style={{width:18,height:18,bottom:18,position:"absolute",top:10,left:0}}
                            resizeMode="contain"
                            source={require('./../../../../images/icon-explore-dark.png')}
                        />
                        <GooglePlacesAutocomplete
                            placeholder='Search'
                            textInputProps={{
                               onChangeText:(searchQuery) => {
                               console.log(me.updateSearchQuery,'yoyoyo');
                                    me.updateSearchQuery(searchQuery);
                               }
                            }}

                            minLength={2} // minimum length of text to search
                            autoFocus={false}
                            fetchDetails={true}
                            onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                                me.updateSearchQuery(data.description);
                                me._onFetch(1, me.refs.listview._refresh)
                            }}
                            query={{
                                 key: 'AIzaSyAyiaituPu_vKF5CB50o3XrQw8PLy1QFMY',
                                 language: 'en', // language of the results
                                 types: '(cities)', // default: 'geocode'
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
                                    width:280
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
                                     width:280,
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

                            filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                        />

                    </View>

                </View>

                {this.props.navigation}


            </View>
        )
    }

    _renderRow(tripData) {
        return (
            <View style={styles.listItem} style={styles.listItemContainer}>
                <TouchableHighlight onPress={()=>{
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
                        console.log('suitcased',tripData.suitcased)
                        if(tripData.suitcased){
                            this.suiteCaseTrip(tripData);
                            console.log('suitcase add');
                        }else{
                            this.unSuiteCaseTrip(tripData);
                            console.log('suitcase remove');
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