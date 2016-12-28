import React from 'react'
import { TouchableOpacity, Text, View, Animated, Image,TouchableWithoutFeedback } from 'react-native'
import errorStyles from './styles/simpleErrorStyle'

export default class SimpleError extends React.Component {

    static propTypes = {
        placeholder: React.PropTypes.string,
        styles: React.PropTypes.object,
        onPress:React.PropTypes.func
    }

    static defaultProps={
        errorMessage:"error message",
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
            <Animated.View style={[errorStyles.errorContainer,{top:this.state.offsetTop}]}>
            <TouchableWithoutFeedback onPress={this.hide.bind(this)} style={[errorStyles.errorContainer]}>
                <View style={errorStyles.errorContainer}>
                    <Image resizeMode="contain" style={errorStyles.errorX} source={require('./../../../Images/icon-close.png')}></Image>
                    <Text style={errorStyles.errorMessage}>{this.props.errorMessage.toUpperCase()}</Text>
                </View>
            </TouchableWithoutFeedback>
            </Animated.View>
        )
    }
}
