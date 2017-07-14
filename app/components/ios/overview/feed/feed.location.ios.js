'use strict';

import countries from "./../../../../data/countries";
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {getFeed,deleteMoment} from '../../../../actions/feed.actions';
import {subscribe,unsubscribe,checkFollowingLocation} from '../../../../actions/user.actions';
import config from '../../../../data/config';
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
import FollowButton from '../../components/followButton'
import Header from '../../components/header'


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    InteractionManager,
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
            inTransition:true,
            containerWidth:windowSize.width-30,
            originalMoments:[],
            headerPreviewLoadedOpacity:new Animated.Value(0),
            headerLoadedOpacity:new Animated.Value(0),
            scrollY:new Animated.Value(0),
            shareURL:config.auth[config.environment].shareBaseURL+"locations/"+props.trip.source+"/"+props.trip.layer+"/"+props.trip.sourceId
        };

        this.currentRows=[];


        // console.log('location props',props.trip)
    }

    shasharereTrip(){
        ActivityView.show({
            url: this.state.shareURL
        });
    }

    componentDidMount(){
        InteractionManager.runAfterInteractions(() => {
            this.setState({inTransition:false})
        });
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
            data:tripDetails,
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

    _onFetch(page=1, callback){
        let req;
        let searchType;
        let data = this.props.trip;

        if (this.props.version === 'v2') {
            req = {
                layer: data.layer,
                source: data.source,
                sourceId: data.sourceId || data.source_id,
                categoryId: data.categoryId,
            };
            searchType = 'guide';
            this.setState({trip: {locus: req}})
        } else {
            req = {type: data.type, page};
            req[data.type]=this.props.trip[data.type];
            searchType='search-places';
        }

        getFeed(req, page, searchType).then((response)=>{
            let locationName = response.rawData.location[response.rawData.location.layer];
            // TODO: Don't set state on action response
            if (locationName) this.setState({locationName: locationName.toUpperCase()});

            if (page===1 && response.moments.length === 0){
                Alert.alert('Location is Empty', 'We dont have any moments for this location', [{text: 'OK'}]);
                this.props.navigator.pop();
            } else {
                const itemsPerRow = 2;
                const organizedMoments = [];
                const data = response.moments;
                let globalIndex=0;
                for(var i=0;i<data.length;i++){
                    let endIndex;
                    if((Math.random()>.5||globalIndex==0)){
                        endIndex = i + 1
                    } else {
                        if(data[i] && data[itemsPerRow+i-1] && data[i].contentType!=='guide'&&data[itemsPerRow+i-1].contentType!=='guide'){
                          endIndex=itemsPerRow+i;

                        } else {
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
                    let locationGID=response.rawData.location[response.rawData.location.layer+"_gid"];
                    this.setState({isReady:true,rawData:response.rawData,moments:organizedMoments,originalMoments:response.moments,headerMoment:organizedMoments[0][0]});

                    checkFollowingLocation(locationGID).then((res)=>{
                        this.setState({isFollowing:res});
                    });
                }
                callback(organizedMoments,settings);


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
        if(this.state.inTransition)return null
        var tripData=this.props.trip;
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
                <SherpaGiftedListview
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

                <StickyHeader ref="stickyHeader" navigation={<Header type="fixed" ref="navFixed" routeName={this.state.locationName||tripData.name.toUpperCase()} goBack={this.props.navigator.pop} navActionRight={this.navActionRight.bind(this)} settings={this.props.navigation}></Header>}></StickyHeader>
                <PopOver enableNavigator={this.props.enableNavigator} ref="popover" shareCopy="SHARE" shareURL={this.state.shareURL}></PopOver>
            </View>
        )
    }

    resetHeaderMoment(){
        //console.log('reset header moment')
        this.setState({headerMoment:this.state.moments[Math.floor(Math.random()*this.state.moments.length)][0]})
    }


    renderFollowButton(){
        return null;
        return(
            <View style={{marginTop:15,maxWidth:103}}>
                <FollowButton   style={{marginTop:0,opacity:this.state.isFollowing?1:0, shadowRadius:2,shadowOpacity:.1,shadowOffset:{width:0,height:.5}}} textStyle={{marginLeft:15,color:'rgba(255,255,255,.7)'}} onPress={()=>{this.followLocation()}} text="following"></FollowButton>
                <FollowButton icon="follow-button" style={{marginTop:-40,opacity:this.state.isFollowing?0:1, shadowRadius:2,shadowOpacity:.1,shadowOffset:{width:0,height:.5}}} onPress={()=>{this.followLocation()}} text={"follow"}></FollowButton>
            </View>
        )
    }


    followLocation(){
        if(this.state.isFollowing){
            unsubscribe(this.state.rawData.location[this.state.rawData.location.layer+"_gid"]);
            this.setState({isFollowing:false})
        }else{
            subscribe(this.state.rawData.location[this.state.rawData.location.layer+"_gid"]);
            this.setState({isFollowing:true})
        }
    }

    showTripLocation(data, rawData){
        let locus=data.split(":");
        var locationData={
            layer: locus[1],
            source: locus[0],
            sourceId: locus[2]
        };


        this.props.navigator.push({
            id: "location",
            data: {...locationData, name: rawData.name || "location"},
            version:"v2"
        });
    }



    _renderHeader(){
        if(!this.state.isReady)return (
            <View style={{flex:1}}>
                <View style={{height:windowSize.height, width:windowSize.width, marginBottom:15,alignItems:'center',justifyContent:"flex-end",backgroundColor:'white'}} >
                </View>
            </View>
        );

        const tripData = this.props.trip;
        const moments = this.state.moments;
        if (moments.length === 0) return null;
        const  country=this.getTripLocation(tripData);
        const windowHeight=windowSize.height;
        let bottomLeft=null;
        let wikipediaInfo = this.state.rawData.location.wikipediaData
          ? <WikipediaInfoBox
              style={{marginTop: -150, width: windowSize.width - 30, left: 15, borderRadius: 3, overflow:'hidden'}}
              data={this.state.rawData.location.wikipediaData}
            />
          : null;
        const tripTitle = this.state.locationName || tripData.pluralName ? tripData.pluralName.toUpperCase() : tripData.name.toUpperCase();


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
                <View style={{height:windowSize.height, width:windowSize.width, marginBottom:15,alignItems:'center',justifyContent:"flex-end"}} >


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
                                transform: [{
                        scale: this.state.scrollY.interpolate({
                            inputRange: [ -windowHeight, 0],
                            outputRange: [3, 1.1],
                             extrapolate: 'clamp'
                        })
                    }]
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
                            <Text style={{color:"#FFFFFF",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{tripTitle}</Text>
                            <TripSubtitle maxLength={2} goLocation={(data)=>{this.showTripLocation.bind(this)(data.locus,data)}} tripData={{locus:this.props.trip.locus||this.state.rawData.location}}></TripSubtitle>
                            {/*<Text style={styles.subtitle}>{locationLayer.toUpperCase()}</Text>*/}

                        </View>
                        <View style={{backgroundColor:'transparent',alignItems:'center',justifyContent:'center',flexDirection:'row'}}>
                        </View>
                    </View>

                    <View style={{position:'absolute',bottom:170,left:0,justifyContent:'center',alignItems:'center',width:windowSize.width,height:20}}>
                        {bottomLeft}
                    </View>
                    <View style={{position:'absolute',left:15, bottom:130,backgroundColor:'red'}}>

                    <View style={{justifyContent:'center',alignItems:"center",flexDirection:"row",width:windowSize.width-30}}>
                        {this.renderFollowButton()}
                        <View>
                            {/*<View style={styles.tripDataFootnoteRightContainer}>
                                <Image source={require('./../../../../Images/icons/images.png')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                                <Text style={styles.tripDataFootnoteCopy}>{tripData.venueCount||this.state.rawData.location.venueCount}</Text>
                            </View>
                            <View style={styles.tripDataFootnoteLeftContainer}>
                                <Image source={require('./../../../../Images/trending.png')} style={[styles.tripDataFootnoteIcon,{alignItems:'center',justifyContent:'center'}]} ></Image>
                                <Text style={styles.tripDataFootnoteCopy}>{locationLayer.toUpperCase()}</Text>
                            </View>*/}
                        </View>
                    </View>
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
                    <Header ref="navStatic" navActionRight={this.navActionRight.bind(this)} goBack={this.props.navigator.pop} routeName={locationLayer.toUpperCase()} settings={this.props.navigation}></Header>
                </Animated.View>

            </View>
        )
    }


    showTripLocationOrGuide(data){
        this.props.navigator.push({
            id: "location",
            data: data.properties,
            version: "v2"
        });
    }


    _renderRow(rowData,sectionID,rowID){
        let index = 0;
        const items = rowData.map(item => {
            //console.log(item);
            if (item === null || (item.type!=='image' && item.contentType !== 'guide')) {
                return null;
            }

            this.currentRows.push(`row-${rowID}-${sectionID}`);

            index++;

            let rowElement;

            switch(item.contentType){
                case "moment":
                    rowElement = (<MomentRow
                      key={`momentRow${rowID}_${index}`}
                      rowIndex={rowID}
                      itemRowIndex={index}
                      itemsPerRow={rowData.length}
                      containerWidth={this.state.containerWidth}
                      tripData={item}
                      trip={this.props.trip}
                      user={this.props.user}
                      dispatch={this.props.dispatch}
                      navigator={this.props.navigator} />);
                    break;
                case "guide":
                    rowElement = (<TripRow
                      fullBleed={true}
                      key={`tripRow${rowID}_${index}`}
                      tripData={item}
                      showTripDetail={() => {this.showTripLocationOrGuide({properties: {...item, type: item.contentType, layer: item.layer, source: item.source, sourceId: item.sourceId||item.sourceId, categoryId: item.categoryId || null}})}} />);
                    break;
                default:
                    rowElement = null;
                    break;
            }
            return rowElement

        });


        //console.log('row data [0]',rowData[0])
        return (
            <View key={sectionID="-"+rowID} style={[styles.row,{width: rowData[0].contentType=== 'guide' ? windowSize.width:windowSize.width-30}]}>
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
    tripDataFootnoteCopy:{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"},
    tripDataFootnoteRightContainer:{position:'absolute',bottom:19,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',right:10},
    tripDataFootnoteLeftContainer:{position:'absolute',bottom:19,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',left:2},
    tripDataFootnoteIcon:{marginBottom:3,marginLeft:8,marginRight:4},
    map: {
        ...StyleSheet.absoluteFillObject
    },
});

export default FeedLocation;