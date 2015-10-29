import * as types from '../constants/feed.actiontypes'
import config from '../data/config';
const {sherpa}=config.auth;


export function loadFeed(userID,sherpaToken) {
    return function (dispatch, getState) {
        dispatch(udpateFeedState('request'));

        const {endpoint,version,feed_uri,user_uri} = sherpa;
        console.log('url::',endpoint+version+user_uri+"/"+userID+feed_uri);
        fetch(endpoint+version+user_uri+"/"+userID+feed_uri,{
            method:'get'
        }).then((rawSherpaResponse)=>{
            var sherpaResponse=JSON.parse(rawSherpaResponse._bodyText);
            dispatch(udpateFeedState('complete'));
            dispatch(udpateFeed({trips:sherpaResponse}));
            dispatch(udpateFeedState('ready'));
        });

        console.log(":: update feed state ::");
    }
}

export function udpateFeedState(feedState){
    return{
        type:types.UPDATE_FEED_STATE,
        feedState
    }
}

export function udpateFeed(feedData){
    return{
        type:types.UPDATE_FEED,
        feedData
    }
}