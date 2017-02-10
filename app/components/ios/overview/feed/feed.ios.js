'use strict';

import FeedList from './feed.list.ios';
import FeedProfile from './feed.profile.ios';
import FeedDestination from './feed.destination.ios';
import FeedLocation from './feed.location.ios';
import FeedTrip from './feed.trip.ios';
import TripDetail from './feed.trip.detail.ios';
import OwnUserProfile from './../profile/profile.ios'
import ProfileSettings from './../profile/profile.settings.ios';
import Suitcase from './../suitcase/feed.suitcase.ios'
import Search from './../explore/feed.search.ios'
import Header from '../../components/header'
import AddTrip from '../profile/profile.add-trip'
import EditTripGrid from '../profile/profile.edit-trip-grid'
import EditMomentNames from '../profile/profile.edit-moment-names'
import EditTripName from '../profile/profile.edit-trip.name'
import Settings from '../profile/profile.settings'

import TripDetailMap from '../feed/feed.trip.detail.map.ios'

import { connect } from 'react-redux';
import {loadFeed,udpateFeedState} from '../../../../actions/feed.actions';
import {updateTab} from '../../../../actions/app.actions';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import config from "../../../../data/config"
const {sherpa}=config.auth[config.environment];
const SCREEN_WIDTH = require('Dimensions').get('window').width;
const SCREEN_HEIGHT = require('Dimensions').get('window').height;


import {
    StyleSheet,
    Navigator,
    View
} from 'react-native';
import React, { Component } from 'react';


var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'
    },
    centeredContainer:{
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
    }
});


const FloatFromRight = {
    ...Navigator.SceneConfigs.FloatFromRight,
    gestures: {
        pop: {
            ...Navigator.SceneConfigs.FloatFromRight.gestures.pop,
            edgeHitWidth: SCREEN_WIDTH,
        },
    },
};

const FloatFromBottom = {
    ...Navigator.SceneConfigs.FloatFromBottom,
    gestures: {
        pop: {
            ...Navigator.SceneConfigs.FloatFromBottom.gestures.pop,
            edgeHitWidth: 50,
        },
    },
};

const FloatFromBottomNoDrag = {
    ...Navigator.SceneConfigs.FloatFromBottom,
    gestures: {
        pop: {
            ...Navigator.SceneConfigs.FloatFromBottom.gestures.pop,
            edgeHitWidth: 0,
        },
    },
};



const FloatFromRightNoDrag = {
    ...Navigator.SceneConfigs.FloatFromRight,
    gestures: {
        pop: {
            ...Navigator.SceneConfigs.FloatFromBottom.gestures.pop,
            edgeHitWidth: 0,
        },
    },
};

class Feed extends Component {

    constructor(){
        super();
        this.currentRenderScene="";
        this.state={
            renderScene:""
        }
    }

    componentDidMount(){
    }

    setView(deepLinkObject){
        switch(deepLinkObject.type){
            case "TRIP":
                this.getTrip(deepLinkObject.id)
            break;
            case "MOMENT":
                this.navigator.push({
                    id: "tripDetail",
                    momentID:deepLinkObject.id,
                    sceneConfig:"right-nodrag"
                });
            break;
        }
    }

    getTrip(id){
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        let feedRequestURI;
        feedRequestURI=endpoint+version+"/trip/"+id;

        let sherpaResponse;
        let sherpaHeaders = new Headers();
        sherpaHeaders.append("token", this.props.user.sherpaToken);
        var me=this;

        fetch(feedRequestURI,{
            method:'get',
            headers:sherpaHeaders,
            mode: 'cors'
        })
            .then((rawSherpaResponse)=>{
                switch(rawSherpaResponse.status){
                    case 200:
                        return rawSherpaResponse.text()
                        break;
                    case 400:
                        return '{}';
                        break;
                }
            })
            .then((rawSherpaResponseFinal)=>{
                sherpaResponse=JSON.parse(rawSherpaResponseFinal);
                this.navigator.push({
                    id: "trip",
                    trip:sherpaResponse
                });
            });
    }

    renderScene(route, navigator) {
        var sceneContent;
        var showNav=false;

        GoogleAnalytics.trackScreenView(route.id);


        switch (route.id) {
            case 'feed':
                showNav=false;
                sceneContent = <FeedList toggleTabBar={this.props.toggleTabBar}  refreshCurrentScene={this.refreshCurrentScene.bind(this)}  ref={route.id} navigator={navigator} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} navigation={this._getNavigation({routeName:"LATEST TRIPS",hideBack:true,fixedHeader:true,hideNav:true})}/>;
            break;
            case "location":
                showNav=true;
                sceneContent = <FeedLocation version={route.version} ref={route.id} navigator={navigator} location={route.location} isCountry={route.isCountry} navigation={this._getNavigation({navColor:'white',routeName:"GUIDE",fixedHeader:true,hideNav:false})} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "trip":
                showNav=true;
                sceneContent = <FeedTrip toggleTabBar={this.props.toggleTabBar} refreshCurrentScene={this.refreshCurrentScene.bind(this)}  navSettings={{navActionRight:this._navActionRight.bind(this)}} ref={route.id}  navigator={navigator} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "destination":
                showNav=true;
                sceneContent = <FeedDestination ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:route.trip.name,fixedHeader:true})} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "tripDetailMap":
                showNav=true;
                sceneContent = <TripDetailMap isFullscreen={route.isFullscreen} disablePins={route.disablePins} initialRegion={route.initialRegion} regionData={route.regionData} mapType={route.mapType} ref={route.id} navigator={navigator}   navigation={this._getNavigation({routeName:route.title,fixedHeader:true,hideNav:true})} user={this.props.user} momentID={route.momentID} trip={route.trip}  dispatch={this.props.dispatch} />;
            break;
            case "tripDetail":
                showNav=true;
                sceneContent = <TripDetail ref={route.id} navigator={navigator} user={this.props.user} momentID={route.momentID} isSuitcased={route.isSuitcased} trip={route.trip} suitcase={route.suiteCaseTrip} unsuitcase={route.unSuiteCaseTrip} dispatch={this.props.dispatch} />;
            break;
            case "profile":
                showNav=true;
                sceneContent = <FeedProfile ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:'Profile',fixedHeader:true,hideNav:false})} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "suitcase":
                showNav=true;
                sceneContent = <Suitcase ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:"suitcase",hideNav:true,hideBack:true,fixedHeader:true})} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "explore":
                showNav=true;
                sceneContent = <Search ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:route.id,hideNav:true,hideBack:true,fixedHeader:true})} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "own-profile":
                showNav=true;
                sceneContent = <OwnUserProfile refresh={route.refresh} ref={route.id} navigator={navigator}  navigation={this._getNavigation({routeName:"Profile",fixedHeader:true,topLeftImage:require('./../../../../Images/icon-add.png'),topLeftImageStyle:{width:9}})} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "settings":
                showNav=true;
                sceneContent = <Settings ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:"Settings",hideNav:true,fixedHeader:true})} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "addTrip":
                showNav=true;
                sceneContent = <AddTrip images={route.images} tripData={route.tripData} momentData={route.momentData} ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:"Select trip photos",topLeftImage:require('./../../../../Images/icon-close-white.png'),topRightImage:require('./../../../../Images/icon-check-white.png'),fixedHeader:true,navColor:'white'})} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "editTripGrid":
                showNav=true;
                sceneContent = <EditTripGrid images={route.images} ref={route.id} tripData={route.tripData} momentData={route.momentData} navigator={navigator} navigation={this._getNavigation({routeName:"add new trip",topLeftImage:require('./../../../../Images/icon-close-black.png'),topRightImage:require('./../../../../Images/icon-arrow-next.png'),fixedHeader:true,topRightImageStyle:{width:7} })} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "editTripNames":
                showNav=true;
                sceneContent = <EditMomentNames selection={route.selection} ref={route.id} tripData={route.tripData} momentData={route.momentData} navigator={navigator} navigation={this._getNavigation({routeName:"add location names",topLeftImage:require('./../../../../Images/icon-arrow-back.png'),topRightImage:require('./../../../../Images/icon-arrow-next.png'),fixedHeader:true,topRightImageStyle:{width:7} })} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "editTripName":
                showNav=true;
                sceneContent = <EditTripName selection={route.selection}  refreshCurrentScene={this.refreshCurrentScene.bind(this)} ref={route.id} tripData={route.tripData} momentData={route.momentData} navigator={navigator} headerProgress={this.props.headerProgress} navigation={this._getNavigation({routeName:"edit trip name",topLeftImage:require('./../../../../Images/icon-arrow-back.png'),fixedHeader:true,hideNav:true })} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "profile-settings":
                sceneContent = <ProfileSettings ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:"settings",opaque:true,topLeftImage:require('./../../../../Images/icon-close-black.png'),fixedHeader:true,hideNav:true })} {...this.props}/>;
            break;
        }

        return sceneContent;
    }

    reset(){
        if(!this.navigator)return;
        if(this.navigator.getCurrentRoutes().length==1){
            this.navigator.refs[this.currentRenderScene].reset()
        }else{
            this.navigator.popToTop();
            this.currentRenderScene=this.props.initial;
        }
    }

    _navActionRight(){
        if(this.navigator.refs[this.currentRenderScene].navActionRight)this.navigator.refs[this.currentRenderScene].navActionRight();
    }

    _navActionLeft(){
        if(this.navigator.refs[this.currentRenderScene].navActionLeft){
            this.navigator.refs[this.currentRenderScene].navActionLeft();
        }else{
            this.navigator.pop();
        }
    }

    _getNavigation(settings){

        var defaultNav=<Header ref="navStatic" goBack={this._navActionLeft.bind(this)} navActionRight={this._navActionRight.bind(this)} settings={settings}></Header>;
        if(settings.fixedHeader){
            return{
                'default': defaultNav,
                'fixed': <Header type="fixed" ref="navFixed" goBack={this._navActionLeft.bind(this)} navActionRight={this._navActionRight.bind(this)} settings={settings}></Header>
            }
        }else{
            return defaultNav
        }

    }

    sceneDidEnter(route){
        this.sceneChange(route);
        if(this.navigator&&this.navigator.refs[this.currentRenderScene]&&this.navigator.refs[this.currentRenderScene].onDidEnter){
            this.navigator.refs[this.currentRenderScene].onDidEnter();
        }
    }

    sceneChange(route){


        if(this.currentRenderScene!==route.id||route.toggleTabBar){
            this.currentRenderScene=route.id;
            this.props.toggleTabBar(!route.hideNav);
        }

        this.currentRenderScene=route.id;
        this.refreshCurrentScene()
    }

     refreshCurrentScene(){
         //console.log('try refresh current scene',this.navigator.refs[this.currentRenderScene]);
        if(this.navigator&&this.navigator.refs[this.currentRenderScene]&&this.navigator.refs[this.currentRenderScene].refreshCurrentScene){
            //console.log('::refrsh current scene from feed')
            this.navigator.refs[this.currentRenderScene].refreshCurrentScene();
        }
    }

    render() {
        return (
                <Navigator
                    sceneStyle={styles.container}
                    ref={(navigator) => { this.navigator = navigator; }}
                    renderScene={this.renderScene.bind(this)}
                    onDidFocus={this.sceneDidEnter.bind(this)}
                    onWillFocus={this.sceneChange.bind(this)}
                    configureScene={(route) => {

                            switch(route.sceneConfig){
                                case "bottom-nodrag":
                                    return FloatFromBottomNoDrag
                                break;
                                case "bottom":
                                    return FloatFromBottom
                                break;
                                case "right-nodrag":
                                    return FloatFromRightNoDrag
                                break;
                                default:
                                    return FloatFromRight
                            }
                    }}
                    initialRoute={{
                      id:this.props.initial,
                      index:0
                    }}
                />
        );

    }

}



export default Feed;