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
    Alert,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';
import StickyHeader from '../../components/stickyHeader';
import SimpleInput from '../../components/simpleInput';
import ChooseHometown from '../../components/chooseHometown';
import { deleteUser, logoutUser, setUserData, loadUser,resetProfile} from '../../../../actions/user.actions';
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
        backgroundColor:'white'
    },
    buttonCopy: {
        fontFamily: "TSTAR",
        letterSpacing: .5,
        fontSize: 10,
        fontWeight: "600",
        marginLeft:10,
    },
    warningButtonCopy: {
        fontFamily: "TSTAR",
        letterSpacing: 1,
        fontSize: 10,
        color: "red",
        fontWeight: "600"
    },
    button: {
        marginLeft: 20,
        marginRight:20,
        height: 90,
    },
    toggleCopy:{
        fontFamily: Fonts.type.bodyCopy,
        letterSpacing: .5,
        fontSize: 12,
        color:'rgba(0,0,0,.5)',
        fontWeight: "600",
        padding:0,
        marginLeft:10,
    },
    dynamicButton: {
        borderStyle: "solid",
        paddingLeft: 20,
        position: "relative",
        justifyContent: "center"
    },
    settingsHeader: {
        position:'relative',
        backgroundColor:'transparent'
    },
    inputStyle: {
        textAlign: 'left',
        borderWidth:1,
        borderColor:"#e5e5e5",
        paddingLeft:20,
        borderRadius:3,
        marginTop:2,
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height:80,
        marginRight:20,
        borderBottomColor:"#e5e5e5",
        borderBottomWidth:1
    },
    toggleRowLow:{
        height:50
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

    deleteAccount(){
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account?',
            [
                {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                {text: 'OK', onPress: () => {
                    this.props.dispatch(deleteUser())
                }}
            ]
        )
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
        //console.log(this.props.user)
        return (
            <View style={{flex:1}}>
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}/>

                <ScrollView style={styles.container}>

                    <View style={[styles.button,{marginTop:100}]}>
                        <Text style={styles.buttonCopy}>NAME</Text>
                        <SimpleInput placeholder={this.props.user.fullName} style={styles.inputStyle} onSubmitEditing={(event) => this._submitEditing("fullName", event.nativeEvent.text)}/>
                    </View>
                    <View style={styles.button}>
                        <Text style={styles.buttonCopy}>EMAIL</Text>
                        <SimpleInput placeholder={this.props.user.email} style={styles.inputStyle} keyboardType="email-address" onSubmitEditing={(event) => this._submitEditing("email", event.nativeEvent.text)}/>
                    </View>
                    <View style={[styles.button,{zIndex:2}]}>
                        <Text style={styles.buttonCopy}>HOMETOWN</Text>
                        {/* TODO: fix styling*/}
                        <View style={{position:'absolute',flex:1,right:0,left:0}}>


                        <ChooseHometown user={this.props.user} placeholder='' dispatch={this.props.dispatch} styles={{
                            poweredContainer: {
                                opacity:0
                            },
                            row:{
                                backgroundColor:'white'
                            },
                            description:[
                                inputStyles.inputText,
                                {borderWidth:0,backgroundColor:'white',margin:0}
                            ],
                            textInput: [
                                buttonStyles.button,
                                inputStyles.inputField,
                                buttonStyles.buttonText,
                                inputStyles.inputText,
                                styles.inputStyle,
                                {marginRight:0,paddingRight:0}
                            ],
                            textInputContainer: {
                                backgroundColor: '#FFFFFF',
                                borderTopColor: '#FFFFFF',
                                borderBottomColor: '#FFFFFF',
                                borderTopWidth: 0,
                                borderBottomWidth: 0,
                                marginBottom:20
                            },
                            separator: {
                                backgroundColor: '#FFFFFF'
                            }}}/>
                    </View>
                    </View>
                    <View style={[styles.button,{justifyContent:'center',marginBottom:20}]}>
                        <View style={[styles.toggleRow,{borderBottomWidth:0}]}>
                            <Text style={styles.buttonCopy}>{"add geotagged photos from Instagram".toUpperCase()}</Text>
                            <Switch
                              value={this.state.allowScrape}
                              onValueChange={this.setAllowScrape.bind(this)}/>
                        </View>
                    </View>
                    {/*
                    <View style={styles.dynamicButton}>
                        <Text style={styles.buttonCopy}>PUSH NOTIFICATIONS</Text>
                        <View style={[styles.toggleRow,{borderTopWidth:1,borderTopColor:"#e5e5e5",marginTop:10}]}>
                            <Text style={[styles.toggleCopy
                            ]}>Trip Added From Instagram</Text>
                            <Switch
                                style={{marginRight:20}}
                              value={this.state.allowTripAddedNotif}
                              onValueChange={(value)=>this.allowTripAddedNotifCallback(value)}/>
                        </View>
                        <View style={styles.toggleRow}>
                            <Text style={[styles.toggleCopy
                            ]}>Trip Featured</Text>
                            <Switch
                                style={{marginRight:20}}
                              value={this.state.allowTripFeaturedNotif}
                              onValueChange={(value)=>this.allowTripFeatureNotifCallback(value)}/>
                        </View>
                        <View style={styles.toggleRow}>
                            <Text style={[styles.toggleCopy
                            ]}>Moment Saved</Text>
                            <Switch
                                style={{marginRight:20}}
                              value={this.state.allowMomentSavedNotif}
                              onValueChange={(value) => this.allowMomentSavedNotifCallback(value)}/>
                        </View>
                        <View style={[styles.toggleRow,{marginBottom:40}]}>
                            <Text style={[styles.toggleCopy
                            ]}>New Suitcase Trip</Text>
                            <Switch
                                style={{marginRight:20}}
                              value={this.state.allowNewSuitcaseTripNotif}
                              onValueChange={(value) => this.allowNewSuitcaseNotifCallback(value)}/>
                        </View>
                    </View>
                    */}
                    <View style={[styles.dynamicButton,{paddingBottom:60}]}>

                        <Text style={styles.buttonCopy}>ACCOUNT</Text>

                        {/* <TouchableHighlight underlayColor="#ececec" style={[styles.toggleRow,styles.toggleRowLow,{borderTopWidth:1,borderTopColor:"#e5e5e5",marginTop:10}]} onPress={() => {
                             Alert.alert(
                              'Reset Profile',
                              'Are you sure you want to reset your profile?',
                              [
                                {text: 'Cancel', onPress: () => {}, style: 'cancel'},
                                {text: 'OK', onPress: () => {
                                        this.props.dispatch(resetProfile());
                                }}
                                ]
                            )
                        }}>
                            <Text style={styles.toggleCopy}>Reset my profile</Text>
                        </TouchableHighlight>*/}
                        <TouchableHighlight underlayColor="#ececec" style={[styles.toggleRow,,styles.toggleRowLow,{borderTopWidth:1,borderTopColor:"#e5e5e5",marginTop:10}]} onPress={() => {this.props.dispatch(logoutUser())}}>
                            <Text style={styles.toggleCopy}>Logout</Text>
                        </TouchableHighlight>
                        <TouchableHighlight underlayColor="#ececec" style={[styles.toggleRow,styles.toggleRowLow]} onPress={this.deleteAccount.bind(this)}>
                            <Text style={styles.toggleCopy}>Delete Account</Text>
                        </TouchableHighlight>
                    </View>

                    {this.props.navigation.default}
            </ScrollView>
            </View>
        );
    }
}


export default ProfileSettings;