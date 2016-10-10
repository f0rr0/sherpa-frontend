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


        let momentImages=[];
        for(let i=0;i<this.state.images.length;i++) {
            let momentImage=RNFetchBlob.fs.readFile(this.state.images[0].uri, 'base64');
            momentImages.push(momentImage);
        }

        Promise.all(momentImages).then((momentImagesRes)=>{
            let moments=[];
            for(let i=0;i<momentImagesRes.length;i++){
                let blob=this.base64ToArrayBuffer(momentImagesRes[i]);
                let momentEXIF=EXIF.readFromBinaryFile(blob);

                let lng=getGps(momentEXIF["GPSLongitude"], momentEXIF['GPSLongitudeRef']);
                let lat=getGps(momentEXIF["GPSLatitude"], momentEXIF['GPSLatitudeRef']);

                let momentPromise=createMoment({
                    lat,
                    lng,
                    "shotDate":new Date(momentEXIF).getTime() / 1000
                });

                moments.push(momentPromise);
            }

            Promise.all(moments).then((momentsRes)=>{
                var momentBlobs=[];
                for(let i=0;i<momentsRes.length;i++){
                    momentBlobs.push({
                        moment:momentsRes[i],
                        image:this.state.images[i]
                    })
                }
                
                this.props.navigator.push({
                    id: "editTripGrid",
                    hideNav:true,
                    momentData:momentBlobs
                });

                var momentUploads=[];
                for(var i=0;i<momentBlobs.length;i++){
                    momentUploads.push(uploadMoment(momentBlobs[i]));
                }
                Promise.all(momentUploads).then((res)=>{
                    console.log('upload res',res)
                }).catch((err)=>{console.log('err')});
            }).catch((err)=>{
                console.log('error:',err);
            })

        }).catch((err)=>{
            console.log('err',err);
        });

    }

    base64ToArrayBuffer(base64) {
        let binary_string =  window.atob(base64);
        let len = binary_string.length;
        let bytes = new Uint8Array( len );
        for (let i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:"#161616"}}>
                {this.props.navigation.default}
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <SherpaCameraRollPicker wrapper={{height:SCREEN_HEIGHT-70,position:'absolute',bottom:0}} backgroundColor={"#161616"} callback={this.getSelectedImages.bind(this)} />
            </View>
        )
    }
}


export default AddTrip;