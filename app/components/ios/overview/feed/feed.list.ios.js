import { connect } from 'react-redux';
import FeedTrip from './feed.trip.ios'
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import {updateUserData,storeUser} from '../../../../actions/user.actions';
import TripRow from '../../components/tripRow'
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import StickyHeader from '../../components/stickyHeader';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import FeaturedProfile from '../../components/featuredProfile'
import {SherpaPlacesAutocomplete} from '../../components/SherpaPlacesAutocomplete'
import config from '../../../../data/config';
import dismissKeyboard from 'dismissKeyboard'
import ToolTipp from '../../components/toolTipp'

const {sherpa}=config.auth[config.environment];
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    AppState,
    Alert,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    PixelRatio,
    ScrollView
} from 'react-native';

import React, { Component } from 'react';

var styles=StyleSheet.create({
    logo:{
        height:30,
        marginTop:23,
        marginBottom:23
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50,
    },
    headerImage:{position:"absolute",top:0,left:0,height:228,width:windowSize.width,opacity:1 },
});

const snapOffset=90;
const topOffset=90;
const mediumOffset=100;
const mapBaseHeight=228;

class FeedList extends React.Component{

    constructor(props){
        super();
        this.itemsLoadedCallback=null;
        this.state={
            currentAppState:'undefined',
            mapLarge:false,
            mapHeight:new Animated.Value(mapBaseHeight),
            searchbarTopOffset:new Animated.Value(90),
            inputFocusOffset:new Animated.Value(0),
            featuredProfiles:[],
            isFixed:true,
            scrollY:new Animated.Value(0)
        };
    }

    //updateMapSize(){
    //    this.props.toggleTabBar(!this.state.mapLarge)
    //
    //    if(this.state.mapLarge){
    //        Animated.stagger(600, [
    //            Animated.spring(this.state.mapHeight, {
    //                toValue: windowSize.height
    //            }),
    //            this.refs.listview.refs.listview.refs.feedlistmap.showMarkers()
    //        ]).start()
    //
    //        this.reset();
    //
    //    }else{
    //        Animated.spring(this.state.mapHeight, {
    //            toValue: mapBaseHeight
    //        }).start();
    //        this.refs.listview.refs.listview.refs.feedlistmap.hideMarkers().start()
    //    }
    //
    //}

    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));

        //this.state.scrollY.addListener((value) => this.handleScroll(value));
        //console.log('add scrolly listener')

        getFeed(this.props.user.sherpaID,-1,'featured-profiles').then((response)=>{
            this.setState({featuredProfiles:response.data})
        })


    }

    handleScroll(pullDownDistance){
            //console.log('yoyo',pullDownDistance.value)
        if (pullDownDistance.value >= snapOffset) {
            return this.setState({ isFixed: true })
        }else{
            return this.setState({ isFixed: false })
        }

    }

    componentDidUpdate(prevProps,prevState){
        if((prevState.currentAppState=='background'||prevState.currentAppState=='background')&&this.state.currentAppState=='active'){
           this.refs.listview._refresh();
        }

        if(prevState.isFixed!==this.state.isFixed){
            if(this.state.isFixed){
                //console.log('spring up')
                Animated.spring(this.state.searchbarTopOffset,{toValue:0,tension:150,friction:12}).start()
            }else{
                //console.log('spring down')
                Animated.spring(this.state.searchbarTopOffset,{toValue:snapOffset,tension:150,friction:12}).start()
            }
        }

    }

    componentWillUnmount(){
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange(currentAppState) {
        this.setState({ currentAppState });
    }

    reset(){
        this.refs.listview.refs.listview.scrollTo({y:0,animated:true})
    }

    showTripLocationOrGuide(data){
        this.props.navigator.push({
            id: "location",
            data:data.properties,
            version:"v2"
        });
    }

    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            data:trip
        });
    }


    _onFetch(page=1,callback){
        getFeed(this.props.user.sherpaID,page,'feed-v2').then((response)=>{
            //let moments=[];
            //const trips=response.trips;
            //console.log("trips ::",trips);
            //for(var i=0;i<response.trips.length;i++){
            //    if(trips[i].featured){
            //        moments=moments.concat(trips[i].moments)
            //    }
            //}
            //
            //console.log('moments',moments)
            //console.log('load page',page)
            //this.setState({moments})
            //console.log('feed response',response)
            callback(response.trips,{allLoaded:response.trips.length==0});
            //callback(response.trips);
        })
    }

    openMap(){
        if(this.refs.listview.refs.listview.refs.mapToolTipp)this.refs.listview.refs.listview.refs.mapToolTipp.hide();
        this.props.navigator.push({
            id: "tripDetailMap",
            sceneConfig:"bottom",
            hideNav:true,
            isFullscreen:true,
            mapType:"global",
            initialRegion:{latitude:29.78001123617821,latitudeDelta:91.95378261860259,longitude:-96.12217477285078,longitudeDelta:65.1293491325775}
        });
    }

    _renderHeader(){
        let windowHeight=windowSize.height;
        let toolTip=this.props.user.usedMap?null:<ToolTipp hideX={true} ref="mapToolTipp" message={"tap to explore".toUpperCase()} ref="mapToolTipp" onHide={()=>{
                                                     this.props.dispatch(updateUserData({usedMap:true}))
                                                     this.props.dispatch(storeUser())
                                                }}></ToolTipp>
        toolTip=null;
        return (
            <View style={{overflow:'visible',justifyContent:'center',marginBottom:0,zIndex:1,width:windowSize.width,alignItems:'flex-start'}}>
                <TouchableOpacity activeOpacity={1} style={{backgroundColor:'white'}} onPress={this.openMap.bind(this)}>
                    <Animated.View style={{overflow:'visible',alignItems:'center',position:'relative',height:mapBaseHeight,width:windowSize.width}}>
                       <Animated.Image source={require('./../../../../Images/header-img.png')} resizeMode="cover" style={
                       [
                       {height:mapBaseHeight,width:windowSize.width}
                        ,{
                         transform: [{
                                scale: this.state.scrollY.interpolate({
                                        inputRange: [ -mapBaseHeight, mapBaseHeight*.2],
                                        outputRange: [3, 1.3],
                                        extrapolate: 'clamp'
                                })
                        },{
                                translateY:this.state.scrollY.interpolate({
                                    inputRange: [ -mapBaseHeight, mapBaseHeight*.2],
                                    outputRange: [-50, 0],
                                    extrapolate: 'clamp'
                        })}]
                        }
                       ]}></Animated.Image>
                       <View style={{position:'absolute',bottom:48, left:0, right:0,alignItems:"center"}} >
                           {toolTip}
                       </View>
                    </Animated.View>
                </TouchableOpacity>
                        <View style={{position:'absolute',width:windowSize.width,top:mapBaseHeight+50,height:50,backgroundColor:"white"}}></View>
                        {this._renderFixedSearchBar()}
                <View style={{flex:1,marginTop:70,backgroundColor:'white'}}>
                    <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,marginBottom:12,fontWeight:"500"}}>FEATURED EXPLORERS</Text>
                    {this._renderFeaturedProfiles.bind(this)()}
                    {<Text style={{marginLeft:15,marginTop:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,top:-12,fontWeight:"500"}}>TRENDING LOCATIONS</Text>}
                </View>
            </View>
        )
    }

    _renderEmpty(){
        return (
            <View style={{justifyContent:'center',backgroundColor:"white",height:200,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    showUserProfile(user){
        //console.log('user',user)
        this.props.navigator.push({
            id: "profile",
            data:{owner:user}
        });
    }

    _renderFeaturedProfiles(){

        return(
            <ScrollView containerWidth={windowSize.width} horizontal={true} showsHorizontalScrollIndicator={false} style={{flex:1,width:windowSize.width,height:75,flexDirection:'row',marginBottom:20}}>
                {this.state.featuredProfiles.map((profile,index)=> {
                    return (
                        <FeaturedProfile
                            key={"profile"+index}
                            style={{width:75,height:75,borderRadius:75,overflow:"hidden",flexDirection:'row',marginLeft:index==0?15:10,marginRight:index==this.state.featuredProfiles.length-1?15:0}}
                            onPress={()=>{this.showUserProfile(profile)}}
                            profileImageUrl={profile.serviceProfilePicture}
                        >
                        </FeaturedProfile>
                    )
                })}
            </ScrollView>
        )
    }

    update(){

    }

    _renderFixedSearchBar(){
        return(
            <Animated.View accessible={this.state.isFixed}  pointerEvents={this.state.mapLarge?'none':'auto'} style={{
                        position:'absolute',
                        backgroundColor:'white',
                        shadowColor:'black',
                        shadowRadius:4,
                        shadowOpacity:.1,
                        shadowOffset:{width:0,height:1},
                        zIndex:1,
                        marginTop:this.state.inputFocusOffset,
                        top:topOffset,
                        width:windowSize.width*.85,
                        left:windowSize.width*.075,
                        opacity:1
                    }}>
                    {this._renderSearchInput('inputFixed')}
            </Animated.View>
        )
    }

    _renderAnimatedSearchBar(){
        return(
            <Animated.View  pointerEvents={this.state.isFixed?'auto':'none'}  style={{
                     position:'absolute',
                     top:0,
                     opacity:this.state.isFixed?1:0,
                     zIndex:99

                }}>


                <Animated.View  pointerEvents={this.state.isFixed?'auto':'none'} style={{
                    backgroundColor:'white',
                    borderRadius:2,
                    shadowColor:'black',
                    shadowRadius:4,
                    shadowOpacity:.1,
                    shadowOffset:{width:0,height:1},
                     top:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[0,-65],extrapolate:'clamp'}),
                        width:windowSize.width,
                        left:0
                }}>
                    {this._renderSearchInput('inputAnimated')}
                </Animated.View>
            </Animated.View>
        )
    }

    _updateSearchInput(text){
        this.refs.listview.refs.listview.refs.inputFixed.setAddressText(text)
        this.refs.listview.refs.listview.refs.inputFixed._onChangeText(text)
        if(!this.state.isFixed){
            this.refs.inputAnimated.setAddressText(text)
            this.refs.inputAnimated._onChangeText(text)
        }
    }

    refreshCurrentScene(){
        if(this.refs.inputAnimated)this.refs.inputAnimated._onBlur();
    }

    _renderSearchInput(ref){
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        const workPlace = {properties:{label:"No results"}};


        return(
            <View ref="searchContainer">
                <SherpaPlacesAutocomplete
                    placeholder={ref=='inputFixed'?"Discover the world":"Discover the world"}
                    ref={ref}
                    placeholderTextColor={'rgba(0,0,0,.5)'}
                    baseUrl={endpoint+version}
                    clearButtonMode='always'
                    onSubmitEditing={this.showTripLocationOrGuide.bind(this)}
                    textInputProps={{
                        returnKeyType:'go',
                        onChangeText:this._updateSearchInput.bind(this),
                        onFocus:()=>{Animated.spring(this.state.inputFocusOffset,{toValue:0}).start()},
                        onBlur:()=>{
                        Animated.spring(this.state.inputFocusOffset,{toValue:0}).start()
                        dismissKeyboard();
                            if(this.refs.inputAnimated)this.refs.inputAnimated._onBlur();
                            //if(this.refs.inputFixed)this.refs.inputFixed._onBlur();
                        }
                    }}
                    onPressProfile={(data)=>{
                      //map data
                     this.showUserProfile.bind(this)(data.payload)
                    }}
                    onPress={this.showTripLocationOrGuide.bind(this)}
                    styles={{
                                listView:{
                                   backgroundColor:"white",
                                },
                                 description: {
                                    fontWeight: 'normal',
                                    fontFamily:"TSTAR-bold",
                                    fontSize:12,
                                    fontWeight:"600",
                                    letterSpacing:.2
                                },
                                textInput: {
                                    backgroundColor: 'white',
                                    borderRadius: 0,
                                    fontSize: 12,
                                    color:'rgba(0,0,0,1)',
                                    fontFamily:"TSTAR-medium",
                                    height:49,
                                    letterSpacing:.8,
                                    marginLeft:0,
                                    marginRight:15,
                                    marginBottom:0,
                                    marginTop:1,
                                    borderBottomWidth:0
                                },
                                separator:{
                                    height: 1/PixelRatio.get(),
                                    backgroundColor:"#F0F0F0"
                                },
                                textInputContainer: {
                                   borderRadius:2,
                                    borderTopWidth:0,
                                    height:ref=='inputAnimated'?65:50,
                                    backgroundColor:"white",
                                    paddingLeft:25,
                                     borderBottomWidth:1/PixelRatio.get(),
                                     borderBottomColor:"#F0F0F0",
                                     marginBottom:-2,
                                     paddingTop:ref=='inputAnimated'?9:0,
                                },
                                row:{
                                   height:75,
                                   alignItems:'center',

                                   padding:0,
                                   backgroundColor:'white',
                                   paddingLeft:15,
                                   marginBottom:-2
                                },
                                listView:{
                                    backgroundColor:'white',
                                    borderRadius:2
                                }
                          }}
                />
                <Animated.Image
                    style={{width:11,height:11,left:15,
                            top:ref=='inputAnimated'?29:19,
                            position:"absolute"}}
                    resizeMode="contain"
                    source={require('./../../../../Images/search.png')}
                />
            </View>
        )
    }


    render(){
        return(
            <View>
                {this._renderAnimatedSearchBar()}
                <SherpaGiftedListview
                    removeClippedSubviews={false}
                    renderHeaderOnInit={true}
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}x
                    refreshableTintColor={"#85d68a"}
                    onEndReachedThreshold={1200}
                    scrollEventThrottle={100}
                    scrollEnabled={!this.state.mapLarge}
                    paginationFetchingView={this._renderEmpty.bind(this)}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
                    onScroll={(event)=>{
                     var currentOffset = event.nativeEvent.contentOffset.y;

                      //Animated.event(
                      //    [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
                      //  )(event);

                     this.offset = currentOffset;
                            //this.refs.listview.refs.listview.refs.inputFixed._onBlur();
                            //this.refs.inputAnimated._onBlur();

                     if(currentOffset>70){
                          this.setState({isFixed:true})
                     }else{
                          this.setState({isFixed:false})
                     }

                    }}
                    ref="listview"
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />
            </View>
        )
    }


    _renderRow(tripData) {
        let rowElement=null;
        //console.log(tripData)
        switch(tripData.contentType){
            case "trip":
                rowElement=<TripRow tripData={tripData} showTripDetail={this.showTripDetail.bind(this)}></TripRow>
            break;
            case "guide":
                rowElement=<TripRow tripData={tripData} showTripDetail={()=>{this.showTripLocationOrGuide({properties:{...tripData, type:tripData.contentType,layer:tripData.layer,source:tripData.source,sourceId:tripData.sourceId}})}}></TripRow>
            break;
        }
        return (
            rowElement
        );
    }
}


export default FeedList;