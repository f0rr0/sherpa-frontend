'use strict';

import config from '../../../../data/config';
import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {getFeed} from '../../../../actions/feed.actions';
import {updateUserData,storeUser} from '../../../../actions/user.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import NotificationRow from '../../components/notificationRow';
import TripTitle from "../../components/tripTitle"
import PopOver from '../../components/popOver';
import Header from '../../components/header';
import UserImage from '../../components/userImage';
import TripRow from '../../components/tripRow'
import Hyperlink from 'react-native-hyperlink';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import MarkerMap from '../../components/MarkerMap'


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
    listView:{
        flex:1,
        paddingBottom:60,
    },
    emptyCopy:{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14},
    loaderContainer:{justifyContent:'center',height:windowSize.height-200,width:windowSize.width,alignItems:'center'},

});

class FeedNotifications extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;

        this.state= {
        };
    }

    componentDidMount(){
        this.markAllAsViewed();
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        this.itemsLoadedCallback=callback;
        this.props.dispatch(updateUserData({notificationCount:0}))
        this.props.dispatch(storeUser())

        getFeed(this.props.user.sherpaID,page,'notifications').then((response)=>{
            //console.log(response.data.notifications)
            callback(response.data.notifications,{allLoaded:response.data.notifications.length==0});
            //callback([]);
        }).catch((err)=>{
            //console.log('err',err)
            //callback([],{allLoaded:true})
        });
    }

    markAllAsViewed(){
        //console.log('mark as viewed');
        getFeed(this.props.user.sherpaID,1,'reset-notifications').then((response)=>{
            //console.log('notifications resetted',response);
        }).catch((err)=>{
            //console.log('notificaitons reset err',err);
        })
    }

    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:windowSize.height-100,width:windowSize.width,position:'absolute',top:0,left:0,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    _renderEmptyWaiting(){
       return(
           <View style={styles.loaderContainer}>
               <Text style={styles.emptyCopy}>Add the destinations you want to remember by tapping the small suitcase button underneath each photo.</Text>
           </View>
       )
    }
    render(){
        return(
            <View style={{flex:1,backgroundColor:'white',paddingBottom:65}}>
                <SherpaGiftedListview
                    removeClippedSubviews={false}
                    renderHeaderOnInit={true}
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}x
                    emptyView={this._renderEmptyWaiting.bind(this)}
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