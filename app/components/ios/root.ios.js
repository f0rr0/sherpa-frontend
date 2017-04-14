'use strict';

import {loadUser,updateUserData,storeUser,rescrape,checkToken,logoutUser,checkUser,updateNotificationCount} from '../../actions/user.actions';
import {getFeed} from '../../actions/feed.actions';
import Loading from './onboarding/onboarding.loading.ios';
import Login from './onboarding/onboarding.login.ios';
import Overview from './overview/overview.ios';
import NotWhitelisted from './onboarding/onboarding.not-whitelisted.ios';
import OnboardingSteps from './onboarding/onboarding.steps.ios';
import { connect } from 'react-redux';
import GoogleAnalytics from 'react-native-google-analytics-bridge';
import React, { Component } from 'react';
import NotificationsIOS from 'react-native-notifications';


import {
    StyleSheet,
    Navigator,
    View,
    AppState,
    PushNotificationIOS
    } from 'react-native';


var styles = StyleSheet.create({
    container: {
        backgroundColor:"black"
    }
});


const tracker=GoogleAnalytics.setTrackerId('UA-75939846-3')

class Root extends Component {
    constructor(props){
        super(props);
        this.props.dispatch(loadUser());
        this.state={
            currentView:"loading",
            currentAppState:'undefined'
        }
    }

    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
        NotificationsIOS.consumeBackgroundQueue();
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
        this.feedStuff()
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
            case "request-invite":
            break;
            case "not-whitelisted":
                this.setState({currentView:"not-whitelisted"});
            break;
            case "empty":
                this.setState({currentView:"login"});
            break;
            case "login-denied":
                this.setState({currentView:"login-denied"});
            break;
            case "waiting":
                this.setState({currentView:"loading"});
            break;
        }
    }


    feedStuff(){
        //console.log('feed stuff')
        checkUser((user)=>{
            //console.log('stored user',user);
            getFeed(user.sherpaID,1,'user',user.sherpaToken).then((result)=>{
                //if(result.data.invited){
                //this.navigator.replace({id:"onboarding-steps"});
                //}else{
                //this.navigator.replace({id:"login"});
                //}
                this.props.dispatch(updateUserData({
                    whiteListed:result.data.whitelisted
                }));
                this.props.dispatch(storeUser());
            })
        }).catch((err)=>{
            console.log('no user')
        })

    }

    componentDidUpdate(prevProps,prevState){
        if((prevState.currentAppState=='background'||prevState.currentAppState=='background')&&this.state.currentAppState=='active'){
            //if(this.state.currentView==='not-whitelisted')this.navigator.replace({id:"login"});
            this.feedStuff();
            checkToken().then((res)=>{
                if(!!res){
                    //console.log('token valid');
                }else{
                    logoutUser();
                }
            }).catch((err)=>{console.log('err',err)})

            rescrape();
            this.props.dispatch(updateNotificationCount());


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
            case "login-denied":
                return <Login denied={route.id=='login-denied'} navigator={navigator} {...this.props}/>;
            break;
            case "not-whitelisted":
                return <NotWhitelisted navigator={navigator} {...this.props} />;
            break;
            case "overview":
                return <Overview tracker={tracker} navigator={navigator} {...this.props}/>;
            break;
            case "onboarding-steps":
                return <OnboardingSteps navigator={navigator} {...this.props}/>;
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