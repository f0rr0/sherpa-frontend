import * as types from '../constants/feed.actiontypes';

const initialState={
    trips:[],
    feedState:"none"
};

export default function userReducer(state=initialState,action){
    switch(action.type){
        case types.UPDATE_FEED:
            console.log('actoin',action.feedData)
            return Object.assign({}, state, {
                trips:action.feedData.trips || state.trips
            });
        break;
        case types.UPDATE_FEED_STATE:
            return Object.assign({}, state, {
                feedState:action.feedState || state.feedState
            });
        break;
    }

    return state;
}