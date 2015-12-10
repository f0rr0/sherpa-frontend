'use strict';

import React from 'react-native';
import FeedList from './feed.list.ios';
import FeedProfile from './feed.profile.ios';
import FeedLocation from './feed.location.ios';
import FeedTrip from './feed.trip.ios';

import { connect } from 'react-redux/native';
import {loadFeed} from '../../../../actions/feed.actions';


var {
    StyleSheet,
    Navigator,
    Component,
    Text,
    View
    } = React;

class Feed extends Component {
    renderScene(route, navigator) {
        switch (route.id) {
            case 'feed.list':
                return <FeedList navigator={navigator} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch} />;
            break;
            case "feed.location":
                return <FeedLocation navigator={navigator} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
                break;
            case "feed.trip":
                return <FeedTrip navigator={navigator} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
            case "feed.profile":
                return <FeedProfile navigator={navigator} trip={route.trip} feed={this.props.feed} user={this.props.user} dispatch={this.props.dispatch}/>;
            break;
        }
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
                  id:"feed.list"
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


export default connect(select)(Feed);