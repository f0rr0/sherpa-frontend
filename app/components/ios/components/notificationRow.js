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

    _renderNotification(){
        let notification;
        //console.log(this.props.data.sentTime)
        var timeAgo=moment(new Date(this.props.data.sentTime)).fromNow();

        switch(this.props.data.type){
            case "trip_featured":
                notification=
                    <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center'}}>
                        <Image source={{uri:this.props.data.primaryImage}} style={{...StyleSheet.absoluteFillObject}}>
                        </Image>
                        <View style={{...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,.5)'}}></View>
                        <View style={{justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:'white',fontSize:12,fontFamily:"Akkurat"}}>{this.props.data.primaryHeadline} {this.props.data.secondaryHeadline}</Text>
                            <Text  style={{color:'white',fontSize:9,fontFamily:"Akkurat",opacity:.8,letterSpacing:1}}>{timeAgo.toUpperCase()}</Text>
                        </View>
                    </View>
            break;
            case "followed":
            case "suitcased":
                notification=
                    <View style={{paddingHorizontal:20,flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
                        <UserImage
                            onPress={()=>{}}
                            radius={25}
                            border={false}
                            userID={this.props.data.payload.profile} imageURL={this.props.data.primaryImage}/>
                        <View style={{width:200}}>
                            <View style={{flexDirection:'row'}}>
                                <Text style={{fontFamily:"Akkurat",color:'black',fontSize:12}}>{this.props.data.primaryHeadline}</Text><Text style={{fontFamily:"Akkurat",color:'black',fontSize:12}}> {this.props.data.secondaryHeadline}</Text>
                            </View>
                            <Text style={{fontFamily:"Akkurat",color:'black',fontSize:9,opacity:.7}}>{this.props.data.description}</Text>
                        </View>
                        <Image source={{uri:this.props.data.secondaryImage||null}}  style={{width:30,height:30}}></Image>
                    </View>
            break;
        }

        return notification
    }

    render() {

        return(
            <TouchableOpacity style={{marginTop:-1,height:20,height:75,justifyContent:'center',marginHorizontal:20,borderTopWidth:1,borderBottomWidth:1,borderColor:"#F0F0F0"}}>
                {this._renderNotification()}
            </TouchableOpacity>

        )
    }
}



export default NotificationRow;

