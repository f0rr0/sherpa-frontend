'use strict';
import React from 'react-native';
import ProfileView from './profile.view.ios';

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
            title: 'Profile',
            component: ProfileView
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