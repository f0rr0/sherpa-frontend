'use strict';

import React from "react-native";
import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'

import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import { connect } from 'react-redux/native';
import config from '../../../../data/config';
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
            moments:[]
        };
    }

    suiteCaseTrip(trip){
        addMomentToSuitcase(trip.id);
    }

    unSuiteCaseTrip(trip){
        removeMomentFromSuitcase(trip.id);
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

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.searchResults[this.props.feed.feedPage]){
            //strip moments out of trips :: unpacking start
            var searchResults=this.props.feed.searchResults[this.props.feed.feedPage];
            var unpackedResults=this.unpackTrips(searchResults);
            //:: unpacking end

            const {endpoint,version} = sherpa;
            fetch(endpoint+version+"/moment/batchsuitcasedby/"+this.props.user.serviceID, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
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

    _renderHeader(){
        if(Object.keys(this.props.feed.searchResults).length==0)return;

        var trips=this.props.feed.searchResults["1"];
        var tripDuration=trips.length;
        var moments=0;
        for(var i=0;i<trips.length;i++){
            moments+=trips[i].moments.length;
        }

        return (
            <View style={{flex:1}}>
                <View style={{flex:1, alignItems:'center',justifyContent:'center',width:380,marginTop:70}}>

                    <View style={{ borderBottomColor: '#001645', borderBottomWidth: 1,flex:1,marginBottom:30}}>
                        <TextInput
                            style={{height: 50,marginTop:20,width:280,left:10,fontSize:25, fontFamily:"TSTAR", color:"#001645", fontWeight:"500",letterSpacing:1,marginRight:20,marginLeft:20}}
                            onChangeText={(searchQuery) => {
                                //check if search query matches country

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
                        />
                        <Image
                            style={{width:18,height:18,bottom:18,position:"absolute"}}
                            resizeMode="contain"
                            source={require('./../../../../images/icon-explore-dark.png')}
                        />
                    </View>



                </View>

                {this.props.navigation}


            </View>
        )
    }

    _renderRow(tripData) {
        var myTripData=tripData;
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