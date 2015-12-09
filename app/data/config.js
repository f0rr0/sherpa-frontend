module.exports = {
    resetUser:false,
    environment:'dev',
    settings:{
        parser:{
            minTripCount:10
        }
    },
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
                    grant_type:"authorization_code"
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
                    client_id:"6c93234fa3544a6592b382a0a814e555",
                    client_secret:"afac24bc39eb4ab2bb52adf09c068293",
                    redirect_uri:"sherpa://oauthcallback-instagram",
                    code_uri:"oauth/authorize",
                    token_uri:"oauth/access_token",
                    response_type:"code",
                    grant_type:"authorization_code"
                },
                sherpa: {
                    endpoint:"http://sherpa-dev.elasticbeanstalk.com/api/",
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
                    client_id:"6c93234fa3544a6592b382a0a814e555",
                    client_secret:"afac24bc39eb4ab2bb52adf09c068293",
                    redirect_uri:"sherpa://oauthcallback-instagram",
                    code_uri:"oauth/authorize",
                    token_uri:"oauth/access_token",
                    response_type:"code",
                    grant_type:"authorization_code"
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