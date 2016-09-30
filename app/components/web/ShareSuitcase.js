import React from 'react';
import ReactDOM from 'react-dom';
import config from '../../data/config';
const {sherpa}=config.auth[config.environment];
import TripTitle from './components/tripTitle';
let { Component } = React;
import countries from '../../data/countries';
import _ from 'underscore';
import 'whatwg-fetch';

class ShareSuitcase extends Component{
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

    getTripLocation(tripData){
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.name;
        })[0];

        var tripLocation=country.name||tripData.name;
        return {location:tripLocation,country:country,countryCode:tripData.country};
    }


    initMap(coords){
        L.mapbox.accessToken = 'pk.eyJ1IjoidHJhdmVseXNoZXJwYSIsImEiOiJjaXRrNnk5OHgwYW92Mm9ta2J2dWw1MTRiIn0.QZvGaQUAnLMvoarRo9JmOg';
        if(!this.map)this.map = L.mapbox.map('mapInfo')

        this.map.setView([this.state.moments[0].lat, this.state.moments[0].lng], 9);

        L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v8')
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

    requestEndpoint(){
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        let feedRequestURI;
        var ids=this.props.routeParams.feedTarget.split("-");
        feedRequestURI=endpoint+version+"/user/"+ids[1]+"/suitcases/?page=1";

        let sherpaResponse;
        let sherpaHeaders = new Headers();
        sherpaHeaders.append("token", this.props.routeParams.sherpaToken);
        var me=this;

        fetch(feedRequestURI,{
            method:'get',
            headers:sherpaHeaders,
            mode: 'cors'
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
                //console.log(ids[0],sherpaResponse);
                var targetSuitcase;
                for(var suitcase in sherpaResponse){
                    if(sherpaResponse[suitcase].id==ids[0])targetSuitcase=sherpaResponse[suitcase];
                }
                this.setState({tripData:targetSuitcase,moments:targetSuitcase.moments});
                this.initMap();
            });
    }

    _renderMoments(){

    }

    render(){
        if(this.state.moments.length==0)return (<div></div>);

        let firstMoment=this.state.moments[0];
        let tripData=this.state.tripData;
        let momentIndex=0;
        var destination=this.getTripLocation(tripData);

        return(
            <div className="sherpa-share">
                <div className="share-container">
                    <div className="logo-header">
                        <a href="http://www.trysherpa.com" target="_blank"><img src="Images/logo-sherpa-2.png" height="50" alt="" /></a>
                    </div>
                    <div className="main-header" style={{backgroundImage:'url('+firstMoment.mediaUrl+')'}}>
                        <div className="trip-title">
                            <h1>{destination.location.toUpperCase()}</h1>
                        </div>
                    </div>
                    <div id="mapInfo"></div>
                    {
                        this.state.moments.map(function(moment) {
                            momentIndex++;
                            if(moment.type!='image')return;
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

export default ShareSuitcase