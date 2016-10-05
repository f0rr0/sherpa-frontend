'use strict';
import StickyHeader from '../../components/stickyHeader';


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

class Settings extends React.Component {
    constructor(){
        super();
    }

    componentDidMount(){
        console.log('show settings');
    }

    render(){
        return(
            <View style={{backgroundColor:'red',flex:1}}>
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <Text>SETTINGS</Text>
            </View>
        )
    }
}


export default Settings;