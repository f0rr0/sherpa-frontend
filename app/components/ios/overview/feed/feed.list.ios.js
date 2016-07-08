import React from 'react-native';
import { connect } from 'react-redux/native';
import FeedTrip from './feed.trip.ios'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';
import TripTitle from "../../components/tripTitle";
import UserImage from "../../components/userImage";

var {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight
    }=React;

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
    },
    listItem:{
        flex:1,
        backgroundColor:"#fcfcfc",
        justifyContent:"center",
        alignItems:'center'
    },
    listItemContainer:{
        flex:1,
        width:350,
        height:350,
        marginBottom:14
    }
});

class FeedList extends React.Component{

    constructor(){
        super();
        this.itemsLoadedCallback=null;
    }

    componentDidMount(){
    }

    componentDidUpdate(prevProps,prevState){
        if(
            prevProps.feed.feedState!='ready'&& this.props.feed.feedState==='ready'&&this.props.feed.userTrips[this.props.feed.userTripsPage]
        ){
            this.itemsLoadedCallback(this.props.feed.userTrips[this.props.feed.userTripsPage]);
        }else if(this.props.feed.feedState==='reset'){
        }
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
        this.itemsLoadedCallback=callback;
        this.props.dispatch(loadFeed(this.props.user.sherpaID,this.props.user.sherpaToken,page));
    }

    _renderHeader(){
        return (
            <Image
                resizeMode="contain"
                style={styles.logo}
                source={require('image!logo-sherpa')}
            />
        )
    }

    render(){
        return(
            <GiftedListView
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                firstLoader={true} // display a loader for the first fetching
                pagination={true} // enable infinite scrolling using touch to load more
                refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false} // enable sections
                headerView={this._renderHeader.bind(this)}
                refreshableTintColor={"#85d68a"}
                ref="listview"
                customStyles={{
                    contentContainerStyle:styles.listView,
                    actionsLabel:{fontSize:12}
                }}
            />
        )
    }


    _renderRow(tripData) {
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();
        return (
            <TouchableHighlight style={styles.listItemContainer} pressRetentionOffset={{top:1,left:1,bottom:1,right:1}} onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    >
                        <View style={{flex:1, backgroundColor:"rgba(0,0,0,.2)"}}></View>
                        </Image>

                    <View style={{position:'absolute',top:20,left:0,right:0,flex:1,alignItems:'center',backgroundColor:'transparent'}}>
                        <UserImage radius={50} userID={tripData.owner.id} imageURL={tripData.owner.serviceProfilePicture}></UserImage>
                    </View>

                    <TripTitle tripData={tripData} tripOwner={tripData.owner.serviceUsername+"'s"}></TripTitle>

                    <View style={{position:'absolute',bottom:20,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',left:0,right:0}}>
                        <Image source={require('image!icon-images')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length}</Text>
                        <Image source={require('image!icon-watch')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{timeAgo.toUpperCase()}</Text>
                    </View>

                </View>
            </TouchableHighlight>
        );
    }
}


export default FeedList;