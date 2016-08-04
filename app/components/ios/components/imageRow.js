import {
    View,
    TouchableHighlight,
    Image,
    Text,
    StyleSheet
} from 'react-native';
import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import moment from 'moment';

import TripTitle from "./tripTitle";
import UserImage from "./userImage";
var windowSize=Dimensions.get('window');
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';


var styles=StyleSheet.create({
    listItem: {
        flex: 1,
        backgroundColor: "#fcfcfc",
        justifyContent: "center",
        alignItems: 'center'
    },
    listItemContainer: {
        flex: 1,
        width: windowSize.width - 30,
        height: windowSize.width - 30,
        marginBottom: 14
    }
});

class ImageRow extends Component {
    constructor(props) {
        super(props);
        this.state={
            imageLoaded:false
        }
    }

    render() {
        var tripData=this.props.tripData;
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();
        return(
        <TouchableHighlight style={styles.listItemContainer} pressRetentionOffset={{top:1,left:1,bottom:1,right:1}} onPress={() => this.props.showTripDetail(tripData)}>
            <View style={styles.listItem}>
                <ImageProgress
                    style={{position:"absolute",top:0,left:0,flex:1,height:windowSize.width-30,width:windowSize.width-30,opacity:1}}
                    resizeMode="cover"
                    indicator={Progress.Circle}
                    indicatorProps={{
                        color: 'rgba(150, 150, 150, 1)',
                        unfilledColor: 'rgba(200, 200, 200, 0.2)'
                    }}
                    source={{uri:tripData.moments[0].mediaUrl}}
                    onLoad={() => {
                        this.setState({imageLoaded:true});
                    }}

                >
                    <View style={{flex:1, backgroundColor:"rgba(0,0,0,.2)"}}></View>
                </ImageProgress>


                <View style={{flex:1,opacity:this.state.imageLoaded?1:0,width:windowSize.width-30}}>
                    <View style={{position:'absolute',top:20,left:0,right:0,flex:1,alignItems:'center',backgroundColor:'transparent'}}>
                        <UserImage radius={50} userID={tripData.owner.id} imageURL={tripData.owner.serviceProfilePicture}></UserImage>
                    </View>

                    <TripTitle tripData={tripData} tripOwner={tripData.owner.serviceUsername+"'s"}></TripTitle>

                    <View style={{position:'absolute',bottom:20,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',left:0,right:0}}>
                        <Image source={require('image!icon-images')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length}</Text>
                        <Image source={require('image!icon-watch')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{timeAgo.toUpperCase()}</Text>
                    </View>
                </View>
            </View>
        </TouchableHighlight>
        )
    }
}



export default ImageRow;

