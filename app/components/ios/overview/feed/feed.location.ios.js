'use strict';

//import Mapbox from "react-native-mapbox-gl";
import countries from "./../../../../data/countries";
import moment from 'moment';
import { connect } from 'react-redux';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import FeedTrip from './feed.trip.ios'
import {getQueryString,encodeQueryData} from '../../../../utils/query.utils';
import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../../actions/user.actions';
import config from '../../../../data/config';
const {sherpa}=config.auth[config.environment];
import StickyHeader from '../../components/stickyHeader';
import PopOver from '../../components/popOver';
import WikipediaInfoBox from '../../components/wikipediaInfoBox';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import MomentRow from '../../components/momentRow'
import MarkerMap from '../../components/MarkerMap'


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight,
    TouchableOpacity,
    Alert
} from 'react-native';
import React, { Component } from 'react';


class FeedLocation extends Component {
    constructor(props){
        super();
        this.itemsLoadedCallback=null;
        this.moments=[];
        this.state={moments:[],containerWidth:windowSize.width-30,originalMoments:[]}
    }

    componentDidMount(){
        //console.log('trip location');
    }
    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    showTripDetail(trip,owner){

        var tripDetails={trip,owner};
        this.props.navigator.push({
            id: "tripDetail",
            tripDetails,
            sceneConfig:"right-nodrag"
        });
    }


    showTripMap(trip){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip,
            regionMap:true,
            sceneConfig:"right-nodrag"
        });
    }

    _onFetch(page=1,callback){
        let req;
        let searchType;
        let data=this.props.trip;
        if(this.props.version=='v2'){
            req={
                layer:data.layer,
                source:data.source,
                source_id:data.source_id
            }
            searchType='search-places-v2';
        }else{
            req={type:data.type,page}
            req[data.type]=this.props.trip[data.type];
            searchType='search-places';
        }
        getFeed(req,page,searchType).then((response)=>{
            if(page==1&&response.moments.length==0){
                Alert.alert(
                    'Location is Empty',
                    'We dont have any moments for this location',
                    [
                        {text: 'OK'}
                    ]
                )
                this.props.navigator.pop();
            }else{


                const itemsPerRow=2;
                let organizedMoments=[];
                let data=response.moments;

                    for(var i=0;i<data.length;i++){
                        let endIndex=Math.random()>.5?itemsPerRow+i:1+i;
                        organizedMoments.push(data.slice(i, endIndex));
                        i = endIndex-1;
                    }


                if(page==1)this.setState({moments:organizedMoments,originalMoments:response.moments});
                var settings=response.moments.length==0?{
                    allLoaded: true
                }:{};

                callback(organizedMoments,settings);
            }
        })
    }


    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    getTripLocation(tripData){
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.name;
        })[0];

        var tripLocation=tripData.name;
        return {location:tripLocation,country:country,countryCode:tripData.country};
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <SherpaGiftedListview
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}
                    ref="listview"
                    onEndReachedThreshold={1200}
                    paginationFetchingView={this._renderEmpty.bind(this)}
                    removeClippedSubviews={false}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
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
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />

                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                <PopOver ref="popover" shareCopy="SHARE" shareURL={config.shareBaseURL+"/location/"+this.props.trip.name+"/"+this.props.user.sherpaToken}></PopOver>
            </View>
        )
    }


    _renderHeader(){
        var tripData=this.props.trip;
        var moments=this.state.moments;
        if(moments.length==0)return null
        var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+moments[0][0].lng+","+moments[0][0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidHJhdmVseXNoZXJwYSIsImEiOiJjaXRrNnk5OHgwYW92Mm9ta2J2dWw1MTRiIn0.QZvGaQUAnLMvoarRo9JmOg";
        var country=this.getTripLocation(tripData);
        var randomMoment=moments[Math.floor(Math.random()*moments.length)][0];
        //console.log(mapURI)

        //console.log(this.state.moments);

        //console.log(this.props.trip)
        return (
            <View style={{flex:1}}>
                <View style={{backgroundColor:'#000', height:windowSize.height, width:windowSize.width, marginBottom:180,alignItems:'center',flex:1}} >

                    <Image
                        style={{height:windowSize.height,width:windowSize.width,left:0,opacity:.5,backgroundColor:'black',flex:1,position:'absolute',top:0}}
                        source={{uri:randomMoment.highresUrl||randomMoment.mediaUrl}}
                    >

                    </Image>


                    <View style={{flex:1,alignItems:'center',justifyContent:'center',position:'absolute',top:250,left:0,right:0,height:20}}>
                        <View>
                            <Text style={{color:"#FFFFFF",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{tripData.name.toUpperCase()}</Text>
                        </View>
                        <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                        </View>
                    </View>
                </View>
                <View style={{height:260,width:windowSize.width-30,left:15,backgroundColor:'white',flex:1,position:'absolute',top:windowSize.height*.85}}>
                    <TouchableOpacity style={styles.map} onPress={()=>{this.showTripMap({moments:this.state.originalMoments})}}>
                        <MarkerMap interactive={false} moments={this.state.originalMoments}></MarkerMap>
                    </TouchableOpacity>
                </View>
                <WikipediaInfoBox isLocationView={true} type={this.props.isCountry?"country":"location"} country={country} countryCode={tripData.country} location={tripData.name} coordinates={{lat:this.state.moments[0].lat,lng:this.state.moments[0].lng}}></WikipediaInfoBox>
                {this.props.navigation.default}

            </View>
        )
    }

    _renderRow(rowData,sectionID,rowID){
        var index=0;
        var items = rowData.map((item) => {moment
            if (item === null || item.type!=='image') {
                return null;
            }

            index++;
            return  <MomentRow key={"momentRow"+rowID+"_"+index}  itemRowIndex={index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
        });


        return (
            <View style={[styles.row,{width:windowSize.width-30}]}>
                {items}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center',
        paddingBottom:10,
    },
    row:{flexDirection: 'row'},
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    map: {
        ...StyleSheet.absoluteFillObject
    },
});

export default FeedLocation;