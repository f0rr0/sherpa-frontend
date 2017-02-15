import * as types from '../constants/user.actiontypes';

const initialState={
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
    initialGeoCount:-1,
    scrapeFromInstagram:false,
    hometownLatitude:undefined,
    hometownLongitude:undefined,
    hometownImage:undefined,
    hometownImageLowRes:undefined,
    mostLikedImage:undefined,
    mostLikedImageLowRes:undefined,
};

export default function userReducer(state=initialState,action){
    //console.log('!! update',action);


    switch(action.type){
        case types.USER_UPDATE:
            return Object.assign({}, state, {
                intent:             action.userData.intent || state.intent,
                usedSuitcase:       action.userData.usedSuitcase || state.usedSuitcase,
                usedAddTrip:        action.userData.usedAddTrip || state.usedAddTrip,
                serviceID:          action.userData.serviceID || state.serviceID,
                sherpaID:           action.userData.sherpaID || state.sherpaID,
                profileID:          action.userData.profileID || state.profileID,
                fullName:           action.userData.fullName || state.fullName,
                profilePicture:     action.userData.profilePicture || state.profilePicture,
                email:              action.userData.email || state.email,
                bio:                action.userData.bio || state.bio,
                invite:             action.userData.invite == undefined? state.invite : action.userData.invite,
                initialGeoCount:    !isNaN(action.userData.initialGeoCount)? action.userData.initialGeoCount : state.initialGeoCount,
                website:            action.userData.website || state.website,
                serviceToken:       action.userData.serviceToken || state.serviceToken,
                sherpaToken:        action.userData.sherpaToken || state.sherpaToken,
                inviteCode:         action.userData.inviteCode || state.inviteCode,
                username:           action.userData.username || state.username,
                jobID:              action.userData.jobID || state.jobID,
                hometown:           action.userData.hometown == undefined ? state.hometown:action.userData.hometown,
                whiteListed:        action.userData.whiteListed == undefined ?state.whiteListed:action.userData.whiteListed,
                scrapeFromInstagram:action.userData.scrapeFromInstagram == undefined ?state.scrapeFromInstagram:action.userData.scrapeFromInstagram,
                isExistingLogin:    action.userData.isExistingLogin == undefined ?state.isExistingLogin:action.userData.isExistingLogin,
                serviceObject:      action.userData.serviceObject || state.serviceObject,
                notificationToken:  action.userData.notificationToken || state.notificationToken,
                allowScrape:        action.userData.allowScrape == undefined ?state.allowScrape:action.userData.allowScrape,
                userContactSettings:action.userData.userContactSettings || state.userContactSettings,
                allContactSettings: action.userData.allContactSettings || state.allContactSettings,
                hometownLatitude:   action.userData.hometownLatitude || state.hometownLatitude,
                hometownLongitude:  action.userData.hometownLongitude || state.hometownLongitude,
                hometownImage:      action.userData.hometownImage || state.hometownImage,
                hometownImageLowRes:action.userData.hometownImageLowRes || state.hometownImageLowRes,
                mostLikedImage:     action.userData.mostLikedImage || state.mostLikedImage,
                mostLikedImageLowRes:action.userData.mostLikedImageLowRes || state.mostLikedImageLowRes
            });

        break;
        case types.USER_SIGNUP_UPDATE_STATE:
            return Object.assign({}, state, {
                signupState:action.signupState || state.signupState
            });
        break;
        case types.USER_DB_UPDATE:
            return Object.assign({}, state, {
                userDBState:action.userDBState || state.userDBState
            });
        break;
    }

    return state;
}