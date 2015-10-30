import * as types from '../constants/feed.actiontypes';

const initialState={
    trips:[],
    feedState:"none",
    jobState:"none",
    jobProgress:0
};

export default function userReducer(state=initialState,action){
    switch(action.type){
        case types.UPDATE_FEED:
            return Object.assign({}, state, {
                trips:action.feedData.trips || state.trips
            });
        break;
        case types.UPDATE_FEED_STATE:
            return Object.assign({}, state, {
                feedState:action.feedState || state.feedState
            });
        break;
        case types.UPDATE_JOB_STATE:
            return Object.assign({}, state, {
                jobState:action.jobState || state.jobState
            });
        break;
        case types.UPDATE_JOB_PROGRESS:
            return Object.assign({}, state, {
                jobProgress:action.jobProgress || state.jobProgress
            });
        break;
    }

    return state;
}