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

import { connect } from 'react-redux/native';
import {loadFeed,udpateFeedState} from '../../../../actions/feed.actions';
import {updateTab} from '../../../../actions/app.actions';
import GoogleAnalytics from 'react-native-google-analytics-bridge';


var {
    StyleSheet,
    Navigator,
    Component,
    Text,
    TouchableHighlight,
    View,
    Image
} = React;

class Feed extends Component {

    constructor(){
        super();
    }

    componentDidMount(){
    }

    renderScene(route, navigator) {
        var sceneContent;
        var showNav=false;

        GoogleAnalytics.trackScreenView(route.id)

        switch (route.id) {
            case 'feed':
                showNav=false;
                sceneContent = <FeedList navigator={navigator} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "location":
                showNav=true;
                sceneContent = <FeedLocation navigator={navigator} location={route.location} navigation={this._getNavigation("black",route.id,navigator)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "trip":
                showNav=true;
                sceneContent = <FeedTrip navigator={navigator} navigation={this._getNavigation("white",route.id,navigator)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "destination":
                showNav=true;
                sceneContent = <FeedDestination navigator={navigator} navigation={this._getNavigation("white","suitcase",navigator)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "profile":
                showNav=true;
                sceneContent = <FeedProfile navigator={navigator} navigation={this._getNavigation("black",route.id,navigator)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "own-profile":
                showNav=true;
                sceneContent = <OwnUserProfile navigator={navigator}  navigation={this._getNavigation("black","profile",navigator,true,true)}  feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "suitcase":
                showNav=true;
                sceneContent = <Suitcase  navigator={navigator} navigation={this._getNavigation("black",route.id,navigator,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "explore":
                showNav=true;
                sceneContent = <Search  navigator={navigator} navigation={this._getNavigation("black",route.id,navigator,true)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "tripDetail":
                showNav=true;
                sceneContent = <TripDetail  navigator={navigator} navigation={this._getNavigation("black",route.tripDetails.trip.venue,navigator)} tripDetails={route.tripDetails} dispatch={this.props.dispatch} />;
            break;
        }
        return sceneContent;
    }

    reset(){
    }

    _getNavigation(color,routeName,navigator,hideBack,opaque){
        var arrowImage=color==="black"?require("image!nav-arrow-black"):require("image!nav-arrow-white");
        var dotsImage=color==="black"?require('image!nav-dots-black'):require('image!nav-dots-white');
        return(
            <View ref="navigation" style={{top:0,left:0,flexDirection:"row",width:380,flex:1,alignItems:"center",justifyContent:"space-between",right:0,backgroundColor:opaque?'white':'transparent',height:70,position:"absolute"}}>
                <TouchableHighlight underlayColor="rgba(255,255,255,.1)" style={{padding:20,marginLeft:5,top:0,opacity:hideBack?0:1}} onPress={
                    () => {
                        navigator.pop();
                        this.props.dispatch(udpateFeedState("reset"));
                    }
                }>
                    <Image
                        style={{width:11,height:11,backgroundColor:'transparent'}}
                        source={arrowImage}
                        resizeMode="contain"
                    ></Image>
                </TouchableHighlight>
                <Text style={{color:color,fontSize:14,  marginLeft:-8,marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{routeName.toUpperCase()}</Text>
                <TouchableHighlight style={{padding:5,marginRight:25}}>
                    <Image
                        style={{width:11,height:13,backgroundColor:'transparent'}}
                        source={dotsImage}
                        resizeMode="contain"
                    ></Image>
                </TouchableHighlight>
            </View>
        )
    }
    render() {
        return (
            <Navigator
                sceneStyle={styles.container}
                ref={(navigator) => { this.navigator = navigator; }}
                renderScene={this.renderScene.bind(this)}
                configureScene={(route) => ({
                  ...route.sceneConfig || Navigator.SceneConfigs.FloatFromRight,
                  gestures: route.gestures
                })}
                initialRoute={{
                  id:this.props.initial,
                  index:0
                }}
            />
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


function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer,
        app: state.appReducer
    };
}


export default connect(select)(Feed);