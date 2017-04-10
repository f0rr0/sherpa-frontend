import React from 'react'
import { TouchableHighlight, Text,StyleSheet,View,TouchableWithoutFeedback } from 'react-native'
import styles from './styles/simpleButtonStyle'

import {
    Image,
    Animated
} from 'react-native';

export default class SimpleButton extends React.Component {

    static propTypes = {
        text: React.PropTypes.string,
        onPress: React.PropTypes.func,
        icon: React.PropTypes.string,
    }

    static defaultProps={
        onPress:function(){},
        text:"please add button copy"
    }

    _renderIcon(){
        if(this.props.icon){
            let image;
            let customStyle=StyleSheet.create({});
            switch(this.props.icon){
                case "instagram":
                    image=require('./../../../Images/icon-insta.png');
                break;
                case "is-suitcased-button":
                    image=require('./../../../Images/icon-suitcased-button.png');
                    customStyle.height=25;
                break;
                case "suitcase-button":
                    image=require('./../../../Images/icon-suitcase-button.png');
                    customStyle.height=25;
                break;
                case "is-following-button":
                    image=require('./../../../Images/icons/following-on-button.png');
                break;
                case "twitter":
                    image=require('./../../../Images/icon-twitter.png');
                    customStyle.height=12;
                break;
            }
            return <Image style={[styles.buttonIcon,customStyle,{opacity:this.props.disabled?.5:1}]} resizeMode="contain" source={image} />
        }

        return null;
    }

    render () {
        return (
                <TouchableWithoutFeedback disabled={this.props.disabled} style={[this.props.stateStyle]} onPress={this.props.onPress}>
                    <Animated.View style={[styles.button, this.props.style,{}]} >
                        {this._renderIcon()}
                        <Text style={[styles.buttonText,this.props.textStyle,{opacity:this.props.disabled?.6:1}]}>{this.props.text && this.props.text.toUpperCase()}</Text>
                    </Animated.View>
                </TouchableWithoutFeedback>
        )
    }
}
