/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
/* @flow */
'use strict';
'use babel';
import { Provider } from 'react-redux/native';
import Feed from './feed/feed.ios';
import React from 'react-native';

var {
    AppRegistry,
    StyleSheet,
    NavigatorIOS,
    TabBarIOS,
    View,
    Text,
    StatusBarIOS,
    Image
    } = React;

const EXPLORE="exploreTab";
const FEED="feedTab";
const PROFILE="profileTab";
const SUITECASE="suitecaseTab";

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

StatusBarIOS.setHidden(true);

class Overview extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedTab: FEED,
            notifCount: 0,
            presses: 0
        };

        this.statics = {
            title: 'Sherpa',
            description: 'Sherpa Prototype'
        };

        this.displayName = 'TabBarExample';
    }

    _renderContent(color:string, pageText:string) {
        var currentView;
        switch (this.state.selectedTab) {
            case FEED:
                return (<Feed />)
                break;
            case EXPLORE:
            case PROFILE:
            case SUITECASE:
                return (
                    <View style={[styles.tabContent, {backgroundColor: "#FFFFFF"}]}>
                        <Image
                            resizeMode="contain"
                            style={styles.logo}
                            source={require('image!logo-sherpa')}
                        />
                        <Text style={styles.tabText}>{pageText}</Text>
                    </View>
                )
                break;
        }
    }

    render() {
        return (
            <TabBarIOS tintColor="#4735f9" barTintColor="#ffffff" style={styles.tabBar}>
                <TabBarIOS.Item
                    icon={require('image!icon-feed')}
                    selected={this.state.selectedTab === FEED}
                    title="Feed"
                    onPress={() => {
                    this.setState({
                        selectedTab: FEED
                    });
                }}>

                    {this._renderContent('#414A8C', 'Blue Tab')}
                </TabBarIOS.Item>

                <TabBarIOS.Item
                    icon={require('image!icon-explore')}
                    title="Explore"
                    selected={this.state.selectedTab === EXPLORE}
                    onPress={() => {
                  this.setState({
                    selectedTab: EXPLORE
                  });
                }}>
                    {this._renderContent('#783E33', 'Explore Tab')}
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    selected={this.state.selectedTab === PROFILE}
                    icon={require('image!icon-profil')}
                    title="Profile"
                    onPress={() => {
                  this.setState({
                    selectedTab: PROFILE
                  });
                }}>
                    {this._renderContent('#21551C', 'Profile Tab')}
                </TabBarIOS.Item>
                <TabBarIOS.Item
                    selected={this.state.selectedTab === SUITECASE}
                    icon={require('image!icon-suitcase')}
                    title="Suitcase"
                    onPress={() => {
                    this.setState({
                        selectedTab: SUITECASE
                    });
                }}>
                    {this._renderContent('#fff606', 'Suitecase Tab')}
                </TabBarIOS.Item>
            </TabBarIOS>
        );
    }
}

export default Overview;