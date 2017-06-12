/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
/* @flow */
'use strict';
'use babel';
import Feed from "./feed/feed.ios";
import {udpateFeedState} from "../../../actions/feed.actions";
import {updateNotificationCount} from "../../../actions/user.actions";
import {updateTab} from "../../../actions/app.actions";

import TabNavigator from "react-native-tab-navigator";
import NotificationsIOS from "react-native-notifications";
import React from "react";
import HeaderProgress from "../components/headerProgress";
import {Alert, Animated, Image, NetInfo, StatusBar, StyleSheet, Text, View} from "react-native";
const SCREEN_WIDTH = require('Dimensions').get('window').width;


const FEED="feed";
const PROFILE="own-profile";
const SUITCASE="suitcase";
const NOTIFICATIONS="notifications";

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
            presses: 0,
            bottomOffset:new Animated.Value(0),
            ready:false
        };
    }

    componentDidMount(){
        this.props.dispatch(updateTab(this.state.selectedTab));
        NotificationsIOS.addEventListener('notificationOpened', this._onNotificationOpened.bind(this));
        NotificationsIOS.addEventListener('notificationReceivedForeground', this.onNotificationReceivedForeground.bind(this));
        NotificationsIOS.addEventListener('notificationReceivedBackground', this.onNotificationReceivedBackground.bind(this));
        NotificationsIOS.consumeBackgroundQueue();
        // PushNotificationIOS.setApplicationIconBadgeNumber(0);
        NotificationsIOS.setBadgesCount(0);
        NetInfo.fetch().done(this.handleFirstConnectivityChange);
        NetInfo.addEventListener(
            'change',
            this.handleFirstConnectivityChange
        );
        this.props.dispatch(updateNotificationCount());
        // console.log('update notification count');

        if(this.props.user.sherpaID==-1){
        }else{
            this.setState({ready:true})
        }
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
            if(this.refs[this.state.selectedTab]){
                this.refs[this.state.selectedTab].refreshCurrentScene();
            }
        }

        if(this.state.selectedView!==prevState.selectedView){
            this.refs[this.state.selectedTab].setView(this.state.selectedView)
        }

    }

    updateTabTo(target){
        if(this.state.selectedTab===target){
            // console.log('reset', this.refs[target],'::',target)

            this.refs[target].reset();
        }
        this.setState({ selectedTab: target });
    }

    _onNotificationOpened(notification) {
        // PushNotificationIOS.setApplicationIconBadgeNumber(0);
        NotificationsIOS.setBadgesCount(0);
        var deepLinkObject=notification.getData();
        this.setState({selectedTab:FEED,selectedView:deepLinkObject});
        if(this.props.tracker)this.props.tracker.trackEvent('notification-opened', deepLinkObject.v1.linkView.id);
    }

    onNotificationReceivedBackground(){
        this.props.dispatch(updateNotificationCount());
        // console.log('notification received foreground');
    }

    onNotificationReceivedForeground(){
        this.props.dispatch(updateNotificationCount());
        // console.log('notification received background');
    }


    toggleTabBar(enable){
        Animated.timing(this.state.bottomOffset, {
            duration: 200,
            toValue: enable? 0 : 100,
            useNativeDriver: true, // <-- Add this
        }).start()
    }

    componentWillUnmount() {
        // Don't forget to remove the event listeners to prevent memory leaks!
        NotificationsIOS.removeEventListener('notificationReceivedForeground', this.onNotificationReceivedForeground);
        NotificationsIOS.removeEventListener('notificationReceivedBackground', this.onNotificationReceivedBackground);
        NotificationsIOS.removeEventListener('notificationOpened', this._onNotificationOpened);
    }

    render() {
        let notificationBadge=this.props.user.notificationCount==0?null:<View style={{width:80}}><View style={{position:'absolute',flexDirection:'row',left:13,top:-5,backgroundColor:'red',alignItems:'center',justifyContent:'center',height:15,borderRadius:15,minWidth:15}}><Text style={{color:'white',paddingLeft:5,paddingRight:5,position:'relative',fontWeight:"600",backgroundColor:'transparent',fontSize:8}}>{this.props.user.notificationCount}</Text></View></View>
        var tabBar =    <TabNavigator titleStyle={{backgroundColor:'white'}} tabBarStyle={[styles.tabBarHeight,{transform:[{translateY:this.state.bottomOffset}],backgroundColor:'white',borderTopWidth:1,borderTopColor:'#EFF1F2'}]}  sceneStyle={{paddingBottom:0}}>
                            <TabNavigator.Item
                                tabStyle={{borderRightWidth:1,borderRightColor:'#EFF1F2'}}
                                selected={this.state.selectedTab === FEED}
                                renderIcon={() => <Image style={{marginBottom:5}} source={require('./../../../Images/icons/explore.png')} />}
                                renderSelectedIcon={() => <Image style={{marginBottom:5,tintColor: '#001645'}} source={require('./../../../Images/icons/explore.png')} />}
                                onPress={()=>this.updateTabTo(FEED)}>
                                <Feed updateTabTo={this.updateTabTo.bind(this)} toggleTabBar={this.toggleTabBar.bind(this)} initial={FEED} headerProgress={this.refs.headerProgress} ref={FEED} {...this.props}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                tabStyle={{borderRightWidth:1,borderRightColor:'#EFF1F2'}}
                                selected={this.state.selectedTab === SUITCASE}
                                renderIcon={() => <Image style={{marginBottom:7}} source={require('./../../../Images/icons/suitcase-tabbar.png')} />}
                                renderSelectedIcon={() => <Image style={{marginBottom:7,tintColor: '#001645'}} source={require('./../../../Images/icons/suitcase-tabbar.png')} />}
                                onPress={()=>this.updateTabTo(SUITCASE)}>
                                <Feed updateTabTo={this.updateTabTo.bind(this)} toggleTabBar={this.toggleTabBar.bind(this)} initial={SUITCASE} headerProgress={this.refs.headerProgress} ref={SUITCASE} {...this.props}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                tabStyle={{borderRightWidth:1,borderRightColor:'#EFF1F2'}}
                                selected={this.state.selectedTab === NOTIFICATIONS}
                                renderIcon={() => <Image  style={{overflow:'visible',marginBottom:5}} source={require('./../../../Images/icons/activity.png')}>{notificationBadge}</Image>}
                                renderSelectedIcon={() => <Image style={{marginBottom:5,tintColor: '#001645'}} source={require('./../../../Images/icons/activity.png')} />}
                                onPress={()=>this.updateTabTo(NOTIFICATIONS)}>
                                <Feed updateTabTo={this.updateTabTo.bind(this)} toggleTabBar={this.toggleTabBar.bind(this)} initial={NOTIFICATIONS} headerProgress={this.refs.headerProgress} ref={NOTIFICATIONS} {...this.props}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                tabStyle={{borderRightWidth:1,borderRightColor:'#EFF1F2'}}c
                                selected={this.state.selectedTab === PROFILE}
                                renderIcon={() => <Image style={{marginBottom:5}} source={require('./../../../Images/icons/user.png')} />}
                                renderSelectedIcon={() => <Image style={{marginBottom:5,tintColor: '#001645'}} source={require('./../../../Images/icons/user.png')} />}
                                onPress={()=>this.updateTabTo(PROFILE)}>
                                <Feed updateTabTo={this.updateTabTo.bind(this)} toggleTabBar={this.toggleTabBar.bind(this)} initial={PROFILE} headerProgress={this.refs.headerProgress} ref={PROFILE} {...this.props}/>
                            </TabNavigator.Item>
                        </TabNavigator>

        return (

            <View style={{flex:1}}>
                <Animated.View style={{position:'absolute',transform:[{translateY:this.state.bottomOffset}]}}>
                    <Image source={require('./../../../Images/navbar_dropshadow.png')} resizeMode="contain" style={styles.tabBarShadow}></Image>
                </Animated.View>
                {tabBar}
                <HeaderProgress ref="headerProgress"></HeaderProgress>
            </View>
        );
    }
}




export default Overview;