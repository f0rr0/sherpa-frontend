import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import config from '../../../../data/config';
import React, { Component } from 'react';
import FollowingRow from '../../components/followingRow'
import {getFollowers,getFollowing,follow,unfollow} from '../../../../actions/user.actions'
import Header from '../../components/header'


import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    AppState,
    Alert,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    PixelRatio,
    ScrollView
} from 'react-native';


var styles=StyleSheet.create({
});

class FollowerList extends React.Component{

    constructor(props){
        super(props);
        this.itemsLoadedCallback=null;
        this.state={
            ownProfile:props.user.profileID==props.profile.id
        };
    }

    componentDidMount(){
    }

    componentDidUpdate(prevProps,prevState){
    }

    componentWillUnmount(){
    }

    showUserProfile(user){
        this.props.navigator.push({
            id: "profile",
            trip:{owner:user}
        });
    }

    _onFetch(page=1,callback){
        switch(this.props.followerType){
            case 'followers':
                getFollowers(this.props.profile.id).then((response)=>{
                    callback(response.followers);
                })
            break;
            case 'following':
                getFollowing(this.props.profile.id).then((response)=>{
                    callback(response.following);
                })
            break;
        }

    }

    _renderHeader(){
        return (
            <View style={{height:75}}>
                <Header settings={{routeName:this.props.followerType=='following'?"FOLLOWING":"FOLLOWERS",topShadow:false,hideNav:true}} ref="navStatic" goBack={this.props.navigator.pop}></Header>
            </View>
        )
    }

    _renderLoading(){
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:windowSize.height-120,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    _renderEmpty(){
        let preposition;
            switch(this.props.followerType){
                case 'followers':
                    preposition= this.state.ownProfile?"You have":this.props.profile.serviceUsername+" has";
                break;
                case 'following':
                    preposition= this.state.ownProfile?"You are":this.props.profile.serviceUsername+" is";
                break;
            }

        return(
            <View style={{justifyContent:'center',alignItems:'center',width:windowSize.width,height:windowSize.height-120}}>
                <Text style={{color:"#a6a7a8",fontSize:12,marginBottom:0, marginTop:5,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", backgroundColor:"transparent"}}>
                    {this.props.followerType=='followers'?preposition+' no followers yet':preposition+' not following anyone yet'}
                </Text>
            </View>
        )
    }

    update(){

    }

    render(){
        return(
            <View style={{backgroundColor:'white',flex:1,paddingBottom:60}}>
                <SherpaGiftedListview
                    removeClippedSubviews={false}
                    renderHeaderOnInit={true}
                    enableEmptySections={true}
                    emptyView={this._renderEmpty.bind(this)}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}x
                    refreshableTintColor={"#85d68a"}
                    onEndReachedThreshold={1200}
                    scrollEnabled={!this.state.mapLarge}
                    paginationFetchingView={this._renderLoading.bind(this)}
                    onEndReached={()=>{
                         //this.refs.listview._onPaginate();
                    }}
                    ref="listview"
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />
            </View>
        )
    }


    _renderRow(rowData){
        return <FollowingRow onPress={this.showUserProfile.bind(this)} data={rowData}></FollowingRow>
    }
}


export default FollowerList;