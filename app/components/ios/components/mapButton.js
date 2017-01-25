import React from 'react'
import { TouchableOpacity, Text, View, Animated, StyleSheet,Image,TouchableWithoutFeedback } from 'react-native'
import mapButtonStyle from './styles/mapButtonStyle'
import Dimensions from 'Dimensions';
import Triangle from './graphics/Triangle';
let windowSize=Dimensions.get('window');

class MapButton extends React.Component {

    static propTypes = {
        placeholder: React.PropTypes.string,
        styles: React.PropTypes.object,
        onPress:React.PropTypes.func
    }

    static defaultProps={
        "message":"",
        "width":"auto",
        "icon":null,
        "initialOpacity":1
    }

    constructor(props){
        super(props);
        this.state={
            "opacity":new Animated.Value(props.initialOpacity),
            "message":props.message,
            "showLoader":false
        }
    }

    hide(fast){

        Animated.spring(this.state.opacity,{toValue:0,delay:fast?0:1,duration:fast?0:1}).start(()=>{
            this.setState({showLoader:false})
        });
    }

    show(){
        this.setState({message:this.props.message});
        Animated.spring(this.state.opacity,{toValue:1}).start();
    }

    load(){
        this.setState({showLoader:true})
    }

    nothing(){
        this.setState({message:"SORRY, NOTHING THERE",showLoader:false});
    }

    render () {
        let buttonWidth;
        switch(this.props.width){
            case "auto":
                buttonWidth=null;
                break;
            case "fullwidth":
                buttonWidth=windowSize.width
            default:
                buttonWidth=this.props.width;
                break;
        }

        const iconStyle=this.props.icon?mapButtonStyle.iconContainer:null;
        const loader=this.state.showLoader?<View style={{...StyleSheet.absoluteFillObject,justifyContent:'center',alignItems:'center'}}><Image style={{width: 20, height: 20}} source={require('./../../../Images/loader@2x.gif')} /></View> :null;
        const content=this.props.icon?<Image resizeMode="contain" style={[mapButtonStyle.icon]} source={this.props.icon}></Image>:<Text style={[mapButtonStyle.copy,{opacity:this.state.showLoader?0:1}]}>{this.state.message.toUpperCase()}</Text>;
        return (
            <Animated.View style={[{opacity:this.state.opacity,width:buttonWidth},mapButtonStyle.basic,iconStyle,this.props.style]}>
                {content}
                {loader}
            </Animated.View>
        )
    }
}

export default MapButton;