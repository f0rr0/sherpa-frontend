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
import UserImage from '../../components/userImage';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import MomentRow from '../../components/momentRow'
import TripRow from '../../components/tripRow'
import MarkerMap from '../../components/MarkerMap'
import TripSubtitle from '../../components/tripSubtitle'


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
            isReady:false,
            containerWidth:windowSize.width-30,
            originalMoments:[],
            headerPreviewLoadedOpacity:new Animated.Value(0),
            headerLoadedOpacity:new Animated.Value(0),
            scrollY:new Animated.Value(0)
        }

        this.currentRows=[];


        //console.log('location props',props)
    }

    componentDidMount(){
        //console.log('trip location');
    }

    componentDidUpdate(prevProps,prevState){
        //console.log(prevState.lastRefresh,"::",this.state.lastRefresh)
        if(prevState.lastRefresh!==this.state.lastRefresh){
            //console.log('refresh rows',this.refs.listview.refs.listview);
            for(var i=0;i<this.currentRows.length;i++){
                if(this.refs.listview.refs[this.currentRows[i]]){
                    this.refs.listview.refs[this.currentRows[i]].checkSuitcased();
                }
            }
            //this.refs.listview._refresh();
        }
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
            sceneConfig:"bottom",
            mapType:"region",
            hideNav:true
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
                sourceId:data.sourceId||data.source_id
            }
            searchType=data.type&&data.type=='guide'?'guide':'guide';
            this.setState({trip:{locus:req}})
            //console.log(searchType,'search type')
        }else{
            req={type:data.type,page}
            req[data.type]=this.props.trip[data.type];
            searchType='search-places';
        }


        getFeed(req,page,searchType).then((response)=>{
            let locationName=response.rawData.location[response.rawData.location.layer];
            if(locationName)this.setState({locationName:locationName.toUpperCase()})

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

                            let endIndex;
                           if((Math.random()>.5||globalIndex==0)){
                               endIndex=1+i
                           }else{
                               if(data[i]&&data[itemsPerRow+i-1]&&data[i].contentType!=='guide'&&data[itemsPerRow+i-1].contentType!=='guide'){
                                endIndex=itemsPerRow+i;

                               }else{

                               endIndex=1+i
                               }
                           }
                            organizedMoments.push(data.slice(i, endIndex));
                            i = endIndex-1;
                        globalIndex++;
                    }



                var settings=response.moments.length==0?{
                    allLoaded: true
                }:{};

                if(page==1){
                    //console.log('get additional stuff',response);
                        this.setState({isReady:true,rawData:response.rawData,moments:organizedMoments,originalMoments:response.moments,headerMoment:organizedMoments[0][0]});
                    callback(organizedMoments,settings);
                    //getFeed(req,1,'search-places-v2').then((secondResponse)=>{
                    //    callback(organizedMoments,settings);
                    //});
                }else{
                    callback(organizedMoments,settings);
                    //console.log('regular resposne')
                }


                //console.log('organized moments::',organizedMoments)

            }
        })
    }

    refreshCurrentScene(){
        this.setState({lastRefresh:Date.now()})
    }


    _renderEmpty(){
        return (
            <View style={{justifyContent:'center',height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
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

    renderProfiles(){
        const profiles=this.state.rawData.location.relatedData.topProfiles;
        const haveBeen=this.props.trip.contentType=="guide"?"have been":"Trips to "+this.props.trip.name
        return(
            <View style={{flexDirection:'row',alignItems:'center',height:26,justifyContent:'center',width:windowSize.width-30}}>

                <View style={{flexDirection:'row',marginRight:20}}>
                    {profiles.map((data,index)=>{

                        return <UserImage key={"profile-"+index} style={{marginRight:-20}} radius={26} userID={data.id} imageURL={data.serviceProfilePicture}></UserImage>
                    })}
                </View>
                <Text style={{backgroundColor:'transparent',fontSize:12,fontWeight:"600",marginTop:5,marginLeft:5,color:"white",fontFamily:"TSTAR"}}>{this.state.rawData.location.relatedData.visitorCount} {haveBeen}</Text>
            </View>
        )
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
                    scrollEventThrottle={8}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
                    onScroll={(event)=>{
                    Animated.event(
                          [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
                        )(event);

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
                <PopOver enableNavigator={this.props.enableNavigator} ref="popover" shareCopy="SHARE" shareURL={config.auth[config.environment].shareBaseURL+"locations/"+this.props.trip.source+"/"+this.props.trip.layer+"/"+this.props.trip.sourceId}></PopOver>
            </View>
        )
    }

    resetHeaderMoment(){
        //console.log('reset header moment')
        this.setState({headerMoment:this.state.moments[Math.floor(Math.random()*this.state.moments.length)][0]})
    }


    _renderHeader(){
        //console.log(this.state)
        var tripData=this.props.trip;
        var moments=this.state.moments;
        //console.log(tripData)
        //console.log(moments,'render header');
        if(moments.length==0)return null
        //var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+moments[0][0].lng+","+moments[0][0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidHJhdmVseXNoZXJwYSIsImEiOiJjaXRrNnk5OHgwYW92Mm9ta2J2dWw1MTRiIn0.QZvGaQUAnLMvoarRo9JmOg";
        var country=this.getTripLocation(tripData);
        let windowHeight=windowSize.height;
        let wikipediaInfo=null;
        let bottomLeft=null

        //switch(tripData.contentType){
        //    case "guide":
        //    break;
        //    case "trip":
        //    default:
                bottomLeft=null;//this.renderProfiles()
                wikipediaInfo=this.state.rawData.location.wikipediaLocation?<WikipediaInfoBox style={{marginTop:-150,width:windowSize.width-30,left:15,borderRadius:3,overflow:'hidden'}} data={this.state.rawData.location.wikipediaLocation._source}></WikipediaInfoBox>:null;
            //break;
        //}


        let locationLayer;
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

        return (
            <View style={{flex:1}}>
                <View style={{height:windowSize.height, width:windowSize.width, marginBottom:15,alignItems:'center'}} >


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

                        <Animated.Image
                            style={[styles.headerImage,{
                                transform: [,{
                        scale: this.state.scrollY.interpolate({
                            inputRange: [ -windowHeight, 0],
                            outputRange: [3, 1.1],
                             extrapolate: 'clamp'
                        })
                    },{translateY:this.state.scrollY.interpolate({
                                                    inputRange: [ -windowHeight,0],
                                                    outputRange: [-40, 0],
                                                    extrapolate: 'clamp',
                                                })}]
                                }]}
                            resizeMode="cover"
                            onLoad={()=>{
                                    Animated.timing(this.state.headerLoadedOpacity,{toValue:1,duration:200}).start()
                                }}
                            onError={(e)=>{
                            }}
                            source={{uri:this.state.headerMoment.highresUrl||this.state.headerMoment.mediaUrl}}
                        >
                            <View
                                style={styles.headerDarkBG}
                            />
                        </Animated.Image>
                    </Animated.View>



                    <View style={{alignItems:'center',justifyContent:'center',position:'absolute',top:250,left:0,right:0,height:20}}>
                        <View style={{alignItems:'center'}}>
                            <Text style={{color:"#FFFFFF",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.state.locationName||tripData.name.toUpperCase()}</Text>
                            {/*<TripSubtitle goLocation={(data)=>{this.showTripLocation.bind(this)(data.locus)}} tripData={{locus:this.props.trip}}></TripSubtitle>*/}
                            <Text style={styles.subtitle}>{locationLayer.toUpperCase()}</Text>

                        </View>
                        <View style={{backgroundColor:'transparent',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                        </View>
                    </View>

                    <View style={{position:'absolute',bottom:170,left:0,justifyContent:'center',alignItems:'center',width:windowSize.width,height:20}}>
                        {bottomLeft}
                    </View>
                </View>
                {wikipediaInfo}
                <View style={{height:260,width:windowSize.width-30,left:15,backgroundColor:'white',flex:1}}>
                    <TouchableOpacity style={styles.map} onPress={()=>{
                    this.showTripMap({moments:this.state.originalMoments}
                    )}}>
                        <MarkerMap interactive={false} moments={this.state.originalMoments}></MarkerMap>
                    </TouchableOpacity>
                </View>

                <Animated.View style={{flex:1,position:'absolute',top:0,
                  transform: [{translateY:this.state.scrollY.interpolate({
                                                    inputRange: [ -windowHeight,0],
                                                    outputRange: [-windowHeight, 0],
                                                    extrapolate: 'clamp',
                                                })}]
                }}>
                {this.props.navigation.default}
                    </Animated.View>

            </View>
        )
    }


    showTripLocationOrGuide(data){
        //console.log('data properties',data.properties)
        this.props.navigator.push({
            id: "location",
            trip:data.properties,
            version:"v2"
        });
    }


    _renderRow(rowData,sectionID,rowID){
        var index=0;
        var items = rowData.map((item) => {
            //console.log(item);
            if (item === null || (item.type!=='image'&&item.contentType!=='guide')) {
                return null;
            }
            this.currentRows.push("row-"+rowID+"-"+sectionID)

            index++;
            //
            let rowElement=null;


            switch(item.contentType){
                case "moment":
                    rowElement=
                            <MomentRow key={"momentRow"+rowID+"_"+index}  itemRowIndex={index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
                    break;
                case "guide":
                    rowElement=<TripRow key={"tripRow"+rowID+"_"+index} tripData={item} showTripDetail={()=>{this.showTripLocationOrGuide({properties:{...item, type:item.contentType,layer:item.layer,source:item.source,sourceId:item.sourceId||item.sourceId}})}}></TripRow>
                    break;

            }
            return rowElement

        });


        //console.log('row data [0]',rowData[0])
        return (
            <View key={sectionID="-"+rowID} style={[styles.row,{width:rowData[0].contentType=='guide'?windowSize.width:windowSize.width-30}]}>
                {items}
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        backgroundColor:'white'
    },
    listItem:{
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
    subtitle:{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"},

    headerImage:{position:"absolute",top:0,left:0,height:windowSize.height*.95,width:windowSize.width },
    headerDarkBG:{position:"absolute",top:0,left:0,height:windowSize.height*.95,width:windowSize.width,opacity:.6,backgroundColor:'black' },

    map: {
        ...StyleSheet.absoluteFillObject
    },
});

export default FeedLocation;