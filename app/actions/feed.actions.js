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
            let searchBody=undefined;

            const {endpoint,version,feed_uri,user_uri} = sherpa;
            let feedRequestURI;
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


            let sherpaResponse;
            let sherpaHeaders = new Headers();
            sherpaHeaders.append("token", sherpaToken);
            sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");



            let reqBody=searchBody?{
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
                let sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                const {endpoint,version} = sherpa;
                let requestURI = endpoint + version + "/moment/"+momentID;


                let reqBody = {
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

                let searchBody = undefined;
                const {endpoint,version,feed_uri,user_uri} = sherpa;
                let feedRequestURI;
                switch (type) {
                    case "location":
                        feedRequestURI = endpoint + version + "/search";
                        searchBody = query;
                    break;
                    case "map-search":
                        feedRequestURI = endpoint + version + "/search/bbox";
                        searchBody = query
                    break;
                    case "profile":
                        feedRequestURI = endpoint + version + "/profile/" + query + "/trips?page=" + page;
                        break;
                    case "featured-profiles":
                        feedRequestURI = endpoint + version + "/profiles/featured";
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
                    case "search-places-v2":
                        feedRequestURI = endpoint + "v2" + "/search?layer="+query.layer+"&source="+query.source+"&source_id="+query.source_id+"&page="+page;
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

                let sherpaHeaders = new Headers();
                let finalToken=user?user.sherpaToken:sherpaToken;
                let reqBody;
                //console.log(feedRequestURI);

                sherpaHeaders.append("token", finalToken);
                switch(type){
                    case 'map-search':
                        sherpaHeaders.append("Content-Type", "application/json");
                        reqBody={
                            method: 'post',
                            headers: sherpaHeaders,
                            body: JSON.stringify(searchBody)
                        }
                    break;
                    case 'location':
                    case 'search-places':
                        sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                        reqBody={
                            method: 'post',
                            headers: sherpaHeaders,
                            body: encodeQueryData(searchBody)
                        }

                    break;
                    default:
                        reqBody={
                            method: 'get',
                            headers: sherpaHeaders
                        }

                }

                //console.log(type,'::feed req uri',feedRequestURI,':: feed req body',reqBody,':: query',query);



                fetch(feedRequestURI, reqBody)
                    .then((rawSherpaResponse)=> {
                        //console.log('raw response',rawSherpaResponse)
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
                        //console.log(rawSherpaResponseFinal)
                        let parsedResponse=JSON.parse(rawSherpaResponseFinal);
                        let trips = parsedResponse.trips;
                        //console.log('final response',type,"::",parsedResponse)
                        switch(type){
                            case "user":
                            case "moment":
                            case "trip":
                            case "location":
                            case "featured-profiles":
                            case "profile":
                            case "map-search":
                                fulfill({data:parsedResponse, page, type});
                            break;


                            case "suitcase-list":
                            case "single-suitcase-feed":
                            case "feed":
                                let cleanTrips=[];
                                for(let index in trips){
                                    let moments=trips[index].moments.reverse();
                                    let name=trips[index].name;
                                    if(name.indexOf("Trip to ")>-1)trips[index].name= name.split("Trip to ")[1];
                                    if(moments.length>0){
                                        trips[index].moments=[];
                                        for(let i=0;i<moments.length;i++){
                                            if(moments[i].type==='image')trips[index].moments.push(moments[i]);
                                        }
                                        cleanTrips.push(trips[index]);
                                    }
                                }


                                fulfill({trips:cleanTrips, page, type});
                            break;
                            case "search":
                            case "search-places":
                            case "search-places-v2":
                            case "search-people":
                            case "location-search":
                                let cleanMoments=[];
                                let moments=parsedResponse;
                                if(moments.length>0){
                                    for(let i=0;i<moments.length;i++){
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