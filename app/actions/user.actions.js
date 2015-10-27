import {getQueryString,encodeQueryData} from '../utils/query.utils';
import config from '../data/config';
import DeviceInfo from 'react-native-device-info/deviceinfo';
import * as types from '../constants/user.actiontypes'
import store from 'react-native-simple-store';
import React, { LinkingIOS } from 'react-native';
const {instagram,sherpa}=config.auth;
const SHERPA="SHERPA";
const INSTAGRAM="INSTAGRAM";
let dispatcher;

/**
 * Update User Data
 */

export function updateUserData(userData){
    return{
        type:types.USER_UPDATE,
        userData
    }
}

export function updateUserSignup(signupState){
    return {
        type:types.USER_SIGNUP_UPDATE,
        signupState
    };
}
export function updateUserDBState(userDBState){
    return {
        type:types.USER_DB_UPDATE,
        userDBState
    };
}

export function loadUser() {
    return function (dispatch, getState) {
        dispatch(updateUserDBState("process"));
        return store.get('user').then((user) => {
            if(user){
                dispatch(updateUserData(user));
                dispatch(updateUserDBState("available"));
            }else{
                console.log('user empty');
                dispatch(updateUserDBState("empty"));
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
        })
    }
}

export function signupUser(){
    return function (dispatch,getState) {
        const { userReducer } = getState();

        instagramAuthRequest();
        dispatch(updateUserSignup("start"));

        function instagramAuthRequest(){
            const {endpoint, code_uri, response_type, client_id, redirect_uri} = instagram;
            const queryData = encodeQueryData({response_type, client_id, redirect_uri});

            dispatch(updateUserSignup("service_code_request"));

            LinkingIOS.openURL(endpoint+code_uri + "/?" +queryData);
            LinkingIOS.addEventListener('url', instagramAuthCallback);

        }

        function instagramAuthCallback(event) {

            dispatch(updateUserSignup("service_code_complete"));


            const {endpoint, token_uri, grant_type, client_secret, client_id, redirect_uri} = instagram;
            LinkingIOS.removeEventListener('url', instagramAuthCallback);

            let code = getQueryString("code", event.url);
            const queryData = encodeQueryData({client_id, client_secret, grant_type, redirect_uri, code});

            dispatch(updateUserSignup("service_token_request"));

            fetch(endpoint+token_uri, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            }).then((rawServiceResponse)=>signupWithSherpa(JSON.parse(rawServiceResponse._bodyText)));
        }

        function signupWithSherpa(serviceResponse){
            dispatch(updateUserSignup("service_token_complete"));

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

            dispatch(updateUserSignup("sherpa_token_request"));
            const {endpoint,version,login_uri} = sherpa;

            fetch(endpoint+version+login_uri,{
                method:'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            }).then((rawSherpaResponse)=>{
                console.log(rawSherpaResponse);
                let sherpaResponse=JSON.parse(rawSherpaResponse._bodyText);
                const {email,id,fullName,profilePicture,profile,username} = sherpaResponse.user;
                dispatch(updateUserSignup("sherpa_token_complete"));
                dispatch(updateUserData({
                    sherpaID:id,
                    serviceID:profile,
                    sherpaToken:sherpaResponse.token,
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