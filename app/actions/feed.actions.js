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
                    feedRequestURI=endpoint+version+"/search/profile/autocomplete"+feedTarget;
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
                        //console.log('suitcase response',sherpaResponse)
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type:"suitcase"}));
                    break;
                    default:
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type}));
                }
        });
    }
}

export function deleteMoment(momentID,instant){
        return new Promise((fulfill,reject)=> {
            store.get('user').then((user) => {
                let sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                const {endpoint,version} = sherpa;
                let requestURI = endpoint + version + "/moment/"+momentID;


                let body={};
                if(!instant)requestURI+="/?reason=image-not-found";

                let reqBody = {
                    method: 'delete',
                    headers: sherpaHeaders,
                    body: encodeQueryData()
                };


                console.log('request delete',reqBody)
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
                        console.log('delete moment response',response)
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
                        feedRequestURI = endpoint + version + "/search";
                        searchBody = query
                    break;
                    case "map-search-v2":
                        feedRequestURI = endpoint + "v2" + "/search?layer="+query.layer+"&source="+query.source+"&sourceId="+query.sourceId+"&page="+query.page+"&bbox="+JSON.stringify(query.bbox);
                    break;
                    case "map-search-profile":
                        feedRequestURI = endpoint + "v1" + "/profile/" + query.profileID + "/map";
                    break;
                    case "map-search-trip":
                        feedRequestURI = endpoint + "v1" + "/trip/" + query.tripID + "/map";
                    break;
                    case "notifications":
                        feedRequestURI = endpoint + version + "/user/" + query +"/notifications?page=" + page;
                    break;
                    case 'reset-notifications':
                        feedRequestURI = endpoint + version + "/user/" + query +"/notifications/view"
                    break;
                    case "map-search-classic":
                        feedRequestURI = endpoint + version + "/search/bbox";
                        searchBody = query
                    break;
                    case "profile":
                        feedRequestURI = endpoint + "v2" + "/profile/" + query + "/trips?page=" + page;
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
                    case "search-user":
                        feedRequestURI = endpoint + version + "/search/profile/autocomplete";
                    break;
                    case "search-places":
                        feedRequestURI = endpoint + version + "/search";
                        searchBody = query;
                    break;
                    case "search-places-v2":
                        feedRequestURI = endpoint + "v2" + "/search?layer="+query.layer+"&source="+query.source+"&source_id="+query.sourceId+"&location&page="+page;
                    break;
                    case "search-places-guides":
                        feedRequestURI = endpoint + "v1" + "/guides/search?layer="+query.layer+"&source="+query.source+"&sourceId="+query.sourceId+"&location&page="+page;
                    break;
                    case "search-people":
                        feedRequestURI = endpoint + version + "/search/users?text=" + query;
                    break;
                    case "guide":
                        feedRequestURI = endpoint + version + "/guides/search?layer="+query.layer+"&source="+query.source+"&sourceId="+query.sourceId+"&location&page="+page;
                    break;
                    case "user":
                        feedRequestURI = endpoint + version + user_uri + "/" + query;
                    break;
                    case "moment":
                        feedRequestURI=endpoint+version+"/moment/"+query;
                    break;
                    case "trip":
                        feedRequestURI=endpoint+version+"/trip/"+query+"?momentPage="+page+"&momentLimit=24";
                    break;
                    case "feed-v2":
                        feedRequestURI = endpoint + "v2" + feed_uri + "?page=" + page;
                    break;
                    case "feed":
                    default:
                        feedRequestURI = endpoint + version + user_uri + "/" + query + feed_uri + "?page=" + page;
                    break;
                }



                let sherpaHeaders = new Headers();
                let finalToken=user?user.sherpaToken:sherpaToken;
                let reqBody;


                sherpaHeaders.append("token", finalToken);

                switch(type){
                    case 'map-search':
                    case 'map-search-classic':
                        sherpaHeaders.append("Content-Type", "application/json");
                        reqBody={
                            method: 'post',
                            headers: sherpaHeaders,
                            body: JSON.stringify(searchBody)
                        }
                    break;
                    case "map-search-profile":
                    case "map-search-trip":
                        sherpaHeaders.append("Content-Type", "application/json");
                        reqBody={
                            method: 'post',
                            headers: sherpaHeaders,
                            body: JSON.stringify(query.bbox)
                        }
                    break;
                    case 'location':
                    case 'search-places':
                        reqBody={
                            method: 'post',
                            headers: sherpaHeaders,
                            body: JSON.stringify(searchBody)
                        }

                    break;
                    case 'reset-notifications':
                        reqBody={
                            method: 'post',
                            headers: sherpaHeaders,
                        }
                    break;
                    default:
                        reqBody={
                            method: 'get',
                            headers: sherpaHeaders
                        }

                }


                //console.log('feed request uri',feedRequestURI)
                fetch(feedRequestURI, reqBody)
                    .then((rawSherpaResponse)=> {
                        switch (rawSherpaResponse.status) {
                            case 200:
                            case 400:
                                return rawSherpaResponse.text()
                            break;
                            case 500:
                                //console.log('reject reject reject',rawSherpaResponse.text())
                                reject({errorCode:rawSherpaResponse.status});
                            break;
                            case 401:
                                store.delete('user').then(()=>{
                                    reduxStore.dispatch(updateUserDBState("empty"));
                                });
                            break;
                        }
                    })
                    .then((rawSherpaResponseFinal)=> {
                        //console.log('final response',rawSherpaResponseFinal)
                        if (!rawSherpaResponseFinal)return;
                        let parsedResponse=JSON.parse(rawSherpaResponseFinal);
                        let trips = parsedResponse.trips || parsedResponse;
                        let cleanTrips=[];
                        for(let index in trips){
                            let currentTrip=trips[index];
                            if(currentTrip&&currentTrip.moments){
                                let moments=currentTrip.moments;
                                let name=currentTrip.name;
                                let coverIndex=0;
                                if(name.indexOf("Trip to ")>-1)currentTrip.name= name.split("Trip to ")[1];
                                if(moments.length>0){
                                    currentTrip.moments=[];
                                    if(currentTrip.coverMoment){
                                        console.log('cover moment',currentTrip.coverMoment)
                                        moments.unshift(currentTrip.coverMoment)
                                        console.log('moments',moments);
                                    }

                                    currentTrip.moments=moments;

                                    cleanTrips.push(currentTrip);
                                }
                            }else{
                                cleanTrips.push(currentTrip);
                            }
                        }



                       //console.log('feed',type,'::',parsedResponse)
                        switch(type){
                            case "featured-profiles":
                            case "moment":
                            case "trip":
                            case "map-search":
                            case "map-search-classic":

                            case "notifications":
                            case "reset-notifications":
                            case "user":
                                fulfill({data:parsedResponse, page, type});
                            break;
                            case "location":
                            case "profile":
                                //parsedResponse.profile.serviceToken
                                fulfill({data:cleanTrips,profile:parsedResponse.profile, page, type,followers:parsedResponse.followers,following:parsedResponse.following});
                            break;
                            case "feed-v2":
                                fulfill({trips:parsedResponse.content, page, type});
                            break;
                            case "suitcase-list":
                            case "single-suitcase-feed":
                            case "feed":
                                fulfill({trips:cleanTrips, page, type});
                            break;
                            case "search":
                            case "search-places":
                            case "search-places-v2":
                            case "search-people":
                            case "location-search":
                            case "map-search-v2":
                            case "map-search-trip":
                            case "map-search-profile":
                            case "guide":
                                let cleanMoments=[];
                                let moments;
                                if(type=="search-places-v2"||type=="map-search-trip"||type=="map-search-profile"){
                                    moments=parsedResponse.moments
                                }else if(type=='guide'){
                                    moments=parsedResponse.content;
                                }else{
                                    moments=parsedResponse;
                                }
                                    //console.log(type,' ++ moments response',moments,'parsed response',parsedResponse)
                                if(moments.length>0){
                                    for(let i=0;i<moments.length;i++){
                                        if(moments[i].type==='image'||moments[i].contentType=='guide')cleanMoments.push(moments[i]);
                                    }
                                }


                                fulfill({rawData:parsedResponse,moments:cleanMoments, page, type});
                            break;

                        }
                    }).catch((err)=>console.log('err',err))
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

export function moveArrayPos(arr,old_index, new_index) {
    while (old_index < 0) {
        old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length;
    }
    if (new_index >= arr.length) {
        var k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing purposes
};