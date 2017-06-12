'use strict';

import countries from "./../../../../data/countries";
import moment from "moment";
import {deleteTrip} from "../../../../actions/trip.edit.actions";
import {getFeed, udpateFeedState} from "../../../../actions/feed.actions";
import {storeUser, updateUserData} from "../../../../actions/user.actions";
import config from "../../../../data/config";
import StickyHeader from "../../components/stickyHeader";
import PopOver from "../../components/popOver";
import Dimensions from "Dimensions";
import UserImage from "../../components/userImage";
import ToolTipp from "../../components/toolTipp";
import MomentRow from "../../components/momentRow";
import SimpleButton from "../../components/simpleButton";
import Header from "../../components/header";
import MarkerMap from "../../components/MarkerMap";
import {BlurView} from "react-native-blur";
import SherpaGiftedListview from "../../components/SherpaGiftedListview";
import {Alert, Animated, Image, ListView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import React, {Component} from "react";
import ActivityView from "react-native-activity-view";
var windowSize=Dimensions.get('window');
const CARD_PREVIEW_WIDTH = 10
const CARD_MARGIN = 3;
const CARD_WIDTH = Dimensions.get('window').width - (CARD_MARGIN + CARD_PREVIEW_WIDTH) * 2;

var styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        borderTopLeftRadius:3,
        borderTopRightRadius:3,
        backgroundColor:'transparent',
        overflow:'hidden'
    },
    tripDetailContainer:{
        //backgroundColor:'rgba(0,0,0,.5)',
        position:'absolute',
        top:0,
        left:0,
        bottom:0,
        right:0
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:60,
    },
    tripDataFootnoteCopy:{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"},

    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-15,
        marginBottom:13,
        marginLeft:15,
        marginRight:15,
        width:windowSize.width-30,
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    iconImages:{height:7,marginBottom:3},
    card: {
        width: CARD_WIDTH,
        position:'relative'
    },
    subtitle:{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"},
    row:{flexDirection: 'row'},
    listViewContainer:{flex:1,backgroundColor:'white'},
    container: {
        flex: 1,
    },
    headerContainer:{flex:1,height:windowSize.height+160},
    headerMaskedView:{height:windowSize.height*.95, width:windowSize.width,alignItems:'center',flex:1},
    headerDarkBG:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,backgroundColor:'black' ,opacity:.4},
    headerImage:{position:"absolute",top:0,left:0,flex:1,height:windowSize.height*.95,width:windowSize.width,opacity:1 },
    headerTripTo:{color:"#FFFFFF",fontSize:12,marginBottom:4,letterSpacing:.5,marginTop:15,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800"},
    headerTripName:{color:"#FFFFFF",fontSize:33, fontFamily:"TSTAR", fontWeight:"500",letterSpacing:1,backgroundColor:"transparent",textAlign:"center",width:windowSize.width-30},
    subTitleContainer:{alignItems:'center',justifyContent:'space-between',flexDirection:'row',position:'absolute',top:windowSize.height*.8,left:15,right:15,height:30,marginTop:-15},
    tripDataFootnoteIcon:{height:10,marginTop:5,marginLeft:-3}
});

class FeedTrip extends Component {
    constructor(props){
        super(props);
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.scrollY=new Animated.Value(0);

        this.state= {
            dataSource: this.ds.cloneWithRows([]),
            annotations:[],
            headerPreviewLoadedOpacity:new Animated.Value(0),
            headerLoadedOpacity:new Animated.Value(0),
            moments:[],
            shouldUpdate:true,
            isCurrentUsersTrip:false,
            routeName:"GUIDE",
            itemsPerRow:2,
            allLoaded:false,
            trip:props.trip,
            isReady:false,
            containerWidth:windowSize.width-30,
            region:null,
            momentDetailsOffsetY:new Animated.Value(windowSize.height),
            momentDetailsBackground:new Animated.Value(0),
            shouldHideDetailView:true,
            didHideDetailView:true,
            didShowDetailView:false,
            scroll: new Animated.Value(0),
            scrollY:new Animated.Value(0),
            shareURL:config.auth[config.environment].shareBaseURL+"trips/"+props.trip.id
        };


    }

    _renderFooterView(){
        let editButton= this.state.isCurrentUsersTrip?<TouchableOpacity onPress={()=>{
            this.props.navigator.push({
                intent:"EDIT_TRIP",
                id: "editTripGrid",
                hideNav:true,
                tripData:this.state.trip,
                momentData:[],
                name:"edit guide",
                sceneConfig:"bottom-nodrag",
                title:"Add Guide Photos"
            });
        }} activeOpacity={1} style={{height:70,borderTopWidth:1,borderTopColor:"#E5E5E5",alignItems:"center",justifyContent:"center",width:windowSize.width-30}}>
            <View style={{flexDirection:"row"}}>
                <Image source={require('../../../../Images/edit.png')} />
                <Text style={{marginLeft:10,fontSize:10,letterSpacing:1.11,fontFamily:"TSTAR-bold"}}>EDIT GUIDE</Text>
            </View>
        </TouchableOpacity>:null;

        let footerButtons=
            this.state.allLoaded?<View style={{marginTop:50}}>
                <TouchableOpacity activeOpacity={1} onPress={this.shareTrip.bind(this)} style={{height:70,borderTopWidth:1,borderTopColor:"#E5E5E5",alignItems:"center",justifyContent:"center",width:windowSize.width-30}}>
                    <View style={{flexDirection:"row"}}>
                        <Image source={require('../../../../Images/share.png')} />
                        <Text style={{marginLeft:10,fontSize:10,letterSpacing:1.11,fontFamily:"TSTAR-bold"}}>SHARE GUIDE</Text>
                    </View>
                </TouchableOpacity>
                {editButton}
            </View>:null;
        return footerButtons;
        // if(!this.state.trip.nameGid)return footerButtons;
        // return <View style={{marginBottom:20}}>
        //     {this.state.trip.locus?<SimpleButton style={{width:windowSize.width-30}} onPress={()=>{
        //     this.showTripLocation(this.state.trip.nameGid)}} text={"Explore "+(this.state.trip.locus[this.state.trip.nameGid.split(":")[1]]||this.state.trip.location)}></SimpleButton>:null}
        //     {footerButtons}
        // </View>
    }

    navActionRight(){
        if(this.refs.listview.refs.editToolTip)this.refs.listview.refs.editToolTip.hide();
        if(this.refs.popover)this.refs.popover._setAnimation("toggle");
    }

    navActionLeft(){
        this.props.navigator.pop();
    }

    componentDidUpdate(prevProps,prevState){

        var showTabBar=true;
        if(this.state.shouldHideDetailView!==prevState.shouldHideDetailView){
            if(this.state.shouldHideDetailView){
                showTabBar=false;
                Animated.timing(this.state.momentDetailsOffsetY, {
                    toValue: windowSize.height,
                    duration:200
                }).start(()=>{
                });
                    this.setState({didHideDetailView:true})
                this.setState({didShowDetailView:false})
            }else{
                showTabBar=true;
                Animated.spring(this.state.momentDetailsOffsetY, {
                    toValue: 60
                }).start(()=>{
                    this.setState({didShowDetailView:true})
                });

                this.setState({didHideDetailView:false});
            }
        }
    }

    componentDidMount(){
        //console.log('did mount')
        //this.onfetch();
    }

    onfetch(page=1,callback){
        //console.log('fetch')
        getFeed(this.props.trip.id,page,'trip').then((result)=>{
            let trip=result;
            let moments=trip.data.moments;
            const organizedMoments=this.organizeMomentRows(moments,2,true);

            if(page==1){
                this.setState({isCurrentUsersTrip:result.data.owner.id===this.props.user.profileID,isReady:true,trip:result.data});
                callback(organizedMoments,{allLoaded:moments.length==0});
                if(moments.length==0)this.setState({allLoaded:true})

            }else{
                callback(organizedMoments,{allLoaded:moments.length==0});
                if(moments.length==0)this.setState({allLoaded:true})
            }


        }).catch((error)=>{
            this.props.navigator.pop();
        })
    }


    organizeMomentRows(moments,itemsPerRow,isRandom=true){
        let globalIndex=0;
        let organizedMoments=[];
        for(var i=0;i<moments.length;i++){
            let endIndex=(Math.random()>.5)||globalIndex==0||!isRandom?1+i:itemsPerRow+i;
            var currentMoment=moments.slice(i, endIndex);
            organizedMoments.push(currentMoment);
            i = endIndex-1;
            globalIndex++;
        }

        return organizedMoments;
    }


    _renderEmpty(){
        return (
            <View style={{justifyContent:'center',height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    render(){
        var header=<Header type="fixed" ref="navFixed" settings={{routeName:(this.state.trip.name?this.state.trip.name.toUpperCase():""),opaque:true,fixedNav:true}} goBack={this.navActionLeft.bind(this)} navActionRight={this.navActionRight.bind(this)}></Header>;
        const completeHeader=
            <View style={styles.listViewContainer}>

                <SherpaGiftedListview
                    //dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    contentContainerStyle={styles.listView}
                    renderHeader={this._renderHeader.bind(this)}
                    ref="listview"
                    rowView={this._renderRow.bind(this)}
                    onFetch={this.onfetch.bind(this)}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
                    paginationFetchingView={this._renderEmpty.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    renderFooter={this._renderFooterView.bind(this)}
                    scrollEventThrottle={8}
                    onScroll={(event)=>{
                        Animated.event(
                          [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
                        )(event);
                         var currentOffset = event.nativeEvent.contentOffset.y;
                         var direction=currentOffset-this.offset>0?'down':'up';
                         var isDown=((direction=='down'&&this.direction=='down')  || (direction=='up' && this.direction=='down'));
                         this.offset = currentOffset;
                         this.direction=direction;

                         if(isDown||currentOffset<300){
                            this.refs.stickyHeader._setAnimation(false);
                         }else{
                            this.refs.stickyHeader._setAnimation(true);
                         }
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={header}></StickyHeader>
                <PopOver ref="popover" showEditTrip={this.state.isCurrentUsersTrip} enableNavigator={this.props.enableNavigator} onEditTrip={()=>{
                      //console.log(this.state.trip)
                      this.props.navigator.push({
                            intent:"EDIT_TRIP",
                            id: "editTripGrid",
                            hideNav:true,
                            tripData:this.state.trip,
                            momentData:[],
                            name:"edit guide",
                            sceneConfig:"bottom-nodrag",
                            title:"Add Guide Photos"
                      });
                }} showDeleteTrip={this.state.isCurrentUsersTrip} onDeleteTrip={this.deleteTripAlert.bind(this)} shareURL={this.state.shareURL}></PopOver>

            </View>
        return completeHeader;
    }

    refreshCurrentScene(){
    }

    deleteTripAlert(){
            Alert.alert(
                'Delete Guide',
                'Are you sure you want to delete this guide?',
                [
                    {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                    {text: 'OK', onPress: () => {
                        deleteTrip(this.state.trip.id).then(()=>{
                            this.props.refreshCurrentScene();
                            setTimeout(this.props.refreshCurrentScene,500)
                        })
                        this.props.navigator.pop();
                    }}
                ]
            )
    }

    showUserProfile(trip){
        this.props.dispatch(udpateFeedState("reset"));

        if(trip.owner.id==this.props.user.serviceID){
            // this.props.updateTabTo("own-profile")
        }else{
            this.props.navigator.push({
                id: "profile",
                data:trip
            });
        }
    }

    showTripLocation(data){
        let locus=data.split(":");
        var locationData={
            layer:locus[1],
            source:locus[0],
            sourceId:locus[2]
        };


        if(this.state.trip){
            this.state.trip.layer=locus[1];
            this.state.trip.source=locus[0];
            this.state.trip.sourceId=locus[2];
        }



        this.props.navigator.push({
            id: "location",
            data:{name:this.state.trip.name,...locationData},
            version:"v2"
        });
    }

    shareTrip(){
        ActivityView.show({
            url: this.state.shareURL
        });
    }

    showTripMap(trip){
        //console.log('trip',trip)
        this.props.navigator.push({
            id: "tripDetailMap",
            trip,
            title:trip.name,
            mapType:"trip",
            tripID:trip.id,
            sceneConfig:"bottom",
            hideNav:true
        });
    }


    _renderHeader(){
        if(!this.state.isReady)return this._renderEmpty()

        var tripData=this.state.trip;
        var type=this.state.trip.type=='global'?'state':this.state.trip.type;
        var tripLocation=this.state.trip[type];

        var country = countries.filter(function(country) {
            return country["alpha-2"].toLowerCase() === tripLocation.toLowerCase();
        })[0];


        if(country)tripLocation=country.name;
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();
        let windowHeight=windowSize.height;
        let fullBleed=tripData.isHometown || tripData.contentType=='guide'
        let bottomLeft=null;
        let momentCount;

        let tripTitle;

        let toolTip=this.props.user.usedEditTrip||!this.state.isCurrentUsersTrip?null:<ToolTipp hasTriangle="top" ref="editToolTip" message="Tap to edit and share" style={{backgroundColor:'rgba(0,0,0,.85)',paddingVertical:15,paddingHorizontal:15}} textStyle={{fontSize:12,letterSpacing:.3,lineHeight:12}} onHide={()=>{
                                                     this.props.dispatch(updateUserData({usedEditTrip:true}))
                                                     this.props.dispatch(storeUser())
                                                }}></ToolTipp>
        switch(tripData.contentType){
            case "trip":
                bottomLeft=<UserImage style={{marginTop:0}} underlined={true} radius={30} userID={this.state.trip.owner.id} imageURL={this.state.trip.owner.serviceProfilePicture}  onPress={() => this.showUserProfile(this.state.trip)}></UserImage>

                let userName;
                if(this.state.isCurrentUsersTrip){
                    userName="YOUR"
                }else{
                    userName=this.state.trip.owner.serviceUsername.toUpperCase()+"'S"
                }

                let didWhat

                if(fullBleed&&this.state.isCurrentUsersTrip||this.state.isCurrentUsersTrip){
                    didWhat="TRIP TO"
                }else if(fullBleed){
                    didWhat="LIVES IN"
                    //didWhat=""
                    //userName=""
                }else{
                    didWhat="WENT TO"
                }

                tripTitle=userName//+didWhat;
                momentCount=this.state.trip.momentCount||this.state.trip.moments.length
            break;
            case "guide":
                tripTitle=this.state.isCurrentUsersTrip?"":""
                momentCount=this.state.trip.venueCount;
            break;
        }



        let firstMoment=this.state.trip.coverMoment?this.state.trip.coverMoment:this.state.trip.moments[0];
        let highresUrl=firstMoment.highresUrl||firstMoment.mediaUrl;
        if(highresUrl.indexOf("https")==-1)highresUrl=highresUrl.replace("http","https");
        return (
            <View style={styles.headerContainer}>

                <View style={[styles.headerMaskedView,{height:windowSize.height}]} >

                    <View style={{position:'absolute',left:0,top:0}}>
                        <Animated.Image
                            style={[styles.headerImage,{opacity:1}]}
                            resizeMode="cover"
                            onLoad={()=>{
                                    Animated.timing(this.state.headerPreviewLoadedOpacity,{toValue:1,duration:100}).start()
                                }}
                            source={{uri:firstMoment.serviceJson?firstMoment.serviceJson.images.thumbnail.url:firstMoment.mediaUrl}}
                        >
                            <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>
                        </Animated.Image>
                    </View>

                        <Animated.View style={{position:'absolute',left:0,
                            opacity:this.state.headerLoadedOpacity,
                            }}>


                            <Animated.Image
                                style={[styles.headerImage,{
                                transform: [{
                        scale: this.state.scrollY.interpolate({
                            inputRange: [ -windowHeight, 0],
                            outputRange: [3, 1.1],
                             extrapolate: 'clamp'
                        })
                    }
                                                ]
                                }]}
                                resizeMode="cover"
                                onLoad={()=>{
                                    Animated.timing(this.state.headerLoadedOpacity,{toValue:1,duration:200}).start()
                                }}
                                source={{uri:highresUrl}}
                            >

                            <View
                                    style={styles.headerDarkBG}
                                />

                            </Animated.Image>
                        </Animated.View>



                   <View style={{ justifyContent:'center',alignItems:'center',height:windowSize.height*.86}}>

                       {<Text style={styles.headerTripTo}>{tripTitle}</Text>}
                            <Text multiline={true} style={styles.headerTripName}>{tripData.name.toUpperCase()}</Text>

                       {/*<TripSubtitle goLocation={(data)=>{this.showTripLocation.bind(this)(data.locus)}} limitLength={false} maxLength={2} tripData={this.state.trip}></TripSubtitle>*/}
                            </View>

                        <View style={styles.subTitleContainer}>
                            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}} >
                                {bottomLeft}
                                {/*<Text style={styles.tripDataFootnoteCopy}>{tripData.owner.serviceUsername.toUpperCase()}</Text>*/}

                                {/*<TouchableOpacity  onPress={() => this.showUserProfile(this.props.trip)}>
                                    <Text style={{color:'white',backgroundColor:'transparent',fontFamily:"TSTAR",fontSize:12,marginLeft:10,marginTop:-8,fontWeight:"800"}}>{this.props.trip.owner.serviceUsername}</Text>
                                </TouchableOpacity>*/}
                            </View>
                            <View style={{flexDirection:"row",alignItems:"center",justifyContent:"flex-end",width:30,flex:1,marginTop:2}}>
                                    <Image style={{marginTop:-3,marginRight:4}} source={require('../../../../Images/icons/images.png')}></Image>
                                    <Text style={styles.tripDataFootnoteCopy}>{tripData.momentCount}</Text>
                                <Image style={{marginTop:-3,marginLeft:8,marginRight:4}} source={require('../../../../Images/icons/clock.png')}></Image>
                                <Text style={styles.tripDataFootnoteCopy}>{timeAgo.toUpperCase()}</Text>
                                {/*<Text style={styles.tripDataFootnoteCopy}>{tripData.owner.serviceUsername.toUpperCase()}</Text>*/}
                            </View>
                        </View>
                </View>
                <View style={{height:260,width:windowSize.width-30,left:15,backgroundColor:'transparent',flex:1,position:'absolute',top:windowSize.height*.85}}>
                    <View style={[{backgroundColor:'white'},styles.map]}></View>

                    <TouchableOpacity style={styles.map} onPress={()=>{this.showTripMap(this.state.trip)}}>
                        <MarkerMap interactive={false} moments={this.state.trip.moments}></MarkerMap>
                    </TouchableOpacity>
                </View>

                <Animated.View style={{flex:1,position:'absolute',top:0,
                  transform: [{translateY:this.state.scrollY.interpolate({
                                                    inputRange: [ -windowHeight,0],
                                                    outputRange: [-windowHeight, 0],
                                                    extrapolate: 'clamp',
                                                })}]
                }}>
                    <Header settings={{navColor:'white',routeName:this.state.routeName,topShadow:true}} ref="navStatic" goBack={this.navActionLeft.bind(this)}  navActionRight={this.navActionRight.bind(this)}></Header>
                </Animated.View>

                <TouchableOpacity activeOpacity={1} onPress={()=>{
                        this.refs.listview.refs.listview.refs.editToolTip.hide()}} style={{position:'absolute',right:10,top:50}}>
                    {toolTip}
                </TouchableOpacity>

            </View>
        )
    }

    _renderRow(rowData,sectionID,rowID) {
        var index=0;
        var items = rowData.map((item) => {moment
            if (item === null || item.type!=='image') {
                return null;
            }

            index++;
            return  <MomentRow isNotCurrentUsersTrip={!this.state.isCurrentUsersTrip} user={this.props.user} dispatch={this.props.dispatch} rowIndex={rowID} key={"momentRow"+rowID+"_"+index}  itemRowIndex={index} itemsPerRow={rowData.length} containerWidth={this.state.containerWidth} tripData={item} trip={this.state.trip} navigator={this.props.navigator}></MomentRow>
        });

        return (
            <View style={[styles.row,{width:this.state.containerWidth}]}>
                {items}
            </View>
        );

    }
}


export default FeedTrip;