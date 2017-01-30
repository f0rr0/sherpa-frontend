'use strict';

//import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'

import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {loadFeed} from '../../../../actions/feed.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import { BlurView, VibrancyView } from 'react-native-blur';


import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

import {
    StyleSheet,
    View,
    Text,
    Image,
    Animated,
    TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    listItem:{
        flex:1,
        //backgroundColor:"black",
        justifyContent:"center",
        alignItems:'flex-start',
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:60
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:125,
        marginBottom:2
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

    suitcaseCopySmall:{marginLeft:30,color:"#FFFFFF",fontSize:10, fontFamily:"TSTAR", fontWeight:"500",textAlign:'left', letterSpacing:1,backgroundColor:"transparent", marginTop:5},
    suitcaseCopyLarge:{marginLeft:30,color:"#FFFFFF",fontSize:25, fontFamily:"TSTAR", fontWeight:"500",textAlign:'left', letterSpacing:1,backgroundColor:"transparent"},
    listViewLabel:{fontSize:12},

    suitcaseHeaderContainer:{flex:1,justifyContent:'center',width:windowSize.width,alignItems:'center',height:70},
    suitcaseHeaderInfo:{backgroundColor:'white',flex:1,alignItems:'center',width:windowSize.width-30,justifyContent:'center',flexDirection:'row',height:50,marginTop:75,marginBottom:5,borderColor:"#cccccc",borderWidth:1,borderStyle:"solid"},
    suitcaseHeaderInfoCopy:{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"},

    iconCountries:{height:8,marginBottom:3},
    iconDivider:{height:25,marginLeft:35,marginRight:25},
    iconImages:{height:7,marginBottom:3},
    listItemImage:{position:"absolute",top:0,left:0,flex:1,height:125,width:windowSize.width-30}
});

class Suitecase extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;
        this.state={
            smallImageOpacity:new Animated.Value(0),
            largeImageOpacity:new Animated.Value(0),
        }
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
            trip,
        });
    }

    _renderEmpty(){
        return (
            <View style={styles.loaderContainer}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    refreshCurrentScene(){
        this.refs.listview._refresh()
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

                <SherpaGiftedListview
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
        var citieS=tripDuration>1||tripDuration==0?"DESTINATIONS":"DESTINATION";
        var moments=0;
        if(trips){
            for(var i=0;i<trips.length;i++){
                moments+=trips[i].moments.length;
            }
        }
        var photoOrPhotos=moments>1||moments==0?"PLACES":"PLACE";
        return (
        <View style={styles.suitcaseHeaderContainer}>
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
            <TouchableOpacity activeOpacity={1} style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Animated.Image
                        style={[styles.listItemImage,{opacity:this.state.smallImageOpacity}]}
                        resizeMode="cover"
                        onLoad={()=>{
                            Animated.timing(this.state.smallImageOpacity,{toValue:1,duration:200}).start()
                        }}
                        source={{uri:tripData.moments[0].serviceJson.images.thumbnail.url}}
                    >
                        <View style={{flex:1, backgroundColor:"rgba(0,0,0,.2)"}}></View>
                        <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>

                    </Animated.Image>

                    <Animated.Image
                        style={[styles.listItemImage,{opacity:this.state.largeImageOpacity}]}
                        resizeMode="cover"
                        onLoad={()=>{
                            Animated.timing(this.state.largeImageOpacity,{toValue:1,duration:500}).start()
                        }}
                        source={{uri:tripData.moments[0].mediaUrl}}
                    >
                        <View style={{flex:1, backgroundColor:"rgba(0,0,0,.2)"}}></View>

                    </Animated.Image>

                    <Animated.View style={{opacity:this.state.largeImageOpacity}}>
                        <Text style={styles.suitcaseCopySmall}>{tripData.moments.length} {tripData.moments.length==1?"PLACE":"PLACES"} IN</Text>
                        <Text style={styles.suitcaseCopyLarge}>{countryOrState.toUpperCase()}</Text>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        );
    }
}


export default Suitecase;