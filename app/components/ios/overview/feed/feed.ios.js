'use strict';

import React from 'react-native';
import FeedList from './feed.list.ios';
import FeedProfile from './feed.profile.ios';
import FeedDestination from './feed.destination.ios';
import FeedLocation from './feed.location.ios';
import FeedTrip from './feed.trip.ios';
import TripDetail from './feed.trip.detail.ios';
import OwnUserProfile from './../profile/feed.own-profile.ios'
import Suitcase from './../suitcase/feed.suitcase.ios'
import Search from './../explore/feed.search.ios'
import Navigation from '../../components/navigation'

import { connect } from 'react-redux';
import {loadFeed,udpateFeedState} from '../../../../actions/feed.actions';
import {updateTab} from '../../../../actions/app.actions';
import GoogleAnalytics from 'react-native-google-analytics-bridge';

var {
    StyleSheet,
    Navigator,
    Component,
    View
} = React;

class Feed extends Component {

    constructor(){
        super();
        this.currentRenderScene="";
    }

    componentDidMount(){
        //check if deeplinking, if yes, request data for deep
    }

    setView(deepLinkObject){
        switch(deepLinkObject.type){
            case "TRIP":
            break;
            case "PROFILE":
            break;
            case "MOMENT":
            break;
            case "PROFILE":
            break;
        }
    }

    renderScene(route, navigator) {
        var sceneContent;
        var showNav=false;

        GoogleAnalytics.trackScreenView(route.id)

        switch (route.id) {
            case 'feed':
                showNav=false;
                sceneContent = <FeedList ref={route.id} navigator={navigator} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "location":
                showNav=true;
                sceneContent = <FeedLocation ref={route.id} navigator={navigator} location={route.location} isCountry={route.isCountry} navigation={this._getNavigation("black",route.id,false,false,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "trip":
                showNav=true;
                sceneContent = <FeedTrip ref={route.id}  navigator={navigator} navigation={this._getNavigation("white",route.id+" TO "+route.trip.name,false,false,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "destination":
                showNav=true;
                sceneContent = <FeedDestination ref={route.id} navigator={navigator} navigation={this._getNavigation("white","suitcase",false,false,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "profile":
                showNav=true;
                sceneContent = <FeedProfile ref={route.id} navigator={navigator} navigation={this._getNavigation("black",route.id,false,true,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
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
                sceneContent = <TripDetail ref={route.id} navigator={navigator} navigation={this._getNavigation("black",route.tripDetails.trip.venue,false,false,true,true)} tripDetails={route.tripDetails} dispatch={this.props.dispatch} />;
            break;
        }

        this.currentRenderScene=route.id;
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


    _getNavigation(color,routeName,hideBack,opaque,fixedHeader,hideNav){
        if(fixedHeader){
            return{
                'default': <Navigation hideNav={hideNav} ref="navStatic" color={color} routeName={routeName} hideBack={hideBack} opaque={opaque} goBack={this._goBack.bind(this)}  toggleNav={this._toggleNav.bind(this)}></Navigation>,
                'fixed': <Navigation hideNav={hideNav} type="fixed" ref="navFixed" color="black" routeName={routeName} hideBack={hideBack} opaque={true}  goBack={this._goBack.bind(this)} toggleNav={this._toggleNav.bind(this)}></Navigation>
            }
        }else{
            return <Navigation hideNav={hideNav} ref="nav-static" color={color} routeName={routeName} hideBack={hideBack} opaque={opaque}  goBack={this._goBack.bind(this)} toggleNav={this._toggleNav.bind(this)}></Navigation>
        }
    }

    _goBack(){
        this.navigator.pop();
        this.props.dispatch(udpateFeedState("reset"));
    }


    render() {
        return (
            <View style={{flex:1}}>

                <Navigator
                    sceneStyle={styles.container}
                    ref={(navigator) => { this.navigator = navigator; }}
                    renderScene={this.renderScene.bind(this)}
                    configureScene={(route) => ({
                      ...Navigator.SceneConfigs.PushFromRight,
                      gestures: route.gestures
                    })}
                    initialRoute={{
                      id:this.props.initial,
                      index:0
                    }}
                />
            </View>
        );
    }
}

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

export default Feed;