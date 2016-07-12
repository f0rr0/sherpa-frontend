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
    }


    render() {
        var loadingInfo=<Text style={styles.copy}>LOADING</Text>
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