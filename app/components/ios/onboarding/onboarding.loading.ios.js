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

var styles = StyleSheet.create({
    copy: {
        color:'#4836f9',
        fontFamily:"TSTAR-bold",
        fontSize:14
    },
    container: {
        flex: 1,
        justifyContent:'center',
        alignItems:'center'
    }
})

class Loading extends Component {
    constructor(props){
        super(props);
        this.state={showProgress:false,currentView:"loading"};
    }


    componentWillReceiveProps(nextProps){
        switch(nextProps.user.userDBState){
            case "available":
                console.log(nextProps.feed.feedState,'feed state');
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
        var loadingInfo;
        if(this.state.showProgress){
            loadingInfo=<Text style={styles.copy}>ANALYZING TRIPS {Math.round(this.props.feed.jobProgress*100)}%</Text>
        }else{
            loadingInfo=<Text style={styles.copy}>LOADING</Text>
        }
        return (
            <View style={styles.container}>
                {loadingInfo}
            </View>
        );
    }
}

function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer
    };
}
export default connect(select)(Loading);