'use strict';

import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {loadFeed} from '../../../../actions/feed.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import TripTitle from "../../components/tripTitle"
import PopOver from '../../components/popOver';
import Dimensions from 'Dimensions';
import UserImage from '../../components/userImage'
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
        backgroundColor:'#001545',
        height:50,
        width:windowSize.width-30,
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    listViewLabel:{fontSize:12}
});

class OwnUserProfile extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;
        this.ready=false;

        this.state= {
            annotations:[],
            trips:[],
            isRescraping:false
        };
        this.isScraping=false;
    }

    componentDidMount(){
        this.checkScrapeStatus();
    }

    checkScrapeStatus(){
        store.get('user').then((user) => {
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            const {endpoint} = sherpa;
            this.isRescraping=true;

            fetch(endpoint+"v1/profile/"+user.serviceID+"/lastscrape/",{
                method:'get',
                headers:sherpaHeaders
            }).then((rawServiceResponse)=>{
                return rawServiceResponse.text();
            }).then((rawSherpaResponse)=>{
                var parsedResponse=JSON.parse(rawSherpaResponse);
                if(parsedResponse.scrapeState!=='completed'){
                    this.checkScrapeTimeout=setTimeout(()=>{this.checkScrapeStatus()},1000);
                }else if(parsedResponse.scrapeState=='completed'){
                    clearTimeout(this.checkScrapeTimeout);
                    setTimeout(()=> {
                        this.ready=false
                        this.props.dispatch(loadFeed(this.props.user.serviceID, this.props.user.sherpaToken, 1, "profile"));
                    },3000)
                }
            });
        })
    }

    componentDidUpdate(prevProps,prevState){

        if(!this.ready&&this.props.feed.feedState==='ready'&&this.props.feed.profileTrips) {
            this.ready=true;
            this.itemsLoadedCallback(this.props.feed.profileTrips[this.props.feed.feedPage]);
            this.refs.listview._refresh();
            this.isScraping=false;
        }
    }

    refresh(){
        this.ready=false;
        this.props.dispatch(loadFeed(this.props.user.serviceID, this.props.user.sherpaToken, 1, "profile"));
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

    _onFetch(page=1,callback){
        this.itemsLoadedCallback=callback;
        this.props.dispatch(loadFeed(this.props.user.serviceID,this.props.user.sherpaToken,page,"profile"));
    }

    render(){
        return(
        <View style={{flex:1,backgroundColor:'white'}}>
            <SherpaGiftedListview
                enableEmptySections={true}
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                firstLoader={true}  // display a loader for the first fetching
                pagination={false}  // enable infinite scrolling using touch to load more
                refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false}// enable sections
                ref="listview"
                paginationFetchingView={this._renderEmpty.bind(this)}

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

    navActionRight(){
        this.props.navigator.push({
            id: "profile-settings",
            sceneConfig:"bottom-nodrag",
            hideNav:true
        });
    }

    navActionLeft(){
        this.props.navigator.push({
            id: "addTrip",
            sceneConfig:"bottom-nodrag",
            hideNav:true
        });
    }




    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    _renderHeader(){
        console.log(this.props.user);
        if(Object.keys(this.props.feed.profileTrips).length==0)return;
        var trips=this.props.feed.profileTrips?this.props.feed.profileTrips["1"]:[];
        var moments=0;
        if(trips){
            for(var i=0;i<trips.length;i++){
                moments+=trips[i].moments.length;
            }
        }
        var hasDescriptionCopy=true;

        var status=!this.isRescraping?
            <View style={{opacity:trips[0]?0:1,flex:1,justifyContent: 'center', height:300,position:'absolute',top:0,width:windowSize.width,alignItems: 'center'}}>
                <Text style={{color:"#bcbec4",width:250,marginTop:400,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>You don't have any trips yet.</Text>
            </View>:
            <View style={{opacity:trips[0]?0:1,flex:1,justifyContent: 'center', height:400,position:'absolute',top:0,width:windowSize.width,alignItems: 'center'}}>
                <View style={{flex:1,justifyContent:'center',height:50,marginTop:300,width:50,alignItems:'center'}}>
                    <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
                </View>
                <Text style={{color:"#bcbec4",width:250,marginTop:20,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>We are still scraping your profile. Please check back soon!</Text>
            </View>;


        return (
            <View>
                <View style={{backgroundColor:'#FFFFFF', height:hasDescriptionCopy?300:250, width:windowSize.width,marginBottom:0,marginTop:70}} >
                    <View style={{flex:1,alignItems:'center',justifyContent:'center',position:'absolute',left:0,top:20,height:200,width:windowSize.width,zIndex:1}}>
                        <UserImage
                          onPress={()=>{Linking.openURL("https://www.instagram.com/"+this.props.user.username);}}
                          radius={80}
                          userID={this.props.user.id} imageURL={this.props.user.profilePicture}/>
                        <Text style={{color:"#282b33",fontSize:20,marginBottom:0, marginTop:30,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.user.username.toUpperCase()}</Text>
                        <Text style={{color:"#a6a7a8",width:300,fontSize:12,marginBottom:5, marginTop:0,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", lineHeight:16,backgroundColor:"transparent"}}>{this.props.user.hometown}</Text>

                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{color:"#a6a7a8",width:300,fontSize:12,marginBottom:5, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", lineHeight:16,backgroundColor:"transparent"}}>{this.props.user.serviceObject.profile.serviceBio}</Text>
                        </Hyperlink>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{color:"#a6a7a8",width:300,fontSize:12,marginBottom:10, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", lineHeight:16,backgroundColor:"transparent"}}>{this.props.user.serviceObject["website"]}</Text>
                        </Hyperlink>
                    </View>
                    {status}
                </View>

                {this.props.navigation.default}
            </View>
        )
    }

    _renderRow(tripData) {
        return (
            <TripRow tripData={tripData} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}/>
        );
    }
}


export default OwnUserProfile;