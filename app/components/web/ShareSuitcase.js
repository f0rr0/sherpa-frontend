import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import config from '../data/config';
const {sherpa}=config.auth[config.environment];
var { Component } = React;


class RootWeb extends Component{
    constructor(props) {
        super(props);
    }

    componentDidMount(){
        this.requestSuitCase();
    }

    requestSuitCase(){
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        var feedRequestURI;
        feedRequestURI=endpoint+version+"/location/"+feedTarget+"?page="+page;


        fetch(feedRequestURI,{
                method:'get',
                headers:sherpaHeaders
            })
            .then((rawSherpaResponse)=>{
                switch(rawSherpaResponse.status){
                    case 200:
                        return rawSherpaResponse.text()
                        break;
                    case 400:
                        return '{}';
                        break;
                }
            })
            .then((rawSherpaResponseFinal)=>{
                sherpaResponse=JSON.parse(rawSherpaResponseFinal);
                switch(type){
                    case "user":
                        dispatch(udpateFeed({trips:sherpaResponse.trips,page:page,type}));
                        break;
                    case "search-people":
                    case "search-places":
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type:"search"}));
                        break;
                    case "suitcase-list":
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type:"suitcase"}));
                        break;
                    default:
                        dispatch(udpateFeed({trips:sherpaResponse,page:page,type}));
                }
            });
    }

    render(){
        return(
            <div>This should be working s</div>
        )
    }
}

export default RootWeb