import * as types from '../constants/feed.actiontypes'
import config from '../data/config';
const {sherpa}=config.auth[config.environment];
const {parser}=config.settings;

export function watchJob(jobID){
    return function (dispatch, getState) {
        udpateJobState('start_watching',jobID)
        const {endpoint,version,job_uri} = sherpa;
        function fetchJob(){
            fetch(endpoint + version + job_uri + "/" + jobID, {
                method: 'get'
            }).then((rawSherpaResponse)=> {
                var sherpaResponse = JSON.parse(rawSherpaResponse._bodyText);
                dispatch(udpateJobState('response_ready'),sherpaResponse[0].state);
                checkFeedReady(sherpaResponse[0].user,dispatch);

                //var hasMinTripCountCondition=parser.minTripCount>-1 && sherpaResponse[0]["scrapesCompleted"]>=parser.minTripCount;
                //var hasAllCompleteCondition=sherpaResponse[0].state === 'completed';
                //
                //console.log(sherpaResponse[0]["scrapesCompleted"])

                //if(hasMinTripCountCondition || hasAllCompleteCondition){
                //    dispatch(udpateJobState('completed'));
                //}else{
                //    dispatch(udpateJobState('progress'));
                //    var progress=sherpaResponse[0].scrapesCompleted/sherpaResponse[0].scrapesTotal;
                //    dispatch(updateJobProgress(progress));
                //    setTimeout(()=>{fetchJob()}, 5000);
                //}
            });

        }
        fetchJob();
    }
}


function checkFeedReady(userID,dispatch){
    console.log('check feed ready');
    const {endpoint,version,feed_uri,user_uri} = sherpa;
    var feedRequestURI=endpoint+version+user_uri+"/"+userID+feed_uri;
    console.log(feedRequestURI)
    fetch(feedRequestURI,{
        method:'get'
    }).then((rawSherpaResponse)=>{
        var sherpaResponse=JSON.parse(rawSherpaResponse._bodyText);
        console.log(sherpaResponse.trips.length,'blablabla');
        if(sherpaResponse.trips.length==25){
            dispatch(udpateJobState('completed'));
        }else{
            setTimeout(()=>{checkFeedReady(userID,dispatch)}, 1000);
        }
    });
}


//types: location,city,state,user
export function loadFeed(feedTarget,sherpaToken,page=1,type='user') {
    return function (dispatch, getState) {
        dispatch(udpateFeedState('fetch'));
        dispatch(updateFeedPage(page,type));

        const {endpoint,version,feed_uri,user_uri} = sherpa;
        var feedRequestURI;

        console.log("load feed type",type);
        switch(type){
            case "location":
                feedRequestURI=endpoint+version+"/location/"+feedTarget+"?page="+page;
            break;
            case "profile":
                feedRequestURI=endpoint+version+"/profile/"+feedTarget+"/trips?page="+page;
            break;
            case "user":
            default:
                feedRequestURI=endpoint+version+user_uri+"/"+feedTarget+feed_uri+"?page="+page;
            break;
        }


        fetch(feedRequestURI,{
            method:'get'
        }).then((rawSherpaResponse)=>{
            var sherpaResponse=JSON.parse(rawSherpaResponse._bodyText);
            if(type==="user"){
                dispatch(udpateFeed({trips:sherpaResponse.trips,page:page,type}));
            }else{
                dispatch(udpateFeed({trips:sherpaResponse,page:page,type}));
            }
            dispatch(udpateFeedState('fetch'));
        });
    }
}

export function udpateJobState(jobState){
    return{
        type:types.UPDATE_JOB_STATE,
        jobState
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

export function updateJobProgress(jobProgress){
    return{
        type:types.UPDATE_JOB_PROGRESS,
        jobProgress
    }
}