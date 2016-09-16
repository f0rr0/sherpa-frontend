'use strict';

import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedLocation from "./feed.location.ios";
import FeedProfile from "./feed.profile.ios";
import countries from "./../../../../data/countries";
import moment from 'moment';
import {loadFeed} from '../../../../actions/feed.actions';
import {addMomentToSuitcase} from '../../../../actions/user.actions';
import StickyHeader from '../../components/stickyHeader';
import PopOver from '../../components/popOver';
import TripTitle from '../../components/tripTitle';
import config from '../../../../data/config';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import MomentRow from '../../components/momentRow'

import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';


var styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center',
        paddingBottom:10,
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:20
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:30
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-15,
        marginBottom:13,
        marginLeft:15,
        marginRight:15,
        width:windowSize.width-30,
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    mapMaskedView:{backgroundColor:'#FAFAFA', justifyContent:'center', height:670, width:windowSize.width,alignItems:'center',flex:1},
    blackOverlay:{position:"absolute",top:0,left:0,flex:1,height:610,width:windowSize.width,opacity:1,backgroundColor:'black' },
    maskedViewImage:{position:"absolute",top:0,left:0,flex:1,height:610,width:windowSize.width,opacity:.5 },
});

class FeedDestination extends Component {
    constructor(){
        super();
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state= {
            dataSource: ds.cloneWithRows([]),
            annotations:[]
        };
    }

    componentDidUpdate(){
    }

    toggleNav(){
        this.refs.popover._setAnimation("toggle");
    }

    componentWillMount(){
        var markers=[];
        for (var i=0;i<this.props.trip.moments.length;i++){
            markers.push({
                coordinates: [this.props.trip.moments[i].lat, this.props.trip.moments[i].lng],
                type: 'point',
                title:this.props.trip.moments[i].venue,
                annotationImage: {
                    url: 'image!icon-pin',
                    height: 8,
                    width: 8
                },
                id:"markers"+i
            })
        }

        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({dataSource:ds.cloneWithRows(this.props.trip.moments),annotations:markers})
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:"white"}}>
                <ListView
                   dataSource={this.state.dataSource}
                   renderRow={this._renderRow.bind(this)}
                   contentContainerStyle={styles.listView}
                   renderHeader={this._renderHeader.bind(this)}
                   enableEmptySections={true}
                   ref="listview"
                   onScroll={(event)=>{
                         var currentOffset = event.nativeEvent.contentOffset.y;
                         var direction = currentOffset > this.offset ? 'down' : 'up';
                         this.offset = currentOffset;
                         if(direction=='down'||currentOffset<100){
                            this.refs.stickyHeader._setAnimation(false);
                         }else{
                            this.refs.stickyHeader._setAnimation(true);
                         }
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <PopOver ref="popover" shareURL={config.shareBaseURL+"/suitcase/"+this.props.trip.id+"-"+this.props.user.sherpaID+"/"+this.props.user.sherpaToken}></PopOver>

            </View>
        )
    }

    showTripDetail(trip,owner){
        var tripDetails={trip,owner:{
            serviceUsername:trip.serviceJson.user.username,
            serviceProfilePicture:trip.serviceJson.user.profile_picture,
            id:trip.serviceJson.user.id,
            serviceObject:{"bio":""},
            hometown:""
        }};
        this.props.navigator.push({
            id: "tripDetail",
            tripDetails
        });
    }

    _renderHeader(){
        var tripData=this.props.trip;
        var photoOrPhotos=tripData.moments.length>1?"PHOTOS":"PHOTO";
        var mapURI=this.props.trip.moments[0].mediaUrl;

        return (
            <View style={{flex:1,height:830}}>
                <View maskImage='mask-test' style={styles.mapMaskedView} >

                    <View
                        style={styles.blackOverlay}
                    />
                    <Image
                        style={styles.maskedViewImage}
                        source={{uri:mapURI}}
                    >
                    </Image>
                    <TripTitle style={{marginTop:100}} type="destination" showSubtitle={false} standalone={true} tripData={tripData}></TripTitle>
                </View>
                <Mapbox
                    style={{height:250,width:windowSize.width-30,left:15,backgroundColor:'black',flex:1,position:'absolute',top:570,fontSize:10,fontFamily:"TSTAR", fontWeight:"500"}}
                    accessToken={'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw'}
                    centerCoordinate={{latitude: this.props.trip.moments[0].lat,longitude: this.props.trip.moments[0].lng}}
                    zoomLevel={6}
                    annotations={this.state.annotations}
                    scrollEnabled={false}
                    zoomEnabled={false}
                />

                {this.props.navigation.default}

            </View>
        )
    }

    _renderRow(tripData) {
        tripData.suitcased=true;
        return (
            <MomentRow tripData={tripData} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
        );
    }
}


export default FeedDestination;