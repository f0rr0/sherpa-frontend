'use strict';

import FeedLocation from "./feed.location.ios";
import FeedProfile from "./feed.profile.ios";
import countries from "./../../../../data/countries";
//import Mapbox from "react-native-mapbox-gl";
import moment from 'moment';
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
import TripDetail from '../../components/tripDetail'
import { Fonts, Colors } from '../../../../Themes/'
import MarkerMap from '../../components/MarkerMap'
import {BlurView} from 'react-native-blur';
import {getFeed} from '../../../../actions/feed.actions';

import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight,
    Alert,
    PanResponder,
    Animated,
    ScrollView,
    TouchableOpacity,
    DeviceEventEmitter

} from 'react-native';
import React, { Component } from 'react';
import AddPaging from 'react-native-paged-scroll-view/index'

const CARD_PREVIEW_WIDTH = 10
const CARD_MARGIN = 3;
const CARD_WIDTH = Dimensions.get('window').width - (CARD_MARGIN + CARD_PREVIEW_WIDTH) * 2;
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

var {
    Gyroscope,
    Magnetometer
    } = require('NativeModules');

var styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius:3,
        borderTopRightRadius:3,
        backgroundColor:'transparent',
        overflow:'hidden'
    },
    listViewContainer:{flex:1,backgroundColor:'white',paddingBottom:60},
    container: {
        flex: 1,
    },
    tripDetailContainer:{
        //backgroundColor:'rgba(0,0,0,.5)',
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:0,
    },
    tripDataFootnoteCopy:{color:"#FFFFFF",fontSize:10, marginTop:-7,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800",marginLeft:8},

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
    iconImages:{height:7,marginBottom:3},
    card: {
        width: CARD_WIDTH,
        position:'relative'
    },
    subtitle:{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"},
    row:{flexDirection: 'row'},
    headerContainer:{flex:1,height:windowSize.height+160},
    headerMaskedView:{height:windowSize.height*.95, width:windowSize.width,alignItems:'center',flex:1},
    headerDarkBG:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,backgroundColor:'black' ,opacity:.4},
    headerImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:1 },
    headerTripTo:{color:"#FFFFFF",fontSize:14,marginBottom:-8,letterSpacing:.5,marginTop:15,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800"},
    headerTripName:{color:"#FFFFFF",fontSize:33,marginTop:3,height:45,paddingTop:7,width:windowSize.width*.99,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1.5,backgroundColor:"transparent"},
    subTitleContainer:{alignItems:'center',justifyContent:'space-between',flexDirection:'row',position:'absolute',top:windowSize.height*.8,left:15,right:15,height:30,marginTop:-15},
    tripDataFootnoteIcon:{height:10,marginTop:5,marginLeft:-3}
});

const DEFAULT_PADDING = { top: 60, right: 60, bottom: 100, left: 60 };

class FeedTrip extends Component {
    constructor(props){
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        let itemsPerRow=2;
        let organizedMoments=[];
        let data=props.trip.moments;
        this.direction='down';
        if(!props.trip.organizedMoments){
            let globalIndex=0;

            for(var i=0;i<props.trip.moments.length;i++){
                let endIndex=(Math.random()>.5)||globalIndex==0?1+i:itemsPerRow+i;
                var currentMoment=data.slice(i, endIndex);
                organizedMoments.push(currentMoment);
                i = endIndex-1;
                globalIndex++;
            }
            props.trip.organizedMoments=organizedMoments;
        }else{
            organizedMoments=props.trip.organizedMoments;
        }


        this.scrollY=new Animated.Value(0);

        this.state= {
            dataSource: this.ds.cloneWithRows(organizedMoments),
            annotations:[],
            headerPreviewLoadedOpacity:new Animated.Value(0),
            headerLoadedOpacity:new Animated.Value(0),
            moments:props.trip.moments,
            shouldUpdate:true,
            isCurrentUsersTrip:props.trip.owner.id===props.user.profileID,
            //routeName:props.trip.owner.serviceUsername.toUpperCase()+"'S TRIP",
            routeName:"LOCATION",
            itemsPerRow:itemsPerRow,
            containerWidth:windowSize.width-30,
            region:null,
            momentDetailsOffsetY:new Animated.Value(windowSize.height),
            momentDetailsBackground:new Animated.Value(0),
            shouldHideDetailView:true,
            didHideDetailView:true,
            didShowDetailView:false,
            scroll: new Animated.Value(0),
            scrollY:new Animated.Value(0)
        };

        Magnetometer.setMagnetometerUpdateInterval(0.8); // in seconds

        DeviceEventEmitter.addListener('MagnetometerData', function (data) {
            /**
             * data.rotationRate.x
             * data.rotationRate.y
             * data.rotationRate.z
             **/
        });


        Magnetometer.startMagnetometerUpdates();

    }

    componentWillUnmount(){
        Magnetometer.stopMagnetometerUpdates();
    }



    _renderFooterView(){
        return;
        return <View style={{marginBottom:20}}>
            {this.props.trip.locus?<SimpleButton style={{width:windowSize.width-30}} onPress={()=>{
            //console.log('type:',this.props.trip,'locus',this.props.trip.locus);
            this.showTripLocation(this.props.trip.locus["region_gid"])}} text={"Explore "+this.props.trip.locus.region}></SimpleButton>:null}
        </View>
    }

    navActionRight(){
       this.refs.popover._setAnimation("toggle");
    }

    navActionLeft(){
        this.props.navigator.pop();
    }

    componentDidUpdate(prevProps,prevState){

        var showTabBar=true;
        if(this.state.shouldHideDetailView!==prevState.shouldHideDetailView){
            if(this.state.shouldHideDetailView){
                showTabBar=false;
                Animated.timing(this.state.momentDetailsOffsetY, {
                    toValue: windowSize.height,
                    duration:200
                }).start(()=>{
                });
                    this.setState({didHideDetailView:true})
                this.setState({didShowDetailView:false})
            }else{
                showTabBar=true;
                Animated.spring(this.state.momentDetailsOffsetY, {
                    toValue: 60
                }).start(()=>{
                    this.setState({didShowDetailView:true})
                });

                this.setState({didHideDetailView:false});
            }
        }
    }

    componentDidMount(){
        //console.log('trip data',this.props.trip.moments)
    }

    refreshCurrentScene(){
        setTimeout(()=>{

        getFeed(this.props.trip.id,1,'trip').then((result)=>{
            let trip=result;
            let globalIndex=0;
            let itemsPerRow=2;
            let organizedMoments=[];
            //console.log('trip endpoint',result);
            let data=trip.data.moments;

            if(data.length!==this.props.trip.moments.length){
                if(data.length==0){
                    deleteTrip(this.props.trip.id).then(()=>{
                        this.props.refreshCurrentScene();
                        setTimeout(this.props.refreshCurrentScene,500)
                    })
                    this.props.navigator.pop();
                }else{
                    for(var i=0;i<data.length;i++){
                        let endIndex=(Math.random()>.5)||globalIndex==0?1+i:itemsPerRow+i;
                        var currentMoment=data.slice(i, endIndex);
                        organizedMoments.push(currentMoment);
                        i = endIndex-1;
                        globalIndex++;
                    }
                    this.props.trip.organizedMoments=organizedMoments;
                    this.setState({dataSource: this.ds.cloneWithRows(organizedMoments)})
                }
            }
        }).catch((error)=>{
            this.props.navigator.pop();
            this.props.refreshCurrentScene();
            setTimeout(this.props.refreshCurrentScene,500)
        })

        },500)
    }

    render(){
        var header=<Header type="fixed" ref="navFixed" settings={{routeName:this.state.routeName,opaque:true,fixedNav:true}} goBack={this.navActionLeft.bind(this)} navActionRight={this.navActionRight.bind(this)}></Header>;

        const completeHeader=
            <View style={styles.listViewContainer}>
                <ListView
                    enableEmptySections={false}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    contentContainerStyle={styles.listView}
                    renderHeader={this._renderHeader.bind(this)}
                    ref="listview"
                    renderFooter={this._renderFooterView.bind(this)}
                    scrollEventThrottle={8}
                    onScroll={(event)=>{
                        Animated.event(
                          [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
                        )(event);
                         var currentOffset = event.nativeEvent.contentOffset.y;
                         //Animated.timing(this.state.scrollY,{duration:0,toValue:currentOffset}).start()
                         var direction=currentOffset-this.offset>0?'down':'up';
                         var isDown=((direction=='down'&&this.direction=='down')  || (direction=='up' && this.direction=='down'));
                         this.offset = currentOffset;
                         this.direction=direction;

                         if(isDown||currentOffset<300){
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
                            name:"edit trip",
                            sceneConfig:"bottom-nodrag"
                      });
                }} showDeleteTrip={this.state.isCurrentUsersTrip} onDeleteTrip={this.deleteTripAlert.bind(this)} shareURL={config.auth[config.environment].shareBaseURL+"trips/"+this.props.trip.id}></PopOver>

            </View>
        return completeHeader;
    }

    deleteTripAlert(){
        //console.log('delete trips',this.props.trip);
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
    }

    showUserProfile(trip){
        this.props.dispatch(udpateFeedState("reset"));
        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    showTripLocation(data){
        let locus=data.split(":");
        var locationData={
            layer:locus[1],
            source:locus[0],
            sourceId:locus[2]
        };


        this.props.trip.layer=locus[1];
        this.props.trip.source=locus[0];
        this.props.trip.sourceId=locus[2];



        this.props.navigator.push({
            id: "location",
            trip:{name:this.props.trip.name,...locationData},
            version:"v2"
        });
    }

    showTripMap(trip){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip,
            title:trip.name,
            sceneConfig:"bottom",
            hideNav:true
        });
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
        let windowHeight=windowSize.height;
        let fullBleed=tripData.isHometown || tripData.contentType=='guide'
        let bottomLeft=null;
        let momentCount;

        let tripTitle;

        switch(tripData.contentType){
            case "trip":
                bottomLeft=<UserImage style={{marginTop:-5}} radius={30} userID={this.props.trip.owner.id} imageURL={this.props.trip.owner.serviceProfilePicture} onPress={() => this.showUserProfile(this.props.trip)}></UserImage>

                let userName;
                if(this.state.isCurrentUsersTrip){
                    userName="YOU"
                }else{
                    userName=this.props.trip.owner.serviceUsername.toUpperCase()
                }

                let didWhat

                if(fullBleed&&this.state.isCurrentUsersTrip){
                    didWhat="LIVE IN"
                }else if(fullBleed){
                    didWhat="LIVES IN"
                }else{
                    didWhat="WENT TO"
                }

                tripTitle=userName+" "+didWhat;
                momentCount=this.props.trip.moments.length
            break;
            case "guide":
                tripTitle="EXPLORE"
                momentCount=this.props.trip.venueCount;
            break;
        }



        return (
            <View style={styles.headerContainer}>
                <View style={[styles.headerMaskedView,{height:windowSize.height}]} >

                    <View style={{position:'absolute',left:0,top:0}}>
                        <Animated.Image
                            style={[styles.headerImage,{opacity:1}]}
                            resizeMode="cover"
                            onLoad={()=>{
                                    Animated.timing(this.state.headerPreviewLoadedOpacity,{toValue:1,duration:100}).start()
                                }}
                            source={{uri:this.state.moments[0].serviceJson?this.state.moments[0].serviceJson.images.thumbnail.url:this.state.moments[0].mediaUrl}}
                        >
                            <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>
                        </Animated.Image>
                    </View>

                        <Animated.View style={{position:'absolute',left:0,
                            opacity:this.state.headerLoadedOpacity,
                            }}>


                            <Animated.Image
                                style={[styles.headerImage,{
                                transform: [,{
                        scale: this.state.scrollY.interpolate({
                            inputRange: [ -windowHeight, 0],
                            outputRange: [3, 1.1],
                             extrapolate: 'clamp'
                        })
                    },{translateY:this.state.scrollY.interpolate({
                                                    inputRange: [ -windowHeight,0],
                                                    outputRange: [-40, 0],
                                                    extrapolate: 'clamp',
                                                })}]
                                }]}
                                resizeMode="cover"
                                onLoad={()=>{
                                    Animated.timing(this.state.headerLoadedOpacity,{toValue:1,duration:200}).start()
                                }}
                                source={{uri:this.state.moments[0].highresUrl||this.state.moments[0].mediaUrl}}
                            >

                            <View
                                    style={styles.headerDarkBG}
                                />

                            </Animated.Image>
                        </Animated.View>



                        <View style={{ justifyContent:'center',alignItems:'center',height:windowSize.height*.86}}>

                            <Text style={styles.headerTripTo}>{tripTitle}</Text>
                                <Text style={styles.headerTripName}>{tripData.name.toUpperCase()}</Text>
                            <TripSubtitle goLocation={(data)=>{this.showTripLocation.bind(this)(data.locus)}} tripData={this.props.trip}></TripSubtitle>
                            </View>

                        <View style={styles.subTitleContainer}>
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}} >
                                {bottomLeft}
                                <Text style={styles.tripDataFootnoteCopy}>UPDATED {timeAgo.toUpperCase()}</Text>

                                {/*<TouchableOpacity  onPress={() => this.showUserProfile(this.props.trip)}>
                                    <Text style={{color:'white',backgroundColor:'transparent',fontFamily:"TSTAR",fontSize:12,marginLeft:10,marginTop:-8,fontWeight:"800"}}>{this.props.trip.owner.serviceUsername}</Text>
                                </TouchableOpacity>*/}
                            </View>
                            {/*<Text style={styles.tripDataFootnoteCopy}>UPDATED {timeAgo.toUpperCase()}</Text>*/}
                            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"flex-end",width:30,flex:1}}>
                                <Image source={require('image!icon-images')} style={styles.iconImages} resizeMode="contain"></Image>
                                <Text style={{color:"#FFFFFF",fontSize:10, marginTop:0,fontFamily:"TSTAR",backgroundColor:"transparent",fontWeight:"500"}}>{momentCount}</Text>
                            </View>
                        </View>
                </View>
                <View style={{height:260,width:windowSize.width-30,left:15,backgroundColor:'transparent',flex:1,position:'absolute',top:windowSize.height*.85}}>
                    <View style={[{backgroundColor:'white'},styles.map]}></View>

                    <TouchableOpacity style={styles.map} onPress={()=>{this.showTripMap(this.props.trip)}}>
                        <MarkerMap interactive={false} moments={this.props.trip.moments}></MarkerMap>
                    </TouchableOpacity>
                </View>

                <Animated.View style={{flex:1,position:'absolute',top:0,
                  transform: [{translateY:this.state.scrollY.interpolate({
                                                    inputRange: [ -windowHeight,0],
                                                    outputRange: [-windowHeight, 0],
                                                    extrapolate: 'clamp',
                                                })}]
                }}>
                    <Header settings={{navColor:'white',routeName:this.state.routeName,topShadow:true}} ref="navStatic" goBack={this.navActionLeft.bind(this)}  navActionRight={this.navActionRight.bind(this)}></Header>
                </Animated.View>
            </View>
        )
    }

    _renderRow(rowData,sectionID,rowID) {
        var index=0;
        var items = rowData.map((item) => {moment
            if (item === null || item.type!=='image') {
                return null;
            }

            index++;
            return  <MomentRow user={this.props.user} dispatch={this.props.dispatch} rowIndex={rowID} key={"momentRow"+rowID+"_"+index}  itemRowIndex={index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
        });

        return (
            <View style={[styles.row,{width:this.state.containerWidth}]}>
                {items}
            </View>
        );

    }
}


export default FeedTrip;