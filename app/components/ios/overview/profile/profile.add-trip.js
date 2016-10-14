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

let styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

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

        let moments = [];
        let momentsExif = [];
        for(var i=0;i<this.state.images.length;i++) {
            momentsExif.push(SherpaExif.getExif(this.state.images[i].uri));
        }

        Promise.all(momentsExif).then((momentsExifData)=> {
            for (let i = 0; i < momentsExifData.length; i++) {
                let exifData = momentsExifData[i];
                let gps=exifData['gps'];
                var lat=gps?gps['Latitude']:0;
                var lng=gps?gps['Longitude']:0;
                var shotDate=exifData['exif']['DateTimeOriginal'];
                let momentPromise = createMoment({
                    lat,
                    lng,
                    "shotDate": new Date(shotDate).getTime() / 1000
                });
                moments.push(momentPromise)
            }

            console.log(momentsExifData)

            Promise.all(moments).then((momentsRes)=>{
                var momentBlobs=[];
                for(let i=0;i<momentsRes.length;i++){
                    momentBlobs.push({
                        moment:momentsRes[i],
                        image:this.state.images[i]
                    })
                }

                console.log(momentsRes)

                this.props.navigator.push({
                    id: "editTripGrid",
                    hideNav:true,
                    momentData:momentBlobs,
                    sceneConfig:"right-nodrag"
                });

                //var momentUploads=[];
                //for(var i=0;i<momentBlobs.length;i++){
                //    momentUploads.push(uploadMoment(momentBlobs[i]));
                //}
                //
                //Promise.all(momentUploads).then((res)=>{
                //    console.log('upload res',res)
                //}).catch((err)=>{console.log('err')});

            }).catch((err)=>{
                console.log('error:',err);
            })
        });
    }


    render(){
        return(
            <View style={{flex:1,backgroundColor:"#161616"}}>
                {this.props.navigation.default}
                <SherpaCameraRollPicker wrapper={{height:SCREEN_HEIGHT-70,position:'absolute',bottom:0}} backgroundColor={"#161616"} callback={this.getSelectedImages.bind(this)} />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>
        )
    }
}


export default AddTrip;