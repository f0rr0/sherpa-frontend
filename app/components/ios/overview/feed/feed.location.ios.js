'use strict';

//import Mapbox from "react-native-mapbox-gl";
import countries from "./../../../../data/countries";
import moment from 'moment';
import { connect } from 'react-redux';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {loadFeed,getFeed,deleteMoment} from '../../../../actions/feed.actions';
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
    Alert,
    Animated
} from 'react-native';
import React, { Component } from 'react';
import {BlurView} from 'react-native-blur';


class FeedLocation extends Component {
    constructor(props){
        super();
        this.itemsLoadedCallback=null;
        this.moments=[];
        this.state={
            moments:[],
            containerWidth:windowSize.width-30,
            originalMoments:[],
            headerPreviewLoadedOpacity:new Animated.Value(0),
            headerLoadedOpacity:new Animated.Value(0),
        }

        //console.log('location props',props)
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
            regionData:this.props.trip,
            title:this.props.trip.name,
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
                    let globalIndex=0;
                    for(var i=0;i<data.length;i++){
                        let endIndex=Math.random()>.5||globalIndex==0?1+i:itemsPerRow+i;
                        organizedMoments.push(data.slice(i, endIndex));
                        i = endIndex-1;
                        globalIndex++;
                    }


                if(page==1)this.setState({moments:organizedMoments,originalMoments:response.moments,headerMoment:organizedMoments[0][0]});
                var settings=response.moments.length==0?{
                    allLoaded: true
                }:{};

                //console.log(organizedMoments)

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
                <PopOver ref="popover" shareCopy="SHARE" shareURL={config.auth[config.environment].shareBaseURL+"locations/"+this.props.trip.name+"/"+this.props.user.sherpaToken}></PopOver>
            </View>
        )
    }

    resetHeaderMoment(){
        //console.log('reset header moment')
        this.setState({headerMoment:this.state.moments[Math.floor(Math.random()*this.state.moments.length)][0]})
    }


    _renderHeader(){
        var tripData=this.props.trip;
        var moments=this.state.moments;
        if(moments.length==0)return null
        //var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+moments[0][0].lng+","+moments[0][0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidHJhdmVseXNoZXJwYSIsImEiOiJjaXRrNnk5OHgwYW92Mm9ta2J2dWw1MTRiIn0.QZvGaQUAnLMvoarRo9JmOg";
        var country=this.getTripLocation(tripData);
        //console.log('get header moment',this.state.headerMoment)
        return (
            <View style={{flex:1}}>
                <View style={{height:windowSize.height, width:windowSize.width, marginBottom:180,alignItems:'center',flex:1}} >


                    <View style={{position:'absolute',left:0,top:0}}>
                        <Animated.Image
                            style={[styles.headerImage,{opacity:1}]}
                            resizeMode="cover"
                            onLoad={()=>{
                                    Animated.timing(this.state.headerPreviewLoadedOpacity,{toValue:1,duration:100}).start()
                                }}
                            onError={(e)=>{
                            //console.log('delete ',this.state.headerMoment.id)
                                deleteMoment(this.state.headerMoment.id);
                                this.resetHeaderMoment();
                            }}
                            source={{uri:this.state.headerMoment.serviceJson?this.state.headerMoment.serviceJson.images.thumbnail.url:this.state.headerMoment.mediaUrl}}
                        >
                            <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>
                        </Animated.Image>
                    </View>


                    <Animated.View style={{position:'absolute',left:0,top:0,opacity:this.state.headerLoadedOpacity}}>
                        <View
                            style={styles.headerDarkBG}
                        />
                        <Image
                            style={styles.headerImage}
                            resizeMode="cover"
                            onLoad={()=>{
                                    Animated.timing(this.state.headerLoadedOpacity,{toValue:1,duration:200}).start()
                                }}
                            onError={(e)=>{
                            }}
                            source={{uri:this.state.headerMoment.highresUrl||this.state.headerMoment.mediaUrl}}
                        />
                    </Animated.View>



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
        var items = rowData.map((item) => {
            if (item === null || item.type!=='image') {
                return null;
            }

            //console.log('moment',item);

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
    headerImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:.6 },
    headerDarkBG:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:1,backgroundColor:'black' },

    map: {
        ...StyleSheet.absoluteFillObject
    },
});

export default FeedLocation;