'use strict';

import {
    View,
    StyleSheet,
    ListView,
    Switch,
    Text,
    TextInput,
    Image,
    ScrollView,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';
import StickyHeader from '../../components/stickyHeader';
import SimpleInput from '../../components/simpleInput';
import ChooseHometown from '../../components/chooseHometown';
import { deleteUser, logoutUser, setUserData, loadUser} from '../../../../actions/user.actions';
import { Fonts, Colors } from '../../../../Themes';
import {encodeQueryData} from '../../../../utils/query.utils';
import buttonStyles from '../../components/styles/simpleButtonStyle';
import inputStyles from '../../components/styles/simpleInputStyle';
import config from '../../../../data/config';
import store from 'react-native-simple-store';
import _ from 'underscore';

const {instagram,sherpa}=config.auth[config.environment];

var styles = StyleSheet.create({
    container:{
        backgroundColor:'white',
        left:0,
        flex:1,
        right:0,
        position:'absolute',
        paddingBottom:50
    },
    buttonCopy: {
        fontFamily: "TSTAR",
        letterSpacing: 1,
        fontSize: 11,
        fontWeight: "600"
    },
    warningButtonCopy: {
        fontFamily: "TSTAR",
        letterSpacing: 1,
        fontSize: 11,
        color: "red",
        fontWeight: "600"
    },
    button: {
        borderStyle: "solid",
        borderTopWidth: 1,
        borderColor: "#d8d8d8",
        paddingLeft: 20,
        height: 70,
        flex: 1,
        position: "relative",
        justifyContent: "center"
    },
    dynamicButton: {
        borderStyle: "solid",
        borderTopWidth: 1,
        borderColor: "#d8d8d8",
        paddingLeft: 20,
        position: "relative",
        justifyContent: "center"
    },
    settingsHeader: {
        height:70,
        position:'relative',
        backgroundColor:'transparent'
    },
    inputStyle: {
        textAlign: 'left',
        height: 20
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    }
});

class ProfileSettings extends React.Component {
    constructor(props) {
        super(props);
        let contactSettings = this.props.user.userContactSettings;
        this.state = {
            routeName: "SETTINGS",
            allowScrape: !this.props.user.allowScrape,
            allowTripAddedNotif: !!_.findWhere(contactSettings, {label: 'trip-added'}),
            allowTripFeaturedNotif: !!_.findWhere(contactSettings, {label: 'trip-featured'}),
            allowMomentSavedNotif: !!_.findWhere(contactSettings, {label: 'moment-saved'}),
            allowNewSuitcaseTripNotif: !!_.findWhere(contactSettings, {label: 'new-suitcase-trip'}),
        };
    }

    _submitEditing(field, value) {
        let data = {};
        data[field] = value;
        this.props.dispatch(setUserData(data));
    }


    resetProfile(){
        const {endpoint,version} = sherpa;
        let feedRequestURI;
        feedRequestURI = endpoint + version + "/profile/" + this.props.user.serviceID + "/reset";
        let sherpaHeaders = new Headers();
        sherpaHeaders.append("token", this.props.user.sherpaToken);

        return fetch(feedRequestURI, {
            method: 'post',
            headers: sherpaHeaders
        }).then((rawSherpaResponse)=> {
              switch (rawSherpaResponse.status) {
                  case 200:
                      return rawSherpaResponse.text();
                      break;
                  case 400:
                      return '{}';
                      break;
              }
          });
    }

    setAllowScrape(value) {
        const {endpoint,version} = sherpa;
        let feedRequestURI = endpoint + version + "/profile/" + this.props.user.serviceID + "/allow-scrape";
        let sherpaHeaders = new Headers();
        let payload = {allowScrape: value};

        sherpaHeaders.append("token", this.props.user.sherpaToken);
        sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        fetch(feedRequestURI, {
            method: 'patch',
            headers: sherpaHeaders,
            body: encodeQueryData(payload)
        }).then(rawSherpaResponse => {
            if (rawSherpaResponse.ok) {
                this.setState(payload);
                this.props.dispatch(loadUser());
            }
        });
    }

    setContactSetting(value, label) {
        const {endpoint,version} = sherpa;
        let setting = _.findWhere(this.props.user.allContactSettings, {label: label});
        //console.log(this.props.user.allContactSettings);
        //console.log(label);
        //console.log(this.props.user);
        let feedRequestURI = endpoint + version + "/user/" + this.props.user.sherpaID + "/contact-settings/" + setting.id;
        let sherpaHeaders = new Headers();
        let payload = {enabled: value};

        sherpaHeaders.append("token", this.props.user.sherpaToken);
        sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        return fetch(feedRequestURI, {
            method: 'post',
            headers: sherpaHeaders,
            body: encodeQueryData(payload)
        }).then(rawSherpaResponse => {
            if (rawSherpaResponse.ok) {
                this.props.dispatch(loadUser());
                return true;
            }
            return false;
        });
    }

    allowTripAddedNotifCallback(value){
        this.setContactSetting(value, 'trip-added').then((success) => {
            if(success){
                this.setState({allowTripAddedNotif: value});
            }
        });
    }

    allowTripFeatureNotifCallback(value){
        this.setContactSetting(value, 'trip-featured').then((success) => {
            if (success) this.setState({allowTripFeaturedNotif: value});
        });
    }

    allowMomentSavedNotifCallback(value){
        this.setContactSetting(value, 'moment-saved').then((success) => {
            if (success) this.setState({allowMomentSavedNotif: value});
        });
    }

    allowNewSuitcaseNotifCallback(value){
        this.setContactSetting(value, 'new-suitcase-trip').then((success) => {
            if (success) this.setState({allowNewSuitcaseTripNotif: value});
        });
    }

    render(){
        return (
            <ScrollView style={styles.container}>
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}/>
                <View style={styles.button}>
                    <Text style={styles.buttonCopy}>NAME</Text>
                    <SimpleInput placeholder={this.props.user.fullName} style={styles.inputStyle} onSubmitEditing={(event) => this._submitEditing("fullName", event.nativeEvent.text)}/>
                </View>
                <View style={styles.button}>
                    <Text style={styles.buttonCopy}>EMAIL</Text>
                    <SimpleInput placeholder={this.props.user.email} style={styles.inputStyle} keyboardType="email-address" onSubmitEditing={(event) => this._submitEditing("email", event.nativeEvent.text)}/>
                </View>
                <View style={styles.dynamicButton}>
                    <Text style={styles.buttonCopy}>HOMETOWN</Text>
                    {/* TODO: fix styling*/}
                    <ChooseHometown user={this.props.user} placeholder='' dispatch={this.props.dispatch} styles={{
                        poweredContainer: {
                            opacity:0
                        },
                        description:[
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            styles.inputStyle
                        ],
                        textInput: [
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            styles.inputStyle
                        ],
                        textInputContainer: {
                            backgroundColor: '#FFFFFF',
                            borderTopColor: '#FFFFFF',
                            borderBottomColor: '#FFFFFF',
                            borderTopWidth: 0,
                            borderBottomWidth: 0,
                        },
                        separator: {
                            backgroundColor: '#FFFFFF'
                        }}}/>
                </View>
                <View style={styles.button}>
                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                        <Text style={styles.buttonCopy}>ADD NEW TRIPS FROM INSTAGRAM</Text>
                        <Switch
                          value={this.state.allowScrape}
                          onValueChange={this.setAllowScrape.bind(this)}/>
                    </View>
                </View>
                <View style={styles.dynamicButton}>
                    <Text style={styles.buttonCopy}>NOTIFICATIONS</Text>
                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                        <Text style={[
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            styles.inputStyle
                        ]}>Trip Added From Instagram</Text>
                        <Switch
                          value={this.state.allowTripAddedNotif}
                          onValueChange={(value)=>this.allowTripAddedNotifCallback(value)}/>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                        <Text style={[
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            styles.inputStyle
                        ]}>Trip Featured</Text>
                        <Switch
                          value={this.state.allowTripFeaturedNotif}
                          onValueChange={(value)=>this.allowTripFeatureNotifCallback(value)}/>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                        <Text style={[
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            styles.inputStyle
                        ]}>Moment Saved</Text>
                        <Switch
                          value={this.state.allowMomentSavedNotif}
                          onValueChange={(value) => this.allowMomentSavedNotifCallback(value)}/>
                    </View>
                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                        <Text style={[
                            buttonStyles.button,
                            inputStyles.inputField,
                            buttonStyles.buttonText,
                            inputStyles.inputText,
                            styles.inputStyle
                        ]}>New Suitcase Trip</Text>
                        <Switch
                          value={this.state.allowNewSuitcaseTripNotif}
                          onValueChange={(value) => this.allowNewSuitcaseNotifCallback(value)}/>
                    </View>
                </View>
                <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this.resetProfile()}}>
                    <Text style={styles.buttonCopy}>RESET PROFILE</Text>
                </TouchableHighlight>
                <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this.props.dispatch(logoutUser())}}>
                    <Text style={styles.buttonCopy}>LOGOUT</Text>
                </TouchableHighlight>
                <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this.props.dispatch(deleteUser())}}>
                    <Text style={styles.buttonCopy}>DELETE ACCOUNT</Text>
                </TouchableHighlight>
                {this.props.navigation.default}

            </ScrollView>
        );
    }
}


export default ProfileSettings;