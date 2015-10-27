/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */


import React, { Component, AppRegistry } from 'react-native';
import { Provider } from 'react-redux/native';
import Overview from './app/components/ios/overview/overview.ios';
import configureStore from './app/utils/configure.store';
const store = configureStore();


class Sherpa extends Component {

    render() {
        return (
            <Provider store={store}>
                {() => <Overview />}
            </Provider>
        );
    }


}


AppRegistry.registerComponent('Sherpa', () => Sherpa);