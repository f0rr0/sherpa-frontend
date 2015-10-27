'use strict';

var React = require('react-native');
var FeedList = require('./feed.list.ios');

var {
    StyleSheet,
    NavigatorIOS,
    Component
    } = React;

class Feed extends Component {
    render() {
        return (
            <NavigatorIOS
                style={styles.container}
                initialRoute={{
                    title: 'Feed',
                    component: FeedList
                }}
            />
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

module.exports = Feed;