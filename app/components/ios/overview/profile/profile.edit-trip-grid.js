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
import SimpleButton from '../../components/simpleButton';
import RNFetchBlob from 'react-native-fetch-blob';
import PhotoSelectorGrid from '../../components/photoSelector.grid';
const SCREEN_WIDTH = require('Dimensions').get('window').width;

class EditTripGrid extends React.Component {
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }

    _renderHeader(){
        return (
            <View style={{flex:1,justifyContent:'center',height:70,width:SCREEN_WIDTH,alignItems:'center',backgroundColor:'white'}}>
                {this.props.navigation.default}
            </View>
        )
    }

    _renderFooter(){
        return(
            <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7,position:'absolute',bottom:0,left:7}} onPress={()=>{this.navActionRight()}} text="next step (edit locations)"></SimpleButton>
        )
    }

    navActionRight(){
        this.props.navigator.push({
            id: "editTripNames",
            hideNav:true,
            momentData:this.props.momentData,
            sceneConfig:"right-nodrag"
        });
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <PhotoSelectorGrid footerView={this._renderFooter.bind(this)} headerView={this._renderHeader.bind(this)} data={this.props.momentData}></PhotoSelectorGrid>
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>
        )
    }
}


export default EditTripGrid;