/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */


import React, { Component, AppRegistry } from 'react-native';
import { Provider } from 'react-redux/native';
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