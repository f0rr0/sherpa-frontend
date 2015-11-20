import * as types from '../constants/feed.actiontypes'
import config from '../data/config';
console.log(config.auth[config.environment]);
const {sherpa}=config.auth[config.environment];
const {parser}=config.settings;

export function watchJob(jobID){
    return function (dispatch, getState) {
        udpateJobState('start_watching',jobID)
        const {endpoint,version,job_uri} = sherpa;
        console.log('watch job',jobID,'job id');
        function fetchJob(){
            fetch(endpoint + version + job_uri + "/" + jobID, {
                method: 'get'
            }).then((rawSherpaResponse)=> {
                var sherpaResponse = JSON.parse(rawSherpaResponse._bodyText);
                dispatch(udpateJobState('response_ready'),sherpaResponse[0].state);

                var hasMinTripCountCondition=parser.minTripCount>-1 && sherpaResponse[0]["scrapesCompleted"]>=parser.minTripCount;
                var hasAllCompleteCondition=sherpaResponse[0].state === 'completed';

                console.log('parsed trips'+sherpaResponse[0]["scrapesCompleted"]);

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

export function loadFeed(userID,sherpaToken) {
    return function (dispatch, getState) {
        dispatch(udpateFeedState('request'));

        const {endpoint,version,feed_uri,user_uri} = sherpa;
        console.log(endpoint+version+user_uri+"/"+userID+feed_uri)
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