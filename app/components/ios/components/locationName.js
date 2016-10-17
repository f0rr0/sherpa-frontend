'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated
} from 'react-native';
import React, { Component } from 'react';
import SimpleButton from './simpleButton';
import RNFetchBlob from 'react-native-fetch-blob';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import Dimensions from 'Dimensions';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import { Fonts, Colors } from '../../../Themes/'
var windowSize=Dimensions.get('window');
import dismissKeyboard from 'react-native-dismiss-keyboard';


class LocationName extends Component{
    constructor(props){
        super();
        this.state={
            inputBottomMargin:new Animated.Value(0)
        }

    }

    componentDidMount(){
    }

    componentDidUpdate(prevProps,prevState){
    }

    moveUp(){
        //console.log('move up');
        this.props.hideNav();
        Animated.spring(this.state.inputBottomMargin, {toValue: -350, friction:8}).start();
        //Animated.spring(this.state.overlayOpacity, {toValue: .5,friction:8}).start();
        //Animated.spring(this.state.headlineOpacity, {toValue: 0,friction:8}).start();
    }

    moveDown(){
        dismissKeyboard();
        this.props.showNav();
        Animated.spring(this.state.inputBottomMargin, {toValue: 0,friction:8}).start();
        //Animated.spring(this.state.overlayOpacity, {toValue: 0,friction:8}).start();
        //Animated.spring(this.state.headlineOpacity, {toValue: 1,friction:8}).start();
    }


    render(){
        var moment = this.props.moment;
        //console.log(this)
        return(
            <Animated.View style={[this.props.style,{marginTop:this.state.inputBottomMargin}]}>
                <ImageProgress
                    resizeMode="cover"
                    indicator={Progress.Circle}
                    indicatorProps={{
                                                color: 'rgba(150, 150, 150, 1)',
                                                unfilledColor: 'rgba(200, 200, 200, 0.2)'
                                            }}
                    style={{
                      width:this.props.cardWidth,
                      height:this.props.cardWidth
                    }}
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
                                            onFocus:(e)=>{
                                                this.moveUp();
                                            },
                                            onBlur:(e)=>{
                                                //this.moveDown();
                                            }
                                         }}

                    fetchDetails={true}
                    onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                                            var result=details.address_components;
                                            var info={};
                                            for(var i= 0;i<result.length;++i){
                                                if(result[i].types[0]=="administrative_area_level_1"){info.state=result[i].long_name}
                                                if(result[i].types[0]=="locality"){info.location=result[i].long_name}
                                                if(result[i].types[0]=="country"){info.country=result[i].short_name}
                                            }


                                            this.props.moment.moment.lat=details.geometry.location.lat;
                                            this.props.moment.moment.lng=details.geometry.location.lng;
                                            this.props.moment.moment.location=details.name;
                                            this.props.moment.moment.state=info.state;
                                            this.props.moment.moment.country=info.country;

                                            this.moveDown();
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
                                                 letterSpacing:Fonts.letterSpacing.small,
                                                 width:this.props.cardWidth-10
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
                                                 backgroundColor:'#FFFFFF',
                                                 //maxHeight:100,
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
            </Animated.View>
        )
    }
}


export default LocationName;