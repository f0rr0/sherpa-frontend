import * as types from '../constants/feed.actiontypes'
import config from '../data/config';
const {sherpa}=config.auth;

export function watchJob(jobID){
    return function (dispatch, getState) {
        udpateJobState('start_watching',jobID)
        const {endpoint,version,job_uri} = sherpa;
        function fetchJob(){
            fetch(endpoint + version + job_uri + "/" + jobID, {
                method: 'get'
            }).then((rawSherpaResponse)=> {
                var sherpaResponse = JSON.parse(rawSherpaResponse._bodyText);
                dispatch(udpateJobState('response_ready'));

                if (sherpaResponse[0].state !== 'completed') {
                    dispatch(udpateJobState('progress'));
                    var progress=sherpaResponse[0].scrapesCompleted/sherpaResponse[0].scrapesTotal;
                    dispatch(updateJobProgress(progress));
                    setTimeout(()=>{fetchJob()}, 5000);
                }else{
                    dispatch(udpateJobState('completed'));
                }

            });
        }
        fetchJob();
    }
}

export function loadFeed(userID,sherpaToken) {
    return function (dispatch, getState) {
        dispatch(udpateFeedState('request'));

        const {endpoint,version,feed_uri,user_uri} = sherpa;
        fetch(endpoint+version+user_uri+"/"+userID+feed_uri,{
            method:'get'
        }).then((rawSherpaResponse)=>{
            var sherpaResponse=JSON.parse(rawSherpaResponse._bodyText);
            dispatch(udpateFeedState('complete'));
            dispatch(udpateFeed({trips:sherpaResponse}));
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