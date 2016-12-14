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
import React, { Component } from 'react';
const SCREEN_WIDTH = require('Dimensions').get('window').width;
import HeaderProgress from '../components/headerProgress'
import {
    Animated,
    StyleSheet,
    View,
    StatusBar,
    Image,
    PushNotificationIOS,
    NetInfo,
    Alert
} from 'react-native';


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
    },
    tabBarHeight:{height: 60},
    tabBarShadow:{width:SCREEN_WIDTH,height:30,left:0,marginBottom:55}

});

StatusBar.setHidden(true);

class Overview extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedTab: FEED,
            notifCount: 0,
            presses: 0,
            bottomOffset:new Animated.Value(0)
        };
    }

    componentDidMount(){
        this.props.dispatch(updateTab(this.state.selectedTab));
        NotificationsIOS.addEventListener('notificationOpened', this._onNotificationOpened.bind(this));
        NotificationsIOS.consumeBackgroundQueue();
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
        NetInfo.fetch().done(this.handleFirstConnectivityChange);
        NetInfo.addEventListener(
            'change',
            this.handleFirstConnectivityChange
        );
        //this.refs[this.state.selectedTab].setView({type:'TRIP',id:1231})
        //this.refs[this.state.selectedTab].setView({type:'MOMENT',id:133276})
    }

    handleFirstConnectivityChange(reach) {
        if(reach=='none'){
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

    toggleTabBar(enable){
        //console.log('toggle tab')
        Animated.timing(this.state.bottomOffset, {
            duration: 200,
            toValue: enable? 0 : -100
        }).start()
    }

    render() {
        var tabBar =    <TabNavigator tabBarStyle={[styles.tabBarHeight,{bottom:this.state.bottomOffset}]}  sceneStyle={{paddingBottom:0}}>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === PROFILE}
                                renderIcon={() => <Image source={require('./../../../Images/icon-profil.png')} />}
                                onPress={()=>this.updateTabTo(PROFILE)}>
                                <Feed toggleTabBar={this.toggleTabBar.bind(this)} initial={PROFILE} headerProgress={this.refs.headerProgress} ref={PROFILE} {...this.props}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === FEED}
                                renderIcon={() => <Image style={{width:19,height:22,marginBottom:-.5}} source={require('./../../../Images/explore-icon.png')} />}
                                onPress={()=>this.updateTabTo(FEED)}>
                                <Feed toggleTabBar={this.toggleTabBar.bind(this)} initial={FEED} headerProgress={this.refs.headerProgress} ref={FEED} {...this.props}/>
                            </TabNavigator.Item>
                            {/*<TabNavigator.Item
                                selected={this.state.selectedTab === EXPLORE}
                                renderIcon={() => <Image source={require('./../../../Images/icon-explore.png')} />}
                                onPress={()=>this.updateTabTo(EXPLORE)}>
                                <Feed toggleTabBar={this.toggleTabBar.bind(this)} initial={EXPLORE} headerProgress={this.refs.headerProgress} ref={EXPLORE} {...this.props}/>
                            </TabNavigator.Item>*/}
                            <TabNavigator.Item
                                selected={this.state.selectedTab === SUITCASE}
                                renderIcon={() => <Image source={require('./../../../Images/icon-suitcase.png')} />}
                                onPress={()=>this.updateTabTo(SUITCASE)}>
                                <Feed toggleTabBar={this.toggleTabBar.bind(this)} initial={SUITCASE} headerProgress={this.refs.headerProgress} ref={SUITCASE} {...this.props}/>
                            </TabNavigator.Item>
                        </TabNavigator>

        return (

            <View style={{flex:1}}>
                <Animated.View style={{position:'absolute',bottom:this.state.bottomOffset}}>
                    <Image source={require('./../../../Images/navbar_dropshadow.png')} resizeMode="contain" style={styles.tabBarShadow}></Image>
                </Animated.View>
                {tabBar}
                <HeaderProgress ref="headerProgress"></HeaderProgress>
            </View>
        );
    }
}




export default Overview;