'use strict';

import config from '../../../../data/config';
import countries from './../../../../data/countries'
import moment from 'moment';
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {getFeed} from '../../../../actions/feed.actions';
import { connect } from 'react-redux';
import StickyHeader from '../../components/stickyHeader';
import NotificationRow from '../../components/notificationRow';
import TripTitle from "../../components/tripTitle"
import PopOver from '../../components/popOver';
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
        flex:1
    }
});

class FeedNotifications extends React.Component {
    constructor(){
        super();
        this.itemsLoadedCallback=null;

        this.state= {
        };
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        this.itemsLoadedCallback=callback;
        getFeed(this.props.user.sherpaID,page,'notifications').then((response)=>{
            callback(response.data.notifications,{allLoaded:true});

        });
    }

    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>

        )
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'white'}}>
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
        this._onFetch()
    }

    refreshCurrentScene(){

        this._onFetch()
    }



    _renderHeader(){
        return (
            <View style={{height:70,alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:13,fontFamily:"TSTAR",fontWeight:"600",letterSpacing:2}}>NOTIFICATIONS</Text>
            </View>
        )
    }

    _renderRow(notificationData) {
        return (
            <NotificationRow data={notificationData}></NotificationRow>
        );
    }
}


export default FeedNotifications;