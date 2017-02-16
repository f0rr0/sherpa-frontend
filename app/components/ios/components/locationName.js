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
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import { Fonts, Colors } from '../../../Themes/'
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import dismissKeyboard from 'react-native-dismiss-keyboard';


class LocationName extends Component{
    constructor(props){
        super();
        this.state={
            inputBottomMargin:new Animated.Value(0),
            isCover:false
        }

    }

    componentDidMount(){
    }

    isCover(val){
        this.setState({isCover:val})
    }

    componentDidUpdate(prevProps,prevState){
        //this.props.moment.isCover=this.state.isCover;
    }

    moveUp(){
        this.props.hideNav();
        Animated.spring(this.state.inputBottomMargin, {toValue: -350, friction:8}).start();
    }

    moveDown(){
        dismissKeyboard();
        this.props.showNav();
        Animated.spring(this.state.inputBottomMargin, {toValue: 0,friction:8}).start();
    }

    setCoverPhoto(){
        this.props.makeCoverPhoto(this.props.locationIndex);
    }

    render(){
        var moment = this.props.moment;
        return(
            <Animated.View style={[this.props.style,{marginTop:this.state.inputBottomMargin}]}>
                <View>
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
                        source={{uri:moment.mediaUrl}}
                        onLoad={() => {}}
                        onError={()=>{}}
                    />
                    <Image style={{width:this.props.cardWidth,position:'absolute',bottom:-60,left:0}} resizeMode="contain" source={require('../../../Images/shadow-bottom.png')}></Image>
                    <TouchableOpacity onPress={this.setCoverPhoto.bind(this)} style={{position:'absolute',right:12,bottom:12}}>
                        <View style={{flexDirection:'row',flex:1,alignItems:'center',justifyContent:'center'}}>

                            <Text style={{color:'white',fontSize:10,fontFamily:Fonts.type.headline,letterSpacing:1}}>MAKE THIS THE COVER PHOTO</Text>
                            <View style={{marginBottom:3,marginLeft:10,width:21,height:21}}>
                                <Image style={{position:'absolute',width:21,height:21}} resizeMode="contain" source={require('../../../Images/icon-empty-white-circle.png')}></Image>
                                <Image style={{position:'absolute',opacity:this.state.isCover?1:0,width:21,height:21}} resizeMode="contain" source={require('../../../Images/icon-check-white-circle.png')}></Image>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <GooglePlacesAutocomplete
                    placeholder='Enter photo location'
                    ref="googlesearch"
                    minLength={2} // minimum length of text to search
                    onTapOutside={ this.moveDown.bind(this)}
                    autoFocus={false}


                    textInputProps={{
                                            onFocus:(e)=>{
                                                this.moveUp();
                                            },
                                            onBlur:(e)=>{
                                                //this.moveDown();
                                            },
                                            onChangeText:(text)=>{
                                                if(text.length==0){
                                                    this.props.moment.venue=""
                                                }
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


                                            this.props.moment.lat=details.geometry.location.lat;
                                            this.props.moment.lng=details.geometry.location.lng;
                                            this.props.moment.location=details.name;
                                            this.props.moment.venue=details.name;
                                            this.props.moment.state=info.state;
                                            this.props.moment.country=info.country;

                                            //console.log(info);

                                            //console.log(this.props.moment);

                                            this.moveDown();
                                         }}
                    getDefaultValue={() => {
                                            return this.props.moment.venue;//this.state.hometown.name; // text input default value
                                         }}
                    query={{
                                             key: 'AIzaSyC8XIcEay54NdSsGEmTwt1TlfP7gXjlvXI',
                                             language: 'en', // language of the results
                                             types: ['establishment','geocode'], // default: 'geocode'
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
                                             listView:{
                                                backgroundColor:'#FFF'
                                             },
                                             container:{
                                                 backgroundColor:'#FFFFFF',
                                                 //maxHeight:300,
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

                    //filterReverseGeocodingByTypes={['establishment']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                />
            </Animated.View>
        )
    }
}


export default LocationName;