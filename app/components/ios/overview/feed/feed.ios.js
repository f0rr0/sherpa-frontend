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
            default:
                displayComponent=<View style={styles.centeredContainer}><Text>waiting for feed</Text></View>;
            break;
        }

        return (
            <View style={styles.container}>
                {displayComponent}
            </View>
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