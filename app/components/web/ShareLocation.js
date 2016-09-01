import React from 'react';
import ReactDOM from 'react-dom';
import config from '../../data/config';
const {sherpa}=config.auth[config.environment];
import TripTitle from './components/tripTitle';
import countries from "./../../data/countries";
import 'whatwg-fetch';
let { Component } = React;


class ShareLocation extends Component{
    constructor(props) {
        super(props);
        this.state= {
            tripData: {},
            moments:[]
        }
        this.map;
    }

    componentDidMount(){
        this.requestEndpoint();
    }

    initMap(coords){
        L.mapbox.accessToken = 'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImRhckc5UlkifQ.f8vV1-k3KEZKVhZxiXhq0w';
        if(!this.map)this.map = L.mapbox.map('mapInfo')

        this.map.setView([this.state.moments[0].lat, this.state.moments[0].lng], 9);

        L.mapbox.styleLayer('mapbox://styles/thomasragger/cih7wtnk6007ybkkojobxerdy')
            .addTo(this.map);

        var markers=[];
        var boundCoords=[];
        var i=0;
        this.state.moments.map((moment) => {
            markers.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [moment.lng,moment.lat]
                },
                "properties": {
                    title:moment.venue,
                    "icon": {
                        "className": "my-icon", // class name to style
                        "html": "&#9647;", // add content inside the marker
                        "iconSize": null // size of icon, use null to set the size in CSS
                    }
                }
            });
            //L.marker([moment.lat,moment.lng]).addTo(this.map);
            boundCoords.push([moment.lat,moment.lng]);
            i++;
        });

        var bounds = new L.LatLngBounds(boundCoords);


        var myLayer = L.mapbox.featureLayer().addTo(this.map);

        myLayer.on('layeradd', function(e) {
            var marker = e.layer,
                feature = marker.feature;
            marker.setIcon(L.divIcon(feature.properties.icon));
        });
        myLayer.setGeoJSON(markers);
        this.map.fitBounds(bounds);
        this.map.scrollWheelZoom.disable()
    }

    componentDidUpdate(prevProps,prevState){
        if(prevProps.routeParams.feedTarget!=this.props.routeParams.feedTarget)this.requestEndpoint();
    }

    isCountry(location){
        var country = countries.filter(function(country) {
            return country["name"].toLowerCase() === location.toLowerCase();
        });

        return country;
    }

    requestEndpoint(){
        var isCountry=this.isCountry(this.props.routeParams.feedTarget);
        let endpointTarget=isCountry.length>0?"country/"+isCountry[0]["alpha-2"]:"location/"+this.props.routeParams.feedTarget;
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        let feedRequestURI;
        feedRequestURI=endpoint+version+"/"+endpointTarget;

        let sherpaResponse;
        let sherpaHeaders = new Headers();
        sherpaHeaders.append("token", this.props.routeParams.sherpaToken);
        var me=this;

        //console.log(feedRequestURI)

        fetch(feedRequestURI,{
            method:'get',
            headers:sherpaHeaders,
            mode: 'cors'
        })
            .then((rawSherpaResponse)=>{
                //console.log('response status',rawSherpaResponse.status);
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
                //console.log(JSON.parse(rawSherpaResponseFinal));
                sherpaResponse= this.unpackTrips(JSON.parse(rawSherpaResponseFinal));

                var cleanMoments=[];
                sherpaResponse.moments.map(function(moment){
                    if(moment.type==='image')cleanMoments.push(moment);
                })

                this.setState({moments:cleanMoments});
                this.initMap();
            });
    }

    unpackTrips(trips){
        var unpackedResults={moments:[],momentIDs:[]};
        for(var index in trips){
            var tripMoments=trips[index].moments;
            for(var i=0;i<tripMoments.length;i++){
                tripMoments[i].trip={
                    owner:trips[index].owner
                };

                unpackedResults.moments.push(tripMoments[i]);
                unpackedResults.momentIDs.push(tripMoments[i].id);
            }
        }
        return unpackedResults;
    }

    _renderMoments(){

    }

    render(){
        if(this.state.moments.length==0)return (<div></div>);

        let firstMoment=this.state.moments[0];
        let momentIndex=0;

        return(
            <div className="sherpa-share">
                <div className="share-container">
                    <div className="logo-header">
                        <img src="Images/logo-sherpa-2.png" height="50" alt="" />
                    </div>
                    <div className="main-header" style={{backgroundImage:'url('+firstMoment.mediaUrl+')'}}>
                        <div className="trip-title">
                            <h1>{this.props.routeParams.feedTarget.toUpperCase()}</h1>
                        </div>                    </div>
                    <div id="mapInfo"></div>
                    {
                        this.state.moments.map(function(moment) {
                            momentIndex++;
                            return (
                                <div className="moment-container" key={moment.id}>
                                    <div className="moment-image" style={{backgroundImage:'url('+moment.mediaUrl+')'}}></div>
                                    <div className="moment-description">{moment.venue}</div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default ShareLocation