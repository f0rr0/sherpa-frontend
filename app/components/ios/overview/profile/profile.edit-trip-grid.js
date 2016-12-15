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
const SCREEN_HEIGHT = require('Dimensions').get('window').height;
class EditTripGrid extends React.Component {
    constructor(props){
        super(props)
    }

    componentDidMount(){
    }

    _renderHeader(){
        return (
            <View style={{position:'absolute',top:0,left:0,flex:1,justifyContent:'center',height:70,marginBottom:-5,width:SCREEN_WIDTH-14,alignItems:'center',backgroundColor:'white'}}>
                {this.props.navigation.default}
            </View>
        )
    }

    _renderFooter(){
        return(
            <View style={{marginLeft:7,width:SCREEN_WIDTH-21,height:55,paddingBottom:0,marginTop:0,justifyContent:"flex-start"}}>
                <SimpleButton style={{width:SCREEN_WIDTH-21}} disabled={this.refs.selectorGrid?!this.refs.selectorGrid.checkEmpty().empty:false} onPress={()=>{this.navActionRight()}} text="next step (edit locations)"></SimpleButton>
            </View>
        )
    }

    navActionLeft(){
        this.props.navigator.popToTop();
    }

    navActionRight(){
            this.props.navigator.push({
                id: "editTripNames",
                hideNav:true,
                momentData:this.props.momentData,
                tripData:this.props.tripData || null,
                sceneConfig:"right-nodrag",
                selection:this.refs.selectorGrid.checkEmpty().checkArr
            });
    }

    render(){

        return(
            <View style={{backgroundColor:'white',minHeight:SCREEN_HEIGHT}}>
                <PhotoSelectorGrid ref="selectorGrid" moreCallback={()=>{
                    this.props.navigator.push({
                        id: "addTrip",
                        hideNav:true,
                        sceneConfig:"bottom-nodrag",
                        images:this.props.images,
                        momentData:this.props.momentData,
                        tripData:this.props.tripData
                    });
                }} showMore={true} footerView={this._renderFooter.bind(this)} wrapper={{paddingTop:60,width:SCREEN_WIDTH}} headerView={this._renderHeader.bind(this)} data={this.props.momentData}></PhotoSelectorGrid>
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>
        )
    }
}


export default EditTripGrid;