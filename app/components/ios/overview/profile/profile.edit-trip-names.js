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

const CARD_PREVIEW_WIDTH = 10
const CARD_MARGIN = 3;
const CARD_WIDTH = Dimensions.get('window').width - (CARD_MARGIN + CARD_PREVIEW_WIDTH) * 2;




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

                <ScrollView
                    style={styles.container}
                    automaticallyAdjustInsets={false}
                    horizontal={true}
                    decelerationRate={0}
                    snapToInterval={CARD_WIDTH + CARD_MARGIN*2}
                    snapToAlignment="start"
                    contentContainerStyle={styles.content}
                >
                    {this.props.momentData.map(function(moment){
                        console.log('current index',currentIndex);
                        currentIndex++;

                        return(<LocationName  style={styles.card} moment={moment} isFirst={currentIndex===1}></LocationName>);

                    })}
                </ScrollView>
                <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7,position:'absolute',bottom:14,left:7}} onPress={()=>{this.navActionRight()}} text="next step (edit tripname)"></SimpleButton>
                {this.props.navigation.default}

            </View>
        )
    }
}


var styles = StyleSheet.create({
    container: {
        //flex: 1,
        backgroundColor: '#F5FCFF',
    },
    content: {
        marginTop: 20,
        paddingHorizontal: CARD_PREVIEW_WIDTH,
        alignItems: 'center',
        //flex: 1,
    },
    card: {
        flex: 1,
        backgroundColor: '#ccc',
        width: CARD_WIDTH,
        margin: CARD_MARGIN,
        height: CARD_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
});



export default EditTripNames;