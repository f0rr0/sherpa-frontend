import React from 'react'
import { TouchableOpacity, Text, View, Animated, Image,TouchableWithoutFeedback } from 'react-native'
import notificationStyles from './styles/simpleErrorStyle'
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
            offsetTop:new Animated.Value(-90),
            opacity:new Animated.Value(1),
            display:true
        }
    }

    hide(){
        Animated.spring(this.state.offsetTop, {toValue: -90,friction:8}).start();
    }

    hideFade(){
        Animated.spring(this.state.opacity, {toValue: 0,friction:8}).start(()=>{
            this.setState({display:false})
        });
    }

    show(){
        this.setState({display:true})
        Animated.timing(this.state.opacity, {toValue: 1,duration:0}).start();
        Animated.spring(this.state.offsetTop, {toValue: 0,friction:8}).start();
        setTimeout(()=>{this.hideFade()},5000);
    }


    render () {
        if(!this.state.display)return null;
        return (
                <TouchableWithoutFeedback onPress={this.hide.bind(this)}>
                    <Animated.View style={[notificationStyles.errorContainer,{marginTop:this.state.offsetTop,backgroundColor:this.props.success?Colors.highlight:Colors.error,opacity:this.state.opacity}]}>
                                <Image resizeMode="contain" style={notificationStyles.errorX} source={require('./../../../Images/icons/close-tooltipp.png')}></Image>
                                <Text style={notificationStyles.errorMessage}>{this.props.notificationMessage.toUpperCase()}</Text>
                    </Animated.View>
                </TouchableWithoutFeedback>
        )
    }
}
