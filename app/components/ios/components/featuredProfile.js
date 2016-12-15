import React, { Component } from 'react';
import BlurImageLoader from './blurImageLoader';

import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity
} from 'react-native';


class FeaturedProfile extends Component{
    componentDidMount(){

    }

    render(){
        return(
            <TouchableOpacity  onPress={this.props.onPress}>
                <BlurImageLoader thumbUrl={this.props.profileImageUrl.replace("s150x150","s50x50")} largeUrl={this.props.profileImageUrl} style={this.props.style}  />
            </TouchableOpacity>
        )
    }
}

FeaturedProfile.defaultProps={
    profileImageUrl:"",
    onPress:function(){}
}

export default FeaturedProfile