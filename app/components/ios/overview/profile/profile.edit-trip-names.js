'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
ScrollView
} from 'react-native';
import React, { Component } from 'react';
import StickyHeader from '../../components/stickyHeader';
import Header from '../../components/stickyHeader';
import SimpleButton from '../../components/simpleButton';
import LocationName from '../../components/locationName';
import RNFetchBlob from 'react-native-fetch-blob';
import PhotoSelectorGrid from '../../components/photoSelector.grid';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import Dimensions from 'Dimensions';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import { Fonts, Colors } from '../../../../Themes/'

var windowSize=Dimensions.get('window');

const SCREEN_WIDTH = require('Dimensions').get('window').width;



class EditTripNames extends React.Component {
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


    navActionRight(){

    }

    render(){
        var currentIndex=0;
        return(
            <View style={{flex:1,backgroundColor:'white'}}>

                <ScrollView pagingEnabled={true} horizontal={true} contentInset={{top:0,left:0,bottom:0,right:-21}} ref="featuredMomentsGallery"  scrollEnabled={true} showsHorizontalScrollIndicator={false} removeClippedSubviews={false}>
                    {this.props.momentData.map(function(moment){
                        console.log('current index',currentIndex);
                        currentIndex++;

                        return(<LocationName moment={moment} isFirst={currentIndex===1}></LocationName>);

                    })}
                </ScrollView>
                <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7,position:'absolute',bottom:14,left:7}} onPress={()=>{this.navActionRight()}} text="next step (edit tripname)"></SimpleButton>
                {this.props.navigation.default}

            </View>
        )
    }
}



export default EditTripNames;