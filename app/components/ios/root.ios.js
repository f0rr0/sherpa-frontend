'use strict';

import {loadUser} from '../../actions/user.actions';
import Loading from './onboarding/onboarding.loading.ios';
import Login from './onboarding/onboarding.login.ios';
import Overview from './overview/overview.ios';
import NotWhitelisted from './onboarding/onboarding.not-whitelisted.ios';
import OnboardingSteps from './onboarding/onboarding.steps.ios';
import { connect } from 'react-redux';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import {
    StyleSheet,
    Navigator,
    View,
    AppState
    } from 'react-native';;
import React, { Component } from 'react';

class Root extends Component {
    constructor(props){
        super(props);
        this.props.dispatch(loadUser());
        GoogleAnalytics.setTrackerId('UA-75939846-3')
        this.state={
            currentView:"loading",
            currentAppState:'undefined'
        }
    }

    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
    }

    componentWillUnmount(){
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange(currentAppState) {
        this.setState({ currentAppState })
        //console.log('update state');
    }

    componentWillReceiveProps(nextProps){
        switch(nextProps.user.userDBState){
            case "available-existing":
            case "notifications-registered":
                this.setState({currentView:"overview"});
            break;
            case "available-new":
                this.setState({currentView:"onboarding-steps"});
            break;
            case "not-whitelisted":
                this.setState({currentView:"not-whitelisted"});
            break;
            case "empty":
                this.setState({currentView:"login"});
            break;
            case "waiting":
                this.setState({currentView:"loading"});
            break;
        }
    }


    shouldComponentUpdate(nextProps,nextState){
        return ((nextState.currentView!=this.state.currentView)||((this.state.currentAppState=='background'||this.state.currentAppState=='background')&&nextState.currentAppState=='active'));
    }

    componentDidUpdate(prevProps,prevState){
        //console.log('did update')
        if((prevState.currentAppState=='background'||prevState.currentAppState=='background')&&this.state.currentAppState=='active'){
           if(this.props.user.userDBState=="not-whitelisted"){
               this.navigator.replace({id:"login"});
           }
        }else{
            this.navigator.replace({id:this.state.currentView});
        }


    }

    renderScene(route, navigator) {
        GoogleAnalytics.trackScreenView(route.id)
        switch (route.id) {
            case 'loading':
                return <Loading navigator={navigator} />;
            break;
            case "login":
                return <Login navigator={navigator} />;
            break;
            case "not-whitelisted":
                return <NotWhitelisted navigator={navigator} />;
            break;
            case "overview":
                return <Overview navigator={navigator} />;
            break;
            case "onboarding-steps":
                return <OnboardingSteps navigator={navigator} />
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
                  ...route.sceneConfig || Navigator.SceneConfigs.FloatFromRight
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
        user: state.userReducer
    };
}
export default connect(select)(Root);