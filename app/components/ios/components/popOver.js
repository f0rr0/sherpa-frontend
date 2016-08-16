import {
    Animated,
    View,
    TouchableHighlight,
    Text,
    StyleSheet
} from 'react-native';

import Communications from 'react-native-communications';
import React, { Component } from 'react';
import ActivityView from "react-native-activity-view";
import { deleteUser,logoutUser } from '../../../actions/user.actions';

var styles = StyleSheet.create({
    button:{
        borderStyle:"solid",
        borderTopWidth:.5,
        borderColor:"#d8d8d8",
        paddingLeft:20,
        height:70,
        flex:1,
        justifyContent:"center"
    },
    buttonCopy:{
        fontFamily:"TSTAR",
        letterSpacing:1,
        fontSize:11,
        fontWeight:"600"
    },
    container:{
        backgroundColor:'white',
        left:0,
        flex:1,
        right:0,
        position:'absolute',
        paddingBottom:50
    }
});

class PopOver extends Component {
    constructor(props) {
        super(props);
        this.bottomOffset = new Animated.Value(-350);
        this.enabled=false;
    }

    componentDidMount(){
    }

    _setAnimation(enable) {
        if(enable=="toggle")enable=!this.enabled;
        if(this.enabled!=enable){
            this.enabled=enable;
            Animated.spring(this.bottomOffset, {
                toValue: enable?-40:-350   // return to start
            }).start()
        }
    }

    reset(){
        this.props.reset();
    }

    openShare(){
        //console.log(this.props.shareURL);
        ActivityView.show({
            url: this.props.shareURL
        });

        this._setAnimation("toggle");
    }

    render() {

        var shareButton=this.props.showShare?
            <TouchableHighlight onPress={this.openShare.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={styles.buttonCopy}>{this.props.shareCopy}</Text>
            </TouchableHighlight>:<View></View>;

        var logoutButton=this.props.showLogout?
            <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this.props.dispatch(logoutUser())}}>
                <Text style={styles.buttonCopy}>LOGOUT</Text>
            </TouchableHighlight>:<View></View>;

        var resetProfileButton=this.props.showReset?
            <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {
                        this.props.resetProfileCallback();
                        this._setAnimation(false)
                }}>
                <Text style={styles.buttonCopy}>RESET PROFILE</Text>
            </TouchableHighlight>:<View></View>;

        var deleteButton=this.props.showDelete?
            <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this.props.dispatch(deleteUser())}}>
                <Text style={styles.buttonCopy}>DELETE ACCOUNT</Text>
            </TouchableHighlight>:<View></View>;

        var cancelButton=
            <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this._setAnimation(false)}}>
                <Text style={styles.buttonCopy}>CANCEL</Text>
            </TouchableHighlight>;

        var emailFeedbackButton=
            <TouchableHighlight style={styles.button} onPress={()=>{Communications.email(['paul@trysherpa.com'], null, null, "Beta Feedback", null)}}>
                <Text style={styles.buttonCopy}>FEEDBACK</Text>
            </TouchableHighlight>;

        return (
            <Animated.View style={[styles.container,{bottom: this.bottomOffset}]}>
                {shareButton}
                {resetProfileButton}
                {logoutButton}
                {deleteButton}
                {emailFeedbackButton}
                {cancelButton}
            </Animated.View>
        );
    }
}

PopOver.defaultProps = {
    showShare:true,
    showLogout:false,
    showDelete:false,
    showReset:false,
    shareURL:"http://trysherpa.com/",
    shareCopy:"SHARE"
}

export default PopOver;