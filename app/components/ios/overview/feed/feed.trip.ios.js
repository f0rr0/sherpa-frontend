'use strict';

import FeedLocation from "./feed.location.ios";
import FeedProfile from "./feed.profile.ios";
import countries from "./../../../../data/countries";
//import Mapbox from "react-native-mapbox-gl";
import moment from 'moment';
import {loadFeed} from '../../../../actions/feed.actions';
import {deleteTrip} from '../../../../actions/trip.edit.actions';
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
import MapView from 'react-native-maps';
import supercluster from 'supercluster'
import {getClusters} from '../../components/get-clusters';
import Orientation from 'react-native-orientation';
 
import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight,
    Alert
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
    tripDataFootnoteCopy:{color:"#FFFFFF",fontSize:10, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"},

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
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    row:{flexDirection: 'row'},
    listViewContainer:{flex:1,backgroundColor:'white'},
    headerContainer:{flex:1,height:windowSize.height+190},
    headerMaskedView:{height:windowSize.height*.95, width:windowSize.width,alignItems:'center',flex:1},
    headerDarkBG:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:1,backgroundColor:'black' },
    headerImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:.6 },
    headerTripTo:{color:"#FFFFFF",fontSize:14,letterSpacing:.5,marginTop:15,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800"},
    headerTripName:{color:"#FFFFFF",fontSize:35,marginTop:3, lineHeight:28,paddingTop:7,width:windowSize.width*.8,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1.5,backgroundColor:"transparent"},
    subTitleContainer:{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row',position:'absolute',top:windowSize.height*.8,left:15,right:15,height:20,marginTop:-5}
});

const DEFAULT_PADDING = { top: 60, right: 60, bottom: 100, left: 60 };

class FeedTrip extends Component {
    constructor(props){
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        const itemsPerRow=2;
        let organizedMoments=[];
        let data=props.trip.moments;

        if(!props.trip.organizedMoments){
            for(var i=0;i<props.trip.moments.length;i++){
                let endIndex=Math.random()>.5?itemsPerRow+i:1+i;
                organizedMoments.push(data.slice(i, endIndex));
                i = endIndex-1;
            }
            props.trip.organizedMoments=organizedMoments;
        }else{
            organizedMoments=props.trip.organizedMoments;
        }

        this.state= {
            dataSource: this.ds.cloneWithRows(organizedMoments),
            annotations:[],
            moments:props.trip.moments,
            shouldUpdate:true,
            isCurrentUsersTrip:props.trip.owner.id===props.user.profileID,
            routeName:"TRIP",
            itemsPerRow:itemsPerRow,
            containerWidth:windowSize.width-30,
            region:null,
            isPortrait:true
        };
    }


    _orientationDidChange(orientation) {
        var isPortrait=(orientation=="PORTRAIT"||orientation=="PORTRAITUPSIDEDOWN"||orientation=="UNKNOWN")
        this.props.toggleTabBar(isPortrait);
        this.setState({isPortrait})
    }

    navActionRight(){
       this.refs.popover._setAnimation("toggle");
    }

    navActionLeft(){
        console.log("LEFT LEFT");
        this.props.navigator.pop();
        Orientation.lockToPortrait();
    }


    getZoomLevel(region = this.state.region) {
        // http://stackoverflow.com/a/6055653
        const angle = region.longitudeDelta;

        // 0.95 for finetuning zoomlevel grouping
        return Math.round(Math.log(360 / angle) / Math.LN2);
    }

    createMarkersForRegion() {
        const padding = 0.25;
        if (this.state.clusters&&this.state.region) {
            const markers = this.state.clusters.getClusters([
                this.state.region.longitude - (this.state.region.longitudeDelta * (0.5 + padding)),
                this.state.region.latitude - (this.state.region.latitudeDelta * (0.5 + padding)),
                this.state.region.longitude + (this.state.region.longitudeDelta * (0.5 + padding)),
                this.state.region.latitude + (this.state.region.latitudeDelta * (0.5 + padding)),
            ], this.getZoomLevel());

            return markers.map((marker,i) => this.renderMarker(marker,i));
        }
        return [];
    }

    renderMarker(marker,i){
        let clustercount=null;
        if(marker.properties&&marker.properties.cluster){
            clustercount=<View style={{position:'absolute',bottom:-3,right:-3,backgroundColor:'white',width:20,height:20,borderRadius:10,justifyContent:'center',alignItems:'center'}}><Text style={{color:'black',fontSize:10}}>{marker.properties.point_count}</Text></View>
        }
        return(
            <MapView.Marker key={i} coordinate={{latitude:marker.geometry.coordinates[1],longitude:marker.geometry.coordinates[0]}}>
                <View style={{width:45,height:45,borderRadius:45,backgroundColor:'white'}}>
                    <Image
                        style={{width:39,height:39,borderRadius:20,marginLeft:3,marginTop:3}}
                        source={{uri:marker.data.mediaUrl}}
                    ></Image>
                    {clustercount}
                </View>
            </MapView.Marker>
        )
    }


    componentDidMount(){
        var markers=[];
        var momentIDs=[];


        for (var i=0;i<this.state.moments.length;i++){
            markers.push({
                latitude:this.state.moments[i].lat,
                longitude:this.state.moments[i].lng,
                moment:this.state.moments[i],
                data:this.state.moments[i],
                geometry:{coordinates:[this.state.moments[i].lng,this.state.moments[i].lat]}
            });

            momentIDs.push(this.state.moments[i].id);
        }

        this.map.fitToCoordinates(markers, {
            edgePadding: DEFAULT_PADDING
        });
        const clusters = supercluster({
            radius: 60,
            maxZoom: 16,
        });

        clusters.load(markers);

        Orientation.addOrientationListener(this._orientationDidChange.bind(this));
        Orientation.unlockAllOrientations();

        this.setState({annotations:markers,clusters});
    }

    componentWillUnmount(){
        Orientation.removeOrientationListener(this._orientationDidChange.bind(this));
    }

    render(){
        var header=<Header type="fixed" ref="navFixed" settings={{routeName:this.state.routeName,opaque:true,fixedNav:true}} goBack={this.navActionLeft.bind(this)} navActionRight={this.navActionRight.bind(this)}></Header>;
        const completeHeader=this.state.isPortrait?
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

                <PopOver ref="popover" showEditTrip={this.state.isCurrentUsersTrip} onEditTrip={()=>{
                      this.props.navigator.push({
                            id: "editTripGrid",
                            hideNav:true,
                            momentData:this.props.trip.moments,
                            tripData:this.props.trip,
                            sceneConfig:"bottom-nodrag"
                      });
                }} showDeleteTrip={this.state.isCurrentUsersTrip} onDeleteTrip={()=>{
                    Alert.alert(
                      'Delete Trip',
                      'Are you sure you want to delete this trip?',
                      [
                        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                        {text: 'OK', onPress: () => {
                            deleteTrip(this.props.trip.id).then(()=>{
                                this.props.refreshCurrentScene();
                                setTimeout(this.props.refreshCurrentScene,500)
                            })
                            this.props.navigator.pop();
                        }}
                      ]
                    )
                }} shareURL={config.shareBaseURL+"/trip/"+this.props.trip.id+"/"+this.props.user.sherpaToken}></PopOver>
            </View>:<View style={[styles.listViewContainer,{backgroundColor:'red'}]}></View>;

        return completeHeader;
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

    _regionUpdated(region){
        this.setState({region});
    }

    _renderHeader(){
        var tripData=this.props.trip;
        var type=this.props.trip.type=='global'?'state':this.props.trip.type;
        var tripLocation=this.props.trip[type];

        var country = countries.filter(function(country) {
            return country["alpha-2"].toLowerCase() === tripLocation.toLowerCase();
        })[0];

        if(country)tripLocation=country.name;
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();

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
                            <Text style={styles.tripDataFootnoteCopy}>{timeAgo.toUpperCase()}</Text>

                        </View>
                </View>
                <View style={{height:260,width:windowSize.width-30,left:15,backgroundColor:'black',flex:1,position:'absolute',top:windowSize.height*.85}}>
                    <MapView
                        style={styles.map}
                        onRegionChangeComplete={this._regionUpdated.bind(this)}
                        ref={ref => { this.map = ref; }}
                    >

                        {this.createMarkersForRegion()}
                    </MapView>

                </View>

                <SimpleButton style={{width:windowSize.width-30,marginLeft:15,marginBottom:15,position:'absolute',top:windowSize.height+105}} onPress={()=>{this.showTripLocation(this.props.trip)}} text={"explore "+tripLocation}></SimpleButton>
                <Header settings={{navColor:'white',routeName:this.state.routeName,topShadow:true}} ref="navStatic" goBack={this.navActionLeft.bind(this)}  navActionRight={this.navActionRight.bind(this)}></Header>
            </View>
        )
    }



    _renderRow(rowData,sectionID,rowID) {
        var index=0;
        var items = rowData.map((item) => {
            if (item === null || item.type!=='image') {
                return null;
            }

            index++;

            return  <MomentRow key={"momentRow"+rowID+"_"+index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
        });

        return (
            <View style={[styles.row,{width:this.state.containerWidth}]}>
                {items}
            </View>
        );

    }
}


export default FeedTrip;