/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */


import { AppRegistry } from 'react-native';
import React, { Component } from 'react';

import { Provider } from 'react-redux';
import Root from './app/components/ios/root.ios';
import configureStore from './app/utils/configure.store';
const store = configureStore();


class Sherpa extends Component {

    render() {
        return (
            <Provider store={store}>
                <Root />
            </Provider>
        );
    }


}


AppRegistry.registerComponent('Sherpa', () => Sherpa);
console.ignoredYellowBox = ['Warning: ReactNative.createElement'];