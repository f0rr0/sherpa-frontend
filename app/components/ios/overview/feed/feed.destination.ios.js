'use strict';

//import Mapbox from "react-native-mapbox-gl";
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
import SimpleButton from '../../components/simpleButton'
import MarkerMap from '../../components/MarkerMap'
import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight,
TouchableOpacity
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
    subTitleContainer:{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',position:'absolute',top:windowSize.height*.8,left:15,right:15,height:20,marginTop:-5},
    tripDataFootnoteCopy:{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"},

    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:60
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
    row:{flexDirection: 'row',justifyContent:"space-between"},
    mapMaskedView:{backgroundColor:'#FAFAFA', justifyContent:'center', height:473, width:windowSize.width-24,alignItems:'center',marginBottom:0,marginTop:70},
    blackOverlay:{position:"absolute",top:0,left:0,flex:1,height:610,width:windowSize.width,opacity:1,backgroundColor:'black' },
    maskedViewImage:{position:"absolute",top:0,left:0,flex:1,height:610,width:windowSize.width,opacity:.5 },
});

class FeedDestination extends Component {
    constructor(props){
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        const itemsPerRow=2;
        let organizedMoments=[];
        let data=props.trip.moments;

        if(!props.trip.organizedMoments){
            let globalIndex=0;
            for(var i=0;i<props.trip.moments.length;i++){
                let endIndex=Math.random()>.5||globalIndex==0?1+i:itemsPerRow+i;
                organizedMoments.push(data.slice(i, endIndex));
                i = endIndex-1;
                globalIndex++;
            }
            props.trip.organizedMoments=organizedMoments;
        }else{
            organizedMoments=props.trip.organizedMoments;
        }

        this.state= {
            dataSource: ds.cloneWithRows(organizedMoments),
            annotations:[],
            containerWidth:windowSize.width-25
        };
    }

    componentDidUpdate(){
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }


    showTripLocation(trip){
        //console.log('trip',trip);
        this.props.navigator.push({
            id: "location",
            data:trip
        });
    }


    _renderFooterView(){
        //console.log(this.props.trip);
        return;
        return <View style={{marginBottom:20}}>
            {this.state.trip.locus?<SimpleButton style={{width:windowSize.width-30}} onPress={()=>{
            this.showTripLocation(this.state.trip.nameGid)}} text={"Explore "+this.state.trip.location}></SimpleButton>:null}
        </View>
    }


    render(){
        return(
            <View style={{backgroundColor:"white",width:windowSize.width}}>
                <ListView
                   dataSource={this.state.dataSource}
                   renderRow={this._renderRow.bind(this)}
                   contentContainerStyle={styles.listView}
                   renderHeader={this._renderHeader.bind(this)}
                   renderFooter={this._renderFooterView.bind(this)}
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
                <PopOver enableNavigator={this.props.enableNavigator} ref="popover" shareURL={config.auth[config.environment].shareBaseURL+"suitcases/"+this.props.trip.id}></PopOver>

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
            data:tripDetails,
            sceneConfig:"right-nodrag"
        });
    }

    showTripMap(trip){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip,
            title:trip.name,
            sceneConfig:"bottom-nodrag",
            hideNav:true
        });
    }

    _renderHeader(){
        var tripData=this.props.trip;
        var photoOrPhotos=tripData.moments.length>1?"PHOTOS":"PHOTO";
        var mapURI=this.props.trip.moments[0].mediaUrl;
        var tripLocation=this.props.trip.name;
        this.props.trip.type='country';

        var country = countries.filter(function(country) {
            return country["alpha-2"].toLowerCase() === tripLocation.toLowerCase();
        })[0];

        if(country)tripLocation=country.name;
        this.props.trip.country=this.props.trip.name;
        var timeAgo="UPDATED "+moment(new Date(tripData.updatedAt)).fromNow()


        return (
            <View style={{width:windowSize.width,alignItems:'center'}}>
                <TouchableOpacity  style={styles.mapMaskedView} onPress={()=>{this.showTripMap(this.props.trip)}}>
                    <MarkerMap ref="markermap" moments={this.props.trip.moments} interactive={false}></MarkerMap>
                </TouchableOpacity>
                <View style={{width:windowSize.width,marginTop:15,marginBottom:12}}>
                    <Text style={{marginLeft:14,fontWeight:"600",fontSize:10,fontFamily:"TSTAR"}}>{this.props.trip.moments.length} PLACES SAVED</Text>
                </View>
                {this.props.navigation.default}

            </View>
        )
    }

    _renderRow(rowData,sectionID,rowID) {
        var index=0;
        var items = rowData.map((item) => {
            if (item === null || item.type!=='image') {
                return null;
            }

            index++;
            return  <MomentRow user={this.props.user} isSuitcased={true} key={"momentRow"+rowID+"_"+index} itemRowIndex={index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
        });
        return (
            <View style={[styles.row,{width:this.state.containerWidth}]}>
                {items}
            </View>
        );
    }
}


export default FeedDestination;