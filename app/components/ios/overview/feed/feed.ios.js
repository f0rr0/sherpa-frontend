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

import { connect } from 'react-redux';
import {loadFeed,udpateFeedState} from '../../../../actions/feed.actions';
import {updateTab} from '../../../../actions/app.actions';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import config from "../../../../data/config"
const {sherpa}=config.auth[config.environment];
const SCREEN_WIDTH = require('Dimensions').get('window').width;


import {
    StyleSheet,
    Navigator,
    View
} from 'react-native';
import React, { Component } from 'react';


var styles = StyleSheet.create({
    container: {
        flex: 1
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

class Feed extends Component {

    constructor(){
        super();
        this.currentRenderScene="";
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
                    momentID:deepLinkObject.id
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

        //console.log('go to ',route);
        this.currentRenderScene=route.id;

        switch (route.id) {
            case 'feed':
                showNav=false;
                sceneContent = <FeedList ref={route.id} navigator={navigator} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} navigation={this._getNavigation("black","LATEST TRIPS",true,true,true,true)}/>;
                break;
            case "location":
                showNav=true;
                sceneContent = <FeedLocation ref={route.id} navigator={navigator} location={route.location} isCountry={route.isCountry} navigation={this._getNavigation("black",route.id,false,false,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "trip":
                showNav=true;
                //route.id+" TO "+route.trip.name
                sceneContent = <FeedTrip navSettings={{toggleNav:this._toggleNav.bind(this),color:'white',hideBack:false,opaque:false,hideNav:false,topShadow:true}} ref={route.id}  navigator={navigator} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "destination":
                showNav=true;
                sceneContent = <FeedDestination ref={route.id} navigator={navigator} navigation={this._getNavigation("white","suitcase",false,false,true,false,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "profile":
                showNav=true;
                sceneContent = <FeedProfile ref={route.id} navigator={navigator} navigation={this._getNavigation("black",route.id,false,true,true,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "own-profile":
                showNav=true;
                sceneContent = <OwnUserProfile ref={route.id} navigator={navigator}  navigation={this._getNavigation("black","YOUR PROFILE",true,true,true)}  feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "suitcase":
                showNav=true;
                sceneContent = <Suitcase ref={route.id} navigator={navigator} navigation={this._getNavigation("black","YOUR SUITCASE",true,true,true,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
                break;
            case "explore":
                showNav=true;
                sceneContent = <Search ref={route.id} navigator={navigator} navigation={this._getNavigation("black",route.id,true,false,true,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
                break;
            case "tripDetail":
                showNav=true;
                sceneContent = <TripDetail ref={route.id} navigator={navigator}  navSettings={{toggleNav:this._toggleNav.bind(this),color:'white',hideBack:false,opaque:false,hideNav:false,topShadow:true}} user={this.props.user} momentID={route.momentID} trip={route.trip} suitcase={route.suitcase} unsuitcase={route.unsuitcase} dispatch={this.props.dispatch} />;
                break;
            case "profile-settings":
                sceneContent =  <ProfileSettings ref={route.id} navigator={navigator} navigation={this._getNavigation("black", "SETTINGS",false,true,true,true)} {...this.props}/>;
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
        }
    }

    _toggleNav(){
        if(this.navigator.refs[this.currentRenderScene].toggleNav)this.navigator.refs[this.currentRenderScene].toggleNav();
    }


    _updateRouteName(routeName){
        //console.log(this.refs);
        if(this.refs.navFixed)this.refs.navFixed.updateRouteName(routeName);
        if(this.refs.navStatic)this.refs.navStatic.updateRouteName(routeName);
    }

    _getNavigation(color,routeName,hideBack,opaque,fixedHeader,hideNav,topShadow){
        var defaultNav=<Header hideNav={hideNav} topShadow={topShadow} ref="navStatic" color={color} routeName={routeName} hideBack={hideBack} opaque={opaque} goBack={this._goBack.bind(this)}  toggleNav={this._toggleNav.bind(this)}></Header>;
        if(fixedHeader){
            return{
                'default': defaultNav,
                'fixed': <Header hideNav={hideNav} type="fixed" ref="navFixed" color="black" routeName={routeName} hideBack={hideBack} opaque={true}  goBack={this._goBack.bind(this)} toggleNav={this._toggleNav.bind(this)}></Header>
            }
        }else{
            return defaultNav
        }

    }

    _goBack(){
        this.navigator.pop();
    }


    render() {
        //console.log('render route',this.props.initial);
        return (
            <View style={{flex:1}}>

                <Navigator
                    sceneStyle={styles.container}
                    ref={(navigator) => { this.navigator = navigator; }}
                    renderScene={this.renderScene.bind(this)}
                    //configureScene={(route) => ({
                    //  ...Navigator.SceneConfigs.PushFromRight
                    //})}
                    configureScene={() => FloatFromRight}
                    initialRoute={{
                      id:this.props.initial,
                      index:0
                    }}
                />
            </View>
        );
    }
}



export default Feed;