import React from 'react'
import { TouchableOpacity, Text, View, Animated, Image,TouchableWithoutFeedback } from 'react-native'
import notificationStyles from './styles/interactiveNotificationStyle'
import { Fonts, Colors } from '../../../Themes/'

export default class InteractiveNotification extends React.Component {

    static propTypes = {
        placeholder: React.PropTypes.string,
        styles: React.PropTypes.object,
        onPress:React.PropTypes.func
    }

    static defaultProps={
        notificationMessage:"notification message",
        onPress:function(){}
    }

    constructor(props){
        super(props);
        this.state={
            offsetTop:new Animated.Value(-90)
        }
    }

    hide(){
        Animated.spring(this.state.offsetTop, {toValue: -90,friction:8}).start();
    }

    show(){
        Animated.spring(this.state.offsetTop, {toValue: 0,friction:8}).start();
    }


    render () {
        return (
            <Animated.View style={[notificationStyles.errorContainer,{backgroundColor:'red',marginTop:this.state.offsetTop}]}>
                <TouchableWithoutFeedback onPress={this.hide.bind(this)}>
                    <View style={[notificationStyles.errorContainer,{backgroundColor:this.props.success?Colors.highlight:Colors.error}]}>
                        <Image resizeMode="contain" style={notificationStyles.errorX} source={require('./../../../Images/icon-close.png')}></Image>
                        <Text style={notificationStyles.errorMessage}>{this.props.notificationMessage.toUpperCase()}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </Animated.View>
        )
    }
}
