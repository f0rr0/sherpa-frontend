import React from 'react'
import { TouchableOpacity, Text } from 'react-native'
import styles from './styles/simpleButtonStyle'

import {
    Image
} from 'react-native';

export default class SimpleButton extends React.Component {

    static propTypes = {
        text: React.PropTypes.string,
        onPress: React.PropTypes.func,
        styles: React.PropTypes.object,
        icon: React.PropTypes.string
    }

    static defaultProps={
        onPress:function(){},
        text:"please add button copy"
    }

    _renderIcon(){
        if(this.props.icon){
            let image;
            switch(this.props.icon){
                case "instagram":
                    image=require('./../../../Images/icon-insta.png');
                break;
            }
            return <Image style={[styles.buttonIcon]} resizeMode="contain" source={image} />
        }

        return null;
    }

    render () {
        return (
            <TouchableOpacity style={[styles.button, this.props.styles]} onPress={this.props.onPress}>
                {this._renderIcon()}
                <Text style={styles.buttonText}>{this.props.text && this.props.text.toUpperCase()}</Text>
            </TouchableOpacity>
        )
    }
}
