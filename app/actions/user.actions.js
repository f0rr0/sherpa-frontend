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
            fetch(endpoint+version+user_uri+"/"+user.sherpaID+"/addtosuitcase/"+momentID, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
                signupWithSherpa(JSON.parse(response))
            }).catch(err=>console.log(err));
        }
    });
}

export function addNotificationsDeviceToken(deviceToken){
    return store.get('user').then((user) => {
        if(user){
            const {endpoint,version,user_uri} = sherpa;
            fetch(endpoint+version+"adddevicetoken/"+user.sherpaToken+"/addtosuitcase/"+momentID, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
                signupWithSherpa(JSON.parse(response))
            }).catch(err=>console.log(err));
        }
    });
}

export function deleteUser(){

}

export function logoutUser(){

}

export function setUserHometown(){

}


export function loadUser() {
    return function (dispatch, getState) {
        dispatch(updateUserDBState("process"));
        return store.get('user').then((user) => {
            if(user&&!config.resetUser){
                dispatch(updateUserData(user));

                const {endpoint,version,user_uri} = sherpa;
                fetch(endpoint+version+user_uri+"/"+user.sherpaID,{
                    method:'get'
                }).
                then((rawSherpaResponse)=>{return rawSherpaResponse.text()})
                then((rawSherpaResponse)=>{

                    switch(rawSherpaResponse.status){
                        case 200:
                            var sherpaResponse=JSON.parse(rawSherpaResponse);
                            if(user.username===sherpaResponse.username){
                                dispatch(updateUserDBState("available"));
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
            dispatch(updateUserDBState("available"));
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
            const {endpoint, code_uri, response_type, client_id, redirect_uri} = instagram;
            const queryData = encodeQueryData({response_type, client_id, redirect_uri});

            dispatch(updateUserSignupState("service_code_request"));
            Linking.openURL(endpoint+code_uri + "/?" +queryData);
            Linking.addEventListener('url', instagramAuthCallback);
            console.log('insta callback');

        }

        function instagramAuthCallback(event) {
            dispatch(updateUserSignupState("service_code_complete"));

            const {endpoint, token_uri, grant_type, client_secret, client_id, redirect_uri} = instagram;
            Linking.removeEventListener('url', instagramAuthCallback);

            let code = getQueryString("code", event.url);
            const queryData = encodeQueryData({client_id, client_secret, grant_type, redirect_uri, code});

            dispatch(updateUserSignupState("service_token_request"));

            fetch(endpoint+token_uri, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            })
            .then((rawServiceResponse)=>{
                return rawServiceResponse.text();
            }).then((response)=>{
                signupWithSherpa(JSON.parse(response))
            }).catch(err=>console.log(err));
        }

        function signupWithSherpa(serviceResponse){
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
                token:serviceResponse["access_token"],
                serviceData:JSON.stringify(serviceResponse.user),
                deviceData:JSON.stringify(deviceData)
            });


            dispatch(updateUserData({
                serviceToken:serviceResponse["access_token"]
            }));

            dispatch(updateUserSignupState("sherpa_token_request"));
            const {endpoint,version,login_uri} = sherpa;
            console.log(endpoint+version+login_uri);
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
                const {email,id,fullName,profilePicture,profile,username} = sherpaResponse.user;
                dispatch(updateUserSignupState("sherpa_token_complete"));
                dispatch(updateUserData({
                    sherpaID:id,
                    serviceID:profile,
                    sherpaToken:sherpaResponse.token,
                    jobID:sherpaResponse.jobId,
                    email,
                    fullName,
                    username,
                    profilePicture
                }));
                dispatch(storeUser());
            })
        }
    };
}