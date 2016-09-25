import * as types from '../constants/feed.actiontypes'
import config from '../data/config';
const {sherpa}=config.auth[config.environment];
const {parser}=config.settings;
import {getQueryString,encodeQueryData} from '../utils/query.utils';
import store from 'react-native-simple-store';
import {updateUserDBState} from "./user.actions"
import {reduxStore} from '../../index.ios'

export function loadFeed(feedTarget,sherpaToken,page=1,type='user',data={}) {
    return function (dispatch, getState) {
            dispatch(udpateFeedState('fetch'));
            dispatch(updateFeedPage(page,type));
            var searchBody=undefined;

            const {endpoint,version,feed_uri,user_uri} = sherpa;
            var feedRequestURI;
            switch(type){
                case "location":
                    feedRequestURI=endpoint+version+"/search";
                    searchBody=feedTarget;
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
                    searchBody=feedTarget;
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
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");



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
                        return rawSherpaResponse.text();
                    break;
                    case 400:
                        return '{}';
                    break;
                    case 401:
                        store.delete('user').then(()=>{
                            dispatch(updateUserDBState("empty"));
                        })
                    break;
                }
            })
            .then((rawSherpaResponseFinal)=>{
                if(!rawSherpaResponseFinal)return;
                sherpaResponse=JSON.parse(rawSherpaResponseFinal);
                switch(type){
                    case "user":
                        dispatch(udpateFeed({trips:sherpaResponse.trips,page:page,type}));
                    break;
                    case "search-places":
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type:"search"}));
                    break;
                    case "location":
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type:"location-search"}));
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

export function deleteMoment(momentID){
        return new Promise((fulfill,reject)=> {
            store.get('user').then((user) => {
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                const {endpoint,version} = sherpa;
                var requestURI = endpoint + version + "/moment/"+momentID;


                var reqBody = {
                    method: 'delete',
                    headers: sherpaHeaders,
                    body: encodeQueryData({reason: "image-not-found"})
                };


                fetch(requestURI, reqBody)
                    .then((rawSherpaResponse)=> {
                        switch (rawSherpaResponse.status) {
                            case 200:
                                return rawSherpaResponse.text()
                                break;
                            case 400:
                                return '{}';
                            break;
                            case 401:
                                store.delete('user').then(()=>{
                                    reduxStore.dispatch(updateUserDBState("empty"));
                                })
                            break;
                        }
                    })
                    .then((response)=> {
                        fulfill();
                    }).catch((err)=>reject(err))
            })
        })
}

export function getFeed(query,page=1,type='') {
        return new Promise((fulfill,reject)=>{
            store.get('user').then((user) => {

                var searchBody = undefined;
                const {endpoint,version,feed_uri,user_uri} = sherpa;
                var feedRequestURI;
                switch (type) {
                    case "location":
                        feedRequestURI = endpoint + version + "/search";
                        searchBody = query;
                        break;
                    case "profile":
                        feedRequestURI = endpoint + version + "/profile/" + query + "/trips?page=" + page;
                        break;
                    case "suitcase-list":
                        feedRequestURI = endpoint + version + "/user/" + query + "/suitcases?page=" + page;
                        break;
                    case "single-suitcase-feed":
                        feedRequestURI = endpoint + version + "/suitcase/" + query;
                        break;
                    case "search-places":
                        feedRequestURI = endpoint + version + "/search";
                        searchBody = query;
                        break;
                    case "search-people":
                        feedRequestURI = endpoint + version + "/search/users?text=" + query;
                        break;
                    case "user":
                        feedRequestURI = endpoint + version + user_uri + "/" + query;
                    break;
                    case "moment":
                        feedRequestURI=endpoint+version+"/moment/"+query;
                    break;
                    case "trip":
                        feedRequestURI=endpoint+version+"/trip/"+query;
                    break;
                    case "feed":
                    default:
                        feedRequestURI = endpoint + version + user_uri + "/" + query + feed_uri + "?page=" + page;
                    break;
                }

                var sherpaHeaders = new Headers();
                var finalToken=user?user.sherpaToken:sherpaToken;
                sherpaHeaders.append("token", finalToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                var reqBody = searchBody ? {
                    method: 'post',
                    headers: sherpaHeaders,
                    body: encodeQueryData(searchBody)
                } : {
                    method: 'get',
                    headers: sherpaHeaders
                };



                fetch(feedRequestURI, reqBody)
                    .then((rawSherpaResponse)=> {
                        switch (rawSherpaResponse.status) {
                            case 200:
                                return rawSherpaResponse.text()
                                break;
                            case 400:
                                return '{}';
                            break;
                            case 401:
                                store.delete('user').then(()=>{
                                    reduxStore.dispatch(updateUserDBState("empty"));
                                });
                            break;
                        }
                    })
                    .then((rawSherpaResponseFinal)=> {
                        if (!rawSherpaResponseFinal)return;
                        var parsedResponse=JSON.parse(rawSherpaResponseFinal);
                        var trips = parsedResponse.trips;
                        switch(type){
                            case "user":
                            case "moment":
                            case "trip":
                            case "location":
                                fulfill({data:parsedResponse, page, type});
                            break;

                            case "profile":
                            case "suitcase-list":
                            case "single-suitcase-feed":
                            case "feed":
                                var cleanTrips=[];
                                for(var index in trips){
                                    var moments=trips[index].moments.reverse();
                                    var name=trips[index].name;
                                    if(name.indexOf("Trip to ")>-1)trips[index].name= name.split("Trip to ")[1];
                                    if(moments.length>0){
                                        trips[index].moments=[];
                                        for(var i=0;i<moments.length;i++){
                                            if(moments[i].type==='image')trips[index].moments.push(moments[i]);
                                        }
                                        cleanTrips.push(trips[index]);
                                    }
                                }

                                fulfill({trips:cleanTrips, page, type});
                            break;
                            case "search":
                            case "search-places":
                            case "search-people":
                            case "location-search":
                                var cleanMoments=[];
                                var moments=parsedResponse;
                                if(moments.length>0){
                                    for(var i=0;i<moments.length;i++){
                                        if(moments[i].type==='image')cleanMoments.push(moments[i]);
                                    }
                                }

                                fulfill({moments:cleanMoments, page, type});
                            break;

                        }
                    }).catch((err)=>console.log(err))
            })
    });
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