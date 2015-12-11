import * as types from '../constants/feed.actiontypes';

const initialState={
    trips:{},
    feedState:"none",
    jobState:"none",
    jobProgress:0,
    feedPage:1
};

export default function feedReducer(state=initialState,action){
    switch(action.type){
        case types.CLEAR_FEED:
            return Object.assign({}, state, {
                trips:{}
            });
        break;
        case types.UPDATE_FEED:
            //TODO: Quick fix, move into actions later
            var cleanTrips=[];

            for(var index in action.feedData.trips){
                if(action.feedData.trips[index].moments.length>0){
                    cleanTrips.push(action.feedData.trips[index]);
                }
            }


            var newPage={};
            newPage[action.feedData.page]=cleanTrips || state.trips;

            var newTrips=Object.assign({},state.trips,newPage);
            console.log("update with new trips")
            return Object.assign({}, state, {
                trips:newTrips,
                feedState:"ready"
            });
        break;
        case types.UPDATE_FEED_PAGE:
            return Object.assign({}, state, {
                feedPage:action.feedPage || state.feedPage
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

    console.log("state updated");
    return state;
}