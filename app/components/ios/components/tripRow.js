import {
    View,
    TouchableHighlight,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
TouchableWithoutFeedback,
Animated
} from 'react-native';
import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import moment from 'moment';

import TripTitle from "./tripTitle";
import UserImage from "./userImage";
import MarkerMap from "./MarkerMap";
var windowSize=Dimensions.get('window');
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import { BlurView, VibrancyView } from 'react-native-blur';

var styles=StyleSheet.create({
    listItem: {
        flex: 1,
        //backgroundColor: "#fcfcfc",
        justifyContent: "center",
        alignItems: 'center',
    },
    listItemContainer: {
        marginBottom: 14
    },

    imageRowContainer:{flex:1,width:windowSize.width-30,height:windowSize.width-30,justifyContent:"center"},

    tripDataFootnoteCopy:{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"},
    tripDataFootnoteContainer:{position:'absolute',bottom:12,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',right:10},
    tripDataFootnoteIcon:{height:7,marginBottom:3,marginLeft:6},

    darkener:{flex:1, backgroundColor:"rgba(0,0,0,.2)"},
    userImageContainer:{position:'absolute',bottom:15,left:15,flex:1,alignItems:'center',backgroundColor:'transparent'},
    tripTitleSmall:{color:"#FFFFFF",fontSize:35, fontFamily:"TSTAR", fontWeight:"500",letterSpacing:1,backgroundColor:"transparent",textAlign:"center"},
    tripTitleLarge: {color:"#FFFFFF",fontSize:12,backgroundColor:"transparent",marginBottom:0,fontFamily:"TSTAR", fontWeight:"800"},
    tripImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.width-30,width:windowSize.width-30,opacity:1}
});

class TripRow extends Component {
    constructor(props) {
        super(props);
        var isFullBleed=!!props.tripData.isHometown||props.tripData.contentType=='guide';
       //console.log('is full bleed',isFullBleed,' data',props.tripData)
        this.state={
            imageLoaded:false,
            userImageRadius:25,
            isFullBleed:isFullBleed,
            imageLoadedOpacity:new Animated.Value(0),
            baseWidth:isFullBleed?windowSize.width:windowSize.width-30,
            baseHeight:isFullBleed?450:windowSize.width-30
        }

    }

    render() {
        var tripData=this.props.tripData;
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();
        var largeImageURI=null;
        var thumbnailURL=null;
        var bottomLeftContent=null;
        var tripTitle=null;
        var bottomRightContent=null;

        //if(!tripData.country || !tripData.continent || !tripData.name)return null;

        let bottomContentType=tripData.contentType;
        if(this.state.isFullBleed)bottomContentType='guide';

        //console.log('full bleed: ',this.state.isFullBleed,'tripData: ',tripData,' ::bottom content type',bottomContentType)
        switch(bottomContentType){
            case "guide":
                //console.log('trip dataaaaa',tripData)
                largeImageURI=tripData.mediaUrl||tripData.moments[0].mediaUrl;
                thumbnailURL=tripData.lowresUrl||tripData.moments[0].lowresUrl;
                let locationLayer="";
                switch(tripData.layer){
                    case "neighbourhood":
                        locationLayer="Neighborhood";
                        break;
                    case "locality":
                        locationLayer="City";
                        break;
                    case "borough":
                        locationLayer="Borough";
                        break;
                    case "region":
                        locationLayer="State / Province";
                        break;
                    case "macro-region":
                        locationLayer="Region";
                        break;
                    case "country":
                        locationLayer="Country";
                        break;
                    case "continent":
                        locationLayer="Continent";
                        break;
                    default:
                        locationLayer="";
                }

                let guideString=tripData.isHometown?"LOCAL":" GUIDE"
                bottomLeftContent=
                    <View style={{flex:1,flexDirection:'row'}}>
                        <Image  source={require('./../../../Images/icons/guide-icon.png')}></Image>
                        <Text  style={[styles.tripDataFootnoteCopy,{marginLeft:5}]}>{locationLayer.toUpperCase() +""+guideString} </Text>
                    </View>
                bottomRightContent= <
                    View style={styles.tripDataFootnoteContainer}>
                        <Image source={require('image!icon-images')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                        <Text style={styles.tripDataFootnoteCopy}>{tripData.venueCount||tripData.momentcount||tripData.moments.length}</Text>
                    </View>
                tripTitle=  <View style={{alignItems:'center'}}>
                                <Text style={styles.tripTitleLarge}>{tripData.isHometown?"":"EXPLORE"}</Text>
                                <Text  style={styles.tripTitleSmall}>{tripData.name.toUpperCase()}</Text>
                            </View>
             break;
             case "trip":
             default:
                 //console.log('trip data moments',tripData.moments)
                largeImageURI=tripData.moments[0].mediaUrl;
                thumbnailURL=tripData.moments[0].serviceJson?tripData.moments[0].serviceJson.images.thumbnail.url:tripData.moments[0].mediaUrl;
                if(tripData.owner){
                    bottomLeftContent=<UserImage radius={this.state.userImageRadius} userID={tripData.owner.id} imageURL={tripData.owner.serviceProfilePicture}></UserImage>
                    tripTitle=<TripTitle isProfile={this.props.isProfile} tripData={tripData} tripOwner={tripData.owner.serviceUsername}></TripTitle>
                }

                bottomRightContent=(
                    <View style={styles.tripDataFootnoteContainer}>
                        <Image source={require('image!icon-images')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                        <Text style={styles.tripDataFootnoteCopy}>{tripData.momentCount||tripData.moments.length}</Text>
                        <Image source={require('image!icon-watch')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                        <Text style={styles.tripDataFootnoteCopy}>{timeAgo.toUpperCase()}</Text>
                    </View>
                )
             break;
        }



        return(
        <TouchableWithoutFeedback onPress={() => this.props.showTripDetail(tripData)} activeOpacity={1} style={{height:this.state.baseHeight,marginBottom:10}} >
            <View style={{height:this.state.baseHeight,width:this.state.baseWidth,marginBottom:15}} >
                <View style={styles.listItem}>
                    <Image
                        style={[styles.tripImage,{height:this.state.baseHeight,width:this.state.baseWidth}]}
                        resizeMode="cover"
                        source={{uri:thumbnailURL}}
                    >
                        <View style={styles.darkener}></View>
                        <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>
                    </Image>

                    <Animated.Image
                        style={[styles.tripImage,{opacity:this.state.imageLoadedOpacity,height:this.state.baseHeight,width:this.state.baseWidth}]}
                        resizeMode="cover"
                        source={{uri:largeImageURI}}
                        onLoad={() => {
                             Animated.timing(this.state.imageLoadedOpacity,{toValue:1,duration:200}).start()
                        }}

                    >
                        <View style={styles.darkener}></View>
                    </Animated.Image>

                    <Animated.View style={[styles.userImageContainer,{opacity:this.state.imageLoadedOpacity}]}>
                        {bottomLeftContent}
                    </Animated.View>

                    <Animated.View style={[styles.imageRowContainer,{opacity:this.state.imageLoadedOpacity}]}>
                        {tripTitle}
                        {bottomRightContent}
                    </Animated.View>
                </View>
            </View>
        </TouchableWithoutFeedback>
        )
    }
}



export default TripRow;

