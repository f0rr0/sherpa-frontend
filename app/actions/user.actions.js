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
import {getFeed} from './feed.actions'


/**
 * Update User Data
 */


function makeRequest(type='get',...args){
    //console.log('args',args);
    //console.log('type',type);
    switch(type){
        case 'get':
        break;
        case 'post':
        break;
    }
}

export function updateUserData(userData){
    //console.log('update user data',userData);
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

export function enableScraping(enable){
    return function (dispatch, getState) {
        return store.get('user').then((user) => {
            //console.log('request enable scrape change')
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token",user.sherpaToken);
            const {endpoint,version,user_uri} = sherpa;

            fetch(endpoint + "v1/profile/" +user.serviceID + "/opt-in", {
                method: 'post',
                headers: sherpaHeaders,
                body: JSON.stringify({
                    "value": enable
                })
            }).then((rawServiceResponse)=> {
                return rawServiceResponse.text();
            }).then((rawSherpaResponse)=> {
            //console.log('update reducer enable:: ', rawSherpaResponse)
            });
            dispatch(updateUserData({scrapeFromInstagram: enable}))
        })
    }
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
                //console.log('added to suitcase')

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

export function checkFollowing(followID,type="profile"){
    return new Promise((fulfill,reject)=> {
        return store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/profile/" + user.profileID + "/subscribed/"+type+"/" + followID, {
                    method: 'get',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    fulfill(response=='true')
                }).catch(err=>reject(err));
            }
        });
    })
}


export function checkFollowingLocation(followID){
    return new Promise((fulfill,reject)=> {
        return store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/profile/" + user.profileID + "/subscribed/location/" + followID, {
                    method: 'get',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    fulfill(response=='true')
                }).catch(err=>reject(err));
            }
        });
    })
}



export function checkSubscribing(id,type="location"){
    return new Promise((fulfill,reject)=> {
        return store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/profile/" + user.profileID + "/subscribed/"+type+"/" + id, {
                    method: 'get',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    fulfill(response=='true')
                }).catch(err=>reject(err));
            }
        });
    })
}

export function subscribe(id,type="location"){
    return store.get('user').then((user) => {
        if(user){
            const {endpoint,version,user_uri} = sherpa;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            fetch(endpoint+version+"/profile/"+user.profileID+"/subscribe/"+type+"/"+id, {
                method: 'post',
                headers: sherpaHeaders
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
                //console.log('successfully subscribed',response);
            }).catch(err=>console.log(err));
        }
    });
}

export function unsubscribe(id,type="location"){
    return store.get('user').then((user) => {
        if(user){
            const {endpoint,version,user_uri} = sherpa;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            fetch(endpoint+version+"/profile/"+user.profileID+"/unsubscribe/"+type+"/"+id, {
                method: 'post',
                headers: sherpaHeaders
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
                //console.log('successfully unsubscribed',response);
            }).catch(err=>console.log(err));
        }
    });
}


export function follow(followID){
    return store.get('user').then((user) => {
        if(user){
            const {endpoint,version,user_uri} = sherpa;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            fetch(endpoint+version+"/profile/"+user.profileID+"/subscribe/profile/"+followID, {
                method: 'post',
                headers: sherpaHeaders
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
                //console.log('successfully followed',response);
            }).catch(err=>console.log(err));
        }
    });
}

export function unfollow(followID){
    return store.get('user').then((user) => {
        if(user){
            const {endpoint,version,user_uri} = sherpa;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

            fetch(endpoint+version+"/profile/"+user.profileID+"/unsubscribe/profile/"+followID, {
                method: 'post',
                headers: sherpaHeaders
            })
                .then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
                //console.log('successfully unfollowed',response);
            }).catch(err=>console.log(err));
        }
    });
}


export function getSubscriptions(profileID){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {

            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/profile/" + profileID+"/subscriptions", {
                    method: 'get',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    fulfill(JSON.parse(response));
                }).catch(err=>reject(err));

            }
        });
    })
}

export function getFollowers(profileID){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {

            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/profile/" + profileID+"/followers", {
                    method: 'get',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    fulfill(JSON.parse(response));
                }).catch(err=>reject(err));

            }
        });
    })
}


export function getFollowing(profileID){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {

            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                fetch(endpoint + version + "/profile/" + profileID+"/following", {
                    method: 'get',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    fulfill(JSON.parse(response));
                }).catch(err=>reject(err));

            }
        });
    })
}


export function checkOptedIn(){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {

            if (user) {
                const {endpoint,version,user_uri} = sherpa;
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                fetch(endpoint + version + "/profile/" + user.serviceID+"/opt-in", {
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


export function updateNotificationCount(){
    return function (dispatch, getState) {
        return store.get('user').then((user) => {
            if (user) {
                getFeed(user.sherpaID,1,'notifications').then((response)=>{
                    dispatch(updateUserData({notificationCount:response.data.counts.unviewedCount}))
                    dispatch(storeUser())
                }).catch((err)=>{
                });
            }
        });
    }
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
                    //console.log('successfully removed moment suitcase',response);
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

export function rescrape(){
    return function (dispatch, getState) {
        store.get('user').then((user) => {
            const {endpoint,version} = sherpa;
            let feedRequestURI;
            feedRequestURI = endpoint + version + "/profile/" + user.serviceID + "/scrape";
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
                        break;
                }
            });
        })
    }
}



export function checkToken(){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            const {endpoint,version} = sherpa;
            let feedRequestURI;
            feedRequestURI = endpoint + version + "/profile/" + user.serviceID + "/check-token";
            let sherpaHeaders = new Headers();
            sherpaHeaders.append("token", user.sherpaToken);
            fetch(feedRequestURI, {
                method: 'get',
                headers: sherpaHeaders
            }).then((rawSherpaResponse)=> {
                switch (rawSherpaResponse.status) {
                    case 200:

                        fulfill(rawSherpaResponse.text());
                        break;
                    case 400:
                        reject(rawSherpaResponse.text())
                        break;
                }
            });
        })
    })
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
                        break;
                }
            });
        })
    }
}

export function resetUser(dispatch){
    dispatch(updateUserData({
        serviceID:-1,
        sherpaID:-1,
        fullName:"",
        profilePicture:"",
        email:"noreply@trysherpa.com",
        bio:"",
        website:"",
        serviceToken:"",
        sherpaToken:"",
        inviteCode:"",
        invite:"",
        username:"",
        jobID:"",
        hometown:"",
        serviceObject:"",
        service:"instagram",
        signupState:"",
        userDBState:"none", //none, empty, available,
        whiteListed:false,
        notificationToken:"",
        isExistingLogin:false,
        profileID:-1,
        usedSuitcase:false,
        usedAddTrip:false,
        usedMap:false,
        usedEditTrip:false,
        initialGeoCount:-1,
        scrapeFromInstagram:false,
        hometownLatitude:undefined,
        hometownLongitude:undefined,
        hometownImage:undefined,
        hometownImageLowRes:undefined,
        mostLikedImage:undefined,
        mostLikedImageLowRes:undefined,
    }));

    dispatch(storeUser())
}

export function deleteUser(){
    return function (dispatch, getState) {
        store.get('user').then((user) => {

            if (user) {

                resetUser(dispatch);
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
                    //console.log('delete user resposne',response)
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
        resetUser(dispatch);
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

export function checkUser(){
    return new Promise((fulfill,reject)=> {
        store.get('user').then((user) => {
            //console.log('got user')
            fulfill(user)
        }).catch((err)=>{
            reject(err)
        })
    })
}

export function loadUser() {
    return function (dispatch, getState) {
        return store.get('user').then((user) => {
            if(user&&!config.resetUser) {
                if(user.invited){
                    dispatch(updateUserDBState("available-existing"));
                    dispatch(updateUserData(user));
                }else{
                    dispatch(updateUserDBState("empty"));
                }
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
        const { userReducer } = getState();
        store.save('user', userReducer);
        dispatch(updateUserDBState("process"));
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

            //console.log('hit instagram',endpoint)
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
                //console.log('response',info)
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

            //console.log(userReducer);


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
                const {
                    email,
                    id,
                    fullName,
                    profilePicture,
                    profile,
                    username,
                    hometown,
                    contactSettings,
                    initialGeoCount,
                    hometownLatitude,
                    hometownLongitude,
                    hometownImage,
                    hometownImageLowRes,
                    mostLikedImage,
                    mostLikedImageLowRes,
                    invited
                } = sherpaResponse.user;

                console.log('sherpa response',sherpaResponse)

                dispatch(updateUserData({
                    sherpaID:id,
                    serviceID:profile,
                    profileID:profile,
                    sherpaToken:sherpaResponse.token,
                    jobID:sherpaResponse.jobId,
                    email,
                    fullName,
                    initialGeoCount:0,
                    bio:userData.bio || "",
                    website:userData.website || "",
                    invite:sherpaResponse.invitation,
                    invited,
                    profilePicture:userData.profile_picture,
                    username,
                    hometown:hometown||"",
                    hometownLatitude:hometownLatitude||0,
                    hometownLongitude:hometownLongitude || 0,
                    hometownImage:hometownImage || "use-fallback",
                    hometownImageLowRes:hometownImageLowRes ||  "use-fallback",
                    mostLikedImage: mostLikedImage ||  "use-fallback",
                    mostLikedImageLowRes:mostLikedImageLowRes || "use-fallback",
                    serviceObject:userData,
                    whiteListed:sherpaResponse.whitelisted,
                    allowScrape: sherpaResponse.allowScrape,
                    userContactSettings: contactSettings,
                    allContactSettings: sherpaResponse.allContactSettings
                }));



                dispatch(storeUser());
                if(
                    //!sherpaResponse.whitelisted&&
                    sherpaResponse.invitation=="expired"|| sherpaResponse.invitation=="invalid" || sherpaResponse.invitation=="not-invited"
                ) {
                    store.get('user').then((user) => {
                            dispatch(updateUserDBState("login-denied"));
                            dispatch(updateUserData({isExistingLogin:false}))
                            dispatch(storeUser());
                    })
                }else if(sherpaResponse.invitation=="requested"){
                    dispatch(updateUserDBState("not-whitelisted"));
                    dispatch(storeUser());
                }else{
                    dispatch(updateUserSignupState("sherpa_token_complete"));
                    dispatch(updateUserDBState("available-new"));
                    dispatch(storeUser());
                }



            }).catch(err=>console.log(err));
        }
    };
}