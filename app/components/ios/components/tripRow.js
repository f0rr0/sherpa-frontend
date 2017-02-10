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
        flex: 1,
        width: windowSize.width - 30,
        height: windowSize.width - 30,
        marginBottom: 14
    },

    listItemContainerFeatured:{
        height:450,
        width: windowSize.width,
        marginBottom: 14,
        //backgroundColor:'red'
    },

    imageRowContainer:{flex:1,width:windowSize.width-30},

    tripDataFootnoteCopy:{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"},
    tripDataFootnoteContainer:{position:'absolute',bottom:12,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',right:15},
    tripDataFootnoteIcon:{height:7,marginBottom:3,marginLeft:6},

    darkener:{flex:1, backgroundColor:"rgba(0,0,0,.2)"},
    userImageContainer:{position:'absolute',bottom:15,left:15,flex:1,alignItems:'center',backgroundColor:'transparent'},

    tripImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.width-30,width:windowSize.width-30,opacity:1}
});

class TripRow extends Component {
    constructor(props) {
        super(props);
        this.state={
            imageLoaded:false,
            userImageRadius:25,
            imageLoadedOpacity:new Animated.Value(0)
        }

    }

    render() {
        var tripData=this.props.tripData;
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();

        if(!tripData.moments[0])return null;
        if(!tripData.country || !tripData.continent || !tripData.name)return null;

        //console.log('trip data',tripData);



        return(
        <TouchableOpacity onPress={() => this.props.showTripDetail(tripData)} activeOpacity={1} style={{height:tripData.isHometown?450:windowSize.width-30,marginBottom:10}} >
            <View style={tripData.isHometown?styles.listItemContainerFeatured:styles.listItemContainer} >
                <View style={styles.listItem}>
                    <Image
                        style={[styles.tripImage,{height:tripData.isHometown?450:windowSize.width-30,width:tripData.isHometown?windowSize.width:windowSize.width-30}]}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].serviceJson?tripData.moments[0].serviceJson.images.thumbnail.url:tripData.moments[0].mediaUrl}}
                    >
                        <View style={styles.darkener}></View>
                        <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>
                    </Image>

                    <Animated.Image
                        style={[styles.tripImage,{opacity:this.state.imageLoadedOpacity,height:tripData.isHometown?450:windowSize.width-30,width:tripData.isHometown?windowSize.width:windowSize.width-30}]}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                        onLoad={() => {
                             Animated.timing(this.state.imageLoadedOpacity,{toValue:1,duration:200}).start()
                        }}

                    >
                        <View style={styles.darkener}></View>
                    </Animated.Image>

                    <Animated.View style={[styles.userImageContainer,{opacity:this.state.imageLoadedOpacity}]}>
                        <UserImage radius={this.state.userImageRadius} userID={tripData.owner.id} imageURL={tripData.owner.serviceProfilePicture}></UserImage>
                    </Animated.View>

                    <Animated.View style={[styles.imageRowContainer,{opacity:this.state.imageLoadedOpacity}]}>


                        <TripTitle tripData={tripData} tripOwner={tripData.owner.serviceUsername}></TripTitle>

                        <View style={styles.tripDataFootnoteContainer}>
                            <Image source={require('image!icon-images')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                            <Text style={styles.tripDataFootnoteCopy}>{tripData.moments.length}</Text>
                            <Image source={require('image!icon-watch')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                            <Text style={styles.tripDataFootnoteCopy}>{timeAgo.toUpperCase()}</Text>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </TouchableOpacity>
        )
    }
}



export default TripRow;

