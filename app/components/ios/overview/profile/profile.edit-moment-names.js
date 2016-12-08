'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
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
import SimpleError from '../../components/simpleError';
import { ScrollView } from 'react-native'
import AddPaging from 'react-native-paged-scroll-view/index'
var PagedScrollView = AddPaging(ScrollView)

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
        //console.log(this.props.momentData)
        this.makeCoverPhoto(1);
    }

    _renderHeader(){
        return (
            <View style={{flex:1,justifyContent:'center',height:70,width:SCREEN_WIDTH,alignItems:'center',backgroundColor:'white'}}>
                {this.props.navigation.default}
            </View>
        )
    }


    navActionRight(){
        if(this.checkEmpty()){
            this.refs.locationError.show();
        }else{
            this.refs.locationError.hide();
            this.props.navigator.push({
                id: "editTripName",
                hideNav:true,
                tripData:this.props.tripData,
                momentData:this.props.momentData,
                sceneConfig:"right-nodrag"
            });
        }
    }

    checkEmpty(){

        var isEmpty=false;
        for(var i=0;i<this.props.momentData.length;i++){
            isEmpty=!this.props.momentData[i].location&&this.props.momentData[i].selected;
        }
        return isEmpty;
    }

    hideNav(){
        Animated.timing(this.state.navOpacity, {toValue: 0,duration:.8}).start();
    }

    showNav(){
        Animated.timing(this.state.navOpacity, {toValue: 1,duration:8}).start();
    }

    makeCoverPhoto(index){
        var currentIndex=0;
        this.props.momentData.map((moment)=>{
            currentIndex++;
            if(moment.selected){
                this.refs["location-"+currentIndex].isCover(currentIndex===index);
            };
        })
    }

    handlePageChange(){
        var currentIndex=0;
        this.props.momentData.map((moment)=>{
            currentIndex++;
            if(moment.selected){
                this.refs["location-"+currentIndex].moveDown();
            };
        })
    }

    render(){
        var currentIndex=0;
        return(
            <View style={{flex:1,backgroundColor:'white'}}>

                {/* //error message here */}

                <PagedScrollView
                    style={styles.container}
                    automaticallyAdjustInsets={false}
                    horizontal={true}
                    decelerationRate={0}
                    ref="scrollview"
                    snapToInterval={CARD_WIDTH + CARD_MARGIN*2}
                    snapToAlignment="start"
                    contentContainerStyle={styles.content}
                    showsHorizontalScrollIndicator={false}
                    onPageChange={this.handlePageChange.bind(this)}
                >

                    {this.props.momentData.map((moment)=>{
                        currentIndex++;
                        return moment.selected?(<LocationName makeCoverPhoto={this.makeCoverPhoto.bind(this)} ref={"location-"+currentIndex} locationIndex={currentIndex} key={currentIndex} cardWidth={CARD_WIDTH} hideNav={this.hideNav.bind(this)} showNav={this.showNav.bind(this)} style={styles.card} moment={moment}></LocationName>):null;
                    })}
                </PagedScrollView>
                <Animated.View style={[{flex:1,position:'absolute',top:0},{opacity:this.state.navOpacity}]}>
                    {this.props.navigation.default}
                </Animated.View>
                <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7,position:'absolute',bottom:14,left:7}} onPress={()=>{this.navActionRight()}} text="next step (edit tripname)"></SimpleButton>
                <SimpleError ref="locationError" errorMessage="Please add a location name to each photo"></SimpleError>

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