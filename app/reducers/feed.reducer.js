import * as types from '../constants/feed.actiontypes';

const initialState={
    trips:{},
    userTrips:{},
    searchResults:{},
    suitcaseDestinations:{},
    userTripsPage:1,
    feedState:"none",
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
            if(action.feedData.type!='search'){
                var cleanTrips=[];
                for(var index in action.feedData.trips){
                    var moments=action.feedData.trips[index].moments;
                    var name=action.feedData.trips[index].name;
                    if(name.indexOf("Trip to ")>-1)action.feedData.trips[index].name= name.split("Trip to ")[1];
                    if(moments.length>0){
                        action.feedData.trips[index].moments=[];
                        for(var i=0;i<moments.length;i++){
                            if(moments[i].type==='image')action.feedData.trips[index].moments.push(moments[i]);
                        }
                        if(moments[0].type==='image')cleanTrips.push(action.feedData.trips[index]);
                    }
                }
                var newPage={};
                newPage[action.feedData.page]=cleanTrips || state.trips;
                var newTrips=Object.assign({},{},newPage);
                newTrips['country']=newTrips['name'];
            }else{
                var cleanMoments=[];
                    var moments=action.feedData.trips;
                    if(moments.length>0){
                        for(var i=0;i<moments.length;i++){
                            if(moments[i].type==='image')cleanMoments.push(moments[i]);
                        }
                    }
                var newPage={};
                newPage[action.feedData.page]=cleanMoments || state.trips;
                var newTrips=Object.assign({},{},newPage);
                newTrips['country']=newTrips['name'];
            }





            switch(action.feedData.type) {
                case "user":
                    var newStatestate = Object.assign({}, state, {
                        userTrips:newTrips,
                        feedState:"ready"
                    });
                    return newStatestate;
                break;
                case "search":
                    return Object.assign({}, state, {
                        searchResults:newTrips,
                        feedState:"ready"
                    });
                break;
                case "suitcase":
                    return Object.assign({}, state, {
                        suitcaseDestinations:newTrips,
                        feedState:"ready"
                    });
                break;
                case "profile":
                    return Object.assign({}, state, {
                        profileTrips:newTrips,
                        feedState:"ready"
                    });
                break;
                default:
                    return Object.assign({}, state, {
                        trips:newTrips,
                        feedState:"ready"
                    });
                break;
            }
        break;
        case types.UPDATE_FEED_PAGE:
            switch(action.feedType){
                case "user":
                    return Object.assign({}, state, {
                        userTripsPage:action.feedPage || state.userTripsPage
                    });
                break;
                default:
                    return Object.assign({}, state, {
                        feedPage: action.feedPage || state.feedPage
                    });
                break;
            }
        break;
        case types.UPDATE_FEED_STATE:
            return Object.assign({}, state, {
                feedState:action.feedState || state.feedState
            });
        break;
    }
    return state;
}