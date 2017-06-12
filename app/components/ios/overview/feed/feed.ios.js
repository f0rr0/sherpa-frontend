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
import Header from '../../components/header'
import AddTrip from '../profile/profile.add-trip'
import FeedNotifications from '../notifications/feed.notifications'
import EditTripGrid from '../profile/profile.edit-trip-grid'
import EditMomentNames from '../profile/profile.edit-moment-names'
import EditTripName from '../profile/profile.edit-trip.name'
import FollowerList from '../feed/feed.followers.ios'
import TripDetailMap from '../feed/feed.trip.detail.map.ios'
import {checkOptedIn,updateUserData} from '../../../../actions/user.actions';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
const SCREEN_WIDTH = require('Dimensions').get('window').width;
import {
    StyleSheet,
} from 'react-native';
import {Navigator} from 'react-native-deprecated-custom-components';
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

const NoBackSwipe ={
    ...Navigator.SceneConfigs.HorizontalSwipeJump,
    gestures: {
        pop: {},
    },
};

class Feed extends Component {

    constructor(){
        super();
        this.currentRenderScene="";
        this.state={
            renderScene:""
        }

        this.navigatorEnabled=true;
    }

    componentDidMount(){
        checkOptedIn().then((res)=>{
            this.props.dispatch(updateUserData({scrapeFromInstagram:res.optedIn}));
        })
    }


    showUserProfile(user) {
        this.navigator.push({
            id: "profile",
            data: {owner: {id:user,user}}
        });
    }

    showTrip(tripID){
        this.navigator.push({
            id: "trip",
            data:{id:tripID}
        });
    }

    setView(deepLinkObject){
        let data = deepLinkObject.v1.linkView;
        let id;
        if(data.trip){
            id="trip"
        }else if(data.moment){
            id="tripDetail";
        }else{
            id=data.id
        }

        switch(id){
            case "profile":
                this.showUserProfile(data.target);
                break;
            case "trip":
                this.showTrip(data.target);
                break;
            default:
                this.navigator.push({
                    id: data.id,
                    data:data.target
                });
            break;
        }
    }


    renderScene(route, navigator) {
        var sceneContent;
        var showNav=false;

        //console.log('render scene',route);

        GoogleAnalytics.trackScreenView(route.id);


        switch (route.id) {
            case 'feed':
                showNav=false;
                sceneContent = <FeedList updateTabTo={this.props.updateTabTo} enableNavigator={this.enableNavigator.bind(this)} toggleTabBar={this.props.toggleTabBar}  refreshCurrentScene={this.refreshCurrentScene.bind(this)}  ref={route.id} navigator={navigator} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} navigation={this._getNavigation({routeName:"LATEST TRIPS",hideBack:true,fixedHeader:true,hideNav:true})}/>;
            break;
            case "follower-list":
                showNav=true;
                sceneContent = <FollowerList user={this.props.user} profile={route.profile} followerType={route.followerType}  enableNavigator={this.enableNavigator.bind(this)} toggleTabBar={this.props.toggleTabBar} refreshCurrentScene={this.refreshCurrentScene.bind(this)}  navSettings={{navActionRight:this._navActionRight.bind(this)}} ref={route.id}  navigator={navigator} dispatch={this.props.dispatch}/>;
            break;
            case "location":
                showNav=true;
                sceneContent = <FeedLocation fromSearch={route.fromSearch} enableNavigator={this.enableNavigator.bind(this)} version={route.version} ref={route.id} navigator={navigator} location={route.data} isCountry={route.isCountry} navigation={{navColor:'white',routeName:"GUIDE",fixedHeader:true,hideNav:false}} trip={route.data} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "trip":
                showNav=true;
                sceneContent = <FeedTrip updateTabTo={this.props.updateTabTo} enableNavigator={this.enableNavigator.bind(this)} toggleTabBar={this.props.toggleTabBar} refreshCurrentScene={this.refreshCurrentScene.bind(this)}  navSettings={{navActionRight:this._navActionRight.bind(this)}} ref={route.id}  navigator={navigator} trip={route.data} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "destination":
                showNav=true;
                sceneContent = <FeedDestination enableNavigator={this.enableNavigator.bind(this)} ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:route.data.name, routeDescription:" SUITCASE",fixedHeader:true})} trip={route.data} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "tripDetailMap":
                showNav=true;
                sceneContent = <TripDetailMap enableNavigator={this.enableNavigator.bind(this)} tripID={route.tripID} profileID={route.profileID} isFullscreen={route.isFullscreen} disablePins={route.disablePins} initialRegion={route.initialRegion} regionData={route.regionData} mapType={route.mapType} ref={route.id} navigator={navigator}   navigation={this._getNavigation({routeName:route.title,fixedHeader:true,hideNav:true})} user={this.props.user} momentID={route.momentID} trip={route.trip}  dispatch={this.props.dispatch} />;
            break;
            case "tripDetail":
            case "momentDetail":
                showNav=true;
                sceneContent = <TripDetail updateTabTo={this.props.updateTabTo} enableNavigator={this.enableNavigator.bind(this)} ref={route.id} navigator={navigator} user={this.props.user} momentID={route.data} isSuitcased={route.isSuitcased} trip={route.trip} suitcase={route.suiteCaseTrip} unsuitcase={route.unSuiteCaseTrip} dispatch={this.props.dispatch} />;
            break;
            case "notifications":
                showNav=true;
                sceneContent= <FeedNotifications  updateTabTo={this.props.updateTabTo} navigator={navigator}  enableNavigator={this.enableNavigator.bind(this)} ref={route.id}  feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}></FeedNotifications>
            break;
            case "profile":
                showNav=true;
                sceneContent = <FeedProfile enableNavigator={this.enableNavigator.bind(this)} ref={route.id} navigator={navigator} navigation={{routeName:'Profile',fixedHeader:true,hideNav:false}} trip={route.data} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "suitcase":
                showNav=true;
                sceneContent = <Suitcase updateTabTo={this.props.updateTabTo}  enableNavigator={this.enableNavigator.bind(this)} ref={route.id} navigator={navigator} navigation={this._getNavigation({routeName:"suitcase",hideNav:true,hideBack:true,fixedHeader:true})} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "explore":
                showNav=true;
            case "own-profile":
                showNav=true;
                sceneContent = <OwnUserProfile enableNavigator={this.enableNavigator.bind(this)} refresh={route.refresh} ref={route.id} navigator={navigator}  navigation={{routeName:"Profile",fixedHeader:true,topLeftImage:require('./../../../../Images/icons/plus.png'),topLeftImageStyle:{width:9}}} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "addTrip":
                showNav=true;
                sceneContent = <AddTrip type={route.type} enableNavigator={this.enableNavigator.bind(this)} images={route.images} tripData={route.tripData} momentData={route.momentData} deselectedMomentIDs={route.deselectedMomentIDs} ref={route.id} navigator={navigator} navigation={{routeName:route.title||"add guide photos",topLeftImage:require('./../../../../Images/icon-close-white.png'),topRightImage:require('./../../../../Images/icon-check-white.png'),fixedHeader:true,navColor:'white'}} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "editTripGrid":
                showNav=true;
                sceneContent = <EditTripGrid deselectedMomentIDs={route.deselectedMomentIDs} type={route.type} ref={route.id} tripData={route.tripData} intent={route.intent} momentData={route.momentData} navigator={navigator} navigation={this._getNavigation({routeName:route.name||"select guide photos",topLeftImage:require('./../../../../Images/icon-close-black.png'),topRightImage:require('./../../../../Images/icon-check-white.png'),fixedHeader:true})} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "editTripNames":
                showNav=true;
                sceneContent = <EditMomentNames type={route.type} ref={route.id}  tripData={route.tripData} intent={route.intent} deselectedMomentIDs={route.deselectedMomentIDs} momentData={route.momentData} navigator={navigator} navigation={this._getNavigation({routeName:"edit locations",topLeftImage:require('./../../../../Images/icon-arrow-back.png'),topRightImage:require('./../../../../Images/icon-check-white.png'),fixedHeader:true })} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "editTripName":
                showNav=true;
                sceneContent = <EditTripName type={route.type} momentData={route.momentData} tripData={route.tripData} deselectedMomentIDs={route.deselectedMomentIDs} intent={route.intent} refreshCurrentScene={this.refreshCurrentScene.bind(this)} ref={route.id} navigator={navigator} headerProgress={this.props.headerProgress} navigation={this._getNavigation({routeName:"edit guide name",topLeftImage:require('./../../../../Images/icon-arrow-back.png'),topRightImage:require('./../../../../Images/icon-check-white.png'),fixedHeader:true,hideNav:false })} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "editMomentName":
                showNav=true;
                sceneContent = <EditMomentNames type={route.type} ref={route.id}  tripData={route.tripData} intent={route.intent} deselectedMomentIDs={route.deselectedMomentIDs} momentData={route.momentData} navigator={navigator} navigation={this._getNavigation({routeName:"edit location name",topLeftImage:require('./../../../../Images/icon-close-black.png'),fixedHeader:true,topRightImageStyle:{width:7} ,hideNav:true})} user={this.props.user} dispatch={this.props.dispatch} />;
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
        //console.log(this.currentRenderScene,' +++ current render scene ');
        if(this.navigator.refs[this.currentRenderScene]&&this.navigator.refs[this.currentRenderScene].navActionLeft){
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
        //console.log('did enter')
        if(this.navigator&&this.navigator.refs[this.currentRenderScene]&&this.navigator.refs[this.currentRenderScene].onDidEnter){
            this.navigator.refs[this.currentRenderScene].onDidEnter();
        }
    }

    sceneChange(route){
        //console.log('scen change')
        if(this.currentRenderScene!==route.id||route.toggleTabBar){
            this.currentRenderScene=route.id;
            this.props.toggleTabBar(!route.hideNav);
        }

        this.currentRenderScene=route.id;
        this.refreshCurrentScene()
    }

     refreshCurrentScene(){
        if(this.navigator&&this.navigator.refs[this.currentRenderScene]&&this.navigator.refs[this.currentRenderScene].refreshCurrentScene){
            this.navigator.refs[this.currentRenderScene].refreshCurrentScene();
        }
    }

    enableNavigator(enableNavigator,ignoreTabBar){
        if(!ignoreTabBar){
            this.navigatorEnabled=enableNavigator;
            this.navigator.immediatelyResetRouteStack(this.navigator.getCurrentRoutes())
            this.props.toggleTabBar(this.navigatorEnabled)
        }
    }

    configureScene(route){
        let transitionType=route.sceneConfig;
        if(!this.navigatorEnabled){
            if(transitionType=='right')transitionType='right-nodrag';
        }

        switch(transitionType){
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
    }

    render() {
        return (
                <Navigator
                    sceneStyle= {{flex: 1,backgroundColor:'white'}}
                    ref={(navigator) => { this.navigator = navigator; }}
                    renderScene={this.renderScene.bind(this)}
                    onDidFocus={this.sceneDidEnter.bind(this)}
                    onWillFocus={this.sceneChange.bind(this)}
                    configureScene={this.configureScene.bind(this)}
                    initialRoute={{
                      id:this.props.initial,
                      index:0
                    }}
                />
        );

    }

}



export default Feed;