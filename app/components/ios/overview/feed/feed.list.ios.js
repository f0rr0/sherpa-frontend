import { connect } from 'react-redux';
import FeedTrip from './feed.trip.ios'
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed,getFeed} from '../../../../actions/feed.actions';
import ImageRow from '../../components/imageRow'
import Dimensions from 'Dimensions';
import StickyHeader from '../../components/stickyHeader';
var windowSize=Dimensions.get('window');

import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    AppState,
    Alert,
    Image
} from 'react-native';
import React, { Component } from 'react';

var styles=StyleSheet.create({
    logo:{
        height:30,
        marginTop:23,
        marginBottom:23
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50
    }
});

class FeedList extends React.Component{

    constructor(props){
        super();
        this.itemsLoadedCallback=null;
        this.state={
            currentAppState:'undefined'
        };
    }

    componentDidMount(){
        AppState.addEventListener('change', this._handleAppStateChange.bind(this));
    }

    componentDidUpdate(prevProps,prevState){
        if((prevState.currentAppState=='background'||prevState.currentAppState=='background')&&this.state.currentAppState=='active'){
           this.refs.listview._refresh();
        }
    }

    componentWillUnmount(){
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange(currentAppState) {
        this.setState({ currentAppState });
    }

    reset(){
        this.refs.listview.refs.listview.scrollTo({y:0,animated:true})
    }

    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            trip
        });
    }

    _onFetch(page=1,callback){
        console.log('get feed::feed list',this.props.user.sherpaID,page,'feed',this.props.user.sherpaToken)
        getFeed(this.props.user.sherpaID,page,'feed').then(function(response){
            callback(response.trips);
        })
    }

    _renderHeader(){
        return (
            <View style={{flex:1,justifyContent:'center',height:70,width:windowSize.width,alignItems:'center'}}>
               {this.props.navigation.default}
            </View>
        )
    }

    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    update(){

    }


    render(){
        return(
            <View style={{flex:1}}>
                <GiftedListView
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}
                    refreshableTintColor={"#85d68a"}
                    onEndReachedThreshold={1200}
                    paginationFetchingView={this._renderEmpty.bind(this)}
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
                    ref="listview"
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>

            </View>
        )
    }


    _renderRow(tripData) {
        return (
            <ImageRow tripData={tripData} showTripDetail={this.showTripDetail.bind(this)}></ImageRow>
        );
    }
}


export default FeedList;