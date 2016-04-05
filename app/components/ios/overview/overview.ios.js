/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
/* @flow */
'use strict';
'use babel';
import Feed from './feed/feed.ios';
import React from 'react-native';
import ProfileNavigator from './profile/profile.ios';

var {
    AppRegistry,
    StyleSheet,
    TabBarIOS,
    View,
    Text,
    StatusBar,
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

StatusBar.setHidden(true);

class Overview extends React.Component {
    constructor() {
        super();
        this.state = {
            selectedTab: FEED,
            notifCount: 0,
            presses: 0
        };
    }

    _renderContent() {
        console.log('render feed::',this.state.selectedTab)
        switch (this.state.selectedTab) {
            case FEED:
                return (<Feed />)
            break;
            case PROFILE:
                return (<ProfileNavigator />)
            break;
            case EXPLORE:
            case SUITECASE:
                return (
                    <View style={[styles.tabContent, {backgroundColor: "#FFFFFF"}]}>
                        <Image
                            resizeMode="contain"
                            style={styles.logo}
                            source={require('image!logo-sherpa')}
                        />
                    </View>
                )
            break;
        }
    }

    render() {
        var tabBar=
         <TabBarIOS tintColor="#4735f9" barTintColor="#ffffff" style={styles.tabBar}>
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
                selected={this.state.selectedTab === SUITECASE}
                icon={require('./../../../images/icon-suitcase.png')}
                title="Suitcase"
                onPress={() => {
                    this.setState({
                        selectedTab: SUITECASE
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

export default Overview;