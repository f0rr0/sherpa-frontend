'use strict';

import {
    Image,
    View,
    TouchableOpacity,
    StyleSheet,
TouchableHighlight,
Linking
} from 'react-native';

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
            <TouchableOpacity onPress={()=>{this.props.onPress()}}>
                <Image
                    style={{height:this.props.radius,width:this.props.radius,opacity:1,borderRadius:this.props.radius/2}}
                    resizeMode="cover"
                    source={{uri:imageURL}}
                />
            </TouchableOpacity>
        )
    }
}

UserImage.defaultProps={
    radius:50,
    imageURL:"",
    userID:"",
    onPress:function(){return}
}

export default UserImage