import React from 'react'
import { TouchableHighlight, Text,StyleSheet,View,TouchableWithoutFeedback } from 'react-native'
import styles from './styles/followButtonStyle'

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
            image=this.props.negative?require('./../../../Images/icons/icon-subscribe.png'):require('./../../../Images/icons/icon-subscribe-white.png');

            return <Image style={[styles.buttonIcon,customStyle,{opacity:this.props.disabled?.5:1}]} resizeMode="contain" source={image} />
        }else{
            return null;
        }
    }

    render () {
        return (
                <TouchableWithoutFeedback disabled={this.props.disabled} style={[this.props.stateStyle]} onPressIn={this.props.onPress}>
                    <Animated.View style={[styles.button, this.props.style,{width:150}]} >
                        {this._renderIcon()}
                        <Text style={[styles.buttonText,this.props.textStyle,{opacity:this.props.disabled?.6:1}]}>{this.props.text && this.props.text.toUpperCase()}</Text>
                    </Animated.View>
                </TouchableWithoutFeedback>
        )
    }
}
