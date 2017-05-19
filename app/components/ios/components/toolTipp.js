import React from 'react'
import { TouchableOpacity, Text, View, Animated, Image,TouchableWithoutFeedback } from 'react-native'
import toolTippStyle from './styles/toolTippStyle'
import Dimensions from 'Dimensions';
import Triangle from './graphics/Triangle';
let windowSize=Dimensions.get('window');

class ToolTipp extends React.Component {

    static propTypes = {
        placeholder: React.PropTypes.string,
        styles: React.PropTypes.object,
        onPress:React.PropTypes.func
    }

    static defaultProps={
        "message":"",
        "width":"auto",
        "hasTriangle":false
    }

    constructor(props){
        super(props);
        this.state={opacity:new Animated.Value(1)}
    }

    hide(){
        Animated.timing(this.state.opacity,{toValue:0}).start();
        this.props.onHide();
    }

    _renderTriangle(){
        let triangle;
            switch(this.props.hasTriangle){
                case "top":
                    triangle= (<Triangle
                        style={{position:'absolute',top:-6,right:20}}
                        width={10}
                        height={6}
                        color={'rgba(0,0,0,.85)'}
                        direction={'up'}
                    />)
                break;
                case "topleft":
                    triangle= (<Triangle
                        style={{position:'absolute',top:-6,left:20}}
                        width={10}
                        height={6}
                        color={'rgba(0,0,0,.85)'}
                        direction={'up'}
                    />)
                    break;
                case "bottom":
                    triangle= (<Triangle
                        style={{position:'absolute',bottom:-6,left:20}}
                        width={10}
                        height={6}
                        color={'rgba(0,0,0,.85)'}
                        direction={'down'}
                    />)
                break;
                default:
                    triangle= null;
            }
        return triangle;
    }

    render () {
        let toolTippWidth;
        switch(this.props.width){
            case "auto":
                toolTippWidth=null;
            break;
            case "fullwidth":
                toolTippWidth=windowSize.width
            default:
                toolTippWidth=this.props.width;
            break;
        }

        return (
            <Animated.View style={[toolTippStyle.basic,{width:toolTippWidth,opacity:this.state.opacity},this.props.style]}>
                <View style={{justifyContent:'center',alignItems:'center',flexDirection:'row'}}>
                    {this.props.hideX?null:<Image style={{marginRight:10}} source={require("../../../Images/icons/close-tooltipp.png")}></Image>}
                    <Text style={[toolTippStyle.copy,this.props.textStyle]}>{this.props.message}</Text>
                </View>
                {this._renderTriangle()}
            </Animated.View>
        )
    }
}

export default ToolTipp;