import { connect } from 'react-redux';
import FeedTrip from './feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import Mapbox from "react-native-mapbox-gl";
import MaskedView from "react-native-masked-view";
import {removeMomentFromSuitcase,addMomentToSuitcase} from '../../../../actions/user.actions';
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
        this.state={
            suitcased:props.tripDetails.trip.suitcased
        }
    }

    componentDidMount(){
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

    suiteCaseTrip(){

        this.setState({suitcased:!this.state.suitcased});
        if(!this.state.suitcased){
            this.props.tripDetails.row.suiteCaseTrip();
        }else{
            this.props.tripDetails.row.unSuiteCaseTrip();
        }
    }

    reset(){
        return true;
    }

    getTripLocation(tripData){
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.name;
        })[0];

        var tripLocation=tripData.name;
        return {location:tripLocation,country:country,countryCode:tripData.country};
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

        var timeAgo=moment(new Date(this.props.tripDetails.trip.date*1000)).fromNow();
        var description=this.props.tripDetails.trip.caption&&this.props.tripDetails.trip.caption.length>0?<Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:12,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={2}>{this.props.tripDetails.trip.caption}</Text>:null;

        var profilePic= this.props.tripDetails.owner?
            <View style={{height:windowSize.width,width:windowSize.width,position:'absolute',top:0,flex:1,justifyContent:'flex-end',alignItems:'flex-start'}}>
                    <Image style={{position:'absolute',bottom:0,left:0,width:windowSize.width,height:200}} resizeMode="cover" source={require('../../../../Images/shadow-bottom.png')}></Image>
                <View style={{alignItems:'flex-start',flexDirection:'row',marginBottom:20,marginLeft:20}}>
                    <UserImage onPress={()=>{this.showUserProfile(this.props.tripDetails)}} radius={30} userID={this.props.tripDetails.owner.id} imageURL={this.props.tripDetails.owner.serviceProfilePicture}></UserImage>
                    <View style={{marginLeft:20,}}>
                        <TouchableOpacity onPress={()=>{
                            Linking.openURL(this.props.tripDetails.trip.serviceJson.link)
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
                        source={{uri:this.props.tripDetails.trip.mediaUrl}}
                    />


                    {profilePic}
                    {this._renderSuitcaseButton()}
                    <WikipediaInfoBox location={this.props.tripDetails.trip.venue} coordinates={{lat:this.props.tripDetails.trip.lat,lng:this.props.tripDetails.trip.lng}}></WikipediaInfoBox>
                    <FoursquareInfoBox location={this.props.tripDetails.trip.venue} coordinates={{lat:this.props.tripDetails.trip.lat,lng:this.props.tripDetails.trip.lng}}></FoursquareInfoBox>

                    <View style={{height:250,width:windowSize.width,left:0,flex:1}} >
                        <Mapbox
                            style={{height:250,width:windowSize.width,left:0,flex:1,position:'absolute',bottom:0,fontSize:10,fontFamily:"TSTAR", fontWeight:"500"}}
                            accessToken={'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw'}
                            centerCoordinate={{latitude:this.props.tripDetails.trip.lat,longitude: this.props.tripDetails.trip.lng}}
                            zoomLevel={16}
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
                                    coordinates: [this.props.tripDetails.trip.lat, this.props.tripDetails.trip.lng],
                                    type: 'point',
                                    title:this.props.tripDetails.trip.venue,
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
                    {this.props.navigation.default}
                </ScrollView>
                <PopOver ref="popover" shareURL={config.shareBaseURL+"/trip/"+this.props.tripDetails.trip.trip+"/"+this.props.user.sherpaToken} showShare={true} reportPhoto={true} momentID={this.props.tripDetails.trip.id}></PopOver>

            </View>
        )
    }
}

export default TripDetail;