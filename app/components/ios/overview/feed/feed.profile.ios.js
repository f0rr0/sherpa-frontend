'use strict';

//import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'
import config from '../../../../data/config';

import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {getFeed} from '../../../../actions/feed.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import TripTitle from "../../components/tripTitle"
import PopOver from '../../components/popOver';
import UserImage from '../../components/userImage';
import TripRow from '../../components/tripRow'
import Hyperlink from 'react-native-hyperlink';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import MarkerMap from '../../components/MarkerMap'


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight,
    TouchableOpacity,
    Linking
} from 'react-native';
import React, { Component } from 'react';



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
        paddingBottom:60
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
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

        this.state= {
            trips:[],
            headerTrips:[],
            annotations:[]
        };


    }

    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            trip
        });
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        this.itemsLoadedCallback=callback;
        getFeed(this.props.trip.owner.id,page,'profile').then((response)=>{

            let hometownGuide=null;
            let trips=response.data;

            for(var i=0;i<trips.length;i++){
                let trip = trips[i];
                if(trip.isHometown){
                    hometownGuide=trips.splice(i,1)[0];
                }
            }
            this.isRescraping=false;
            this.setState({hometownGuide,trips,feedReady:true})

            if(page==1)this.setState({headerTrips:response.data})
            callback(response.data);
        });
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'white'}}>

                <SherpaGiftedListview
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={false} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    ref="listview"
                    paginationFetchingView={this._renderEmpty.bind(this)}

                    onEndReachedThreshold={1200}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
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
                        actionsLabel:{fontSize:12}
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <PopOver ref="popover" showShare={true} shareURL={config.auth[config.environment].shareBaseURL+"profiles/"+this.props.trip.owner.id}></PopOver>

            </View>
        )
    }


    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>

        )
    }

    showProfileMap(moments){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip:{moments},
            title:this.props.trip.owner.serviceUsername.toUpperCase()+"'S TRAVELS",
            sceneConfig:"bottom",
            hideNav:true
        });
    }


    _renderHeader(){
        var trips=this.state.trips;
        var moments=[];

        //console.log(this.state.trips)
        if(trips){
            for(var i=0;i<trips.length;i++){
                Array.prototype.push.apply(moments,trips[i].moments)
            }
        }

        if(this.state.hometownGuide)Array.prototype.push.apply(moments,this.state.hometownGuide.moments);

        var hasDescriptionCopy=true;


        const tooltip=!this.props.user.usedAddTrip?
            <TouchableOpacity style={{position:'absolute',left:5,top:50}} onPress={()=>{this.hideTooltip()}}><Animated.Image ref="tooltip" source={require('./../../../../Images/tooltip-addtrip.png')} resizeMode="contain" style={{opacity:this.state.tooltipOpacity,width:365,height:90}}></Animated.Image></TouchableOpacity>
            : null;




        const hometownGuide=this.state.hometownGuide?
            <View>
                <TripRow isProfile={true} tripData={this.state.hometownGuide} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}/>
                <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,fontWeight:"500",marginVertical:10}}>{this.props.trip.owner.serviceUsername.toUpperCase()}'S TRAVELS</Text>
            </View>
            :null;

        const map= this.state.feedReady&&this.state.trips.length>0?<TouchableOpacity  onPress={()=>{this.showProfileMap(moments)}} style={{left:15,height:260,width:windowSize.width-30,marginBottom:14}}>
            <MarkerMap moments={moments} interactive={false}></MarkerMap>
        </TouchableOpacity>:null;

        return (
            <View style={{marginBottom:15}}>
                <View style={{backgroundColor:'#FFFFFF', height:600, width:windowSize.width,marginBottom:-290,marginTop:75}} >
                    <View style={{flex:1,alignItems:'center',justifyContent:'center',position:'absolute',left:0,top:0,height:300,width:windowSize.width}}>
                        <UserImage onPress={()=>{
                            Linking.openURL("https://www.instagram.com/"+this.props.trip.owner.serviceUsername);
                        }} radius={80} userID={this.props.trip.owner.id} imageURL={this.props.trip.owner.serviceProfilePicture}></UserImage>

                        <Text style={{color:"#000000",fontSize:20,marginBottom:20, marginTop:25,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.trip.owner.serviceUsername.toUpperCase()}</Text>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{color:"#000000",width:300,fontSize:12,marginBottom:0, marginTop:3,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", backgroundColor:"transparent"}}>{this.props.trip.owner.serviceObject["bio"]}</Text>
                        </Hyperlink>
                        <Text style={{color:"#949494",width:300,fontSize:12,marginBottom:0, marginTop:3,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500",backgroundColor:"transparent"}}>{this.props.trip.owner.hometown}</Text>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{textDecorationLine:'underline',color:"#8AD78D",width:300,fontSize:12,marginBottom:10,marginTop:5, fontFamily:"TSTAR", textAlign:'center', fontWeight:"600",backgroundColor:"transparent"}}>{this.props.trip.owner.serviceObject["website"].replace("http://","").replace("https://","")}</Text>
                        </Hyperlink>
                    </View>
                </View>

                {/*<View style={{bottom:0,backgroundColor:'white',flex:1,alignItems:'center',width:windowSize.width-30,justifyContent:'center',flexDirection:'row',position:'absolute',height:55,left:15,top:385,borderColor:"#cccccc",borderWidth:1,borderStyle:"solid"}}>
                    <View style={{flexDirection:'column',alignItems:'center'}}>
                        <Image source={require('image!icon-countries-negative')} style={{height:8,marginBottom:4}} resizeMode="contain"></Image>
                        <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripDuration} {tripS}</Text>
                    </View>
                    <Image source={require('image!icon-divider')} style={{height:25,marginLeft:35,marginRight:25}} resizeMode="contain"></Image>
                    <View style={{flexDirection:'column',alignItems:'center'}}>
                        <Image source={require('image!icon-images-negative')} style={{height:7,marginBottom:5}} resizeMode="contain"></Image>
                        <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{moments} {phopoporPhotos}</Text>
                    </View>
                </View>*/}
                {hometownGuide}
                {map}

                {this.props.navigation.default}
            </View>
        )
    }

    _renderRow(tripData) {
        return (
            <TripRow isProfile={true} tripData={tripData} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}></TripRow>
        );
    }
}


export default FeedProfile;