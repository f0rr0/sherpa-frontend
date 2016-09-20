'use strict';

import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'

import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';


import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

import {
    StyleSheet,
    View,
    Text,
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
        backgroundColor:"#fcfcfc",
        justifyContent:"center",
        alignItems:'center',
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:20
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:90,

        marginBottom:5
    },

    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },

    loaderContainer:{flex:1,justifyContent:'center',height:windowSize.height,width:windowSize.width,alignItems:'center'},
    loaderImage:{width: 250, height: 250},

    emptyContainer:{flex:1,justifyContent: 'center', height:400,alignItems: 'center'},
    emptyCopy:{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14},

    suitcaseCopySmall:{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", marginTop:5},
    suitcaseCopyLarge:{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent"},
    listViewLabel:{fontSize:12},

    suitcaseHeaderContainer:{flex:1,justifyContent:'center',width:windowSize.width,alignItems:'center',height:150},
    suitcaseHeaderInfo:{backgroundColor:'white',flex:1,alignItems:'center',width:windowSize.width-30,justifyContent:'center',flexDirection:'row',height:50,marginTop:75,marginBottom:5,borderColor:"#cccccc",borderWidth:.5,borderStyle:"solid"},
    suitcaseHeaderInfoCopy:{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"},

    iconCountries:{height:8,marginBottom:3},
    iconDivider:{height:25,marginLeft:35,marginRight:25},
    iconImages:{height:7,marginBottom:3},
    listItemImage:{position:"absolute",top:0,left:0,flex:1,height:90,width:windowSize.width-30,opacity:1}
});

class Suitecase extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;
    }


    reset(){
        this.refs.listview.refs.listview.scrollTo({y:0,animated:true});
    }

    componentDidMount(){
        this.itemsLoadedCallback=function(){
        }
    }

    showTripDetail(trip) {
        this.props.navigator.push({
            id: "destination",
            trip
        });
    }

    _renderEmpty(){
        return (
            <View style={styles.loaderContainer}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.suitcaseDestinations[this.props.feed.feedPage]){
            this.itemsLoadedCallback(this.props.feed.suitcaseDestinations[this.props.feed.feedPage])
        }else if(this.props.feed.feedState==='reset'){
            this.refs.listview._refresh()
        }
    }

    _onFetch(page=1,callback){
        this.itemsLoadedCallback=callback;
        this.props.dispatch(loadFeed(this.props.user.sherpaID,this.props.user.sherpaToken,page,"suitcase-list"));
    }

    render(){
        return(
            <View style={{flex:1}}>

                <GiftedListView
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    emptyView={this._emptyView.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={false} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    ref="listview"
                    paginationFetchingView={this._renderEmpty.bind(this)}

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
                    headerView={this._renderHeader.bind(this)}
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:styles.listViewLabel
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>
        )
    }

    _emptyView(){
        return(
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyCopy}>Add the destinations you want to remember by tapping the small suitcase button underneath each photo.</Text>
            </View>
        )
    }

    _renderHeader(){
        if(Object.keys(this.props.feed.trips).suitcaseDestinations==0)return;
        var trips=this.props.feed.suitcaseDestinations["1"];

        var tripDuration=trips.length;
        var citieS=tripDuration>1?"DESTINATIONS":"DESTINATION";
        var moments=0;
        if(trips){
            for(var i=0;i<trips.length;i++){
                moments+=trips[i].moments.length;
            }
        }
        var photoOrPhotos=moments>1?"LOCATIONS":"LOCATION";

        return (
            <View style={styles.suitcaseHeaderContainer}>
                <View style={styles.suitcaseHeaderInfo}>
                    <Image source={require('image!icon-countries-negative')} style={styles.iconCountries} resizeMode="contain"></Image>
                    <Text style={styles.suitcaseHeaderInfoCopy}>{tripDuration} {citieS}</Text>
                    <Image source={require('image!icon-divider')} style={styles.iconDivider} resizeMode="contain"></Image>
                    <Image source={require('image!icon-images-negative')} style={styles.iconImages} resizeMode="contain"></Image>
                    <Text style={styles.suitcaseHeaderInfoCopy}>{moments} {photoOrPhotos}</Text>
                </View>
                {this.props.navigation.default}
            </View>
        )
    }

    _renderRow(tripData) {
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.name;
        })[0];

        if(!country)country={name:tripData.name};
        var countryOrState=(tripData.name.toUpperCase()==="US")?tripData.state:country.name;

        return (
            <TouchableHighlight style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={styles.listItemImage}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    >
                        <View style={{flex:1, backgroundColor:"rgba(0,0,0,.2)"}}></View>

                    </Image>
                    <Text style={styles.suitcaseCopySmall}>{tripData.moments.length} {tripData.moments.length==1?"PLACE":"PLACES"} IN</Text>
                    <Text style={styles.suitcaseCopyLarge}>{countryOrState.toUpperCase()}</Text>
                </View>
            </TouchableHighlight>
        );
    }
}


export default Suitecase;