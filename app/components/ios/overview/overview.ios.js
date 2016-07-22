/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
/* @flow */
'use strict';
'use babel';
import Feed from './feed/feed.ios';
import React from 'react-native';
import {udpateFeedState} from '../../../actions/feed.actions';
import {updateTab} from '../../../actions/app.actions';
import { connect } from 'react-redux/native';
import TabNavigator from 'react-native-tab-navigator';
import NotificationsIOS from 'react-native-notifications';

var {
    StyleSheet,
    View,
    StatusBar,
    Image,
    PushNotificationIOS
} = React;

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
    constructor() {
        super();
        this.state = {
            selectedTab: FEED,
            notifCount: 0,
            presses: 0
        };
        this.myFeed=null;

    }

    componentDidMount(){
        this.props.dispatch(updateTab(this.state.selectedTab));
        NotificationsIOS.addEventListener('notificationOpened', this._onNotificationOpened.bind(this));
        NotificationsIOS.consumeBackgroundQueue();
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.selectedTab!==prevState.selectedTab){
            this.props.dispatch(udpateFeedState("reset"));
            this.props.dispatch(updateTab(this.state.selectedTab));
        }
    }

    updateTabTo(target){
        if(this.state.selectedTab===target)this.refs[target].reset();
        this.setState({ selectedTab: target });
    }

    componentWillUnmount(){
        NotificationsIOS.removeEventListener('notificationOpened', this._onNotificationOpened.bind(this));
    }


    _onNotificationOpened(notification) {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
        var deepLinkObject=JSON.parse(notification.getMessage());
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
        this.setState({selectedTab:FEED});
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


function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer,
        app: state.appReducer
    };
}

export default connect(select)(Overview);