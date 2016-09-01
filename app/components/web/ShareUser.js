import React from 'react';
import ReactDOM from 'react-dom';
import config from '../../data/config';
const {sherpa}=config.auth[config.environment];
import TripTitle from './components/tripTitle';
let { Component } = React;


class ShareUser extends Component{
    constructor(props) {
        super(props);
        this.state= {
            trips: [],
            user:{}
        }
        this.map;
    }

    componentDidMount(){
        this.requestSuitCase();
    }

    componentDidUpdate(prevProps,prevState){
        if(prevProps.routeParams.feedTarget!=this.props.routeParams.feedTarget)this.requestSuitCase();
    }

    requestSuitCase(){
        const {endpoint,version,feed_uri,user_uri} = sherpa;
        let feedRequestURI;

        let sherpaResponse;
        let sherpaHeaders = new Headers();
        sherpaHeaders.append("token", this.props.routeParams.sherpaToken);
        var me=this;

            fetch(endpoint+version+"/profile/"+this.props.routeParams.feedTarget+"/trips",{
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
                this.setState({trips:sherpaResponse});
            });


            fetch(endpoint+version+"/user/"+this.props.routeParams.feedTarget,{
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
                this.setState({user:sherpaResponse});
            });
    }

    _renderMoments(){

    }

    render(){
        if(this.state.trips.length==0)return (<div></div>);

        let momentIndex=0;
        let sherpaToken=this.props.routeParams.sherpaToken;
        let user=this.state.user;
        return(
            <div className="sherpa-share">
                <div className="share-container">
                    <div className="logo-header">
                        <img src="Images/logo-sherpa-2.png" height="50" alt="" />
                    </div>
                    <div className="main-header profile">
                        <div className="trip-title user">
                            <img className="profile-picture" src={this.state.user.profilePicture} alt=""/>
                            <h1>{this.state.user.username}</h1>
                            <h2>{this.state.user.hometown}</h2>
                            <h2 className="profile-bio">{this.state.user.profile.serviceBio}</h2>
                        </div>
                    </div>
                    {
                        this.state.trips.map(function(trip) {
                            momentIndex++;
                            let moment=trip.moments[0];
                            if(moment.type!='image'||momentIndex==1)return;
                            if(!trip.country)return;
                            return (
                                <div className="moment-container profile" key={moment.id}>
                                    <a href={"#/trip/"+trip.id+"/"+sherpaToken} className="moment-image" style={{backgroundImage:'url('+moment.mediaUrl+')'}}></a>
                                    <TripTitle tripData={trip} owner={user.profile}></TripTitle>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default ShareUser