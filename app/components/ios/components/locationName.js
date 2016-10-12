'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated
} from 'react-native';
import React, { Component } from 'react';
import SimpleButton from './simpleButton';
import RNFetchBlob from 'react-native-fetch-blob';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import Dimensions from 'Dimensions';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import { Fonts, Colors } from '../../../Themes/'
var windowSize=Dimensions.get('window');


class LocationName extends Component{
    constructor(props){
        super();
    }

    componentDidMount(){
    }

    componentDidUpdate(prevProps,prevState){
    }

    render(){
        var moment = this.props.moment;
        return(
            <Animated.View style={this.props.style} key={moment.id}>

            </Animated.View>
        )
    }
}

var styles = StyleSheet.create({
    content:{
        left:14,
        width: windowSize.width-28,
    },
    secondContent:{
        left: -7,
        top: 0,
        width: windowSize.width-28,
    },
    container: {
        flexDirection: 'column',
        alignItems: "flex-start",
        justifyContent:'flex-start',
        height: windowSize.height,
        width: windowSize.width,
        marginTop:100//-windowSize.width+20
    },
    bg: {
        height: windowSize.width-14
    },
})


export default LocationName;