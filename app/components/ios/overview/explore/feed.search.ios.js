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
        alignItems:'center'
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
        marginBottom:15
    },

    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        width:165,
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }
});

class Search extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;
        this.state = {
            searchQuery: "",
            backendSearchQuery:"",
            searchType:"places"
        };
    }

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.searchResults[this.props.feed.feedPage]){
            this.itemsLoadedCallback(this.props.feed.searchResults[this.props.feed.feedPage])
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
        this.props.dispatch(loadFeed(this.state.backendSearchQuery,this.props.user.sherpaToken,page,"search-"+this.state.searchType));
    }

    render(){
        return(
            <GiftedListView
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                emptyView={this._emptyView.bind(this)}
                firstLoader={true} // display a loader for the first fetching
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
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        //if country code not in ISO, don't resolve country. i.e. Kosovo uses XK but is not in ISO yet
        if(!country)country={name:tripData.country}

        var countryOrState=(tripData.country.toUpperCase()==="US")?tripData.state:country.name;

        var timeAgo=moment(new Date(tripData.dateStart*1000)).fromNow();
        return (
            <TouchableHighlight style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:.7}}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    />
                    <Text style={{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent"}}>{tripData.name.toUpperCase()}</Text>
                    <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", marginTop:5}}>{countryOrState.toUpperCase()}/{tripData.continent.toUpperCase()}</Text>

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


export default Search;