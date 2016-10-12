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
import RNFetchBlob from 'react-native-fetch-blob';
import PhotoSelectorGrid from '../../components/photoSelector.grid';
import Swiper from 'react-native-swiper';
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

    _renderFooter(){
        return(
            <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7,position:'absolute',bottom:0,left:7}} onPress={()=>{this.navActionRight()}} text="next step (edit locations)"></SimpleButton>
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

                        return(
                            <View style={styles.container} key={moment.id}>
                                <View style={currentIndex==1?styles.content:styles.secondContent}>
                                    <ImageProgress
                                        resizeMode="cover"
                                        indicator={Progress.Circle}
                                        indicatorProps={{
                                                color: 'rgba(150, 150, 150, 1)',
                                                unfilledColor: 'rgba(200, 200, 200, 0.2)'
                                            }}
                                        style={styles.bg}
                                        source={{uri:moment.image.uri}}
                                        onLoad={() => {}}
                                        onError={()=>{}}
                                    />
                                    <GooglePlacesAutocomplete
                                        placeholder='Enter photo location'
                                        ref="googlesearch"
                                        minLength={2} // minimum length of text to search
                                        autoFocus={false}


                                        textInputProps={{
                                            //onEndEditing:()=>{
                                            //},
                                            onBlur:(e)=>{
                                            e.preventDefault();
                                               //this.refs.googlesearch.setAddressText(this.state.hometown.name)
                                            }
                                         }}

                                        fetchDetails={true}
                                        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true

                                            var hometownObject={
                                                lat:details.geometry.location.lat,
                                                lng:details.geometry.location.lng,
                                                name:details.name
                                            }

                                            this.setState({hometown:hometownObject});

                                            //this.props.dispatch(setUserHometown(hometownObject));
                                            //this.props.dispatch(updateUserData({hometown:hometownObject.name}));
                                         }}
                                        getDefaultValue={() => {
                                            return "";//this.state.hometown.name; // text input default value
                                         }}
                                        query={{
                                             key: 'AIzaSyC8XIcEay54NdSsGEmTwt1TlfP7gXjlvXI',
                                             language: 'en', // language of the results
                                             types: '(cities)', // default: 'geocode'
                                         }}
                                        styles={{
                                             description: {
                                                 fontFamily: Fonts.type.bodyCopy,
                                                 fontSize: Fonts.size.input,
                                                 letterSpacing:Fonts.letterSpacing.small,
                                                 color:'#333'
                                             },
                                                 predefinedPlacesDescription: {
                                                 color: '#FF0000',
                                             },
                                                 poweredContainer: {
                                                 justifyContent: 'center',
                                                 alignItems: 'center',
                                                 opacity:0
                                             },
                                             textInput: {
                                                 backgroundColor: '#FFFFFF',
                                                 height: 42,
                                                 borderRadius: 0,
                                                 paddingTop:0,
                                                 paddingBottom:0,
                                                 fontWeight:'normal',
                                                 fontFamily: Fonts.type.bodyCopy,
                                                 fontSize: Fonts.size.input,
                                                 letterSpacing:Fonts.letterSpacing.small
                                             },
                                             textInputContainer: {
                                                 backgroundColor: '#FFFFFF',
                                                 height:55,
                                                 borderRadius:2,
                                                 borderTopWidth: 1,
                                                 borderLeftWidth:1,
                                                 borderRightWidth:1,
                                                 borderBottomWidth: 1,
                                                 borderColor:"#e5e5e5",
                                                 borderBottomColor:"#e5e5e5",
                                                 borderTopColor:"#e5e5e5",
                                             },
                                             container:{
                                                 backgroundColor:'#FFF',
                                                 maxHeight:100,
                                                 left:0,
                                                 marginTop:10
                                             },
                                             separator: {
                                                 height: 0,
                                                 backgroundColor: '#FFFFFF'
                                             }
                                         }}

                                        currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                                        currentLocationLabel="Current location"
                                        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                                        GoogleReverseGeocodingQuery={{
                                         }}
                                        GooglePlacesSearchQuery={{
                                            rankby: 'distance'
                                         }}

                                        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                                    />
                                </View>
                            </View>);

                    })}
                </ScrollView>
                {this.props.navigation.default}

            </View>
        )
    }
}

var styles = StyleSheet.create({
    content:{
        left:0,
        width: windowSize.width-28,
    },
    secondContent:{
        left: -21,
        top: 0,
        width: windowSize.width-28,
    },
    container: {
        flexDirection: 'column',
        alignItems: "center",
        justifyContent:'flex-start',
        height: windowSize.height,
        width: windowSize.width,
        marginTop:100//-windowSize.width+20
    },
    bg: {
        height: windowSize.width-14
    },
})


export default EditTripNames;