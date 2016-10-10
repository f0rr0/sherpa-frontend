import * as types from '../constants/user.actiontypes';

const initialState={
    serviceID:-1,
    sherpaID:-1,
    fullName:"",
    profilePicture:"",
    email:"",
    serviceToken:"",
    sherpaToken:"",
    inviteCode:"xxx",
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
    profileID:-1
};

export default function userReducer(state=initialState,action){
    switch(action.type){
        case types.USER_UPDATE:
            return Object.assign({}, state, {
                serviceID:          action.userData.serviceID || state.serviceID,
                sherpaID:           action.userData.sherpaID || state.sherpaID,
                profileID:          action.userData.profileID || state.profileID,
                fullName:           action.userData.fullName || state.fullName,
                profilePicture:     action.userData.profilePicture || state.profilePicture,
                email:              action.userData.email || state.email,
                serviceToken:       action.userData.serviceToken || state.serviceToken,
                sherpaToken:        action.userData.sherpaToken || state.sherpaToken,
                inviteCode:         action.userData.inviteCode || state.inviteCode,
                username:           action.userData.username || state.username,
                jobID:              action.userData.jobID || state.jobID,
                hometown:           action.userData.hometown || state.hometown,
                whiteListed:        action.userData.whiteListed == undefined ?state.whiteListed:action.userData.whiteListed,
                isExistingLogin:    action.userData.isExistingLogin == undefined ?state.isExistingLogin:action.userData.isExistingLogin,
                serviceObject:      action.userData.serviceObject || state.serviceObject,
                notificationToken:  action.userData.notificationToken || state.notificationToken
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