import {
    View,
    TouchableHighlight,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';
import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import moment from 'moment';
import UserImage from "./userImage";

var styles=StyleSheet.create({
});

class NotificationRow extends Component {
    constructor(props) {
        super(props);
        this.state={
        }

    }


    showUserProfile(user) {
        this.props.navigator.push({
            id: "profile",
            trip: {owner: {id:user,user}}
        });
    }


    showMoment(momentID) {
        this.props.navigator.push({
            id: "tripDetail",
            momentID
        });
    }

    showTrip(tripID){
        this.props.navigator.push({
            id: "trip",
            trip:{id:tripID}
        });
    }

    _renderNotification(){
        let notification;
        var timeAgo=this.props.data.createdAt?moment(new Date(this.props.data.createdAt)).fromNow():null;
        let timeAgoNode=timeAgo?<Text  style={{color:'white',fontSize:9,fontFamily:"Akkurat",opacity:.8,letterSpacing:1}}>{timeAgo.toUpperCase()}</Text>:null;
        switch(this.props.data.type){
            case "trip_featured":
            case "trip_created":
            case "profile_created":
                notification=
                    <TouchableOpacity onPress={()=>{this.props.data.type=='profile_created'?this.showUserProfile(this.props.data.payload.v1.primaryView.profile):this.showTrip(this.props.data.payload.v1.primaryView.trip)}} activeOpacity={1} style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center'}}>
                        <Image source={{uri:this.props.data.primaryImage}} style={{...StyleSheet.absoluteFillObject}}>
                        </Image>
                        <View style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,.5)'}}></View>
                        <View style={{justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:'white',fontSize:12,fontFamily:"Akkurat"}}>{this.props.data.primaryHeadline} {this.props.data.secondaryHeadline}</Text>
                            {timeAgoNode}
                        </View>
                    </TouchableOpacity>
            break;
            case "followed":
            case "suitcased":
            default:
                let description=this.props.data.description?this.props.data.description.toUpperCase():null;
                notification=
                    <View style={{paddingHorizontal:20,flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
                        <UserImage
                            onPress={()=>{this.showUserProfile(this.props.data.payload.v1.primaryView.profile)}}
                            radius={25}
                            border={false}
                            userID={this.props.data.payload.profile} imageURL={this.props.data.primaryImage}/>
                        <View style={{width:200}}>
                            <View style={{flexDirection:'row'}}>
                                <TouchableOpacity onPress={()=>{this.showUserProfile(this.props.data.payload.v1.primaryView.profile)}}><Text style={{fontFamily:"Akkurat",color:'black',fontSize:12}}>{this.props.data.primaryHeadline}</Text></TouchableOpacity><Text style={{fontFamily:"Akkurat",color:'black',fontSize:12}}> {this.props.data.secondaryHeadline}</Text>
                            </View>
                            <Text style={{fontFamily:"Akkurat",color:'black',fontSize:9,opacity:.7}}>{description||timeAgo||""}</Text>
                        </View>
                        <TouchableOpacity onPress={()=>{this.showMoment(this.props.data.payload.v1.secondaryView.moment)}}>
                            <Image source={{uri:this.props.data.secondaryImage||null}}  style={{width:30,height:30}}></Image>
                        </TouchableOpacity>
                    </View>
            break;
        }

        return notification
    }

    render() {

        return(
            <View style={{marginTop:-1,height:20,height:75,justifyContent:'center',marginHorizontal:20,borderTopWidth:1,borderBottomWidth:1,borderColor:"#F0F0F0"}}>
                {this._renderNotification()}
            </View>

        )
    }
}



export default NotificationRow;

