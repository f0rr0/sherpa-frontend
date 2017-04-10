'use strict';

//import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'
import config from '../../../../data/config';

import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {getFeed} from '../../../../actions/feed.actions';
import {follow,unfollow,checkFollowing} from '../../../../actions/user.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import TripTitle from "../../components/tripTitle"
import PopOver from '../../components/popOver';
import UserImage from '../../components/userImage';
import TripRow from '../../components/tripRow'
import Hyperlink from 'react-native-hyperlink';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import MarkerMap from '../../components/MarkerMap'
import { Fonts, Colors } from '../../../../Themes/'
import UserStat from '../../components/userStat'
import SimpleButton from '../../components/simpleButton'


import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight,
    TouchableOpacity,
    Linking
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
    }
});

class FeedProfile extends React.Component {
    constructor(props){
        super(props);
        this.itemsLoadedCallback=null;
        const isHeaderReady=false;
        this.state= {
            trips:[],
            headerTrips:[],
            annotations:[],
            owner:isHeaderReady?props.trip.owner:null,
            isHeaderReady,
            isFollowing:false
        };

    }

    componentDidMount(){
        //console.log('trip profile created');
        //getFeed("profile-map")
    }


    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            trip
        });
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        this.itemsLoadedCallback=callback;
        getFeed(this.props.trip.owner.id,page,'profile').then((response)=>{

            let trips=response.data;
            this.isRescraping=false;
            this.setState({owner:response.profile,trips,feedReady:true})
            var settings=response.data.length==0?{
                allLoaded: true
            }:{};

            if(page==1){
                let hometownGuide=null;
                for(var i=0;i<trips.length;i++){
                    let trip = trips[i];
                    if(trip.isHometown){
                        hometownGuide=trips.splice(i,1)[0];
                    }
                }


                checkFollowing(response.profile.id).then((res)=>{

                    this.setState({isHeaderReady:true,isFollowing:res,hometownGuide,headerTrips:response.data,profile:response.profile,followers:response.followers,following:response.following})
                    callback(response.data,settings);
                })
            }else{
                callback(response.data,settings);
            }


        });
    }

    showFollowers(followerType){
        this.props.navigator.push({
            id: "follower-list",
            followerType,
            user:this.props.user,
            profile:this.state.profile
        });
    }



    followUser(){
        if(this.state.isFollowing){
            unfollow(this.state.profile.id);
            this.setState({isFollowing:false})
        }else{
            follow(this.state.profile.id);
            this.setState({isFollowing:true})
        }
    }


    renderUserStats(){

        if(!this.state.profile)return;

        const counts=this.state.profile.serviceObject.counts;

        const userStats=[
            {icon:require('./../../../../Images/icons/user-small.png'),description:this.state.followers+" followers",onPress:()=>{this.showFollowers('followers')}},
            {icon:require('./../../../../Images/icons/user-small.png'),description:counts.media+" moments"},
            {icon:require('./../../../../Images/icons/user-small.png'),description:this.state.following+" following",onPress:()=>{this.showFollowers('following')}},
        ]

        const borderRight={
            borderRightWidth:1,
            borderRightColor:'#E5E5E5'
        };

        const borderLeft={
            borderLeftWidth:1,
            borderLeftColor:'#E5E5E5',
        };
        return(
            <View style={{flexDirection:'row',justifyContent:'space-between',width:windowSize.width-30}}>
                {userStats.map((item,index)=>{

                    let border=null;
                    if(index==0){
                        border=borderRight;
                    }else if(index==userStats.length-1){
                        border=borderLeft;
                    }

                    return (
                        <View  key={"user-stat-"+index} style={[{justifyContent:"center",flexDirection:'row',flex:1,alignItems:'center'},border]}>
                            <UserStat style={[{paddingHorizontal:5}]} icon={item.icon} description={item.description} onPress={item.onPress}></UserStat>
                        </View>
                    )
                })}
            </View>
        )
    }

    renderFollowButton(){
        return null;
        return(
            <View style={{width:windowSize.width-30,marginTop:15}}>
                <SimpleButton icon="is-following-button"  style={{marginTop:0, shadowRadius:2,shadowOpacity:.1,shadowOffset:{width:0,height:.5}}} textStyle={{color:Colors.white}} onPress={()=>{this.unfollow()}} text="following"></SimpleButton>
                <SimpleButton icon="follow-button" style={{marginTop:-55,opacity:this.state.isFollowing?0:1, shadowRadius:2,shadowOpacity:.1,shadowOffset:{width:0,height:.5}}} onPress={()=>{this.followUser()}} text={"follow "+this.state.profile.serviceUsername}></SimpleButton>
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
                    pagination={false} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    ref="listview"
                    paginationFetchingView={this._renderEmpty.bind(this)}

                    onEndReachedThreshold={1200}
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
                    headerView={this._renderHeader.bind(this)}
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
                {this.state.owner?<PopOver enableNavigator={this.props.enableNavigator} ref="popover" showShare={true} shareURL={config.auth[config.environment].shareBaseURL+"profiles/"+this.state.owner.id}></PopOver>:null}

            </View>
        )
    }


    _renderEmpty(){
        return (
            <View style={{justifyContent:'center',backgroundColor:"white",height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>

        )
    }

    showProfileMap(moments){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip:{moments},
            title:this.state.owner.serviceUsername.toUpperCase()+"'S TRAVELS",
            sceneConfig:"bottom",
            hideNav:true
        });
    }



    _renderHeader(){
        if(!this.state.isHeaderReady)return;

        var trips=this.state.trips;
        var moments=[];

        if(trips){
            for(var i=0;i<this.state.headerTrips.length;i++){
                Array.prototype.push.apply(moments,this.state.headerTrips[i].moments)
            }
        }


        if(this.state.hometownGuide)Array.prototype.push.apply(moments,this.state.hometownGuide.moments);

        var hasDescriptionCopy=true;


        const tooltip=!this.props.user.usedAddTrip?
            <TouchableOpacity style={{position:'absolute',left:5,top:50}} onPress={()=>{this.hideTooltip()}}><Animated.Image ref="tooltip" source={require('./../../../../Images/tooltip-addtrip.png')} resizeMode="contain" style={{opacity:this.state.tooltipOpacity,width:365,height:90}}></Animated.Image></TouchableOpacity>
            : null;




        const hometownGuide=this.state.hometownGuide&&this.state.owner.serviceUsername?
            <View>
                <TripRow isProfile={true} tripData={this.state.hometownGuide} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}/>
                <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,fontWeight:"500",marginVertical:10}}>{this.state.owner.serviceUsername.toUpperCase()}'S TRAVELS</Text>
            </View>
            :null;

        const map= this.state.feedReady&&this.state.headerTrips.length>0?<TouchableOpacity  onPress={()=>{this.showProfileMap(moments)}} style={{left:15,height:260,width:windowSize.width-30,marginBottom:14}}>
            <MarkerMap moments={moments} interactive={false}></MarkerMap>
        </TouchableOpacity>:null;

        return (
            <View>
                <View style={{height:windowSize.height*.4, width:windowSize.width,marginBottom:85,marginTop:0,justifyContent:'space-between',zIndex:1}} >
                    <View style={{flex:1,alignItems:'center',justifyContent:'flex-start',paddingTop:0,width:windowSize.width,zIndex:1}}>
                        <UserImage border={false} onPress={()=>{
                            Linking.openURL("https://www.instagram.com/"+this.state.owner.serviceUsername);
                        }} radius={80} userID={this.state.owner.id} imageURL={this.state.owner.serviceProfilePicture}></UserImage>

                        <Text style={{color:"#000000",fontSize:20,marginBottom:20, marginTop:-65,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.state.owner.serviceUsername.toUpperCase()}</Text>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{color:"#000000",width:300,fontSize:12,marginBottom:0, marginTop:3,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", backgroundColor:"transparent"}}>{this.state.owner.serviceObject["bio"]}</Text>
                        </Hyperlink>
                        <Text style={{color:"#949494",width:300,fontSize:12,marginBottom:0, marginTop:3,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500",backgroundColor:"transparent"}}>{this.state.owner.hometown}</Text>
                        <Hyperlink onPress={(url) => Linking.openURL(url)}>
                            <Text style={{textDecorationLine:'underline',color:"#8AD78D",width:300,fontSize:12,marginBottom:10,marginTop:5, fontFamily:"TSTAR", textAlign:'center', fontWeight:"600",backgroundColor:"transparent"}}>{this.state.owner.serviceObject["website"].replace("http://","").replace("https://","")}</Text>
                        </Hyperlink>
                    </View>
                </View>

                <View style={{width:windowSize.width,height:130,marginBottom:-65,alignItems:'center',justifyContent:'center',zIndex:1}}>
                    {/*this.renderUserStats()*/}
                    {this.renderFollowButton()}
                </View>

                {hometownGuide}
                {map}

                {this.props.navigation.default}
            </View>
        )
    }

    _renderRow(tripData) {
        return (
            <TripRow isProfile={true} tripData={tripData} showTripDetail={this.showTripDetail.bind(this)} hideProfileImage={true}></TripRow>
        );
    }
}


export default FeedProfile;