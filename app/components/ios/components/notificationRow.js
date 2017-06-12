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
        if(user==this.props.user.serviceID){
           this.props.updateTabTo("own-profile")
        }else{
            this.props.navigator.push({
                id: "profile",
                data: {owner: {id:user,user}}
            });
        }

    }

    showTrip(tripID){
        this.props.navigator.push({
            id: "trip",
            data:{id:tripID}
        });
    }

    setView(data){
        let id;
        if(data.trip){
            id="trip"
        }else if(data.moment){
            id="tripDetail";
        }else{
            id=data.id
        }
        switch(id){
            case "profile":
                this.showUserProfile(data.target);
            break;
            case "trip":
                this.showTrip(data.target);
            break;
            default:
                this.props.navigator.push({
                    id: data.id,
                    data:data.target
                });
            break;
        }
    }

    _renderNotification(){
        //console.log(this.props.data.primaryImage);

        if(!this.props.data.payload)return null;
        let notification;

        var timeAgo=this.props.data.createdAt?moment(new Date(this.props.data.createdAt)).fromNow().toUpperCase():null;
        let timeAgoNode=timeAgo?<Text  style={{color:'white',fontSize:9,fontFamily:"Akkurat",opacity:.8,letterSpacing:1}}>{timeAgo || ""}</Text>:null;

        if(this.props.data.payload.v1.layout=='image') {
            notification =
                <TouchableOpacity onPress={()=>{this.setView(this.props.data.payload.v1.primaryView)}} activeOpacity={1}
                                  style={{backgroundColor:'transparent',flex:1,alignItems:'center',marginTop:-2,justifyContent:'center'}}>
                    <Image source={{uri:this.props.data.primaryImage}} style={{...StyleSheet.absoluteFillObject}}>
                    </Image>
                    <View style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,.5)'}}></View>
                    <View style={{justifyContent:'center',alignItems:'center'}}>
                        <Text
                            style={{color:'white',fontSize:12,fontFamily:"Akkurat"}}>{this.props.data.primaryHeadline || ""} {this.props.data.secondaryHeadline || ""}</Text>
                        {timeAgoNode}
                    </View>
                </TouchableOpacity>
        }else{
            //console.log(this.props.data.primaryHeadline,"::",this.props.data.primaryImage)
                let description=this.props.data.description?this.props.data.description.toUpperCase():null;
                notification=
                    <View style={{paddingHorizontal:20,flex:1,justifyContent:'flex-start',alignItems:'center',flexDirection:'row'}}>
                        <UserImage
                            onPress={()=>{this.setView(this.props.data.payload.v1.primaryView)}}
                            radius={25}
                            border={false}
                            userID={this.props.data.payload.profile} imageURL={this.props.data.primaryImage}/>
                        <View style={{width:220}}>
                            <View style={{flexDirection:'row'}}>
                                <TouchableOpacity onPress={()=>{this.setView(this.props.data.payload.v1.primaryView)}}><Text style={{fontFamily:"Akkurat",color:'black',fontSize:12}}>{this.props.data.primaryHeadline||""}</Text></TouchableOpacity><Text style={{fontFamily:"Akkurat-Light",fontWeight:"200",color:'black',fontSize:12}}> {this.props.data.secondaryHeadline||""}</Text>
                            </View>
                            <Text style={{fontFamily:"Akkurat",color:'black',fontSize:9,opacity:.7}}>{description||timeAgo||""}</Text>
                        </View>

                        {this.props.data.payload.v1.secondaryView?<TouchableOpacity onPress={()=>{this.setView(this.props.data.payload.v1.secondaryView)}}>
                            <Image source={{uri:this.props.data.secondaryImage||null}}  style={{width:30,height:30}}></Image>
                        </TouchableOpacity>:null}
                    </View>
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

