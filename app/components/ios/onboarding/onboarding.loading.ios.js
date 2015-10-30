'use strict';

import React from 'react-native';
import {updateUserData,signupUser,loadUser} from '../../../actions/user.actions';
import {watchJob} from '../../../actions/feed.actions';
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
        this.state={showProgress:false};
    }



    componentDidUpdate(prevProps){
        console.log(':: DID UPDATE ::')
        if(prevProps.user.userDBState!==this.props.user.userDBState){
            switch(this.props.user.userDBState){
                case "process":
                break;
                case "available":
                    if(this.props.feed.jobState==='complete'){
                        this.setState({showProgress:false})
                        this.props.navigator.push({
                            id: "overview"
                        });
                    }else{
                        this.setState({showProgress:true})
                    }
                break;
                case "empty":
                    this.props.navigator.push({
                        id: "login"
                    });
                break;
            }
        }

    }


    render() {
        return (
            <View style={styles.container}>
                <Text>Loading... {this.state.percentLoaded}%</Text>
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
        user: state.userReducer,
        feed: state.feedReducer
    };
}

export default connect(select)(Loading);