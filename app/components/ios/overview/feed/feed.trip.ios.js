'use strict';

var React = require('react-native');
var FeedList = require('./feed.list.ios');

var {
    StyleSheet,
    NavigatorIOS,
    Component,
    View,
    Text
    } = React;

class FeedTrip extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Text>FEED TRIP</Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

module.exports = FeedTrip;