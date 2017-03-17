'use strict';

import {
    Image,
    View,
    TouchableOpacity,
    StyleSheet,
    TouchableHighlight,
    Linking
} from 'react-native';

import BlurImageLoader from '../components/blurImageLoader'
import store from 'react-native-simple-store';
import config from '../../../data/config';
import React, {Component} from 'react';
const {sherpa}=config.auth[config.environment];

class UserImage extends Component {
    constructor(props){
        super(props);
        this.state={
            imageURL:undefined
        };

        this.mounted=false;
    }

    componentDidMount(){
        this.mounted=true;
        this.rescrapeImage();
    }

    componentWillUnmount(){
        this.mounted=false;
    }

    componentDidUpdate(prevProps,prevState){
        if(this.props.imageURL!=prevProps.imageURL){
            this.rescrapeImage();
        }
    }

    rescrapeImage(){
        store.get('user').then((user) => {
            if (user) {
                const {endpoint,version} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/profile/"+this.props.userID+"/refreshuserimage", {
                    method: 'post',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {

                    if(this.mounted&&response.length>2){
                        this.setState({imageURL:response});
                    }
                }).catch(err=>console.log('device token err',err));
            }
        });
    }

    render() {
        var imageURL=this.state.imageURL?this.state.imageURL:this.props.imageURL;
        return(
            <TouchableOpacity onPress={()=>{this.props.onPress()}} style={this.props.style}>
                <View style={{height:this.props.radius,width:this.props.radius}}>
                    <BlurImageLoader imageStyle={{height:this.props.radius,width:this.props.radius,borderWidth:this.props.border?1.5:0,borderColor:this.props.border?"#FFFFFF":'transparent',borderRadius:this.props.radius/2}} thumbUrl={imageURL.replace("s150x150","s50x50")} largeUrl={imageURL} style={this.props.style}  />
                </View>
            </TouchableOpacity>
        )
    }
}

UserImage.defaultProps={
    radius:50,
    imageURL:"",
    userID:"",
    border:true,
    onPress:function(){return}
}

export default UserImage