module.exports = {
    resetUser:false,
    environment:'dev',
    settings:{
        parser:{
            minTripCount:10
        }
    },
    shareBaseURL:"http://www.trysherpa.com/share.html#",
    auth:{
            debug:{
                instagram: {
                    endpoint:"https://api.instagram.com/",
                    client_id:"6c93234fa3544a6592b382a0a814e555",
                    client_secret:"afac24bc39eb4ab2bb52adf09c068293",
                    redirect_uri:"sherpa://oauthcallback-instagram",
                    code_uri:"oauth/authorize",
                    token_uri:"oauth/access_token",
                    response_type:"code",
                    grant_type:"authorization_code",
                    redirect_uri_web:"http://www.trysherpa.com/auth",
                    response_type_web:"token"
                },
                sherpa: {
                    endpoint:"http://sherpa.wild.as/api/",
                    version:"v0",
                    login_uri:"/login",
                    job_uri:"/job",
                    feed_uri:"/feed",
                    user_uri:"/user"
                }
            },
            dev:{
                instagram: {
                    endpoint:"https://api.instagram.com/",
                    client_id:"610a4a6a16bc40ec95f749e95c48087a",
                    client_secret:"0518505aae83497bbcbb1c795c2a48dd",
                    redirect_uri:"sherpa://oauthcallback-instagram",
                    code_uri:"oauth/authorize",
                    token_uri:"oauth/access_token",
                    response_type:"code",
                    grant_type:"authorization_code",
                    redirect_uri_web:"http://web.trysherpa.com/callback",
                    response_type_web:"token"
                },
                sherpa: {
                    endpoint:"http://api.trysherpa.com/api/",
                    version:"v1",
                    login_uri:"/login",
                    job_uri:"/job",
                    feed_uri:"/feed",
                    user_uri:"/user"
                }
            },
            live:{
                instagram: {
                    endpoint:"https://api.instagram.com/",
                    client_id:"610a4a6a16bc40ec95f749e95c48087a",
                    client_secret:"0518505aae83497bbcbb1c795c2a48dd",
                    redirect_uri:"sherpa://oauthcallback-instagram",
                    code_uri:"oauth/authorize",
                    token_uri:"oauth/access_token",
                    response_type:"code",
                    grant_type:"authorization_code",
                    redirect_uri_web:"http://www.trysherpa.com/auth",
                    response_type_web:"token"
                },
                sherpa: {
                    endpoint:"http://sherpa.wild.as/api/",
                    version:"v1",
                    login_uri:"/login",
                    job_uri:"/job",
                    feed_uri:"/feed",
                    user_uri:"/user"
                }
            }
    }
}