'use strict';

import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {getFeed} from '../../../../actions/feed.actions';
import {updateUserData,storeUser} from '../../../../actions/user.actions';
import NotificationRow from '../../components/notificationRow';
import FollowButton from '../../components/followButton';
import Header from '../../components/header';
import NotificationsIOS from 'react-native-notifications';

import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');


import {
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';
import React from 'react';



var styles = StyleSheet.create({
    listView:{
        flex:1,
        paddingBottom:60,
    },
    emptyCopy:{color:"#282B33",width:300,textAlign:"center", fontWeight:"800", fontFamily:"Akkurat",lineHeight:16,letterSpacing:0.2,fontSize:12},
    loaderContainer:{zIndex:1,justifyContent:'center',height:windowSize.height-160,width:windowSize.width,alignItems:'center'},

});

class FeedNotifications extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;

        this.state= {
            empty:false
        };
    }

    componentDidMount(){
        this.markAllAsViewed();
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        this.itemsLoadedCallback=callback;
        this.props.dispatch(updateUserData({notificationCount:0}));
        this.props.dispatch(storeUser());

        getFeed(this.props.user.sherpaID,page,'notifications').then((response)=>{
            if(response.data.notifications.length==0&&page==1){
                this.setState({empty:true})
                callback([],{allLoaded:true});
            }else{
                callback(response.data.notifications);
            }
        }).catch((err)=>{
        });
    }

    markAllAsViewed(){
        // PushNotificationIOS.setApplicationIconBadgeNumber(0);
        NotificationsIOS.setBadgesCount(0);


        getFeed(this.props.user.sherpaID,1,'reset-notifications').then((response)=>{
        }).catch((err)=>{
        })
    }

    _renderEmpty(){
        if(this.state.empty){
            return this._renderEmptyWaiting()
        }
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:windowSize.height-100,width:windowSize.width,position:'absolute',top:0,left:0,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }


    _renderEmptyWaiting(){
       return(
           <View style={styles.loaderContainer}>
               <Image style={{marginBottom:23}} source={require('./../../../../Images/activity-big.png')} />
               <Text style={{fontFamily:"TSTAR-bold",letterSpacing:1.6, fontSize:24,fontWeight:"700",marginBottom:5}}>STAY UPDATED</Text>
               <Text style={styles.emptyCopy}>Subscribe to people and places for personalized travel content.</Text>
               <FollowButton negative={true} textStyle={{color:'black',marginLeft:0,marginRight:0,letterSpacing:1.11}} style={{marginLeft:0,marginRight:0,marginTop:25,borderColor:'rgba(0,0,0,.15)'}} onPress={()=>{this.props.updateTabTo("feed")}} text="Start Exploring"></FollowButton>
           </View>
       )
    }
    render(){
        return(
            <View style={{flex:1,backgroundColor:'white',paddingBottom:65}}>
                <SherpaGiftedListview
                    removeClippedSubviews={false}
                    renderHeaderOnInit={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}x
                    emptyView={this._renderEmpty.bind(this)}
                    paginationAllLoadedView={this._renderEmpty.bind(this)}
                    refreshableTintColor={"#85d68a"}
                    onEndReachedThreshold={1200}
                    ref="listview"
                    scrollEventThrottle={30}
                    scrollEnabled={!this.state.mapLarge}
                    paginationFetchingView={this._renderEmpty.bind(this)}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
                />
            </View>
        )
    }

    reset(){
        this.refs.listview._refresh();
        this.markAllAsViewed();
    }

    refreshCurrentScene(){

        this.refs.listview._refresh();
        this.markAllAsViewed();
    }



    _renderHeader(){
        return (
            <View style={{height:75}}>
                <Header settings={{hideBack:true,routeName:"NOTIFICATIONS",topShadow:false,hideNav:true}} ref="navStatic"></Header>
            </View>
        )
    }

    _renderRow(notificationData) {
        return (
            <NotificationRow user={this.props.user}  updateTabTo={this.props.updateTabTo} navigator={this.props.navigator} data={notificationData}></NotificationRow>
        );
    }
}


export default FeedNotifications;