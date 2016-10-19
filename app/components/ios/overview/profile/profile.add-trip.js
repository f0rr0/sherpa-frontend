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
import SherpaCameraRollPicker from '../../components/SherpaCameraRollPicker'
import EXIF from 'exif-js'
import RNFetchBlob from 'react-native-fetch-blob';
const SCREEN_HEIGHT = require('Dimensions').get('window').height;
import {createMoment,uploadMoment,getGps} from "../../../../actions/trip.edit.actions"
import SherpaExif from '../../components/SherpaExif'

class AddTrip extends React.Component {
    constructor(){
        super();
        this.state={images:[]}
    }

    componentDidMount(){
    }

    getSelectedImages(res){
        this.setState({images:res})
    }

    navActionRight(){
        if(this.state.images.length==0)return;

        let momentsExif = [];
        for(var i=0;i<this.state.images.length;i++) {
            momentsExif.push(SherpaExif.getExif(this.state.images[i].uri));
        }

        Promise.all(momentsExif).then((momentsExifData)=> {
            var momentBlobs=[];
            for (let i = 0; i < momentsExifData.length; i++) {
                let exifData = momentsExifData[i];
                let gps=exifData['gps'];
                var lat=gps?gps['Latitude']:0;
                var lng=gps?gps['Longitude']:0;
                var shotDate=exifData['exif']['DateTimeOriginal'];


                const dateTime = shotDate.split(' ');
                const regex = new RegExp(':', 'g');
                dateTime[0] = dateTime[0].replace(regex, '-');

                momentBlobs.push({
                    moment:{
                        "lat":lat,
                        "lng":lng,
                        "locationData":[],
                        "shotDate": new Date(shotDate)
                    },
                    image:this.state.images[i]
                })
            }

            this.props.navigator.push({
                id: "editTripGrid",
                hideNav:true,
                momentData:momentBlobs,
                sceneConfig:"bottom-nodrag"
            });

        });
    }


    render(){
        return(
            <View style={{flex:1,backgroundColor:"#161616"}}>
                {this.props.navigation.default}
                <SherpaCameraRollPicker ref="sherpaCameraRoll" wrapper={{height:SCREEN_HEIGHT-70,position:'absolute',bottom:0}} backgroundColor={"#161616"} callback={this.getSelectedImages.bind(this)} />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>
        )
    }
}


export default AddTrip;