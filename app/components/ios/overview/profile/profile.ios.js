'use strict';

import FeedTrip from './../feed/feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import {updateUserData,storeUser,enableScraping,checkOptedIn} from '../../../../actions/user.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import TripTitle from "../../components/tripTitle"
import PopOver from '../../components/popOver';
import Dimensions from 'Dimensions';
import ToolTipp from '../../components/toolTipp'
import UserImage from '../../components/userImage'
import MarkerMap from '../../components/MarkerMap'
var windowSize=Dimensions.get('window');
import config from '../../../../data/config';
import store from 'react-native-simple-store';
const {sherpa}=config.auth[config.environment];
import TripRow from '../../components/tripRow'
import SimpleButton from '../../components/simpleButton'
import Hyperlink from 'react-native-hyperlink';
import UserStat from '../../components/userStat'
import { Fonts, Colors } from '../../../../Themes/'
import Header from '../../components/header'


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight,
    Linking,
Animated,
TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';

var styles = StyleSheet.create({
    container: {
        //flex: 1
    },
    listItem:{
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center'
    },
    listView:{
        alignItems:'center',
        //justifyContent:"center",
        paddingBottom:60,
        //top:0,
        minHeight:windowSize.height,
    },
    listItemContainer:{
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:15
    },

    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    button:{
        width:windowSize.width-30,
        marginTop:0,
        marginBottom:20
    },
    listViewLabel:{fontSize:12}
});

class OwnUserProfile extends React.Component {
    constructor(props){
        super(props);
        this.itemsLoadedCallback=null;
        this.ready=false;

        this.state= {
            annotations:[],
            trips:[],
            profile:null,
            hometownGuide:null,
            tooltipOpacity:new Animated.Value(1),
            isRescraping:props.user.scrapeFromInstagram,
            isFollowing:false
        };
        this.isScraping=false;
    }

    componentDidMount(){
        checkOptedIn().then((res)=>{
            this.props.dispatch(updateUserData({scrapeFromInstagram:res.optedIn}));
        });

        this.checkScrapeStatus();
    }

    checkScrapeStatus(){
        store.get('user').then((user) => {
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            const {endpoint} = sherpa;
            this.isRescraping=true;

            //console.log(this.props.user.scrapeState)
            fetch(endpoint+"v1/profile/"+user.serviceID+"/lastscrape/",{
                method:'get',
                headers:sherpaHeaders
            }).then((rawServiceResponse)=>{
                return rawServiceResponse.text();
            }).then((rawSherpaResponse)=>{
                var parsedResponse=JSON.parse(rawSherpaResponse);

                //console.log(this.props.user.scrapeState)
                 if(parsedResponse.scrapeState=='completed'){
                    this.props.dispatch(updateUserData({scrapeState:'completed'}));
                    this.props.dispatch(storeUser());
                    clearTimeout(this.checkScrapeTimeout);
                    setTimeout(()=> {
                        this.ready=false;
                        this._onFetch();
                    },3000)
                }else if(parsedResponse.scrapeState.indexOf('error')>-1){
                    this.props.dispatch(updateUserData({scrapeState:'error'}));
                    this.props.dispatch(storeUser());
                    this.ready=false;
                     clearTimeout(this.checkScrapeTimeout);
                     setTimeout(()=> {
                         this.ready=false;
                         this._onFetch();
                     },500)
                }else if(parsedResponse.scrapeState!=='completed'){
                    this.checkScrapeTimeout=setTimeout(()=>{this.checkScrapeStatus()},1000);
                    this.props.dispatch(updateUserData({scrapeState:'scraping'}));
                    this.props.dispatch(storeUser());
                }
            });
        })
    }

    refreshCurrentScene(){
        this.refresh();
    }

    refresh(){
        this.ready=false;
        this._onFetch();
    }

    reset(){
        this.refs.listview.refs.listview.scrollTo({y:0,animated:true});
    }

    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            data:trip
        });
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        //console.log('on fetch')
        this.itemsLoadedCallback=callback;
        getFeed(this.props.user.serviceID,page,'profile').then((response)=>{
            callback(response.data);
            let trips=response.data;

            //console.log('after fetch',trips,'callback',callback)
            this.isRescraping=false;
            if(page==1){
                let hometownGuide=null;
                for(var i=0;i<trips.length;i++){
                    let trip = trips[i];
                    if(trip.isHometown){
                        hometownGuide=trips[i]
                    }
                }
                //console.log(response)
                this.setState({hometownGuide,profile:response.profile,followers:response.followers,following:response.following});
            }
            //console.log('after fetch set state',this.isRescraping,'page',page);
            this.setState({trips,feedReady:true})
        });
    }

    hideTooltip(){
        if(this.refs.listview.refs.listview.refs.geoToolTipp)this.refs.listview.refs.listview.refs.geoToolTipp.hide();
        this.props.dispatch(updateUserData({usedAddTrip:true}))
        this.props.dispatch(storeUser())
    }

    showFollowers(followerType){
        this.props.navigator.push({
            id: "follower-list",
            followerType,
            user:this.props.user,
            profile:this.state.profile
        });
    }


    renderUserStats(){
        //return null;

        if(!this.state.profile)return;
        const counts=this.state.profile.serviceObject.counts;

        //console.log(this.state.profile)

        const userStats=[
            {icon:require('./../../../../Images/icons/user-small.png'),description:this.state.followers+" followers",onPress:()=>{this.showFollowers('followers')}},
            {icon:require('./../../../../Images/icons/flag-small.png'),description:(counts?counts.media:0)+" places"},
            {icon:require('./../../../../Images/icons/user-small.png'),description:this.state.following+" following",onPress:()=>{this.showFollowers('following')}},
        ]

        const borderRight={
            borderRightWidth:1,
            borderRightColor:'#E5E5E5',
            height:15
        };

        const borderLeft={
            borderLeftWidth:1,
            borderLeftColor:'#E5E5E5',
            height:15
        };


        return(
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:"center",width:windowSize.width-30,height:50}}>
                {userStats.map((item,index)=>{

                    let border=null;
                    if(index==0){
                        border=borderRight;
                    }else if(index==userStats.length-1){
                        border=borderLeft;
                    }

                    return (
                        <View key={"user-stat-"+index} style={[{justifyContent:"center",flexDirection:'row',flex:1,alignItems:'center'},border]}>
                            <UserStat textStyle={{marginLeft:6,fontSize:9}} style={[{paddingHorizontal:5}]} icon={item.icon} description={item.description} onPress={item.onPress}></UserStat>
                        </View>
                    )
                })}
            </View>
        )
    }



    render(){
        const tooltipTouchable=this.props.user.usedAddTrip?null:
            <TouchableOpacity onPress={this.hideTooltip.bind(this)} style={{position:'absolute',top:0,left:0,bottom:0,right:0,backgroundColor:'transparent'}}></TouchableOpacity>



        return(
        <View style={{backgroundColor:'white'}}>

            <SherpaGiftedListview
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                renderHeaderOnInit={true}
                firstLoader={true}  // display a loader for the first fetching
                pagination={false}  // enable infinite scrolling using touch to load more
                refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false}// enable sections
                ref="listview"
                paginationFetchingView={this._renderEmpty.bind(this)}
                emptyView={this._renderEmpty.bind(this)}
                footerView={()=>{
                    let activeView=null

                    if(!this.props.user.scrapeFromInstagram){
                        activeView=
                        <SimpleButton onPress={()=>{
                            this.isRescraping=true;
                            this.setState({isRescraping:true})
                            this.props.dispatch(enableScraping(true));
                            this.props.dispatch(updateUserData({scrapeFromInstagram:true}))
                            this.props.dispatch(storeUser());
                            this.checkScrapeStatus();
                        }} style={[styles.button]}text="create your travel profile via instagram"></SimpleButton>
                    }else if(this.props.user.scrapeFromInstagram&&this.isRescraping&&this.props.user.scrapeState=='scraping'){
                        //activeView=this._renderRescrapeMessage();
                    }
                    return(
                        <View style={{justifyContent:'flex-start',alignItems:'center'}}>
                            {activeView}
                        </View>
                    )
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
                headerView={this._renderHeader.bind(this)}
                customStyles={{
                    contentContainerStyle:styles.listView,
                    actionsLabel:styles.listViewLabel
                }}
            />
            {tooltipTouchable}

            <StickyHeader ref="stickyHeader" reset={()=>this.reset()} navigation={<Header type="fixed" ref="navFixed" routeName={this.props.user.username.toUpperCase()} goBack={this.navActionLeft.bind(this)} navActionRight={this.navActionRight.bind(this)} settings={this.props.navigation}></Header>}></StickyHeader>
            <PopOver  enableNavigator={this.props.enableNavigator} ref="popover" showShare={true} showSettings={true} openSettings={this.openSettings.bind(this)} shareURL={config.auth[config.environment].shareBaseURL+"profiles/"+this.props.user.serviceID}></PopOver>
        </View>
        )
    }

    openSettings(){
        this.props.navigator.push({
            id: "profile-settings",
            sceneConfig:"bottom-nodrag",
            hideNav:true
        });
    }
    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    navActionLeft(){
        this.props.navigator.push({
            id: "addTrip",
            sceneConfig:"bottom-nodrag",
            intent:"ADD_TRIP",
            hideNav:true
        });
    }

    _renderEmpty(){

        //console.log('render empty')
        let status;
        let message='0';
        //console.log(this.isRescraping,'render empty',this.state.trips)

        if(this.isRescraping){
            message='a';
            status=this._renderStillScraping();
        }else if(this.state.trips.length==0&&this.props.user.scrapeFromInstagram){
            message='b';
            status=
                <View style={{justifyContent: 'center', width:windowSize.width,alignItems: 'center'}}>
                    <Text style={{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>Geotag places on Instagram or tap the plus button above to create your travel profile.</Text>
                </View>
        }else if(this.state.trips.length>0){
            message='c';
            status=
                <View style={{justifyContent:'center',width:windowSize.width,alignItems:'center'}}>
                    <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
                </View>
        }


        return  this.props.user.scrapeFromInstagram?status:null;
    }

    _renderStillScraping(){
        let trips=this.state.trips;
        let scrapeMessage=
            this.isRescraping? this._renderRescrapeMessage():null;
        return(
           scrapeMessage
        )
    }

    _renderRescrapeMessage(){
        //console.log(this.props.user.scrapeState)
        return(
            <View style={{justifyContent: 'center',alignItems: 'center'}}>
                <View style={{justifyContent:'center',height:50,width:50,alignItems:'center'}}>
                    <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
                </View>
                {this.props.user.scrapeState!=='completed'?<Text style={{color:"#bcbec4",width:250,marginTop:0,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>{"We're creating your profile.\n Check back soon."}</Text>:null}
            </View>
        )
    }

    showProfileMap(moments){
        this.props.navigator.push({
             id: "tripDetailMap",
             trip:{moments},
             title:this.props.user.username.toUpperCase()+"'S TRIPS",
             sceneConfig:"bottom",
             mapType:"profile",
             profileID:this.props.user.serviceID,
             hideNav:true
        });
    }

    _renderHeader(){
        var trips=this.state.trips;
        var moments=[];
        if(trips){
            for(var i=0;i<trips.length;i++){
                Array.prototype.push.apply(moments,trips[i].moments)
            }
        }

        if(this.state.hometownGuide)Array.prototype.push.apply(moments,this.state.hometownGuide.moments);
        var hasDescriptionCopy=true;

        let tooltip=
            this.props.user.usedAddTrip?null:<View style={{position:'absolute',zIndex:2,left:5,top:60}} >

                <ToolTipp hideX={false} hasTriangle="topleft" style={{backgroundColor:'rgba(0,0,0,.85)',paddingVertical:15,paddingHorizontal:15}} textStyle={{fontSize:12,letterSpacing:.3,lineHeight:15}} message={"Tap here to create a new travel album."} ref="geoToolTippprops.user" onHide={()=>{
                                                     this.props.dispatch(updateUserData({usedMap:true}))
                                                     this.props.dispatch(storeUser())
                                                }}></ToolTipp>

            </View>

        const hometownGuide=this.state.hometownGuide?
            <View>
                <TripRow isProfile={true} tripData={this.state.hometownGuide} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}/>
                <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,fontWeight:"500",marginVertical:10}}>{this.props.user.username.toUpperCase()}'S TRIPS</Text>
            </View>
            :null;

        const map= this.state.feedReady&&this.state.trips.length>0?<TouchableOpacity  onPress={()=>{this.showProfileMap(moments)}} style={{left:15,height:260,width:windowSize.width-30,marginBottom:14}}>
            <MarkerMap moments={moments} interactive={false}></MarkerMap>
        </TouchableOpacity>:null;

        return (
            <View>
                <View style={{backgroundColor:'transparent',alignItems:'center',justifyContent:"flex-start", height:windowSize.height*.6, width:windowSize.width,marginTop:0,zIndex:1}} >

                    <View style={{width:80,height:80,marginTop:135,marginBottom:-40,backgroundColor:'transparent'}}>
                        <UserImage
                            radius={80}
                            activeOpacity={1}
                            border={false}
                            userID={this.props.user.id} imageURL={this.props.user.profilePicture}/>
                    </View>

                    <View style={{backgroundColor:'transparent'}}>
                        <Text style={{color:"#282b33",fontSize:20,marginVertical:20,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.user.username.toUpperCase()}</Text>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{color:"#000",width:300,fontSize:12,marginBottom:0, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", backgroundColor:"transparent"}}>{this.props.user.bio}</Text>
                        </Hyperlink>
                        <Text style={{color:"#a6a7a8",width:300,fontSize:12,marginBottom:0, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", backgroundColor:"transparent"}}>{this.props.user.hometown}</Text>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{textDecorationLine:'underline',color:"#8AD78D",width:300,fontSize:12,marginBottom:10, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500",backgroundColor:"transparent"}}>{this.props.user.website.replace("http://","").replace("https://","")}</Text>
                        </Hyperlink>
                    </View>
                </View>

                <View style={{marginBottom:20,backgroundColor:"transparent",alignItems:'center'}}>
                    {this.renderUserStats()}
                </View>

                {tooltip}
                {hometownGuide}
                {map}
                <View style={{position:'absolute',top:0,height:75,backgroundColor:"transparent",zIndex:1}}>
                    <Header type="fixed" ref="navFixed" goBack={this.navActionLeft.bind(this)} navActionRight={this.navActionRight.bind(this)} settings={this.props.navigation}></Header>
                </View>
            </View>
        )
    }

    _renderRow(tripData) {
        if(!tripData||tripData.isHometown)return null;
        return (
            <TripRow neverFeature={true} key={"row"+tripData.id} tripData={tripData} isProfile={true} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}/>
        );
    }
}


export default OwnUserProfile;