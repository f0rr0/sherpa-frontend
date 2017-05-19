import { connect } from 'react-redux';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import config from '../../../../data/config';
import React, { Component } from 'react';
import FollowingRow from '../../components/followingRow'
import {getFollowers,getFollowing,follow,unfollow,getSubscriptions} from '../../../../actions/user.actions'
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


let styles = StyleSheet.create({
    emptyCopy:{color:"#bcbec4",width:250,textAlign:"center", fontFamily:"Avenir LT Std",lineHeight:18,fontSize:14},
})

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
            data:{owner:user}
        });
    }

    showTripLocation(data){
        //console.log(data);
        //let locus=data.split(":");
        //var locationData={
        //    layer:locus[1],
        //    source:locus[0],
        //    sourceId:locus[2]
        //};
        //
        //
        //this.props.navigator.push({
        //    id: "location",
        //    data:{name:this.state.trip.name,...locationData},
        //    version:"v2"
        //});
    }

    _onFetch(page=1,callback){
        switch(this.props.followerType){
            case 'followers':
                getFollowers(this.props.profile.id).then((response)=>{
                    callback(response.followers);
                })
            break;
            case 'following':
                //getFollowing(this.props.profile.id).then((response)=>{
                    getSubscriptions(this.props.profile.id).then((response)=>{
                       //console.log('subscriptions',response)
                        callback(response.sources);
                    });
                    //console.log(response.following);
                //})
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
        let followCopy;
            switch(this.props.followerType){
                case 'followers':
                    //console.log('followers')
                    followCopy="You don’t have any followers yet. But that’s ok, we still think you're great.";
                    //preposition= this.state.ownProfile?"You have":this.props.profile.serviceUsername+" has";
                break;
                case 'following':
                    default:
                    followCopy="Visit the explore tab to find people and places to follow.";
                    //preposition= this.state.ownProfile?"You are":this.props.profile.serviceUsername+" is";
                break;
            }

        //console.log('follow copy',followCopy,'::',this.props.followerType)
        return(
            <View style={{justifyContent:'center',alignItems:'center',width:windowSize.width,height:windowSize.height-240}}>
                <Text style={styles.emptyCopy}>
                    {followCopy}
                    {/*this.props.followerType=='followers'?preposition+' no followers yet':preposition+' not following anyone yet'*/}
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
        if(!rowData.type)rowData.type="profile";
        switch(rowData.type){
            case "profile":
                return <FollowingRow isMe={this.props.user.serviceID==rowData.id} onPress={this.showUserProfile.bind(this)} data={rowData}></FollowingRow>
            break;
            case "location":
                return <FollowingRow onPress={this.showTripLocation.bind(this)} data={rowData}></FollowingRow>
            break;
        }
    }
}


export default FollowerList;