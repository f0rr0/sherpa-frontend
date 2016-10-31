import React from 'react'
import { TouchableOpacity, Text, View, Animated, Image } from 'react-native'
import InteractiveNotification from '../components/interactiveNotification';
const SCREEN_WIDTH = require('Dimensions').get('window').width;
const SCREEN_HEIGHT = require('Dimensions').get('window').height;

export default class HeaderProgress extends React.Component {

    static propTypes = {
        onRetry: React.PropTypes.func,
        onViewTrip:React.PropTypes.func
    }

    static defaultProps={
        onRetry:function(){},
        onViewTrip:function(){}
    }

    constructor(props){
        super(props);
        this.state={
            offsetTop:new Animated.Value(-90),
            progressPercent:new Animated.Value(0)
        }
    }

    componentDidMount(){
    }

    hide(){
        Animated.timing(this.state.offsetTop, {toValue:-90,duration:500}).start();
    }

    show(){
        Animated.timing(this.state.offsetTop, {toValue:0,duration:500}).start();
    }

    startToMiddle(){
        Animated.timing(this.state.progressPercent, {toValue:SCREEN_WIDTH*.8,duration:5000}).start();
    }

    middleToEnd(){
        Animated.timing(this.state.progressPercent, {toValue:SCREEN_WIDTH,duration:500}).start(()=>{
           this.refs.uploadSuccess.show();
            Animated.timing(this.state.progressPercent, {toValue:0,duration:0}).start();
            });
    }

    showError(){
        this.refs.uploadFailed.show();
        Animated.timing(this.state.progressPercent, {toValue:0,duration:500}).start();
    }

    showSuccess(){
        this.middleToEnd();
    }

    retry(){

    }

    render () {
        return (
            <Animated.View style={{position:'absolute',top:this.state.offsetTop,left:0,flex:1,width:SCREEN_WIDTH}}>
                <Animated.View style={{backgroundColor:'#8ad78d', width:this.state.progressPercent,height:3}}></Animated.View>

                <InteractiveNotification ref="uploadFailed" notificationMessage="the trip upload failed"></InteractiveNotification>
                <InteractiveNotification ref="uploadSuccess" success={true}  notificationMessage="the trip upload was successful"></InteractiveNotification>
            </Animated.View>
        )
    }
}
