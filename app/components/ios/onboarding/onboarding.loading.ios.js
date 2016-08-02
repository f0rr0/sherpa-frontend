'use strict';

import { connect } from 'react-redux';
import Overview from '../overview/overview.ios';
import Login from './onboarding.login.ios';

import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';
import React, { Component } from 'react';


var styles = StyleSheet.create({
    copy: {
        color:'#001545',
        fontFamily:"TSTAR-bold",
        fontSize:14,
        marginTop:20
    },
    container: {
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
    }
})

class Loading extends Component {
    constructor(props){
        super(props);
    }


    render() {
        var loadingInfo=<Text style={styles.copy}>LOADING</Text>
        return (
            <View style={styles.container}>
                <Image style={{width: 250, height: 250}} source={{uri: 'http://www.thomasragger.com/loader.gif'}} />
                {loadingInfo}
            </View>
        );
    }
}

function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer
    };
}
export default connect(select)(Loading);