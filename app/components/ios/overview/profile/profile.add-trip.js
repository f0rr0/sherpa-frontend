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
const SCREEN_HEIGHT = require('Dimensions').get('window').height;
import EXIF from 'exif-js'
import RNFetchBlob from 'react-native-fetch-blob';
var styles = StyleSheet.create({
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
        //console.log('res',res[0].uri)
        this.setState({images:res})
    }

    navActionRight(){
        console.log(this.state.images);
        console.log('fetch blob');


        if(this.state.images.length==0)return;
        RNFetchBlob.fs.readFile(this.state.images[0].uri, 'base64')
            .then((data) => {
                var blob=this.base64ToArrayBuffer(data);
                console.log(EXIF.readFromBinaryFile(blob));
            }).catch((err)=>{
            });
    }

    base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:"#161616"}}>
                {this.props.navigation.default}
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <SherpaCameraRollPicker wrapper={{height:SCREEN_HEIGHT-65,position:'absolute',bottom:0}} backgroundColor={"#161616"} callback={this.getSelectedImages.bind(this)} />
            </View>
        )
    }
}


export default AddTrip;