import React, { Component } from 'react';

import {
    StyleSheet,
    View,
    Text,
    Animated,
    Image
} from 'react-native';
import { BlurView, VibrancyView } from 'react-native-blur';


class BlurImageLoader extends Component{
    constructor(){
        super();
        this.state={
            previewImageOpacity:new Animated.Value(0),
            largeImageOpacity:new Animated.Value(0)
        }
    }

    componentDidMount(){
    }

    render(){
        //console.log(this.props.thumbUrl,"thumb url")
        //console.log(this.props.largeUrl,"large url")
        return(
            <View style={[this.props.style,{backgroundColor:"transparent"}]}>
                <Animated.View style={[styles.animatedContainer,{opacity:this.state.previewImageOpacity,...StyleSheet.absoluteFillObject}]}>
                    <Image source={{uri:this.props.thumbUrl}} onLoad={()=>{Animated.timing(this.state.previewImageOpacity,{toValue:1,duration:200}).start()}} style={[{...StyleSheet.absoluteFillObject,backgroundColor:'transparent'},this.props.imageStyle]}></Image>
                    <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>
                </Animated.View>

                <Animated.View style={[styles.animatedContainer,{opacity:this.state.largeImageOpacity,...StyleSheet.absoluteFillObject}]}>
                    <Image source={{uri:this.props.largeUrl}} onLoad={()=>{Animated.timing(this.state.largeImageOpacity,{toValue:1,duration:200}).start()}} style={[{...StyleSheet.absoluteFillObject,backgroundColor:'transparent'},this.props.imageStyle]}></Image>
                </Animated.View>
            </View>
        )
    }
}

BlurImageLoader.defaultProps={
    thumbUrl:"",
    largeUrl:"",
    darken:false
}

const styles=StyleSheet.create({
    animatedContainer:{
        position:'absolute',
        top:0,
        left:0
    }
});

export default BlurImageLoader;