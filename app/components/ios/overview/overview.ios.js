/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
/* @flow */
'use strict';
'use babel';
import Feed from './feed/feed.ios';
import {udpateFeedState} from '../../../actions/feed.actions';
import {updateTab} from '../../../actions/app.actions';
import { connect } from 'react-redux';
import TabNavigator from 'react-native-tab-navigator';
import NotificationsIOS from 'react-native-notifications';

import {
    StyleSheet,
    View,
    StatusBar,
    Image,
    PushNotificationIOS,
    NetInfo,
    Alert
} from 'react-native';
import React, { Component } from 'react';



const EXPLORE="explore";
const FEED="feed";
const PROFILE="own-profile";
const SUITCASE="suitcase";

var styles=StyleSheet.create({
    container:{
        flex:1
    },
    tabContent: {
        flex: 1,
        alignItems: 'center'
    },
    tabText: {
        color: 'black',
        margin: 50,
        fontSize:35
    },
    tabBar:{
        height:100,
        flex:1,
        alignItems: 'center'
    },
    logo:{
        width:85,
        marginTop:30,
        marginBottom:30
    }
});

StatusBar.setHidden(true);

class Overview extends React.Component {
    constructor(props) {
        super();
        this.state = {
            selectedTab: FEED,
            notifCount: 0,
            presses: 0
        };

        this.myFeed=null;
        console.log('props constructor ++',props);

    }

    componentDidMount(){
        this.props.dispatch(updateTab(this.state.selectedTab));
        NotificationsIOS.addEventListener('notificationOpened', this._onNotificationOpened.bind(this));
        NotificationsIOS.consumeBackgroundQueue();

        //this.setState({selectedTab:FEED,selectedView:{"type":"TRIP",id:22164}});
        //this.setState({selectedTab:PROFILE,selectedView:{"type":"PROFILE",id:1233}});
        PushNotificationIOS.setApplicationIconBadgeNumber(0);

        NetInfo.fetch().done(this.handleFirstConnectivityChange);

        NetInfo.addEventListener(
            'change',
            this.handleFirstConnectivityChange
        );


    }

    handleFirstConnectivityChange(reach) {
        if(reach=='none'){
            // Works on both iOS and Android
            Alert.alert(
                'No internet connection',
                "Please verify your connection and try again.",
                [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                ]
            )
        }
    }

    componentDidUpdate(prevProps,prevState){

        if(this.state.selectedTab!==prevState.selectedTab){
            this.props.dispatch(udpateFeedState("reset"));
            this.props.dispatch(updateTab(this.state.selectedTab));
        }

        if(this.state.selectedView!==prevState.selectedView){
            this.refs[this.state.selectedTab].setView(this.state.selectedView)
        }

    }

    updateTabTo(target){
        if(this.state.selectedTab===target)this.refs[target].reset();
        this.setState({ selectedTab: target });
    }


    _onNotificationOpened(notification) {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
        var deepLinkObject=notification.getData();
        this.setState({selectedTab:FEED,selectedView:deepLinkObject});
    }

    render() {
        var tabBar =    <TabNavigator  tabBarStyle={{ height: 60}} container={{height:60}}>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === FEED}
                                renderIcon={() => <Image source={require('./../../../images/icon-feed.png')} />}
                                onPress={()=>this.updateTabTo(FEED)}>
                                <Feed initial={FEED} ref={FEED} {...this.props}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === EXPLORE}
                                renderIcon={() => <Image source={require('./../../../images/icon-explore.png')} />}
                                onPress={()=>this.updateTabTo(EXPLORE)}>
                                <Feed initial={EXPLORE} ref={EXPLORE} {...this.props}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === PROFILE}
                                renderIcon={() => <Image source={require('./../../../images/icon-profil.png')} />}
                                onPress={()=>this.updateTabTo(PROFILE)}>
                                <Feed initial={PROFILE} ref={PROFILE} {...this.props}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === SUITCASE}
                                renderIcon={() => <Image source={require('./../../../images/icon-suitcase.png')} />}
                                onPress={()=>this.updateTabTo(SUITCASE)}>
                                <Feed initial={SUITCASE} ref={SUITCASE} {...this.props}/>
                            </TabNavigator.Item>
                        </TabNavigator>

        return (

            <View style={{flex:1}}>
                {tabBar}
                <Image source={require('./../../../images/navbar_dropshadow.png')} resizeMode="contain" style={{width:375,height:30,left:0,bottom:55,position:'absolute'}}></Image>
            </View>
        );
    }
}




export default Overview;