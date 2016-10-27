'use strict';

import FeedLocation from "./feed.location.ios";
import FeedProfile from "./feed.profile.ios";
import countries from "./../../../../data/countries";
import Mapbox from "react-native-mapbox-gl";
import moment from 'moment';
import {loadFeed} from '../../../../actions/feed.actions';
import {udpateFeedState} from '../../../../actions/feed.actions';
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import config from '../../../../data/config';
import store from 'react-native-simple-store';
import StickyHeader from '../../components/stickyHeader';
import PopOver from '../../components/popOver';
import TripSubtitle from '../../components/tripSubtitle'
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
const {sherpa}=config.auth[config.environment];
import UserImage from '../../components/userImage'
import MomentRow from '../../components/momentRow'
import SimpleButton from '../../components/simpleButton'
import Header from '../../components/header'



import {
    StyleSheet,
    View,
    Text,
    ListView,
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
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center',
        paddingBottom:10,
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:60,
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:38,
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
    },
    listViewContainer:{flex:1,backgroundColor:'white'},
    headerContainer:{flex:1,height:windowSize.height+190},
    headerMaskedView:{height:windowSize.height*.95, width:windowSize.width,alignItems:'center',flex:1},
    headerDarkBG:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:1,backgroundColor:'black' },
    headerImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:.6 },
    headerTripTo:{color:"#FFFFFF",fontSize:14,letterSpacing:.5,marginTop:15,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800"},
    headerTripName:{color:"#FFFFFF",fontSize:35,marginTop:3, lineHeight:28,paddingTop:7,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1.5,backgroundColor:"transparent"},
    subTitleContainer:{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',position:'absolute',top:windowSize.height*.8,left:0,right:0,height:20,marginTop:-5}
});

class FeedTrip extends Component {
    constructor(props){
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state= {
            dataSource: this.ds.cloneWithRows(props.trip.moments),
            annotations:[],
            moments:props.trip.moments,
            shouldUpdate:true,
            isCurrentUsersTrip:false,
            routeName:"TRIP"
        };
    }

    navActionRight(){
       this.refs.popover._setAnimation("toggle");
    }

    componentDidUpdate(){
    }

    componentDidMount(){
        //console.log(this.state.moments);
        var markers=[];
        var momentIDs=[];


        for (var i=0;i<this.state.moments.length;i++){
            markers.push({
                coordinates: [this.state.moments[i].lat, this.state.moments[i].lng],
                type: 'point',
                title:this.state.moments[i].venue||"",
                annotationImage: {
                    url: 'image!icon-pin',
                    height: 7,
                    width: 7
                },
                id:"markers"+i
            });

            momentIDs.push(this.state.moments[i].id);
        }

        this.setState({annotations:markers})
    }

    render(){
        var header=<Header type="fixed" ref="navFixed" settings={{routeName:this.state.routeName,opaque:true,fixedNav:true}} goBack={this.props.navigator.pop} navActionRight={this.navActionRight.bind(this)}></Header>;        return(
            <View style={styles.listViewContainer}>
                <ListView
                    enableEmptySections={false}
                   dataSource={this.state.dataSource}
                   renderRow={this._renderRow.bind(this)}
                   contentContainerStyle={styles.listView}
                   renderHeader={this._renderHeader.bind(this)}
                   ref="listview"
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
                />
                <StickyHeader ref="stickyHeader" navigation={header}></StickyHeader>
                <PopOver ref="popover" showEditTrip={true} onEditTrip={()=>{
                      this.props.navigator.push({
                            id: "editTripGrid",
                            hideNav:true,
                            momentData:this.props.trip.moments,
                            tripData:this.props.trip,
                            sceneConfig:"bottom-nodrag"
                      });
                }} shareURL={config.shareBaseURL+"/trip/"+this.props.trip.id+"/"+this.props.user.sherpaToken}></PopOver>
            </View>
        )
    }


    showUserProfile(trip){
        this.props.dispatch(udpateFeedState("reset"));
        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    showTripLocation(trip){
        this.props.navigator.push({
            id: "location",
            trip
        });
    }

    getTripLocation(tripData){
        var country = countries.filter(function(country) {
            return country["name"].toLowerCase() === tripData.name.toLowerCase();
        })[0];

        var tripLocation=tripData.name;
        return {location:tripLocation,country:country};
    }


    _renderHeader(){
        var tripData=this.props.trip;
        var type=this.props.trip.type=='global'?'state':this.props.trip.type;
        var tripLocation=this.props.trip[type];

        var country = countries.filter(function(country) {
            return country["alpha-2"].toLowerCase() === tripLocation.toLowerCase();
        })[0];

        if(country)tripLocation=country.name;

        return (
            <View style={styles.headerContainer}>
                <View maskImage='mask-test' style={[styles.headerMaskedView,{height:windowSize.height}]} >
                    <View
                        style={styles.headerDarkBG}
                    />

                        <Image
                            style={styles.headerImage}
                            resizeMode="cover"
                            source={{uri:this.state.moments[0].mediaUrl}}
                        />

                        <View style={{ justifyContent:'center',alignItems:'center',height:windowSize.height*.86}}>

                            <UserImage radius={40} userID={this.props.trip.owner.id} imageURL={this.props.trip.owner.serviceProfilePicture} onPress={() => this.showUserProfile(this.props.trip)}></UserImage>
                            <Text style={styles.headerTripTo}>{this.state.isCurrentUsersTrip?"YOUR TRIP ":this.props.trip.owner.serviceUsername.toUpperCase()+'S TRIP'}</Text>
                            <TouchableHighlight onPress={() => this.showTripLocation(this.props.trip)}>
                                <Text style={styles.headerTripName}>{tripData.name.toUpperCase()}</Text>
                            </TouchableHighlight>
                            </View>

                        <View style={styles.subTitleContainer}>
                            <TripSubtitle tripData={this.props.trip}></TripSubtitle>
                        </View>
                </View>
                <View style={{height:260,width:windowSize.width-30,left:15,backgroundColor:'black',flex:1,position:'absolute',top:windowSize.height*.85}}>
                    <Mapbox
                        style={{borderRadius:2,flex:1,top:0,left:0,bottom:0,right:0,fontSize:10,position:'absolute',fontFamily:"TSTAR", fontWeight:"500"}}
                        styleURL={'mapbox://styles/mapbox/streets-v9'}
                        accessToken={'pk.eyJ1IjoidHJhdmVseXNoZXJwYSIsImEiOiJjaXRrNnk5OHgwYW92Mm9ta2J2dWw1MTRiIn0.QZvGaQUAnLMvoarRo9JmOg'}
                        centerCoordinate={{latitude: this.state.moments[0].lat,longitude: this.state.moments[0].lng}}
                        zoomLevel={6}
                        annotations={this.state.annotations}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    />
                    <View style={{flex:1,top:0,left:0,bottom:0,right:0,backgroundColor:'transparent'}}></View>
                </View>

                <SimpleButton style={{width:windowSize.width-30,marginLeft:15,marginBottom:15,position:'absolute',top:windowSize.height+105}} onPress={()=>{this.showTripLocation(this.props.trip)}} text={"explore "+tripLocation}></SimpleButton>

                <Header settings={{navColor:'white',routeName:this.state.routeName,topShadow:true}} ref="navStatic" goBack={this.props.navigator.pop}  navActionRight={this.navActionRight.bind(this)}></Header>
            </View>
        )
    }

    _renderRow(tripData,sectionID,rowID) {
        if(tripData.type!=='image')return(<View></View>);
        return (
           <MomentRow tripData={tripData} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
        );
    }
}


export default FeedTrip;