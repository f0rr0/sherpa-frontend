import * as types from '../constants/feed.actiontypes'
import config from '../data/config';
const {sherpa}=config.auth[config.environment];
const {parser}=config.settings;

export function loadFeed(feedTarget,sherpaToken,page=1,type='user') {
    return function (dispatch, getState) {
        dispatch(udpateFeedState('fetch'));
        dispatch(updateFeedPage(page,type));

        const {endpoint,version,feed_uri,user_uri} = sherpa;
        var feedRequestURI;

        switch(type){
            case "location":
                feedRequestURI=endpoint+version+"/location/"+feedTarget+"?page="+page;
            break;
            case "profile":
                feedRequestURI=endpoint+version+"/profile/"+feedTarget+"/trips?page="+page;
            break;
            case "suitcase-list":
                feedRequestURI=endpoint+version+"/user/"+feedTarget+"/suitcases?page="+page;
            break;
            case "single-suitcase-feed":
                feedRequestURI=endpoint+version+"/suitcase/"+feedTarget;
            break;
            case "search-user":
                feedRequestURI=endpoint+version+"/search/trips?text="+feedTarget;
            break;
            case "search-trip":
                feedRequestURI=endpoint+version+"/search/users?text="+feedTarget;
            break;
            case "user":
            default:
                feedRequestURI=endpoint+version+user_uri+"/"+feedTarget+feed_uri+"?page="+page;
            break;
        }



            fetch(feedRequestURI,{
                method:'get'
            })
            .then((rawSherpaResponse)=>{return rawSherpaResponse.text()})
            .then((rawSherpaResponse)=>{
            var sherpaResponse=JSON.parse(rawSherpaResponse);
            if(type==="user"){
                console.log('sherpa response trips',sherpaResponse.trips);
                dispatch(udpateFeed({trips:sherpaResponse.trips,page:page,type}));
            }else{
                dispatch(udpateFeed({trips:sherpaResponse,page:page,type}));
            }
            dispatch(udpateFeedState('fetch'));
        });
    }
}

export function udpateFeedState(feedState){
    return{
        type:types.UPDATE_FEED_STATE,
        feedState
    }
}

export function clearFeed(feedState){
    return{
        type:types.CLEAR_FEED,
        feedState
    }
}

export function updateFeedPage(feedPage,feedType){
    return{
        type:types.UPDATE_FEED_PAGE,
        feedPage,
        feedType
    }
}

export function udpateFeed(feedData){
    return{
        type:types.UPDATE_FEED,
        feedData
    }
}