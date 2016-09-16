'use strict';

import {loadUser,updateUserData,storeUser} from '../../actions/user.actions';
import {getFeed} from '../../actions/feed.actions';
import Loading from './onboarding/onboarding.loading.ios';
import Login from './onboarding/onboarding.login.ios';
import Overview from './overview/overview.ios';
import NotWhitelisted from './onboarding/onboarding.not-whitelisted.ios';
import OnboardingSteps from './onboarding/onboarding.steps.ios';
import { connect } from 'react-redux';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import React, { Component } from 'react';


import {
    StyleSheet,
    Navigator,
    View,
    AppState
    } from 'react-native';


var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
});



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


    componentDidUpdate(prevProps,prevState){
        if((prevState.currentAppState=='background'||prevState.currentAppState=='background')&&this.state.currentAppState=='active'){
            if(this.props.user.whiteListed)return;
            getFeed(this.props.user.sherpaID,1,'user',this.props.user.sherpaToken).then((result)=>{
                console.log('white listing state',result.data.whitelisted,this.props.user.whiteListed)
                if(result.data.whitelisted){
                    this.navigator.replace({id:"onboarding-steps"});
                }
                console.log('dispatch whitelisted',result.data.whitelisted);
                this.props.dispatch(updateUserData({
                    whiteListed:result.data.whitelisted
                }));
                this.props.dispatch(storeUser());
            })
        }else if((prevState.currentView!=this.state.currentView)){
            this.navigator.replace({id:this.state.currentView});
        }
    }

    renderScene(route, navigator) {
        GoogleAnalytics.trackScreenView(route.id)
        switch (route.id) {
            case 'loading':
                return <Loading navigator={navigator} {...this.props}/>;
            break;
            case "login":
                return <Login navigator={navigator} {...this.props}/>;
            break;
            case "not-whitelisted":
                return <NotWhitelisted navigator={navigator} {...this.props} />;
            break;
            case "overview":
                return <Overview navigator={navigator} {...this.props}/>;
            break;
            case "onboarding-steps":
                return <OnboardingSteps navigator={navigator} {...this.props}/>
            break;
        }
    }

    render() {
        return (
            <Navigator
                sceneStyle={styles.container}
                ref={(navigator) => { this.navigator = navigator; }}
                renderScene={this.renderScene.bind(this)}
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


function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer,
        app: state.appReducer
    };
}

export default connect(select)(Root);