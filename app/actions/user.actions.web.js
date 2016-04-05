import {getQueryString,encodeQueryData} from '../utils/query.utils';
import config from '../data/config';
import * as types from '../constants/user.actiontypes'
import IG from '../utils/ig'
const {instagram,sherpa}=config.auth[config.environment];
const SHERPA="SHERPA";
const INSTAGRAM="INSTAGRAM";
let dispatcher;
export function updateUserSignupState(signupState){
    return {
        type:types.USER_SIGNUP_UPDATE_STATE,
        signupState
    };
}

//https://www.instagram.com/oauth/authorize/?response_type=code&client_id=6c93234fa3544a6592b382a0a814e555&redirect_uri=http://web.trysherpa.com/auth

export function signupUser(){
    return function (dispatch,getState) {
        const { userReducer } = getState();

        instagramAuthRequest();
        dispatch(updateUserSignupState("start"));

        function instagramAuthRequest(){
            const {endpoint, code_uri, response_type_web, client_id, redirect_uri_web} = instagram;
            const queryData = encodeQueryData({response_type:response_type_web, client_id, redirect_uri:redirect_uri_web});
            dispatch(updateUserSignupState("service_code_request"));
            //LinkingIOS.openURL(endpoint+code_uri + "/?" +queryData);
            //LinkingIOS.addEventListener('url', instagramAuthCallback);

            //fetch(endpoint+code_uri + "/?" +queryData,{
            //    method:'post'
            //}).then((rawInstagramResponse)=>{
            //    console.log(rawInstagramResponse);
            //})

            console.log(endpoint+code_uri+"/?"+queryData);
        }


        function signupWithSherpa(serviceResponse){
            dispatch(updateUserSignupState("service_token_complete"));

            let deviceData={
                deviceSource:'web'
                //deviceUniqueId:     DeviceInfo.getUniqueID(),
                //deviceManufacturer: DeviceInfo.getManufacturer(),
                //deviceModel:        DeviceInfo.getModel(),
                //deviceName:         DeviceInfo.getSystemName(),
                //deviceVersion:      DeviceInfo.getSystemVersion(),
                //bundleId:           DeviceInfo.getBundleId(),
                //buildNumber:        DeviceInfo.getBuildNumber(),
                //appVersion:         DeviceInfo.getVersion(),
                //appVersionReadable: DeviceInfo.getReadableVersion()
            };


            const queryData = encodeQueryData({
                email:userReducer.email,
                inviteCode:userReducer.inviteCode,
                service:userReducer.service,
                token:serviceResponse["access_token"],
                serviceData:JSON.stringify(serviceResponse.user),
                deviceData:JSON.stringify(deviceData)
            });

            console.log({
                email:userReducer.email,
                inviteCode:userReducer.inviteCode,
                service:userReducer.service,
                token:serviceResponse["access_token"],
                serviceData:JSON.stringify(serviceResponse.user),
                deviceData:JSON.stringify(deviceData)
            })




            dispatch(updateUserData({
                serviceToken:serviceResponse["access_token"]
            }));

            dispatch(updateUserSignupState("sherpa_token_request"));
            const {endpoint,version,login_uri} = sherpa;
            fetch(endpoint+version+login_uri,{
                method:'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body:queryData
            })
            .then((rawSherpaResponse)=>{return rawSherpaResponse.text()})
            .then((rawSherpaResponse)=>{
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