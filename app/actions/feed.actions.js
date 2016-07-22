import * as types from '../constants/feed.actiontypes'
import config from '../data/config';
const {sherpa}=config.auth[config.environment];
const {parser}=config.settings;
import {getQueryString,encodeQueryData} from '../utils/query.utils';


export function loadFeed(feedTarget,sherpaToken,page=1,type='user') {
    return function (dispatch, getState) {
            dispatch(udpateFeedState('fetch'));
            dispatch(updateFeedPage(page,type));
            var searchBody=undefined;

            const {endpoint,version,feed_uri,user_uri} = sherpa;
            var feedRequestURI;
            switch(type){
                case "location-continent":
                    feedRequestURI=endpoint+version+"/search";
                    searchBody={type:'continent',continent:feedTarget};
                break;
                case "location-country":
                    feedRequestURI=endpoint+version+"/search";
                    searchBody={type:'country',country:feedTarget};
                break;
                case "location":
                    feedRequestURI=endpoint+version+"/search";
                    searchBody={needle:feedTarget.length>0?feedTarget:"----"};
                    //feedRequestURI=endpoint+version+"/location/"+feedTarget+"?page="+page;
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
                case "search-places":
                    feedRequestURI=endpoint+version+"/search";
                    searchBody={needle:feedTarget.length>0?feedTarget:"----"};
                break;
                case "search-people":
                    feedRequestURI=endpoint+version+"/search/users?text="+feedTarget;
                break;
                case "user":
                default:
                    feedRequestURI=endpoint+version+user_uri+"/"+feedTarget+feed_uri+"?page="+page;
                break;
            }



            var sherpaResponse;
            var sherpaHeaders = new Headers();
            sherpaHeaders.append("token", sherpaToken);


            var reqBody=searchBody?{
                method:'post',
                headers:sherpaHeaders,
                body:encodeQueryData(searchBody)
            }:{
                method:'get',
                headers:sherpaHeaders,
            };


            fetch(feedRequestURI,reqBody)
            .then((rawSherpaResponse)=>{
                switch(rawSherpaResponse.status){
                    case 200:
                        return rawSherpaResponse.text()
                    break;
                    case 400:
                        return '{}';
                    break;
                }
            })
            .then((rawSherpaResponseFinal)=>{
                sherpaResponse=JSON.parse(rawSherpaResponseFinal);
                console.log('sherpa response',sherpaResponse)
                switch(type){
                    case "user":
                        dispatch(udpateFeed({trips:sherpaResponse.trips,page:page,type}));
                    break;
                    case "search-people":
                    case "search-places":
                    case "location-continent":
                    case "location-country":
                    case "location":
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type:"search"}));
                    break;
                    case "suitcase-list":
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type:"suitcase"}));
                    break;
                    default:
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type}));
                }
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