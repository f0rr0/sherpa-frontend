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


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';


class FeedLocation extends Component {
    constructor(props){
        super();
        this.itemsLoadedCallback=null;
        this.moments=[];
        this.state={moments:[]}
    }

    componentDidMount(){
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

    _onFetch(page=1,callback){
        var req={type:this.props.trip.type,page}
        req[this.props.trip.type]=this.props.trip[this.props.trip.type];

        getFeed(req,page,'search-places').then((response)=>{
            if(page==1)this.setState({moments:response.moments});
            var settings=response.moments.length==0?{
                allLoaded: true, // the end of the list is reached
            }:{};
            callback(response.moments,settings);
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
            <View style={{flex:1,backgroundColor:'white',width:windowSize.width}}>
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
        var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+moments[0].lng+","+moments[0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidHJhdmVseXNoZXJwYSIsImEiOiJjaXRrNnk5OHgwYW92Mm9ta2J2dWw1MTRiIn0.QZvGaQUAnLMvoarRo9JmOg";
        var country=this.getTripLocation(tripData);
        console.log(mapURI)
        return (
            <View>
                <View style={{backgroundColor:'#FFFFFF', height:500, width:windowSize.width, marginBottom:-200,alignItems:'center',flex:1}} >

                    <Image
                        style={{height:602,width:windowSize.width,left:0,opacity:.5,backgroundColor:'black',flex:1,position:'absolute',top:0}}
                        source={{uri:mapURI}}
                    >

                    </Image>


                    <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',position:'absolute',top:125,left:0,right:0,height:20}}>
                        <View>
                            <Text style={{color:"#282b33",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{tripData.name.toUpperCase()}</Text>
                        </View>
                        <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                        </View>
                    </View>
                </View>
                <WikipediaInfoBox isLocationView={true} type={this.props.isCountry?"country":"location"} country={country} countryCode={tripData.country} location={tripData.name} coordinates={{lat:this.state.moments[0].lat,lng:this.state.moments[0].lng}}></WikipediaInfoBox>
                {this.props.navigation.default}

            </View>
        )
    }

    _renderRow(tripData,sectionID,rowID){
        return (
            <View style={[styles.row,{width:windowSize.width-30}]}>
                <MomentRow itemsPerRow={1} containerWidth={windowSize.width-30} tripData={tripData} trip={{owner:tripData.profile}} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
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
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    }
});

export default FeedLocation;