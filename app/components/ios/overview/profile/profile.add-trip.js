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
import Header from '../../components/header';
import SherpaCameraRollPicker from '../../components/SherpaCameraRollPicker'
import SherpaInstagramPicker from '../../components/SherpaInstagramPicker'
import EXIF from 'exif-js'
import RNFetchBlob from 'react-native-fetch-blob';
const SCREEN_HEIGHT = require('Dimensions').get('window').height;
const SCREEN_WIDTH = require('Dimensions').get('window').width;
import {createMoment,uploadMoment,getGps} from "../../../../actions/trip.edit.actions"
import SherpaExif from '../../components/SherpaExif'
import {Fonts} from '../../../../Themes'
import PhotoSelectorGrid from '../../components/photoSelector.grid';
import {getUserInstagramPhotos} from '../../../../actions/trip.edit.actions'

class AddTrip extends React.Component {
    constructor(props){
        super(props);
        this.state={images:{cameraroll:props.images&&!props.momentData?props.images.cameraroll:[],instagram:props.images&&!props.momentData?props.images.instagram:[]},type:'cameraroll'}
    }

    componentDidMount(){
        this.setType('cameraroll');
    }

    componentDidUpdate(){
        this.refs['tab-cameraroll'].setOpacityTo(this.refs['tab-cameraroll'].props.disabled?1:.2)
        this.refs['tab-instagram'].setOpacityTo(this.refs['tab-instagram'].props.disabled?1:.2)
    }

    getSelectedImagesCameraRoll(res){
        this.state.images.cameraroll=res;
        this.setState({images:this.state.images})
    }

    getSelectedImagesInstagram(res) {
        this.state.images.instagram=res;
        this.setState({images:this.state.images})
    }

    navActionRight(){
        if(this.checkEmpty())return

        let momentsExif = [];
        for(var i=0;i<this.state.images.cameraroll.length;i++) {
            momentsExif.push(SherpaExif.getExif(this.state.images.cameraroll[i].uri));
        }

        Promise.all(momentsExif).then((momentsExifData)=> {
            var momentBlobs=this.props.momentData||[];
            for (let i = 0; i < momentsExifData.length; i++) {
                let exifData = momentsExifData[i];
                console.log(exifData);
                let gps=exifData['gps'];
                let lat=gps?gps['Latitude']:0;
                let lng=gps?gps['Longitude']:0;
                let dateTime=new Date();
                if(exifData.exif.DateTimeOriginal){
                    dateTime=exifData.exif.DateTimeOriginal.split(' ');
                    const regex = new RegExp(':', 'g');
                    dateTime[0] = dateTime[0].replace(regex, '-');
                }

                console.log('moment date',new Date(dateTime).getTime());
                momentBlobs.push({
                    "lat":lat,
                    "lng":lng,
                    "date": new Date(dateTime).getTime()/1000,
                    "service":"",
                    "venue":"",
                    "location":"",
                    "state":"",
                    "country":"",
                    "mediaUrl":this.state.images.cameraroll[i].uri
                })
            }


            momentBlobs=momentBlobs.concat(this.state.images.instagram);
            console.log(this.state.images.instagram,'instagram');

            this.props.navigator.push({
                id: "editTripGrid",
                hideNav:true,
                momentData:momentBlobs,
                images:this.state.images,
                sceneConfig:"bottom-nodrag",
                tripData:this.props.tripData
            });

        });
    }

    setType(newType){
        this.setState({type:newType})
    }

    checkEmpty(){
        return (this.state.images.cameraroll.length==0&&this.state.images.instagram.length==0);
    }


    render(){
        var header=<Header ref="navFixed" rightDisabled={this.checkEmpty()} settings={{opaque:false,routeName:"Select trip photos",topLeftImage:require('./../../../../Images/icon-close-white.png'),topRightImage:require('./../../../../Images/icon-check-white.png'),navColor:'white'}} goBack={this.props.navigator.pop} navActionRight={this.navActionRight.bind(this)}></Header>;


        var currentImageSelection=null;
        switch(this.state.type){
            case "cameraroll":
                currentImageSelection=<SherpaCameraRollPicker ref="sherpaCameraRoll" selected={this.state.images.cameraroll} wrapper={{height:SCREEN_HEIGHT-120,position:'absolute',bottom:0}} backgroundColor={"#161616"} callback={this.getSelectedImagesCameraRoll.bind(this)} />
            break;
            case "instagram":
                currentImageSelection=<SherpaInstagramPicker ref="sherpaInstagram" selected={this.state.images.instagram} wrapper={{height:SCREEN_HEIGHT-120,position:'absolute',bottom:0}} backgroundColor={"#161616"} callback={this.getSelectedImagesInstagram.bind(this)} />
            break;
        }
        return(
            <View style={{flex:1,backgroundColor:"#161616"}}>
                {header}

                <View style={{width:SCREEN_WIDTH,marginTop:70,flex:1,flexDirection:'row',borderTopColor:"#343434",borderTopWidth:1}}>
                    <TouchableOpacity disabled={this.state.type==='cameraroll'} onPress={()=>this.setType('cameraroll')} ref="tab-cameraroll" style={{width:SCREEN_WIDTH/2,flex:1,height:50,alignItems:"center",justifyContent:'center'}}>
                        <Text style={{color:'white',fontFamily:Fonts.type.headline,fontSize:11,letterSpacing:.5}}>CAMERA ROLL</Text>
                    </TouchableOpacity>
                    <View style={{height:50,width:1,backgroundColor:"#343434"}}></View>
                    <TouchableOpacity disabled={this.state.type==='instagram'} onPress={()=>this.setType('instagram')} ref="tab-instagram" style={{width:SCREEN_WIDTH/2,flex:1,height:50,alignItems:"center",justifyContent:'center'}}>
                        <Text style={{color:'white',fontFamily:Fonts.type.headline,fontSize:11,letterSpacing:.5}}>INSTAGRAM</Text>
                    </TouchableOpacity>
                </View>
                {currentImageSelection}
            </View>
        )
    }
}


export default AddTrip;