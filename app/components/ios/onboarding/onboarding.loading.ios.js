'use strict';

import React from 'react-native';
import { connect } from 'react-redux/native';
import Overview from '../overview/overview.ios';
import Login from './onboarding.login.ios';

var {
    StyleSheet,
    View,
    Component,
    Text,
    Image
    } = React;

var styles = StyleSheet.create({
    copy: {
        color:'#001545',
        fontFamily:"TSTAR-bold",
        fontSize:14,
        marginTop:20
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
            case "available-new":
                this.setState({showProgress:false,currentView:"onboarding-notifications"});
            break;
            case "available-existing":
            case "notifications-registered":
                this.setState({showProgress:false,currentView:"overview"});
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
            loadingInfo=<Text style={styles.copy}>ANALYZING TRIPS</Text>
        }else{
            loadingInfo=<Text style={styles.copy}>LOADING</Text>
        }
        return (
            <View style={styles.container}>
                <Image style={{width: 250, height: 250}} source={{uri: 'http://www.thomasragger.com/loader.gif'}} />
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