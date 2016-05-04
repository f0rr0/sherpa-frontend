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

var {
    StyleSheet,
    TabBarIOS,
    View,
    StatusBar,
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
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.selectedTab!==prevState.selectedTab){
            this.props.dispatch(udpateFeedState("reset"));
            this.props.dispatch(updateTab(this.state.selectedTab));
        }
    }

    _renderContent() {
        var feed=<Feed initial={this.state.selectedTab} ref={this.state.selectedTab}/>;
        switch (this.state.selectedTab) {
            case FEED:
            case EXPLORE:
            case PROFILE:
            case SUITCASE:
                return (feed);
            break;
        }

    }

    render() {
        var tabBar=
         <TabBarIOS tintColor="#282b33" barTintColor="#ffffff" style={styles.tabBar}>
            <TabBarIOS.Item
                icon={require('./../../../images/icon-feed.png')}
                selected={this.state.selectedTab === FEED}
                title="Feed"
                onPress={() => {
                    this.setState({
                        selectedTab: FEED
                    });
                }}>

                {this._renderContent()}
            </TabBarIOS.Item>
            <TabBarIOS.Item
                icon={require('./../../../images/icon-explore.png')}
                title="Explore"
                selected={this.state.selectedTab === EXPLORE}
                onPress={() => {
                  this.setState({
                    selectedTab: EXPLORE
                  });
                }}>
                {this._renderContent()}
            </TabBarIOS.Item>
            <TabBarIOS.Item
                selected={this.state.selectedTab === PROFILE}
                icon={require('./../../../images/icon-profil.png')}
                title="Profile"
                onPress={() => {
                  this.setState({
                    selectedTab: PROFILE
                  });
                }}>
                {this._renderContent()}
            </TabBarIOS.Item>
            <TabBarIOS.Item
                selected={this.state.selectedTab === SUITCASE}
                icon={require('./../../../images/icon-suitcase.png')}
                title="Suitcase"
                onPress={() => {
                    this.setState({
                        selectedTab: SUITCASE
                    });
                }}>
                {this._renderContent()}
            </TabBarIOS.Item>
        </TabBarIOS>
        return (
            <View style={{flex:1}}>{tabBar}</View>
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