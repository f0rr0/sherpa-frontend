'use strict';

import React from "react-native";
import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedTrip from './../feed/feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import TripTitle from "../../components/tripTitle"
import PopOver from '../../components/popOver';
import config from '../../../../data/config';

import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');


var {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight
    } = React;


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
        paddingBottom:20
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
    }
});

class OwnUserProfile extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;

        this.state= {
            annotations:[],
            trips:[],
            ready:false
        };

    }

    componentDidUpdate(prevProps,prevState){
        if(!this.state.ready&&this.props.feed.feedState==='ready'&&this.props.feed.profileTrips) {
            this.itemsLoadedCallback(this.props.feed.profileTrips[this.props.feed.feedPage])
            this.setState({ready:true})
        }
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

            <GiftedListView
                enableEmptySections={true}
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                firstLoader={true} // display a loader for the first fetching
                pagination={true} // enable infinite scrolling using touch to load more
                refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false} // enable sections
                ref="listview"
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

            <StickyHeader ref="stickyHeader" reset={()=>this.reset()} navigation={this.props.navigation.fixed}></StickyHeader>
            <PopOver ref="popover" showShare={false} dispatch={this.props.dispatch} showLogout={true} showDelete={true}></PopOver>

        </View>
        )
    }

    toggleNav(){
        this.refs.popover._setAnimation("toggle");
    }

    _renderFooter(){
        return(

                <View style={{flex:1,alignItems:"center",justifyContent:"center",opacity:this.state.ready?1:0}}>
                </View>


        )
    }
    _renderHeader(){
        if(Object.keys(this.props.feed.profileTrips).length==0)return;

        var trips=this.props.feed.profileTrips?this.props.feed.profileTrips["1"]:[];
        var tripDuration=trips.length;
        var moments=0;
        if(trips){
            for(var i=0;i<trips.length;i++){
                moments+=trips[i].moments.length;
            }
        }
        var hasDescriptionCopy=this.props.user.serviceObject.profile&&this.props.user.serviceObject.profile.serviceBio.length>0;

        return (
            <View>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FFFFFF', height:hasDescriptionCopy?550:500, width:windowSize.width,marginBottom:-290,marginTop:70}} >
                    <View style={{flex:1,alignItems:'center',justifyContent:'center',position:'absolute',left:0,top:20,height:200,width:windowSize.width}}>
                        <Image
                            style={{height:80,width:80,opacity:1,borderRadius:40}}
                            resizeMode="cover"
                            source={{uri:this.props.user.profilePicture}}
                        />
                        <Text style={{color:"#282b33",fontSize:20,marginBottom:5, marginTop:30,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.user.username.toUpperCase()}</Text>
                        <Text style={{color:"#282b33",fontSize:10,marginBottom:5, marginTop:0,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.user.hometown.toUpperCase()}</Text>
                        <Text style={{color:"#a6a7a8",width:250,fontSize:12,marginBottom:10, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", lineHeight:16,backgroundColor:"transparent"}}>{hasDescriptionCopy?this.props.user.serviceObject.profile.serviceBio:""}</Text>
                    </View>


                    <View style={{opacity:trips[0]?0:1,flex:1,justifyContent: 'center', height:400,position:'absolute',top:0,width:windowSize.width-20,alignItems: 'center'}}>
                        <Text style={{color:"#bcbec4",width:250,marginTop:400,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14}}>You don't have any trips yet. The next time you're travelling, remember to tag your Instagram photos with your location.</Text>
                    </View>


                </MaskedView>



                {this.props.navigation.default}
            </View>
        )
    }

    _renderRow(tripData) {
        if(!tripData.country || !tripData.continent || !tripData.name)return <View/>;
        var timeAgo=moment(new Date(tripData.dateStart*1000)).fromNow();
        return (
            <TouchableHighlight style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:windowSize.width-30,width:windowSize.width-30,opacity:.7}}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    />

                    <TripTitle tripData={tripData} tripOwner="YOUR"></TripTitle>


                    <View style={{position:'absolute',bottom:20,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',left:0,right:0}}>
                        <Image source={require('image!icon-images')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length}</Text>
                        <Image source={require('image!icon-watch')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{timeAgo.toUpperCase()}</Text>
                    </View>

                </View>
            </TouchableHighlight>
        );
    }
}


export default OwnUserProfile;