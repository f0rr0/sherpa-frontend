'use strict';

import React from 'react-native';
import FeedList from './feed.list.ios';
import { connect } from 'react-redux/native';
import {loadFeed} from '../../../../actions/feed.actions';


var {
    StyleSheet,
    NavigatorIOS,
    Component,
    Text,
    View
    } = React;

class Feed extends Component {

    componentDidMount(){
        this.props.dispatch(loadFeed(this.props.user.sherpaID,this.props.user.sherpaToken));
    }

    render() {
        let displayComponent=<Text>no state</Text>;
        switch(this.props.feed.feedState){
            case "ready":
                displayComponent=
                    <NavigatorIOS
                        style={styles.container}
                        initialRoute={{
                            title: 'Feed',
                            component: FeedList
                        }}
                    />
            break;
            case "request":
                displayComponent=<Text>request</Text>;
            break;
            case "complete":
                displayComponent=<Text>complete</Text>;
            break;
            case "none":
                displayComponent=<Text>none</Text>;
            break;
        }

        return (
            <View style={{flex:1}}>
                {displayComponent}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});


function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer
    };
}


export default connect(select)(Feed);