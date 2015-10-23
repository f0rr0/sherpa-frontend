'use strict';

var React = require('react-native');
var ProfileView = require('./profile.view.ios');

var {
    StyleSheet,
    NavigatorIOS,
    Component
    } = React;

class Profile extends Component {
    render() {
        return (
            <NavigatorIOS
                style={styles.container}
                initialRoute={{
            title: 'Feed',
            component: FeedList
          }}/>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

module.exports = Profile;