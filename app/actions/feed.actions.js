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

                var hasMinTripCountCondition=parser.minTripCount>-1 && sherpaResponse[0]["scrapesCompleted"]>=parser.minTripCount;
                var hasAllCompleteCondition=sherpaResponse[0].state === 'completed';

                if(hasMinTripCountCondition || hasAllCompleteCondition){
                    dispatch(udpateJobState('completed'));
                }else{
                    dispatch(udpateJobState('progress'));
                    var progress=sherpaResponse[0].scrapesCompleted/sherpaResponse[0].scrapesTotal;
                    dispatch(updateJobProgress(progress));
                    setTimeout(()=>{fetchJob()}, 5000);
                }
            });

        }
        fetchJob();
    }
}

export function loadFeed(userID,sherpaToken,page=1) {
    return function (dispatch, getState) {
        dispatch(updateFeedPage(page));

        const {endpoint,version,feed_uri,user_uri} = sherpa;
        var feedRequestURI=endpoint+version+user_uri+"/"+userID+feed_uri+"?page="+page;
        fetch(feedRequestURI,{
            method:'get'
        }).then((rawSherpaResponse)=>{
            var sherpaResponse=JSON.parse(rawSherpaResponse._bodyText);
            dispatch(udpateFeed({trips:sherpaResponse,page:page}));
            dispatch(udpateFeedState('ready'));
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

export function updateFeedPage(feedPage){
    return{
        type:types.UPDATE_FEED_PAGE,
        feedPage
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