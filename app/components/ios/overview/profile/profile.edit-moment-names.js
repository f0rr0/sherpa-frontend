'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
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




class EditMomentNames extends React.Component {
    constructor(props){
        super(props)
        this.state={
            navOpacity:new Animated.Value(1)
        }
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
        this.props.navigator.push({
            id: "editTripName",
            hideNav:true,
            momentData:this.props.momentData,
            sceneConfig:"right-nodrag"
        });
    }

    hideNav(){
        Animated.timing(this.state.navOpacity, {toValue: 0,duration:.8}).start();
    }

    showNav(){
        Animated.timing(this.state.navOpacity, {toValue: 1,duration:8}).start();
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
                    showsHorizontalScrollIndicator={false}
                >

                    {this.props.momentData.map((moment)=>{
                        console.log('current index',currentIndex);
                        currentIndex++;

                        return(<LocationName cardWidth={CARD_WIDTH} hideNav={this.hideNav.bind(this)} showNav={this.showNav.bind(this)} style={styles.card} moment={moment} isFirst={currentIndex===1}></LocationName>);

                    })}
                </ScrollView>
                <Animated.View style={[{flex:1,position:'absolute',top:0},{opacity:this.state.navOpacity}]}>
                    {this.props.navigation.default}
                </Animated.View>
                <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7,position:'absolute',bottom:14,left:7}} onPress={()=>{this.navActionRight()}} text="next step (edit tripname)"></SimpleButton>

            </View>
        )
    }
}


var styles = StyleSheet.create({
    container: {
        //flex: 1,
        backgroundColor:'transparent',
    },
    content: {
        marginTop: 130,
        backgroundColor:'transparent',
        paddingHorizontal: CARD_PREVIEW_WIDTH,
        alignItems: 'flex-start',
    },
    card: {
        //flex: 1,
        backgroundColor: 'transparent',
        width: CARD_WIDTH,
        margin: CARD_MARGIN,
        //height: CARD_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:2
    },
});



export default EditMomentNames;