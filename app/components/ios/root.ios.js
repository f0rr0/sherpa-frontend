'use strict';

import React from 'react-native';
import {loadUser} from '../../actions/user.actions';
import Loading from './onboarding/onboarding.loading.ios';
import Login from './onboarding/onboarding.login.ios';
import Overview from './overview/overview.ios';
import OnboardingNotifications from './onboarding/onboarding.notifications.ios';
import { connect } from 'react-redux/native';

var {
    StyleSheet,
    Navigator,
    Component,
    View
    } = React;

class Root extends Component {

    constructor(props){
        super(props);
        this.props.dispatch(loadUser());
    }

    renderScene(route, navigator) {
        switch (route.id) {
            case 'loading':
                return <Loading navigator={navigator} />;
            break;
            case "login":
                return <Login navigator={navigator} />;
            break;
            case "overview":
                return <Overview navigator={navigator} />;
            break;
            case "onboarding-hometown":
            break;
            case "onboarding-notifications":
                return <OnboardingNotifications navigator={navigator} />
            break;
        }
    }

    render() {
        return (
            <Navigator
                sceneStyle={styles.container}
                ref={(navigator) => { this.navigator = navigator; }}
                renderScene={this.renderScene}
                configureScene={(route) => ({
                  ...route.sceneConfig || Navigator.SceneConfigs.FloatFromRight,
                  gestures: route.gestures
                })}
                initialRoute={{
                  id:"loading"
                }}
            />
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
});


function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer
    };
}
export default connect(select)(Root);