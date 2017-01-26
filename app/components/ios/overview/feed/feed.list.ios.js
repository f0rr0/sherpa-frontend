import { connect } from 'react-redux';
import FeedTrip from './feed.trip.ios'
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import TripRow from '../../components/tripRow'
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import StickyHeader from '../../components/stickyHeader';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import Orientation from 'react-native-orientation';
import MarkerMap from '../../components/MarkerMap'
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
    }
});

const snapOffset=20;
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
            searchbarTopOffset:new Animated.Value(snapOffset),
            inputFocusOffset:new Animated.Value(0),
            featuredProfiles:[],
            mapMoments:[],
            isFixed:false
        };
    }

    updateMapSize(){
        this.props.toggleTabBar(!this.state.mapLarge)

        if(this.state.mapLarge){
            Animated.stagger(600, [
                Animated.spring(this.state.mapHeight, {
                    toValue: windowSize.height
                }),
                this.refs.listview.refs.listview.refs.feedlistmap.showMarkers()
            ]).start()

            this.reset();

        }else{
            Animated.spring(this.state.mapHeight, {
                toValue: mapBaseHeight
            }).start();
            this.refs.listview.refs.listview.refs.feedlistmap.hideMarkers().start()
        }

    }

    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
        Orientation.lockToPortrait();

        getFeed(this.props.user.sherpaID,-1,'featured-profiles').then((response)=>{
            this.setState({featuredProfiles:response.data})
        })

    }

    componentDidUpdate(prevProps,prevState){
        if((prevState.currentAppState=='background'||prevState.currentAppState=='background')&&this.state.currentAppState=='active'){
           this.refs.listview._refresh();
        }

        if(prevState.isFixed!==this.state.isFixed){
            if(this.state.isFixed){
                Animated.spring(this.state.searchbarTopOffset,{toValue:0,tension:150,friction:12}).start()
            }else{
                Animated.spring(this.state.searchbarTopOffset,{toValue:snapOffset,tension:150,friction:12}).start()
            }
        }

        if(prevState.mapLarge!==this.state.mapLarge){
            this.updateMapSize.bind(this)();
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

    showTripLocation(data){
        this.props.navigator.push({
            id: "location",
            trip:data.properties,
            version:"v2"
        });
    }

    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            trip
        });
    }

    _onFetch(page=1,callback){
        getFeed(this.props.user.sherpaID,page,'feed').then((response)=>{
            let moments=[];
            const trips=response.trips;
            for(var i=0;i<response.trips.length;i++){
                if(trips[i].featured){
                    moments=moments.concat(trips[i].moments)
                }
            }

            this.setState({moments})
            callback(response.trips);
        })
    }

    openMap(){
        this.refs.listview.refs.listview.refs.mapToolTipp.hide();
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
        return (
            <View style={{overflow:'visible',flex:1,justifyContent:'center',width:windowSize.width,alignItems:'flex-start',zIndex:1}}>
                <TouchableWithoutFeedback onPress={this.openMap.bind(this)}>
                    <Animated.View style={{overflow:'visible',alignItems:'center',position:'relative',height:this.state.mapHeight,width:windowSize.width,marginBottom:30,zIndex:2}}>
                       <Image source={require('./../../../../Images/feed-map.png')} resizeMode="cover" style={{height:mapBaseHeight,width:windowSize.width}}></Image>
                       <View style={{position:'absolute',bottom:48, left:0, right:0,alignItems:"center"}} >
                            <ToolTipp ref="mapToolTipp" message="tap to open map" ref="mapToolTipp"></ToolTipp>
                       </View>
                        {this._renderFixedSearchBar()}
                    </Animated.View>
                </TouchableWithoutFeedback>
                <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,top:-12,fontWeight:"500"}}>FEATURED SHERPAS</Text>
                {this._renderFeaturedProfiles.bind(this)()}
                <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,top:-12,fontWeight:"500"}}>LATEST TRIPS</Text>
            </View>
        )
    }

    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:200,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    showUserProfile(user){
        this.props.navigator.push({
            id: "profile",
            trip:{owner:user}
        });
    }

    _renderFeaturedProfiles(){
        return(
            <ScrollView containerWidth={windowSize.width} horizontal={true} showsHorizontalScrollIndicator={false} style={{flex:1,width:windowSize.width,height:75,flexDirection:'row',marginBottom:30}}>
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
                        marginTop:this.state.inputFocusOffset,
                        top:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[topOffset-snapOffset,topOffset],extrapolate:'clamp'}),
                        width:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[windowSize.width,windowSize.width*.85],extrapolate:'clamp'}),
                        left:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[0,windowSize.width*.075],extrapolate:'clamp'}),
                        opacity:this.state.mapHeight.interpolate({inputRange:[mapBaseHeight,windowSize.height],outputRange:[1,0],extrapolate:'clamp'}),
                    }}>
                    {this._renderSearchInput('inputFixed')}
            </Animated.View>
        )
    }

    _renderAnimatedSearchBar(){
        return(
            <Animated.View  pointerEvents={this.state.isFixed?'auto':'none'}  style={{
                     position:'absolute',
                     top:this.state.searchbarTopOffset,
                     zIndex:1,
                     opacity:this.state.isFixed?1:0
                }}>


                <Animated.View  pointerEvents={this.state.isFixed?'auto':'none'} style={{
                    backgroundColor:'white',
                    borderRadius:2,
                    shadowColor:'black',
                    shadowRadius:4,
                    shadowOpacity:.1,
                    shadowOffset:{width:0,height:1},
                    width:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[windowSize.width,windowSize.width*.85],extrapolate:'clamp'}),
                    left:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[0,windowSize.width*.075],extrapolate:'clamp'}),
                    opacity:this.state.mapHeight.interpolate({inputRange:[mapBaseHeight,windowSize.height],outputRange:[1,0],extrapolate:'clamp'}),
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

    _renderSearchInput(ref){
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        const workPlace = {properties:{label:"No results"}};


        return(
            <View ref="searchContainer">
                <SherpaPlacesAutocomplete
                    placeholder="Discover the World"
                    ref={ref}
                    placeholderTextColor={'rgba(0,0,0,.5)'}
                    baseUrl={endpoint+version+"/geosearch/"}
                    clearButtonMode='always'
                    onSubmitEditing={this.showTripLocation.bind(this)}
                    textInputProps={{
                        returnKeyType:'go',
                        onChangeText:this._updateSearchInput.bind(this),
                        onFocus:()=>{Animated.spring(this.state.inputFocusOffset,{toValue:0}).start()},
                        onBlur:()=>{
                        Animated.spring(this.state.inputFocusOffset,{toValue:0}).start()
                        dismissKeyboard();
                        }
                    }}
                    onPress={this.showTripLocation.bind(this)}
                    styles={{
                                listView:{
                                   backgroundColor:"white",
                                },
                                 description: {
                                    fontWeight: 'normal',
                                    fontFamily:"TSTAR-bold",
                                    fontSize:12
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
                                    height:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[65,50],extrapolate:'clamp'}),
                                    backgroundColor:"white",
                                    paddingLeft:25,
                                     borderBottomWidth:1/PixelRatio.get(),
                                     borderBottomColor:"#F0F0F0",
                                     marginBottom:-2,
                                     paddingTop:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[10,0],extrapolate:'clamp'}),
                                },
                                row:{
                                   height:75,
                                   alignItems:'center',
                                   padding:0,
                                   backgroundColor:'white',
                                   paddingLeft:20,
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
                            top:this.state.searchbarTopOffset.interpolate({inputRange:[0,snapOffset],outputRange:[29,19],extrapolate:'clamp'}),
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
                    // Fixes feed-rendering anomaly, issue #3 but may cause performance issues w/ memory usage
                    removeClippedSubviews={false}
                    //
                    renderHeaderOnInit={true}
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}x
                    refreshableTintColor={"#85d68a"}
                    onEndReachedThreshold={1200}
                    scrollEnabled={!this.state.mapLarge}
                    paginationFetchingView={this._renderEmpty.bind(this)}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
                    onScroll={(event)=>{
                     var currentOffset = event.nativeEvent.contentOffset.y;
                     this.offset = currentOffset;
                            this.refs.listview.refs.listview.refs.inputFixed.triggerBlur();
                            this.refs.inputAnimated.triggerBlur();

                     if(currentOffset>(topOffset-snapOffset)){
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
        return (
            <TripRow tripData={tripData} showTripDetail={this.showTripDetail.bind(this)}></TripRow>
        );
    }
}


export default FeedList;