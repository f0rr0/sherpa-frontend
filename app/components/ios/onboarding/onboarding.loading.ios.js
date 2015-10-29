'use strict';

import React from 'react-native';
import {updateUserData,signupUser,loadUser} from '../../../actions/user.actions';
import { connect } from 'react-redux/native';
import Overview from '../overview/overview.ios';
import Login from './onboarding.login.ios';

var {
    StyleSheet,
    View,
    Component,
    Text
    } = React;

class Loading extends Component {
    constructor(props){
        super(props);
        this.props.dispatch(loadUser());
    }


    componentDidUpdate(){
        switch(this.props.user.userDBState){
            case "process":
            break;
            case "available":
                this.props.navigator.push({
                    id: "overview"
                });
            break;
            case "empty":
                this.props.navigator.push({
                    id: "login"
                });
            break;
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
    }
});

function select(state) {
    return {
        user: state.userReducer
    };
}

export default connect(select)(Loading);