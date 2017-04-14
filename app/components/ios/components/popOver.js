import {
    Animated,
    View,
    TouchableHighlight,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';

import Communications from 'react-native-communications';
import React, { Component } from 'react';
import ActivityView from "react-native-activity-view";

var styles = StyleSheet.create({
    button:{
        borderStyle:"solid",
        borderTopWidth:1,
        borderColor:"#e6e6e6",
        height:50,
        flex:1,
        justifyContent:"center"
    },
    buttonRed:{
        backgroundColor:'white'
    },
    buttonCopy:{
        fontFamily:"TSTAR",
        letterSpacing:1,
        fontSize:13,
        color:"#161616",
        marginTop:4,
        textAlign:'center',
        fontWeight:"800"
    },
    container:{
        backgroundColor:'white',
        left:5,
        flex:1,
        right:5,
        borderRadius:4,
        overflow:'hidden',
        position:'absolute',
        shadowColor:'black',
        shadowRadius:4,
        shadowOpacity:.2,
        shadowOffset:{width:0,height:-5},
        paddingBottom:40,
    }
});

class PopOver extends Component {
    constructor(props) {
        super(props);
        this.state={
            enabled:false,
            bottomOffset:new Animated.Value(-400)
        }
    }

    componentDidMount(){
    }

    _setAnimation(enable,ignoreTabBar) {
        if(enable=="toggle")enable=!this.enabled;
        if(this.enabled!=enable){
            this.enabled=enable;
            if(this.props.enableNavigator){
                this.props.enableNavigator(!this.enabled,ignoreTabBar)
            }
            this.setState({enabled:this.enabled})
            Animated.spring(this.state.bottomOffset, {
                toValue: enable?-40:-400   // return to start
            }).start()
        }
    }

    reset(){
        this.props.reset();
    }

    openShare(){
        ActivityView.show({
            url: this.props.shareURL
        });

        this._setAnimation("toggle");
    }

    render() {

        var shareButton=this.props.showShare?
            <TouchableHighlight onPress={this.openShare.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={styles.buttonCopy}>{this.props.shareCopy}</Text>
            </TouchableHighlight>:null;

        var editTripButton=this.props.showEditTrip?
            <TouchableHighlight onPress={this.props.onEditTrip.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={styles.buttonCopy}>EDIT</Text>
            </TouchableHighlight>:null;

        var deleteTripButton=this.props.showDeleteTrip?
            <TouchableHighlight onPress={this.props.onDeleteTrip.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={[styles.buttonCopy,{color:"#ff0000"}]}>DELETE ALBUM</Text>
            </TouchableHighlight>:null;

        var deleteMomentButton=this.props.showDeleteMoment?
            <TouchableHighlight onPress={this.props.onDeleteMoment.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={[styles.buttonCopy,{color:"#ff0000"}]}>DELETE</Text>
            </TouchableHighlight>:null;

        var editMomentButton=this.props.showEditMoment?
            <TouchableHighlight onPress={this.props.onEditMoment.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={[styles.buttonCopy]}>EDIT LOCATION</Text>
            </TouchableHighlight>:null;


        var resetProfileButton=this.props.showReset?
          <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {
              this._setAnimation(false)
              this.props.resetProfileCallback();
          }}>
              <Text style={styles.buttonCopy}>RESET PROFILE</Text>
          </TouchableHighlight>:null;

        var profileSettingsButton = this.props.settings ?
          <TouchableHighlight underlayColor="#ececec" style={styles.button} dispatch={this.props.dispatch.bind(this)} onPress={() => {
              this._setAnimation(false);
              this.props.showSettings();
          }}>
              <Text style={styles.buttonCopy}>PROFILE SETTINGS</Text>
          </TouchableHighlight> : null;

        var cancelButton=
            <TouchableHighlight underlayColor="#ececec" style={[styles.button]} onPress={() => {this._setAnimation(false)}}>
                <Text style={[styles.buttonCopy,{color:"#999999"}]}>CANCEL</Text>
            </TouchableHighlight>;

        var emailFeedbackButton=
            <TouchableHighlight  underlayColor="#ececec" style={styles.button} onPress={()=>{Communications.email(['paul@trysherpa.com'], null, null, "Feedback", null)}}>
                <Text style={styles.buttonCopy}>FEEDBACK</Text>
            </TouchableHighlight>;

        var reportPhotoButton=this.props.reportPhoto?
            <TouchableHighlight style={[styles.button,styles.buttonRed]} onPress={()=>{Communications.email(['support@trysherpa.com'], null, null, "Report Abuse", 'Photos ID: '+this.props.momentID+'\n\n Description: Please tell us why you feel this content is inappropriate.')}}>
                <Text style={[styles.buttonCopy]}>REPORT ABUSE</Text>
            </TouchableHighlight>:null;

        var settingsButton=this.props.showSettings?
            <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {
              this._setAnimation(false,true)
              this.props.openSettings();
          }}>
                <Text style={styles.buttonCopy}>SETTINGS</Text>
            </TouchableHighlight>:null;


        return (
            <Animated.View style={{position:'absolute',top:0,left:0,bottom:0,right:0,backgroundColor:this.state.bottomOffset.interpolate({inputRange:[-400,-40],outputRange:['rgba(0,0,0,0)','rgba(0,0,0,.3)'],extrapolate:'clamp'})}} pointerEvents={this.state.enabled?"auto":"none"} >
            <TouchableOpacity onPress={()=>{this._setAnimation(false)}} activeOpacity={1} style={{position:'absolute',top:0,left:0,bottom:0,right:0}}>

                <Animated.View style={[styles.container,{bottom: this.state.bottomOffset}]}>
                    {editTripButton}
                    {shareButton}
                    {reportPhotoButton}
                    {profileSettingsButton}
                    {settingsButton}
                    {emailFeedbackButton}
                    {editMomentButton}
                    {deleteMomentButton}
                    {deleteTripButton}
                    {cancelButton}
                </Animated.View>
            </TouchableOpacity>
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
    shareCopy:"SHARE",
    reportPhoto:false
};

export default PopOver;