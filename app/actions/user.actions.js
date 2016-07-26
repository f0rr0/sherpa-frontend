import {getQueryString,encodeQueryData} from '../utils/query.utils';
import config from '../data/config';
import * as types from '../constants/user.actiontypes'
const {instagram,sherpa}=config.auth[config.environment];
const SHERPA="SHERPA";
const INSTAGRAM="INSTAGRAM";
let dispatcher;
import React, { Linking,AlertIOS } from 'react-native';
import store from 'react-native-simple-store';
import DeviceInfo from 'react-native-device-info/deviceinfo';
let simpleAuthClient = require('react-native-simple-auth');


/**
 * Update User Data
 */



export function updateUserData(userData){
    return{
        type:types.USER_UPDATE,
        userData
    }
}

export function updateUserSignupState(signupState){
    return {
        type:types.USER_SIGNUP_UPDATE_STATE,
        signupState
    };
}
export function updateUserDBState(userDBState){
    return {
        type:types.USER_DB_UPDATE,
        userDBState
    };
}

export function addMomentToSuitcase(momentID){
    return store.get('user').then((user) => {
        if(user){
            const {endpoint,version,user_uri} = sherpa;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            fetch(endpoint+version+user_uri+"/"+user.sherpaID+"/addtosuitcase/"+momentID, {
                method: 'post',
                headers: sherpaHeaders
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
            }).catch(err=>console.log(err));
        }
    });
}

export function removeMomentFromSuitcase(momentID){
    return store.get('user').then((user) => {
        if(user){
            const {endpoint,version,user_uri} = sherpa;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            fetch(endpoint+version+user_uri+"/"+user.sherpaID+"/removefromsuitcase/"+momentID, {
                method: 'post',
                headers: sherpaHeaders
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
            }).catch(err=>console.log(err));
        }
    });
}


export function addNotificationsDeviceToken(deviceToken){
    return function (dispatch, getState) {
        return store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;

                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/user/adddevicetoken/" + user.sherpaToken + "/" + deviceToken, {
                    method: 'post',
                    headers: sherpaHeaders
                })
                .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    dispatch(updateUserDBState("available-existing"));
                }).catch(err=>console.log('device token err',err));
            }
        });
    }
}

export function deleteUser(){
    return function (dispatch, getState) {
        store.delete('user').then(()=> {
            dispatch(updateUserDBState("empty"));
        })
    }
}

export function logoutUser(){
    return function (dispatch, getState) {
        store.delete('user').then(()=> {
            dispatch(updateUserDBState("empty"));
        })
    }
}

export function setUserHometown(hometown){
    return function (dispatch, getState) {
        return store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;

                const queryData = encodeQueryData({
                    hometown:hometown.name,
                    hometownLatitude:hometown.lat,
                    hometownLongitude:hometown.lng,
                    userid:user.sherpaID
                });


                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/user/hometown", {
                    method: 'post',
                    headers: sherpaHeaders,
                    body:queryData
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                }).catch(err=>console.log('hometown  err',err));
            }
        });
    }
}


export function loadUser() {
    return function (dispatch, getState) {
        dispatch(updateUserDBState("process"));



        return store.get('user').then((user) => {
            if(user&&!config.resetUser){
                dispatch(updateUserData(user));
                var responseStatus=400;
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);

                fetch(endpoint+version+user_uri+"/"+user.sherpaID,{
                    method:'get',
                    headers:sherpaHeaders
                }).
                then((rawServiceResponse)=>{
                    responseStatus=rawServiceResponse.status;
                    return rawServiceResponse.text();
                }).then((rawSherpaResponse)=>{
                    var responseJSON = JSON.parse(rawSherpaResponse);
                    switch(responseStatus){

                        case 200:
                            dispatch(updateUserData({
                                serviceObject:responseJSON,
                                bio:responseJSON.profile.serviceBio
                            }));

                            if(user.username===responseJSON.username){
                                dispatch(updateUserDBState("available-existing"));
                            }else{
                                dispatch(updateUserDBState("empty"));
                            }
                        break;
                        case 400:
                            dispatch(updateUserDBState("empty"));
                        break;
                    }
                });
            }else{
                store.delete('user').then(()=>{
                    dispatch(updateUserDBState("empty"));
                })
            }
        });
    }
}

export function storeUser() {
    return function (dispatch, getState) {
        dispatch(updateUserDBState("process"));
        const { userReducer } = getState();
        store.save('user', userReducer).then(()=>{
            dispatch(updateUserDBState("available-new"));
            //dispatch(watchJob(userReducer.jobID));
        })
    }
}

export function signupUser(){
    return function (dispatch,getState) {
        const { userReducer } = getState();

        instagramAuthRequest();
        dispatch(updateUserSignupState("start"));

        function instagramAuthRequest(){
            simpleAuthClient.configure({
                instagram: {
                    client_id: '610a4a6a16bc40ec95f749e95c48087a',
                    redirect_uri: 'sherpa://oauthcallback-instagram'
                }
            }).then(() => {
                simpleAuthClient.authorize('instagram').then((info) => {
                    signupWithSherpa(info.token,info.data);
                }).catch((error) => {
                    let errorCode = error.code;
                    let errorDescription = error.description;
                    dispatch(updateUserDBState("empty"));
                });
            });

        }

        function signupWithSherpa(instagramToken,userData){
            dispatch(updateUserSignupState("service_token_complete"));
            let deviceData={
                deviceUniqueId:     DeviceInfo.getUniqueID(),
                deviceManufacturer: DeviceInfo.getManufacturer(),
                deviceModel:        DeviceInfo.getModel(),
                deviceName:         DeviceInfo.getSystemName(),
                deviceVersion:      DeviceInfo.getSystemVersion(),
                bundleId:           DeviceInfo.getBundleId(),
                buildNumber:        DeviceInfo.getBuildNumber(),
                appVersion:         DeviceInfo.getVersion(),
                appVersionReadable: DeviceInfo.getReadableVersion()
            };


            const queryData = encodeQueryData({
                email:userReducer.email,
                inviteCode:userReducer.inviteCode,
                service:userReducer.service,
                token:instagramToken,
                serviceData:JSON.stringify(userData),
                deviceData:JSON.stringify(deviceData)
            });


            dispatch(updateUserData({
                serviceToken:instagramToken
            }));

            dispatch(updateUserSignupState("sherpa_token_request"));
            const {endpoint,version,login_uri} = sherpa;
            fetch(endpoint+version+login_uri,{
                method:'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            }).then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
            }).then((rawSherpaResponse)=>{
                let sherpaResponse=JSON.parse(rawSherpaResponse);
                const {email,id,fullName,profilePicture,profile,username,hometown} = sherpaResponse.user;
                console.log('whitelisted',sherpaResponse);
                if(!sherpaResponse.whitelisted){
                    dispatch(updateUserDBState("not-whitelisted"));
                }else{
                    dispatch(updateUserSignupState("sherpa_token_complete"));
                    dispatch(updateUserData({
                        sherpaID:id,
                        serviceID:profile,
                        sherpaToken:sherpaResponse.token,
                        jobID:sherpaResponse.jobId,
                        email,
                        fullName,
                        username,
                        profilePicture,
                        hometown,
                        serviceObject:userData
                    }));
                    dispatch(storeUser());
                }

            })
        }
    };
}