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
import TripDetail from '../../components/tripDetail'
import { Fonts, Colors } from '../../../../Themes/'
import MarkerMap from '../../components/MarkerMap'
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
    TouchableOpacity

} from 'react-native';
import React, { Component } from 'react';
import AddPaging from 'react-native-paged-scroll-view/index'

const CARD_PREVIEW_WIDTH = 10
const CARD_MARGIN = 3;
const CARD_WIDTH = Dimensions.get('window').width - (CARD_MARGIN + CARD_PREVIEW_WIDTH) * 2;
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';

var styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
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
    card: {
        width: CARD_WIDTH,
        position:'relative'
    },
    row:{flexDirection: 'row'},
    headerContainer:{flex:1,height:windowSize.height+190},
    headerMaskedView:{height:windowSize.height*.95, width:windowSize.width,alignItems:'center',flex:1},
    headerDarkBG:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:1,backgroundColor:'black' },
    headerImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:.6 },
    headerTripTo:{color:"#FFFFFF",fontSize:14,letterSpacing:.5,marginTop:15,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800"},
    headerTripName:{color:"#FFFFFF",fontSize:35,marginTop:3, lineHeight:28,paddingTop:7,width:windowSize.width*.8,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1.5,backgroundColor:"transparent"},
    subTitleContainer:{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'space-between',flexDirection:'row',position:'absolute',top:windowSize.height*.8,left:15,right:15,height:20,marginTop:-5},
    tripDataFootnoteIcon:{height:10,marginTop:5,marginLeft:-3}
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
            isPortrait:true,
            momentDetailsOffsetY:new Animated.Value(windowSize.height),
            momentDetailsBackground:new Animated.Value(0),
            shouldHideDetailView:true,
            didHideDetailView:true,
            didShowDetailView:false,
            scroll: new Animated.Value(0)
        };

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
            if(this.state.isPortrait)this.props.toggleTabBar(!showTabBar);
        }else if(this.state.isPortrait!==prevState.isPortrait){
            this.props.toggleTabBar(this.state.isPortrait);
        }

    }

    componentDidMount(){
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
                }} showDeleteTrip={this.state.isCurrentUsersTrip} onDeleteTrip={this.deleteTripAlert} shareURL={config.shareBaseURL+"/trip/"+this.props.trip.id+"/"+this.props.user.sherpaToken}></PopOver>

            </View>
        return completeHeader;
    }

    deleteTripAlert(){
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

    showTripLocation(trip){
        this.props.navigator.push({
            id: "location",
            trip
        });
    }

    showTripMap(trip){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip,
            sceneConfig:"right-nodrag"
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

        return (
            <View style={styles.headerContainer}>
                <View maskImage='mask-test' style={[styles.headerMaskedView,{height:windowSize.height}]} >
                    <View
                        style={styles.headerDarkBG}
                    />

                        <Image
                            style={styles.headerImage}
                            resizeMode="cover"
                            source={{uri:this.state.moments[0].highresUrl||this.state.moments[0].mediaUrl}}
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
                    <View style={[{backgroundColor:'white'},styles.map]}></View>

                    <TouchableOpacity style={styles.map} onPress={()=>{this.showTripMap(this.props.trip)}}>

                    <MarkerMap interactive={false} moments={this.props.trip.moments}></MarkerMap>
                    </TouchableOpacity>


                </View>

                <SimpleButton style={{width:windowSize.width-30,marginLeft:15,marginBottom:15,position:'absolute',top:windowSize.height+105}} onPress={()=>{this.showTripLocation(this.props.trip)}} text={"explore "+tripLocation}></SimpleButton>
                <Header settings={{navColor:'white',routeName:this.state.routeName,topShadow:true}} ref="navStatic" goBack={this.navActionLeft.bind(this)}  navActionRight={this.navActionRight.bind(this)}></Header>
            </View>
        )
    }

    //renderTripDetails(){
    //    let currentIndex=0;
    //    var currentMoment=this.props.trip.moments[0];
    //
    //    return(
    //        this.state.didHideDetailView?null:<Animated.View style={[styles.tripDetailContainer,{backgroundColor:this.state.momentDetailsOffsetY.interpolate({extrapolate:'clamp',inputRange:[0,windowSize.height],outputRange:['rgba(0,0,0,.8)','rgba(0,0,0,0)']})}]}>
    //                <PanController
    //                            horizontal
    //                            vertical
    //                            xBounds={[-(this.props.trip.moments.length-1) * (CARD_WIDTH + CARD_MARGIN*2),0]}
    //                            yBounds={[-20,this.state.shouldHideDetailView?9999:60]}
    //                            snapSpacingX={CARD_WIDTH + CARD_MARGIN*2}
    //                            xMode="snap"
    //                            panX={this.state.scroll}
    //                            panY={this.state.momentDetailsOffsetY}
    //                            overshootY='spring'
    //                            overshootReductionFactor={2}
    //                            pageCount={this.props.trip.moments.length}
    //                            onPanResponderMove={(_,{dx,dy,x0,y0})=>{
    //                            }}
    //                            onReleaseY={({ vx, vy, dx, dy })=>{
    //                               let currentPosY=this.state.momentDetailsOffsetY._offset+dy;
    //                               if(currentPosY>0&&currentPosY<250){
    //                                     Animated.timing(this.state.momentDetailsOffsetY, {toValue:50,duration:200}).start();
    //                               }else if(currentPosY>250){
    //                                     this.setState({shouldHideDetailView:true});
    //                               }
    //                            }}
    //                >
    //                    <Animated.View style={{top:this.state.momentDetailsOffsetY}}>
    //
    //                        <Animated.View style={{marginLeft:CARD_PREVIEW_WIDTH,left:this.state.scroll,flexDirection:'row',backgroundColor:'red'}}>
    //
    //                            {this.props.trip.moments.map((momentData)=>{
    //                                currentIndex++;
    //
    //                                var timeAgo=moment(new Date(momentData.date*1000)).fromNow();
    //                                var description=momentData.caption&&momentData.caption.length>0?<Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:12,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={2}>{momentData.caption}</Text>:null;
    //
    //
    //                                var profilePic= this.props.trip.owner.serviceProfilePicture?
    //                                    <View style={{height:CARD_WIDTH,flex:1,justifyContent:'flex-end',alignItems:'flex-start'}}>
    //                                        <Image style={{position:'absolute',bottom:0,left:0,width:windowSize.width,height:200}} resizeMode="cover" source={require('../../../../Images/shadow-bottom.png')}></Image>
    //
    //                                        <View style={{alignItems:'flex-start',flexDirection:'row',marginBottom:20,marginLeft:20}}>
    //                                        <UserImage onPress={()=>{this.showUserProfile({owner:moment.profile})}} radius={30} userID={momentData.profile.id} imageURL={this.props.trip.owner.serviceProfilePicture}></UserImage>
    //                                            <View style={{marginLeft:20,}}>
    //                                                <TouchableOpacity onPress={()=>{Linking.openURL(momentData.serviceJson.link)}}>
    //                                                    {description}
    //                                                </TouchableOpacity>
    //                                                <View style={{flexDirection:'row',alignItems:'center'}}>
    //                                                    <Image source={require('image!icon-watch')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
    //                                                    <Text style={{backgroundColor:'transparent',color:'white', marginTop:6,fontFamily:'Akkurat',fontSize:10,opacity:.8,marginLeft:3}}>{timeAgo.toUpperCase()}</Text>
    //                                                </View>
    //                                            </View>
    //                                        </View>
    //                                    </View>:null;
    //
    //                                return (
    //                                    <ImageProgress
    //                                            style={[styles.card,
    //                                                {
    //                                                    backgroundColor:'grey',
    //                                                    width:CARD_WIDTH,
    //                                                    height:CARD_WIDTH,
    //                                                    marginHorizontal:CARD_MARGIN,
    //                                                    position:'absolute',
    //                                                    left:(currentIndex-1)*(CARD_WIDTH+CARD_MARGIN*2)
    //                                            }]}
    //                                            resizeMode="cover"
    //                                            key={"moment-"+momentData.id}
    //                                            indicator={Progress.Circle}
    //                                            indicatorProps={{
    //                                                color: 'rgba(150, 150, 150, 1)',
    //                                                unfilledColor: 'rgba(200, 200, 200, 0.2)'
    //                                            }}
    //                                            source={{uri:momentData.mediaUrl}}
    //                                        >
    //                                        {profilePic}
    //                                        </ImageProgress>
    //
    //                                )
    //                            })}
    //
    //                        </Animated.View>
    //
    //                        <View style={{height:CARD_WIDTH,width:CARD_WIDTH,top:CARD_WIDTH,left:CARD_PREVIEW_WIDTH+CARD_MARGIN}} >
    //                            {this._renderSuitcaseButton()}
    //                            <View style={{height:CARD_WIDTH,width:CARD_WIDTH,backgroundColor:'grey'}}>
    //                                {this.state.didShowDetailView?this._renderMap(currentMoment):null}
    //                            </View>
    //                        </View>
    //
    //                    </Animated.View>
    //                </PanController>
    //        </Animated.View>
    //    )
    //}
    //_renderMap(currentMoment){
    //    return(
    //            <MapView
    //                style={styles.map} ref={ref => { this.map = ref; }}
    //                initialRegion={{
    //                                    latitude: parseFloat(currentMoment.lat),
    //                                    longitude: parseFloat(currentMoment.lng),
    //                                    latitudeDelta: 1,
    //                                    longitudeDelta: 1,
    //                                }}
    //                scrollEnabled={false}
    //            >
    //                <MapView.Marker coordinate={{latitude:parseFloat(currentMoment.lat),longitude:parseFloat(currentMoment.lng)}}>
    //                    <View style={{width:45,height:45,borderRadius:45,backgroundColor:'white'}}>
    //                        <Image
    //                            style={{width:39,height:39,borderRadius:20,marginLeft:3,marginTop:3}}
    //                            source={{uri:currentMoment.mediaUrl}}
    //                        ></Image>
    //                    </View>
    //                </MapView.Marker>
    //            </MapView>
    //    )
    //}
    //
    //_renderSuitcaseButton(){
    //    return(
    //        <Animated.View style={{marginTop:this.props.gap,marginBottom:this.props.gap,borderRadius:this.props.borderRadius,overflow:'hidden'}}>
    //            <SimpleButton icon="is-suitcased-button"  style={{marginTop:0,backgroundColor:Colors.white,borderRadius:0}} textStyle={{color:Colors.highlight}} onPress={()=>{this.suiteCaseTrip()}} text="ADDED TO YOUR SUITCASE"></SimpleButton>
    //            <SimpleButton icon="suitcase-button" style={{marginTop:-55,opacity:this.state.suitcased?0:1}} onPress={()=>{this.suiteCaseTrip()}} text="ADD TO YOUR SUITCASE"></SimpleButton>
    //        </Animated.View>
    //    )
    //}
    //
    _renderRow(rowData,sectionID,rowID) {
        var index=0;
        var items = rowData.map((item) => {moment
            if (item === null || item.type!=='image') {
                return null;
            }

            index++;
            return  <MomentRow key={"momentRow"+rowID+"_"+index}  itemRowIndex={index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
        });

        return (
            <View style={[styles.row,{width:this.state.containerWidth}]}>
                {items}
            </View>
        );

    }
}


export default FeedTrip;