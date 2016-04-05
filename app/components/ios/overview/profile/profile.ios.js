'use strict';

import React from 'react-native';
import FeedList from './../feed/feed.list.ios';
import UserProfile from './profile.feed.ios';
import FeedLocation from './../feed/feed.location.ios';
import FeedTrip from './../feed/feed.trip.ios';

import { connect } from 'react-redux/native';
import {loadFeed,udpateFeedState} from '../../../../actions/feed.actions';


var {
    StyleSheet,
    Navigator,
    Component,
    Text,
    TouchableHighlight,
    View,
    Image
    } = React;

class ProfileNavigator extends Component {
    renderScene(route, navigator) {
        var sceneContent;
        var showNav=false;
        var navColor="white";

        switch (route.id) {
            case "location":
                showNav=true;
                sceneContent = <FeedLocation navigator={navigator} navigation={this._getNavigation("black",route,navigator)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "trip":
                navColor="white";
                showNav=true;
                sceneContent = <FeedTrip navigator={navigator} navigation={this._getNavigation("white",route,navigator)} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "profile":
                navColor="black";
                showNav=true;
                sceneContent = <UserProfile navigator={navigator} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
        }

        return sceneContent;
    }


    _getNavigation(color,route,navigator){
        var arrowImage=color==="black"?require("image!nav-arrow-black"):require("image!nav-arrow-white");
        var dotsImage=color==="black"?require('image!nav-dots-black'):require('image!nav-dots-white');
        return(
            <View ref="navigation" style={{top:0,left:0,flexDirection:"row",width:380,flex:1,alignItems:"center",justifyContent:"space-between",right:0,backgroundColor:'transparent',height:70,position:"absolute"}}>
                <TouchableHighlight  style={{padding:20,marginLeft:5,top:0}} onPress={
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
                <Text style={{color:color,fontSize:14,  marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{route.id.toUpperCase()}</Text>
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
                  id:"profile",
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
        feed: state.feedReducer
    };
}


export default connect(select)(ProfileNavigator);