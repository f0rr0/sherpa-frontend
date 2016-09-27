import { connect } from 'react-redux';
import FeedTrip from './feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import Mapbox from "react-native-mapbox-gl";
import MaskedView from "react-native-masked-view";
import {removeMomentFromSuitcase,addMomentToSuitcase,checkSuitcased} from '../../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import PopOver from '../../components/popOver';
import UserImage from '../../components/userImage';
import StickyHeader from '../../components/stickyHeader';
import WikipediaInfoBox from '../../components/wikipediaInfoBox';
import FoursquareInfoBox from '../../components/foursquareInfoBox';
import SimpleButton from '../../components/simpleButton';
import config from '../../../../data/config';
import { Fonts, Colors } from '../../../../Themes/'
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import Navigation from '../../components/navigation'

import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
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
        alignItems:'center',
        paddingBottom:10,
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width,
        height:windowSize.width-30,
        marginBottom:30
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-5,
        marginBottom:0,
        justifyContent:'center',
        alignItems:'center'
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    tripDataFootnoteIcon:{height:10,marginTop:5,marginLeft:-3},
});

class TripDetail extends React.Component{
    constructor(props){
        super();
        this.state= {
            suitcased: props.trip?props.trip.suitcased:false,
            momentData: null,
            routeName:"TRIP"
        }


        getFeed(props.momentID,1,'moment').then((moment)=>{
            this.setState({
                momentData: moment.data,
                routeName: moment.data.venue
            })
        })


    }

    componentDidMount(){
        //checkSuitcased(this.props.momentID).then((res)=>{
        //    this.setState({
        //        suitcased:res
        //    })
        //})

    }

    showUserProfile(trip){
        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    toggleNav(){
        this.refs.popover._setAnimation("toggle");
    }

    suitecaseMoment(){
        this.setState({suitcased:true});
        addMomentToSuitcase(this.props.momentID);
    }

    unsuitecaseMoment(){
        this.setState({suitcased:false});
        removeMomentFromSuitcase(this.props.momentID);
    }


    suiteCaseTrip(){

        this.setState({suitcased:!this.state.suitcased});
        if(!this.state.suitcased){
            this.props.suitcase?this.props.suitcase():this.suitecaseMoment();
        }else{
            this.props.unsuitcase?this.props.unsuitcase():this.unsuitecaseMoment();
        }
    }

    reset(){
        return true;
    }



    _renderSuitcaseButton(){
        return(
            <View>
                <SimpleButton icon="is-suitcased-button"  style={{marginTop:0,backgroundColor:Colors.white}} textStyle={{color:Colors.highlight}} onPress={()=>{this.suiteCaseTrip()}} text="ADDED TO YOUR SUITCASE"></SimpleButton>
                <SimpleButton icon="suitcase-button" style={{marginTop:-55,opacity:this.state.suitcased?0:1}} onPress={()=>{this.suiteCaseTrip()}} text="ADD TO YOUR SUITCASE"></SimpleButton>
            </View>
        )
    }


    render(){
        var momentData=this.state.momentData;
        if(!momentData)return <View style={{flex:1,backgroundColor:'white', justifyContent:'center',alignItems:'center'}}><Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} /></View>

        var timeAgo=moment(new Date(momentData.date*1000)).fromNow();
        var description=momentData.caption&&momentData.caption.length>0?<Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:12,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={2}>{momentData.caption}</Text>:null;

        var profilePic= momentData.serviceJson?
            <View style={{height:windowSize.width,width:windowSize.width,position:'absolute',top:0,flex:1,justifyContent:'flex-end',alignItems:'flex-start'}}>
                    <Image style={{position:'absolute',bottom:0,left:0,width:windowSize.width,height:200}} resizeMode="cover" source={require('../../../../Images/shadow-bottom.png')}></Image>
                <View style={{alignItems:'flex-start',flexDirection:'row',marginBottom:20,marginLeft:20}}>
                    <UserImage onPress={()=>{this.showUserProfile({owner:momentData.profile})}} radius={30} userID={momentData.profile.id} imageURL={momentData.serviceJson.user['profile_picture']}></UserImage>
                    <View style={{marginLeft:20,}}>
                        <TouchableOpacity onPress={()=>{
                            Linking.openURL(momentData.serviceJson.link)
                        }}>
                            {description}
                        </TouchableOpacity>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Image source={require('image!icon-watch')} style={styles.tripDataFootnoteIcon} resizeMode="contain"></Image>
                            <Text style={{backgroundColor:'transparent',color:'white', marginTop:6,fontFamily:'Akkurat',fontSize:10,opacity:.8,marginLeft:3}}>{timeAgo.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
            </View>:null;
        return (
            <View style={{flex:1}}>
                <ScrollView style={{flex:1,backgroundColor:'white'}}>

                    <Image
                        style={{height:windowSize.width,width:windowSize.width }}
                        resizeMode="cover"
                        source={{uri:momentData.mediaUrl}}
                    />


                    {profilePic}
                    {this._renderSuitcaseButton()}
                    <WikipediaInfoBox countryCode={momentData.country} location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></WikipediaInfoBox>
                    <FoursquareInfoBox location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></FoursquareInfoBox>

                    <View style={{height:250,width:windowSize.width,left:0,flex:1}} >
                        <Mapbox
                            style={{height:250,width:windowSize.width,left:0,flex:1,position:'absolute',bottom:0,fontSize:10,fontFamily:"TSTAR", fontWeight:"500"}}
                            accessToken={'pk.eyJ1IjoidHJhdmVseXNoZXJwYSIsImEiOiJjaXRrNnk5OHgwYW92Mm9ta2J2dWw1MTRiIn0.QZvGaQUAnLMvoarRo9JmOg'}
                            centerCoordinate={{latitude:momentData.lat,longitude: momentData.lng}}
                            zoomLevel={12}
                            onScroll={(event)=>{
                                 var currentOffset = event.nativeEvent.contentOffset.y;
                                 var direction = currentOffset > this.offset ? 'down' : 'up';
                                 this.offset = currentOffset;
                                 if(direction=='down'||currentOffset<30){
                                    this.refs.stickyHeader._setAnimation(false);
                                 }else{
                                    this.refs.stickyHeader._setAnimation(true);
                                 }
                            }}
                            annotations={[
                                {
                                    coordinates: [momentData.lat, momentData.lng],
                                    type: 'point',
                                    title:momentData.venue,
                                    annotationImage: {
                                        url: 'image!icon-pin',
                                        height: 7,
                                        width: 7
                                    },
                                    id:"markers1"
                                }
                            ]}
                            scrollEnabled={true}
                            zoomEnabled={true}
                        />

                    </View>
                    <Navigation hideNav={this.props.navSettings.hideNav} topShadow={this.props.navSettings.topShadow} ref="navStatic" color={this.props.navSettings.color} routeName={this.state.routeName} hideBack={this.props.navSettings.hideBack} opaque={this.props.navSettings.opaque} goBack={this.props.navigator.pop}  toggleNav={this.props.navSettings.toggleNav}></Navigation>
                </ScrollView>
                <PopOver ref="popover" shareURL={config.shareBaseURL+"/trip/"+momentData.trip+"/"+this.props.user.sherpaToken} showShare={true} reportPhoto={true} momentID={momentData.id}></PopOver>

            </View>
        )
    }
}

export default TripDetail;