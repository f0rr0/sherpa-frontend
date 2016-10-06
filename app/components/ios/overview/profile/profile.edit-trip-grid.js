'use strict';


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';
import StickyHeader from '../../components/stickyHeader';
import Header from '../../components/stickyHeader';
import RNFetchBlob from 'react-native-fetch-blob';
import PhotoSelectorGrid from '../../components/photoSelector.grid';
const SCREEN_HEIGHT = require('Dimensions').get('window').height;

class EditTripGrid extends React.Component {
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }


    render(){
        return(
            <View style={{flex:1,backgroundColor:"red"}}>
                {this.props.navigation.default}
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <View style={{height:SCREEN_HEIGHT-65,position:'absolute',bottom:0,flex:1,left:0,right:0,backgroundColor:'green'}}>
                    <PhotoSelectorGrid wrapper={{position:'absolute',top:0}}></PhotoSelectorGrid>
                </View>
            </View>
        )
    }
}


export default EditTripGrid;