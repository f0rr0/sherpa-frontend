'use strict';

var React = require('react-native');
import {updateUserData,signupUser} from '../../../actions/user.actions';
import { connect } from 'react-redux/native';
import Dimensions from 'Dimensions';

var windowSize=Dimensions.get('window');

var {
    StyleSheet,
    View,
    Component,
    Text,
    TextInput,
    TouchableHighlight,
    AlertIOS,
    Image,
    Animated
    } = React;


var styles = StyleSheet.create({
    container: {
        flexDirection:'column',
        flex:1,
        backgroundColor:'transparent'
    },
    copy:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:10
    },
    copyCenter:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:9,
        textAlign:'center'
    },
    bg:{
        position:'absolute',
        left:windowSize.width*.3,
        top:-60,
        width:windowSize.width*.4,
        height:windowSize.height
    },
    login:{
        flex:1,
        padding:40,
        justifyContent:'center',
        marginTop:80
    },
    textInput:{
        height: 50,
        marginTop:3,
        marginBottom:10,
        backgroundColor:'white',
        padding:10,
        borderWidth: 0,
        fontSize:11,
        fontFamily:"TSTAR-bold"
    },

    imageContainer:{
        flex: 1,
        alignItems: 'stretch'
    },
    bgImage:{
        flex:1
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    copyButton:{
        marginTop:12
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        justifyContent:'center',
        alignItems:'center'
    }
});

class Login extends Component {
    constructor(props){
        super(props);
        this.state={email:"",inviteCode:"EVEREST",inputBottomMargin: new Animated.Value(0),copyOpacity:new Animated.Value(1)};
    }
    componentDidMount(){

    }

    connectWithService(){
        this.props.dispatch(updateUserData({email:this.state.email,inviteCode:this.state.inviteCode}));
        this.props.dispatch(signupUser());
    }

    requestInvite(){
        AlertIOS.alert("you can't request invites yet");
    }

    moveUp(){
        Animated.spring(
            this.state.inputBottomMargin,
            {
                toValue: 308,
                friction:6
            }
        ).start();

        Animated.spring(
            this.state.copyOpacity,
            {
                toValue:0,
                friction:6
            }
        ).start();
    }

    moveDown(){
        Animated.spring(
            this.state.inputBottomMargin,
            {
                toValue: 50,
                friction:6
            }
        ).start();

        Animated.spring(
            this.state.copyOpacity,
            {
                toValue:1,
                friction:6
            }
        ).start();
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.bg} source={require('image!logo-sherpa')} resizeMode="contain"/>

                <View style={styles.login}>

                        <Animated.View style={[{
                        marginBottom:this.state.inputBottomMargin
                        }]}>
                    <TouchableHighlight style={styles.button} underlayColor="white" onPress={this.connectWithService.bind(this)}>
                            <Text style={styles.copyLarge}>CONNECT WITH INSTAGRAM</Text>
                    </TouchableHighlight>
                        </Animated.View>
                </View>
            </View>
        );
    }
}



function select(state) {
    return {
        user: state.userReducer
    };
}

export default connect(select)(Login);