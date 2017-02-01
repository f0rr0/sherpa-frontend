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
import SafariView from "react-native-safari-view";


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
                console.log('added to suitcase')

            }).catch(err=>console.log(err));
        }
    });
}

export function checkSuitcased(momentID){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                fetch(endpoint + version + "/moment/" + momentID + "/suitcasedby/" + user.sherpaID, {
                    method: 'get',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    fulfill(response);
                }).catch(err=>reject(err));
            }
        });
    })
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
                    console.log('successfully removed moment suitcase',response);
            }).catch(err=>console.log(err));
        }
    });
}


export function addNotificationsDeviceToken(deviceToken,sherpaToken){
    return function (dispatch, getState) {
        return store.get('user').then((user) => {
            //if (user) {
                dispatch(updateUserData({notificationToken:deviceToken}));

                const {endpoint,version,user_uri} = sherpa;
                let token=user?user.sherpaToken:sherpaToken;

                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", token);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/user/adddevicetoken/" + token + "/" + deviceToken, {
                    method: 'post',
                    headers: sherpaHeaders
                })
                .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    if(!sherpaToken)dispatch(updateUserDBState("available-existing"));

                }).catch(err=>console.log('device token err',err));
            //}
        });
    }
}

export function resetProfile(){
    return function (dispatch, getState) {
        store.get('user').then((user) => {
            const {endpoint,version} = sherpa;
            let feedRequestURI;
            feedRequestURI = endpoint + version + "/profile/" + user.serviceID + "/reset";
            let sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);

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
        })
    }
}

export function deleteUser(){
    return function (dispatch, getState) {
        store.get('user').then((user) => {

            if (user) {
                const {endpoint,version,user_uri} = sherpa;



                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/user/" + user.sherpaID, {
                    method: 'delete',
                    headers: sherpaHeaders
                })
                .then((rawServiceResponse)=> {
                    return rawServiceResponse.text();
                }).then((response)=> {
                    store.delete('user').then(()=> {
                        dispatch(updateUserDBState("empty"));
                    })
                }).catch(err=>console.log('device token err',err));
            }
            dispatch(updateUserDBState("empty"));
        })
    }
}

export function logoutUser(){
    return function (dispatch, getState) {
        store.delete('user').then(()=> {
            dispatch(updateUserData({
                whiteListed:false
            }));
            dispatch(updateUserDBState("empty"));
        })
    }
}

export function setUserData(userdata) {
    return function (dispatch, getState) {
        return store.get('user').then(user => {
            if (!user) return Promise.reject(new Error('No user'));
            const {endpoint, version } = sherpa;

            let sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            return fetch(endpoint + version + "/user/" + user.sherpaID + "/update", {
                method: 'patch',
                headers: sherpaHeaders,
                body: encodeQueryData(userdata)
            }).then(response => {
                if (!response.ok) Promise.reject(new Error(response.statusText));
                // Only update the field that changed - no need to update the whole user object
                dispatch(updateUserData(userdata));
            }).catch(err => console.log("Error updating user", err));
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
        //dispatch(updateUserDBState("process"));
        return store.get('user').then((user) => {
        //
            if(user&&!config.resetUser) {
                //setTimeout(()=>{
                    dispatch(updateUserDBState("available-existing"));
                    dispatch(updateUserData(user));
                //},800)
            }else{
                store.delete('user').then(()=>{
                    dispatch(updateUserDBState("empty"));
                })
            }
        //        var responseStatus=400;
        //        const {endpoint,version,user_uri} = sherpa;
        //        var sherpaHeaders = new Headers();
        //        sherpaHeaders.append("token", user.sherpaToken);
        //
        //        fetch(endpoint+version+user_uri+"/"+user.sherpaID,{
        //            method:'get',
        //            headers:sherpaHeaders
        //        }).
        //        then((rawServiceResponse)=>{
        //            responseStatus=rawServiceResponse.status;
        //            return rawServiceResponse.text();
        //        }).then((rawSherpaResponse)=>{
        //            switch(responseStatus){
        //
        //                case 200:
        //                    var responseJSON = JSON.parse(rawSherpaResponse);
        //                    dispatch(updateUserData({
        //                        serviceObject:responseJSON,
        //                        profileID:responseJSON.profile.id,
        //                        profilePicture:responseJSON.profile.serviceProfilePicture,
        //                        bio:responseJSON.profile.serviceBio,
        //                        allowScrape: responseJSON.allowScrape,
        //                        userContactSettings: responseJSON.contactSettings,
        //                        allContactSettings: responseJSON.allContactSettings,
        //                    }));
        //
        //                    if(!user.whiteListed){
        //                        dispatch(updateUserDBState("empty"));
        //                    }else if(user.username===responseJSON.username) {
        //                        dispatch(updateUserDBState("available-existing"));
        //                    }else{
        //                        dispatch(updateUserDBState("empty"));
        //                    }
        //
        //                    dispatch(storeUser());
        //                break;
        //                case 400:
        //                case 401:
        //                case 500:
        //                case 506:
        //                    store.delete('user').then(()=>{
        //                        dispatch(updateUserDBState("empty"));
        //                    })
        //                break;
        //            }
        //        }).catch((err)=>{
        //            store.delete('user').then(()=>{
        //                dispatch(updateUserDBState("empty"));
        //            })
        //        });
        //    }else{
        //        store.delete('user').then(()=>{
        //            dispatch(updateUserDBState("empty"));
        //        })
        //    }
        });
    }
}

export function storeUser() {
    return function (dispatch, getState) {
        dispatch(updateUserDBState("process"));
        const { userReducer } = getState();
        store.save('user', userReducer);
    }
}

export function signupUser(){
    return function (dispatch,getState) {
        const { userReducer } = getState();

        instagramAuthRequest();
        dispatch(updateUserSignupState("start"));
        //signupWithSherpa("184267603.610a4a6.9c1223178abf473b9ea5e2f444452c82",JSON.parse('{"bio": "tech director & co-founder at WILD living in vienna / austria","full_name": "Thomas Ragger","username": "ragmaen","counts": {"media": 159,"follows": 299,"followed_by": 311},"profile_picture": "https://scontent.cdninstagram.com/t51.2885-19/s150x150/14276504_1820927734817780_537359030_a.jpg","id":"184267603","website": "http://www.wild.as"}'));


        function instagramAuthRequest(){
            const {endpoint, code_uri, response_type, client_id, redirect_uri} = instagram;
            const queryData = encodeQueryData({response_type, client_id, redirect_uri});

            dispatch(updateUserSignupState("service_code_request"));
            SafariView.isAvailable()
                .then(()=>{
                    SafariView.show({
                        url: endpoint+code_uri + "/?" +queryData
                    });

                    SafariView.addEventListener(
                        "onDismiss",
                        updateState
                    );

                    SafariView.addEventListener(
                        "onCode",
                        instagramAuthCallback
                    );
                })
                .catch(error => {
                    instagramSimpleAuthWithWebview();
                });

        }

        function updateState(){
            dispatch(updateUserDBState("empty"))
        }

        function instagramAuthCallback(event) {
            SafariView.removeEventListener("onDismiss",updateState);
            dispatch(updateUserSignupState("service_code_complete"));

            const {endpoint, token_uri, grant_type, client_secret, client_id, redirect_uri} = instagram;
            SafariView.removeEventListener('onCode', instagramAuthCallback);

            let code = event.code;
            const queryData = encodeQueryData({client_id, client_secret, grant_type, redirect_uri, code});
            //console.log({client_id, client_secret, grant_type, redirect_uri, code})
            dispatch(updateUserSignupState("service_token_request"));

            fetch(endpoint+token_uri, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            }).then((rawServiceResponse)=>{
                return rawServiceResponse.text();
            }).then((rawSherpaResponse)=>{
                //console.log('raw sherpa response',rawSherpaResponse)
                var info=JSON.parse(rawSherpaResponse);
                signupWithSherpa(info.access_token,info.user);
            }).catch(error => {
                dispatch(updateUserDBState("empty"));
            });
        }

        function instagramSimpleAuthWithWebview(){
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



            let queryObject={
                email:userReducer.email,
                intent:userReducer.intent,
                service:userReducer.service,
                token:instagramToken,
                serviceData:JSON.stringify(userData),
                deviceData:JSON.stringify(deviceData)
            }

            if(userReducer.inviteCode.length>0)queryObject.inviteCode=userReducer.inviteCode;
            const queryData = encodeQueryData(queryObject);


            //console.log({
            //    email:userReducer.email,
            //    inviteCode:userReducer.inviteCode,
            //    intent:userReducer.intent,
            //    service:userReducer.service,
            //    token:instagramToken,
            //    serviceData:JSON.stringify(userData),
            //    deviceData:JSON.stringify(deviceData)
            //})

            dispatch(updateUserData({
                serviceToken:instagramToken
            }));

            dispatch(updateUserSignupState("sherpa_token_request"));
            const {endpoint,version,login_uri} = sherpa;
            //console.log(endpoint+version+login_uri,'login uri')
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
                //console.log('sherpa response',sherpaResponse)
                const {email,id,fullName,profilePicture,profile,username,hometown, contactSettings} = sherpaResponse.user;

                dispatch(updateUserData({
                    sherpaID:id,
                    serviceID:profile,
                    profileID:profile,
                    sherpaToken:sherpaResponse.token,
                    jobID:sherpaResponse.jobId,
                    email,
                    fullName,
                    bio:userData.bio,
                    website:userData.website,
                    invite:sherpaResponse.invitation,
                    profilePicture:userData.profile_picture,
                    username,
                    hometown,
                    serviceObject:userData,
                    whiteListed:sherpaResponse.whitelisted,
                    allowScrape: sherpaResponse.allowScrape,
                    userContactSettings: contactSettings,
                    allContactSettings: sherpaResponse.allContactSettings
                }));

                dispatch(storeUser());
                //console.log(sherpaResponse," invite resposne")
                if(
                    //!sherpaResponse.whitelisted&&
                    sherpaResponse.invitation=="expired"|| sherpaResponse.invitation=="invalid" || sherpaResponse.invitation=="not-invited"
                ) {
                    store.get('user').then((user) => {
                        //if(user.isExistingLogin){
                            dispatch(updateUserDBState("login-denied"));
                            dispatch(updateUserData({isExistingLogin:false}))
                        //}else{
                        //    dispatch(updateUserDBState("not-whitelisted"));
                        //}
                    })
                }else if(sherpaResponse.invitation=="requested"){
                    dispatch(updateUserDBState("not-whitelisted"));
                }else{
                    dispatch(updateUserSignupState("sherpa_token_complete"));
                    dispatch(updateUserDBState("available-new"));
                }



            }).catch(err=>console.log(err));
        }
    };
}