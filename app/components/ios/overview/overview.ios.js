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

var {
    StyleSheet,
    TabBarIOS,
    View,
    StatusBar,
    Image
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
            selectedTab: EXPLORE,
            notifCount: 0,
            presses: 0
        };
        this.myFeed=null;

    }

    componentDidMount(){
        this.props.dispatch(updateTab(this.state.selectedTab));
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.selectedTab!==prevState.selectedTab){
            this.props.dispatch(udpateFeedState("reset"));
            this.props.dispatch(updateTab(this.state.selectedTab));
        }
    }

    render() {
        var tabBar =    <TabNavigator  tabBarStyle={{ height: 60}} container={{height:60}}>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === FEED}
                                renderIcon={() => <Image source={require('./../../../images/icon-feed.png')} />}
                                onPress={() => this.setState({ selectedTab: FEED })}>
                                <Feed initial={FEED} ref={FEED}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === EXPLORE}
                                renderIcon={() => <Image source={require('./../../../images/icon-explore.png')} />}
                                onPress={() => this.setState({ selectedTab: EXPLORE })}>
                                <Feed initial={EXPLORE} ref={EXPLORE}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === PROFILE}
                                renderIcon={() => <Image source={require('./../../../images/icon-profil.png')} />}
                                onPress={() => this.setState({ selectedTab: PROFILE })}>
                                <Feed initial={PROFILE} ref={PROFILE}/>
                            </TabNavigator.Item>
                            <TabNavigator.Item
                                selected={this.state.selectedTab === SUITCASE}
                                renderIcon={() => <Image source={require('./../../../images/icon-suitcase.png')} />}
                                onPress={() => this.setState({ selectedTab: SUITCASE })}>
                                <Feed initial={SUITCASE} ref={SUITCASE}/>
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
        feed: state.feedReducer
    };
}
export default connect(select)(Overview);