'use strict';

import React from 'react-native';
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
        this.state={showProgress:false,currentView:"loading"};
    }


    componentWillReceiveProps(nextProps){
        switch(nextProps.user.userDBState){
            case "available":
                if(nextProps.feed.jobState==='completed'){
                    this.setState({showProgress:false,currentView:"overview"});
                }else{
                    this.setState({showProgress:true,currentView:"loading"});
                }
            break;
            case "empty":
                this.setState({showProgress:true,currentView:"login"});
            break;
        }
    }

    componentDidUpdate(prevProps,prevState){
        if(prevState.currentView!==this.state.currentView){
            this.props.navigator.push({
                id: this.state.currentView
            });
        }
    }


    render() {
        return (
            <View style={styles.container}>
                <Text>Loading... {Math.round(this.props.feed.jobProgress*100)}%</Text>
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