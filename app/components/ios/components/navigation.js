var React = require('react-native');

var {
    Component,
    View,
    TouchableHighlight,
    Image,
    Text
    } = React;

class Navigation extends Component {
    constructor(props) {
        super(props);

        this.state={
            "arrowImage":this.props.color==="black"?require("image!nav-arrow-black"):require("image!nav-arrow-white"),
            "dotsImage":this.props.color==="black"?require('image!nav-dots-black'):require('image!nav-dots-white'),
            "routeName":this.props.routeName
        }
    }

    render() {
        return (
            <View ref="navigation" style={{top:0,left:0,flexDirection:"row",width:380,flex:1,alignItems:"center",justifyContent:"space-between",right:0,backgroundColor:this.props.opaque?'white':'transparent',height:70,position:"absolute"}}>
                <TouchableHighlight underlayColor="rgba(255,255,255,.1)" style={{padding:20,marginLeft:5,top:0,opacity:this.props.hideBack?0:1}} onPress={
                    () => {
                        this.props.goBack();
                    }
                }>
                    <Image
                        style={{width:11,height:11,backgroundColor:'transparent'}}
                        source={this.state.arrowImage}
                        resizeMode="contain"
                    ></Image>
                </TouchableHighlight>
                <Text style={{color:this.props.color,fontSize:14,  marginLeft:-8,marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{this.state.routeName.toUpperCase()}</Text>
                <TouchableHighlight style={{padding:5,marginRight:25}}>
                    <Image
                        style={{width:11,height:13,backgroundColor:'transparent'}}
                        source={this.state.dotsImage}
                        resizeMode="contain"
                    ></Image>
                </TouchableHighlight>
            </View>
        );
    }
}

Navigation.defaultProps = {
    color:"white",
    routeName:"",
    goBack:function(){},
    hideBack:false,
    opaque:false
};


export default Navigation;