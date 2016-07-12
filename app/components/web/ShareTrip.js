import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import config from '../../data/config';
const {sherpa}=config.auth[config.environment];
import $ from 'jquery';
var { Component } = React;


class ShareTrip extends Component{
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        console.log('mounted');
        this.requestSuitCase();
    }

    requestSuitCase(){
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        var feedRequestURI;
        feedRequestURI=endpoint+version+"/trip/"+this.props.routeParams.feedTarget;

        var sherpaResponse;
        var sherpaHeaders = new Headers();
        sherpaHeaders.append("token", this.props.routeParams.sherpaToken);

        $.ajax({type: "GET",
            url: feedRequestURI,
            headers: sherpaHeaders,
            success: function(res) {
                console.log("SUCCESS");
            },
            error:function(req,err){
                console.log('error signup')
                console.log(req,err)
            }
        });

        //
        //fetch(feedRequestURI,{
        //    method:'get',
        //    headers:sherpaHeaders
        //})
        //    .then((rawSherpaResponse)=>{
        //        switch(rawSherpaResponse.status){
        //            case 200:
        //                return rawSherpaResponse.text()
        //                break;
        //            case 400:
        //                return '{}';
        //                break;
        //        }
        //    })
        //    .then((rawSherpaResponseFinal)=>{
        //        sherpaResponse=JSON.parse(rawSherpaResponseFinal);
        //        console.log(sherpaResponse);
        //    });
    }

    render(){
        return(
            <div>This should be working s</div>
        )
    }
}

export default ShareTrip