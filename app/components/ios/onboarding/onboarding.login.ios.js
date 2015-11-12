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
    Image
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
        left:0,
        top:0,
        width:windowSize.width,
        height:windowSize.height
    },
    login:{
        flex:1,
        padding:40,
        justifyContent:'flex-end'
    },
    textInput:{
        height: 40,
        marginTop:3,
        marginBottom:20,
        backgroundColor:'white',
        padding:10,
        borderWidth: 0,
        fontSize:11,
        fontFamily:"TSTAR-bold"
    },
    button:{
        backgroundColor:'#4836f9',
        color:'white',
        height:50,
        justifyContent:'center',
        alignItems:'center',
        marginTop:20
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
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:10,
        textAlign:'center',
        marginTop:12
    }
});

class Login extends Component {
    constructor(props){
        super(props);
        this.state={email:"",inviteCode:"EVEREST"};
    }

    connectWithService(){
        this.props.dispatch(updateUserData({email:this.state.email,inviteCode:this.state.inviteCode}));
        this.props.dispatch(signupUser());
    }

    requestInvite(){
        AlertIOS.alert("you can't request invites yet");
    }

    render() {
        return (
            <View style={styles.container}>
                <Image style={styles.bg} source={require('image!landing-bg')} resizeMode="cover"/>
                <View style={styles.login}>
                    <Text style={styles.copy}>We want your E-Mail Address</Text>
                    <TextInput
                        placeholder="YOUR MAIL"
                        placeholderTextColor="#d7d8d8"
                        clearButtonMode="while-editing"
                        style={styles.textInput}
                        onChangeText={(email) => this.setState({email})}
                    />
                    <Text style={styles.copy}>Put your invite code here</Text>
                    <TextInput
                        placeholder="Try something with everest"
                        clearButtonMode="while-editing"
                        placeholderTextColor="#d7d8d8"
                        style={styles.textInput}
                        onChangeText={(inviteCode) => this.setState({inviteCode})}
                        defaultValue={this.state.inviteCode}
                    />
                    <TouchableHighlight underlayColor="white" style={styles.button} onPress={this.connectWithService.bind(this)}>
                        <View>
                            <Text style={styles.copyLarge}>CONNECT WITH INSTAGRAM</Text>
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="white" style={styles.copyButton} onPress={this.requestInvite.bind(this)}>
                            <Text style={styles.copyCenter}>NO CODE? REQUEST AN INVITE VIA TWITTER</Text>
                    </TouchableHighlight>
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