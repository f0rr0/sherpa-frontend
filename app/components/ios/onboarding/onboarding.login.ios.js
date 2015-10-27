'use strict';

var React = require('react-native');
import {updateUserData,signupUser,loadUser} from '../../../actions/user.actions';
import { connect } from 'react-redux/native';

var {
    StyleSheet,
    View,
    Component,
    Text,
    TextInput,
    TouchableHighlight,
    AlertIOS
    } = React;


var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:'center',
        margin:30
    }
});

class Login extends Component {
    constructor(props){
        super(props);
        this.state={email:"",inviteCode:"everest"};
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
               <Text>We want your e-mail address</Text>
               <TextInput
                   placeholder="Enter your e-mail address"
                   clearTextOnFocus={true}
                   placeholderTextColor="#797979"
                   clearButtonMode="while-editing"
                   style={{height: 40,marginTop:10,marginBottom:20,borderColor: 'gray', padding:10,borderWidth: 1}}
                   onChangeText={(email) => this.setState({email})}
               />
               <Text>Put your invite code here</Text>
               <TextInput
                   placeholder="Try something with everest"
                   clearTextOnFocus={true}
                   clearButtonMode="while-editing"
                   placeholderTextColor="#797979"
                   style={{height: 40,marginTop:10,marginBottom:20,borderColor: 'gray', padding:10,borderWidth: 1}}
                   onChangeText={(inviteCode) => this.setState({inviteCode})}
                   defaultValue={this.state.inviteCode}
               />
               <TouchableHighlight underlayColor="white" style={{backgroundColor:'grey',height:50,justifyContent:'center',alignItems:'center',marginTop:20}} onPress={this.connectWithService.bind(this)}>
                   <View>
                       <Text>Connect with Instagram</Text>
                   </View>
               </TouchableHighlight>
               <TouchableHighlight underlayColor="white" style={{backgroundColor:'white',height:50,justifyContent:'center',alignItems:'center'}} onPress={this.requestInvite.bind(this)}>
                   <View>
                       <Text>Request invite via Twitter</Text>
                   </View>
               </TouchableHighlight>
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