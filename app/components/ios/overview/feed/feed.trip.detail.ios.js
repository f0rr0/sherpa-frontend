import { connect } from 'react-redux';
import countries from './../../../../data/countries'
import moment from 'moment';
//import Mapbox from "react-native-mapbox-gl";
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import PopOver from '../../components/popOver';
import UserImage from '../../components/userImage';
import MomentRow from '../../components/momentRow';
import StickyHeader from '../../components/stickyHeader';
import WikipediaInfoBox from '../../components/wikipediaInfoBox';
import FoursquareInfoBox from '../../components/foursquareInfoBox';
import SimpleButton from '../../components/simpleButton';
import config from '../../../../data/config';
import { Fonts, Colors } from '../../../../Themes/'
import {loadFeed,getFeed,deleteMoment} from '../../../../actions/feed.actions';
import Header from '../../components/header'
import MapView from 'react-native-maps'
import MarkerMap from '../../components/MarkerMap'
import {BlurView} from 'react-native-blur';
import {removeMomentFromSuitcase,addMomentToSuitcase,checkSuitcased} from '../../../../actions/user.actions';

import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    TouchableHighlight,
Alert,
Animated,
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
    row:{flexDirection: 'row'},

    map: {
        ...StyleSheet.absoluteFillObject,
        height:250,width:windowSize.width
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
            suitcased: props.isSuitcased?true:(props.trip?props.trip.suitcased:false),
            momentData: null,
            routeName:"TRIP",
            scrollY:new Animated.Value(0),
            headerLoadedOpacity:new Animated.Value(0),
            containerWidth:windowSize.width-30,
        }


        //get moment data
        getFeed(props.momentID,1,'moment').then((moment)=>{
            const itemsPerRow=2;
            let organizedRelatedMoments=[];
            let data=moment.data.related;
            let globalIndex=0;
            for(var i=0;i<data.length;i++){
                let endIndex=Math.random()>.5||globalIndex==0?1+i:itemsPerRow+i;
                organizedRelatedMoments.push(data.slice(i, endIndex));
                i = endIndex-1;
                globalIndex++;
            }


            this.setState({
                organizedRelatedMoments,
                momentData: moment.data,
                routeName: moment.data.venue
            })
        })


        //get trip data

    }

    componentDidMount(){
        if(this.props.isSuitcased==undefined){
            checkSuitcased(this.props.momentID).then((res)=>{
                this.setState({suitcased:res==='true'});
            })
        }
    }

    showTripMap(momentData){
        this.props.navigator.push({
            id: "tripDetailMap",
            trip:{moments:[momentData]},
            title:momentData.venue,
            sceneConfig:"bottom-nodrag",
            hideNav:true,
            disablePins:true
        });
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    showTripDetail(){
        //console.log('this is trip detail');
    }

    showUserProfile(trip){
        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    navActionRight(){
        this.refs.popover._setAnimation("toggle");
    }

    suitecaseMoment(){
        this.setState({suitcased:true});
        this.props.suiteCaseTrip?this.props.suiteCaseTrip():addMomentToSuitcase(this.props.momentID);;
    }

    unsuitecaseMoment(){
        this.setState({suitcased:false});
        this.props.unSuiteCaseTrip?this.props.unSuiteCaseTrip():removeMomentFromSuitcase(this.props.momentID);;
    }


    suiteCaseTrip(){
        //console.log('suitcase trip');

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
        //console.log('this state suitcase',this.state.suitcased);
        return(
            <View>
                <SimpleButton icon="is-suitcased-button"  style={{marginTop:0,backgroundColor:Colors.white}} textStyle={{color:Colors.highlight}} onPress={()=>{this.suiteCaseTrip()}} text="ADDED TO YOUR SUITCASE"></SimpleButton>
                <SimpleButton icon="suitcase-button" style={{marginTop:-55,opacity:this.state.suitcased?0:1}} onPress={()=>{this.suiteCaseTrip()}} text="ADD TO YOUR SUITCASE"></SimpleButton>
            </View>
        )
    }

    onDeleteMoment(){
        Alert.alert(
            'Delete Trip',
            'Are you sure you want to delete this trip?',
            [
                {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                {text: 'OK', onPress: () => {
                    deleteMoment(this.state.momentData.id,true)
                    this.props.navigator.pop()
                }}
            ]
        )

    }


    render(){
        var momentData=this.state.momentData;
        //console.log(momentData)
        if(!momentData)return <View style={{flex:1,backgroundColor:'white', justifyContent:'center',alignItems:'center'}}><Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} /></View>
        let windowHeight=windowSize.height;
        var timeAgo=moment(new Date(momentData.date*1000)).fromNow();
        var description=momentData.caption&&momentData.caption.length>0?<Text style={{backgroundColor:'transparent',color:'white', fontFamily:'Akkurat',fontSize:12,width:windowSize.width-100}} ellipsizeMode="tail" numberOfLines={10}>{momentData.caption}</Text>:null;
        var profilePic= momentData.profile.serviceProfilePicture?
            <View style={{height:windowSize.width,width:windowSize.width,position:'absolute',top:0,flex:1,justifyContent:'flex-end',alignItems:'flex-start'}}>
                <Image style={{position:'absolute',bottom:0,left:0,width:windowSize.width,height:200}} resizeMode="cover" source={require('../../../../Images/shadow-bottom.png')}></Image>

                <View style={{alignItems:'flex-start',flexDirection:'row',marginBottom:20,marginLeft:20}}>
                    <UserImage onPress={()=>{this.showUserProfile({owner:momentData.profile})}} radius={30} userID={momentData.profile.id} imageURL={momentData.profile.serviceProfilePicture}></UserImage>
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



        let relatedMoments=this.state.organizedRelatedMoments.map((rowData,rowID)=>{
            let index=0;
            let items = rowData.map((item) => {
                if (item === null || item.type!=='image') {
                    return null;
                }

                index++;
                return  <MomentRow key={"momentRow"+rowID+"_"+index}  itemRowIndex={index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.props.trip} dispatch={this.props.dispatch} navigator={this.props.navigator}></MomentRow>
            });

            return (
                <View key={"row"+rowID} style={[styles.row,{width:windowSize.width-30,marginLeft:15,marginBottom:0}]}>
                    {items}
                </View>
            )
        })

        let relatedMomentContainer=this.state.momentData.related.length>0?
            <View style={{marginBottom:55}}>
                <Text style={{marginLeft:15,fontSize:10,fontFamily:"TSTAR",letterSpacing:.8,marginTop:30,marginBottom:12,fontWeight:"500"}}>OTHER PHOTOS FROM THIS LOCATION</Text>
                {relatedMoments}
            </View>:null;





        return (
            <View style={{flex:1}}>
                <ScrollView  scrollEventThrottle={8} style={{flex:1,backgroundColor:'white'}} onScroll={(event)=>{
                 Animated.event(
                          [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
                        )(event);
                }}>

                    <View style={{position:'absolute',left:0,top:0}}>
                        <Animated.Image
                            style={[{height:windowSize.width,width:windowSize.width,opacity:1}]}
                            resizeMode="cover"
                            source={{uri:momentData.serviceJson?momentData.serviceJson.images.low_resolution.url:momentData.mediaUrl}}
                        >
                            <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>
                        </Animated.Image>
                    </View>

                    <Animated.Image
                        style={[{height:windowSize.width,width:windowSize.width,opacity:this.state.headerLoadedOpacity },
                        {
                                transform: [,{
                        scale: this.state.scrollY.interpolate({
                            inputRange: [ -windowSize.width, 0],
                            outputRange: [3, 1.1],
                             extrapolate: 'clamp'
                        })
                    },{translateY:this.state.scrollY.interpolate({
                                                    inputRange: [ -windowSize.width,0],
                                                    outputRange: [-40, 0],
                                                    extrapolate: 'clamp',
                                                })}]
                                }]}
                        resizeMode="cover"
                        onLoad={()=>{
                            Animated.timing(this.state.headerLoadedOpacity,{toValue:1,duration:100}).start()
                        }}
                        source={{uri:momentData.mediaUrl}}
                    />


                    {profilePic}
                    {this._renderSuitcaseButton()}
                    <WikipediaInfoBox data={momentData.wikipediaVenue} countryCode={momentData.country} location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></WikipediaInfoBox>
                    <FoursquareInfoBox data={momentData.foursquareVenue} location={momentData.venue} coordinates={{lat:momentData.lat,lng:momentData.lng}}></FoursquareInfoBox>

                    <TouchableOpacity style={{height:260,left:0,flex:1}}  onPress={()=>{this.showTripMap(momentData)}}>
                        <MarkerMap interactive={false} moments={[momentData]}> </MarkerMap>
                    </TouchableOpacity>


                    {relatedMomentContainer}

                </ScrollView>
                    <Header settings={{navColor:'white',routeName:this.state.routeName,topShadow:true,hideNav:false}} ref="navStatic" goBack={this.props.navigator.pop}  navActionRight={this.navActionRight.bind(this)}></Header>
                <PopOver ref="popover" shareURL={config.auth[config.environment].shareBaseURL+"trips/"+momentData.trip+"/moments/"+momentData.id} onEditMoment={()=>{}} onDeleteMoment={this.onDeleteMoment.bind(this)} showShare={true} reportPhoto={true} momentID={momentData.id} showEditMoment={false} showDeleteMoment={true}></PopOver>
            </View>

        )
    }
}

TripDetail.defaultProps={
    isSuitcased:undefined
}

export default TripDetail;