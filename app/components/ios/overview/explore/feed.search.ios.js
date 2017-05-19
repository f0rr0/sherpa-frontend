'use strict';

//import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import states from './../../../../data/states';

import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import { connect } from 'react-redux';
import config from '../../../../data/config';
import store from 'react-native-simple-store';
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../../actions/user.actions';
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import StickyHeader from '../../components/stickyHeader';

import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import MomentRow from '../../components/momentRow'


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
        paddingBottom:60
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:30
    },
    row:{flexDirection: 'row'},
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
    copyEmpty:{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}
});
const msg_empty=<Text style={styles.copyEmpty}>Search for countries, cities or continents. We'll display the photos that match your result.</Text>;
const msg_noresults=<Text style={styles.copyEmpty}>No results found for this location</Text>;
const msg_loading=<Text style={styles.copyEmpty}>Loading</Text>;


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
            searchEmptyMessage:msg_empty,
            containerWidth:windowSize.width-30
        };
    }

    componentDidMount(){
        this.props.feed.searchResults=[];
    }


    componentDidUpdate(){
        console.log(this.state.backendSearchQuery)
    }

    reset(){
        this.refs.listview.refs.listview.scrollTo({y:0,animated:true});
    }

    showTripDetail(trip,owner){
        var tripDetails={trip,owner};
        this.props.navigator.push({
            id: "tripDetail",
            data:tripDetails,
            sceneConfig:"right-nodrag"
        });
    }


    _onFetch(page=1,callback){
        this.itemsLoadedCallback=callback;
        var me=this;

        var query=this.state.backendSearchQuery;
        query.page=page;

        getFeed(query,page,"search-"+this.state.searchType).then(function(response){
            callback(response.moments);
            if(response.moments.length==0)me.setState({"searchEmptyMessage":msg_noresults})
        })
    }

    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    render(){
        return(
            <View style={{flex:1}}>
                <SherpaGiftedListview
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    emptyView={this._emptyView.bind(this)}
                    firstLoader={false} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    initialLoad={false}
                    paginationFetchingView={this._renderEmpty.bind(this)}
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
                {this.state.searchEmptyMessage}
            </View>
        )
    }

    updateSearchQuery(searchQuery,detailed){
        var needle=searchQuery || "---";
        var standalone=!detailed;
        var country;

        var isLocationCountry=false;

        if(standalone||searchQuery.country){
            var location=standalone?searchQuery:searchQuery.location || searchQuery.country;

            var countryQuery = countries.filter(function(country) {
                if(searchQuery.location){
                    return location.toLowerCase().indexOf(country["name"].toLowerCase())>-1;
                }
            });

            isLocationCountry=countryQuery.length>0 || searchQuery.country;
            if(isLocationCountry)country=countryQuery?countryQuery:searchQuery.country;
        }


        if(standalone&&country){
            this.setState({searchQuery,backendSearchQuery:{type:'country',country:country['alpha-2']}});
        }else if(!standalone&&searchQuery.state){
            var localType=searchQuery.location?'location':'state';
            this.setState({searchQuery:searchQuery.query,backendSearchQuery:{type:localType,location:searchQuery.location,country:searchQuery.country,state:searchQuery.state}});
        }else if(!standalone&&searchQuery.country&&isLocationCountry){
            this.setState({searchQuery:searchQuery.query,backendSearchQuery:{type:'country',country:searchQuery.country}});
        }else{
            this.setState({searchQuery,backendSearchQuery:{needle}});
        }

    }

    _renderHeader(){
        var me=this;
        return (
            <View style={{zIndex:1,flex:1}}>
                <View style={{alignItems:'center',justifyContent:'center',width:windowSize.width,marginTop:70}}>

                    <View>
                        <Image
                            style={{width:18,height:18,bottom:18,position:"absolute",top:10,left:0}}
                            resizeMode="contain"
                            source={require('./../../../../Images/icon-explore-dark.png')}
                        />
                        <GooglePlacesAutocomplete
                            placeholder='Discover the world'
                            ref="googleSearch"
                            textInputProps={{
                               onChangeText:(searchQuery) => {
                                    me.updateSearchQuery(searchQuery);
                               },
                               onSubmitEditing:(event)=>{
                                    me.refs.listview.refs.listview.refs.googleSearch._onBlur()
                                    me.updateSearchQuery(event.nativeEvent.text);
                                    me.setState({"searchEmptyMessage":this._renderEmpty()});
                                    me.refs.listview._postRefresh([]);
                                    me._onFetch(1, me.refs.listview._postRefresh);
                               }
                            }}

                            minLength={2} // minimum length of text to search
                            autoFocus={false}
                            fetchDetails={true}
                            onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                                var result=details.address_components;
                                var info=[];
                                for(var i= 0;i<result.length;++i){
                                    if(result[i].types[0]=="administrative_area_level_1"){info.state=result[i].long_name}
                                    if(result[i].types[0]=="locality"){info.location=result[i].long_name}
                                    if(result[i].types[0]=="country"){info.country=result[i].short_name}
                                }

                                info.query=details.formatted_address;

                                me.updateSearchQuery(info,true);
                                this.setState({"searchEmptyMessage":this._renderEmpty()});
                                if(this.itemsLoadedCallback)this.itemsLoadedCallback([]);
                                me._onFetch(1, me.refs.listview._postRefresh);
                            }}
                            query={{
                                 key: 'AIzaSyC8XIcEay54NdSsGEmTwt1TlfP7gXjlvXI',
                                 language: 'en', // language of the results
                                 types: '(regions)', // default: 'geocode'
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
                                     paddingLeft:10,
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
                                 listView:{
                                    backgroundColor:"white"
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
            <View style={[styles.row,{width:this.state.containerWidth}]}>
                <MomentRow user={this.props.user} itemsPerRow={1} tripData={tripData} containerWidth={this.state.containerWidth}  trip={{owner:tripData.profile}} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
            </View>
        );
    }
}


export default Search;