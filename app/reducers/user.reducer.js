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
    usedAddTrip:false
};

export default function userReducer(state=initialState,action){
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
                website:            action.userData.website || state.website,
                serviceToken:       action.userData.serviceToken || state.serviceToken,
                sherpaToken:        action.userData.sherpaToken || state.sherpaToken,
                inviteCode:         action.userData.inviteCode || state.inviteCode,
                username:           action.userData.username || state.username,
                jobID:              action.userData.jobID || state.jobID,
                hometown:           action.userData.hometown == undefined ? state.hometown:action.userData.hometown,
                whiteListed:        action.userData.whiteListed == undefined ?state.whiteListed:action.userData.whiteListed,
                isExistingLogin:    action.userData.isExistingLogin == undefined ?state.isExistingLogin:action.userData.isExistingLogin,
                serviceObject:      action.userData.serviceObject || state.serviceObject,
                notificationToken:  action.userData.notificationToken || state.notificationToken,
                allowScrape:        action.userData.allowScrape || state.allowScrape,
                userContactSettings: action.userData.userContactSettings || state.userContactSettings,
                allContactSettings: action.userData.allContactSettings || state.allContactSettings,
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