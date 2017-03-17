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
import UserImage from '../../components/userImage'
import MarkerMap from '../../components/MarkerMap'
var windowSize=Dimensions.get('window');
import config from '../../../../data/config';
import store from 'react-native-simple-store';
const {sherpa}=config.auth[config.environment];
import TripRow from '../../components/tripRow'
import SimpleButton from '../../components/simpleButton'
import Hyperlink from 'react-native-hyperlink';

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
        flex: 1
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center'
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:60
    },
    listItemContainer:{
        flex:1,
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
        flex:1,
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
            hometownGuide:null,
            tooltipOpacity:new Animated.Value(1),
            isRescraping:false
        };
        this.isScraping=false;
    }

    componentDidMount(){
        checkOptedIn().then((res)=>{
            this.props.dispatch(updateUserData({scrapeFromInstagram:res.optedIn}));
        })
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
                if(parsedResponse.scrapeState!=='completed'){
                    this.checkScrapeTimeout=setTimeout(()=>{this.checkScrapeStatus()},1000);
                    this.props.dispatch(updateUserData({scrapeState:'scraping'}));
                    this.props.dispatch(storeUser());
                }else if(parsedResponse.scrapeState=='completed'){
                    this.props.dispatch(updateUserData({scrapeState:'completed'}));
                    this.props.dispatch(storeUser());
                    clearTimeout(this.checkScrapeTimeout);
                    setTimeout(()=> {
                        this.ready=false;
                        this._onFetch();
                    },3000)
                }
            });
        })
    }

    refreshCurrentScene(){
        //this.refresh();
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
            trip
        });
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        this.itemsLoadedCallback=callback;
        getFeed(this.props.user.serviceID,page,'profile').then((response)=>{
            //console.log(response)
            callback(response.data);
            let trips=response.data;

            this.isRescraping=false;
            if(page==1){
                let hometownGuide=null;
                for(var i=0;i<trips.length;i++){
                    let trip = trips[i];
                    if(trip.isHometown){
                        hometownGuide=trips.splice(i,1)[0];
                    }
                }
                this.setState({hometownGuide});
            }
            this.setState({trips,feedReady:true})
        });
    }

    hideTooltip(){
        Animated.timing(this.state.tooltipOpacity,{duration:100,toValue:0}).start(()=>{
            this.setState({hideTooltip:true})
        });
        this.props.dispatch(updateUserData({usedAddTrip:true}))
        this.props.dispatch(storeUser())
    }

    render(){
        const tooltipTouchable=this.state.hideTooltip||this.props.user.usedAddTrip?null:
            <TouchableOpacity onPress={this.hideTooltip.bind(this)} style={{position:'absolute',top:0,left:0,bottom:0,right:0,backgroundColor:'transparent'}}></TouchableOpacity>


        //console.log('scrape from isntagram',this.props.user.scrapeFromInstagram)

        return(
        <View style={{flex:1,backgroundColor:'white'}}>

            <SherpaGiftedListview
                enableEmptySections={true}
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                renderHeaderOnInit={true}
                firstLoader={true}  // display a loader for the first fetching
                pagination={false}  // enable infinite scrolling using touch to load more
                refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false}// enable sections
                ref="listview"
                paginationFetchingView={this._renderEmpty.bind(this)}
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
                    }else if(this.props.user.scrapeFromInstagram&&this.isRescraping&&this.props.user.scrapeState!=='completed'){
                        activeView=this._renderRescrapeMessage();
                    }
                    return(
                        <View style={{flex:1,justifyContent:'flex-start',alignItems:'center'}}>
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
            <PopOver  enableNavigator={this.props.enableNavigator} ref="popover" showShare={true} showSettings={true} openSettings={this.openSettings.bind(this)} shareURL={config.auth[config.environment].shareBaseURL+"profiles/"+this.props.user.serviceID}></PopOver>

            <StickyHeader ref="stickyHeader" reset={()=>this.reset()} navigation={this.props.navigation.fixed}></StickyHeader>
        </View>
        )
    }

    resetProfile(){
        const {endpoint,version} = sherpa;
        let feedRequestURI;
        feedRequestURI = endpoint + version + "/profile/" + this.props.user.serviceID + "/reset";
        let sherpaHeaders = new Headers();
        sherpaHeaders.append("token", this.props.user.sherpaToken);
        var me = this;

        fetch(feedRequestURI, {
            method: 'post',
            headers: sherpaHeaders,
            mode: 'cors'
        })
            .then((rawSherpaResponse)=> {
                switch (rawSherpaResponse.status) {
                    case 200:
                        return rawSherpaResponse.text()
                        break;
                    case 400:
                        return '{}';
                        break;
                }
            })
            .then((rawSherpaResponseFinal)=> {
                me.refs.listview._refresh();
            });
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
            hideNav:true
        });
    }


    _renderEmpty(){

        let status;
        let message='0';

        if(this.isRescraping){

            status=this._renderStillScraping();
            message='a';
        }else if(this.state.trips.length==0){
            message='b';
            status=
                <View style={{justifyContent: 'center', width:windowSize.width,alignItems: 'center'}}>
                    <Text style={{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>You don't have any trips yet.</Text>
                </View>
        }else if(this.state.trips.length>0){
            message='c';
            status=
                <View style={{flex:1,justifyContent:'center',width:windowSize.width,alignItems:'center'}}>
                    <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
                </View>
        }

        return (
            this.props.user.scrapeFromInstagram?status:null
        )
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
        return(
            <View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}>
                <View style={{flex:1,justifyContent:'center',height:50,width:50,alignItems:'center'}}>
                    <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
                </View>
                {this.props.user.scrapeState!=='completed'?<Text style={{color:"#bcbec4",width:250,marginTop:20,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>We are scraping your profile. Please check back soon!</Text>:null}
            </View>
        )
    }

    showProfileMap(moments){
        this.props.navigator.push({
             id: "tripDetailMap",
             trip:{moments},
             title:this.props.user.username.toUpperCase()+"'S TRAVELS",
             sceneConfig:"bottom",
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

        const tooltip=!this.props.user.usedAddTrip?
                <TouchableOpacity style={{position:'absolute',left:5,top:50}} onPress={()=>{this.hideTooltip()}}><Animated.Image ref="tooltip" source={require('./../../../../Images/tooltip-addtrip.png')} resizeMode="contain" style={{opacity:this.state.tooltipOpacity,width:365,height:90}}></Animated.Image></TouchableOpacity>
            : null;

        const hometownGuide=this.state.hometownGuide?
            <View>
                <TripRow isProfile={true} tripData={this.state.hometownGuide} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}/>
                <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,fontWeight:"500",marginVertical:10}}>{this.props.user.username.toUpperCase()}'S TRAVELS</Text>
            </View>
            :null;

        const map= this.state.feedReady&&this.state.trips.length>0?<TouchableOpacity  onPress={()=>{this.showProfileMap(moments)}} style={{left:15,height:260,width:windowSize.width-30,marginBottom:14}}>
            <MarkerMap moments={moments} interactive={false}></MarkerMap>
        </TouchableOpacity>:null;

        return (
            <View>
                <View style={{backgroundColor:'#FFFFFF', height:hasDescriptionCopy?300:250, width:windowSize.width,marginBottom:0,marginTop:100}} >
                    <View style={{flex:1,alignItems:'center',justifyContent:'center',position:'absolute',left:0,top:20,height:200,width:windowSize.width,zIndex:1}}>
                        <UserImage
                          onPress={()=>{Linking.openURL("https://www.instagram.com/"+this.props.user.username);}}
                          radius={80}
                          border={false}
                          userID={this.props.user.id} imageURL={this.props.user.profilePicture}/>
                        <Text style={{color:"#282b33",fontSize:20, marginTop:25,marginBottom:20,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.user.username.toUpperCase()}</Text>

                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{color:"#000",width:300,fontSize:12,marginBottom:0, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", backgroundColor:"transparent"}}>{this.props.user.bio}</Text>
                        </Hyperlink>
                        <Text style={{color:"#a6a7a8",width:300,fontSize:12,marginBottom:0, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", backgroundColor:"transparent"}}>{this.props.user.hometown}</Text>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{textDecorationLine:'underline',color:"#8AD78D",width:300,fontSize:12,marginBottom:10, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500",backgroundColor:"transparent"}}>{this.props.user.website.replace("http://","").replace("https://","")}</Text>
                        </Hyperlink>
                    </View>
                </View>
                {tooltip}
                {hometownGuide}
                {map}
                {this.props.navigation.default}
            </View>
        )
    }

    _renderRow(tripData) {
        if(!tripData)return null;
        return (
            <TripRow key={"row"+tripData.id} tripData={tripData} isProfile={true} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}/>
        );
    }
}


export default OwnUserProfile;