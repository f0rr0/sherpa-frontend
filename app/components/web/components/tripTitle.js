import countries from '../../../data/countries';
import React from 'react';
import ReactDOM from 'react-dom';
var { Component } = React;


class TripTitle extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
    }


    render() {
        var continents=["europe","asia","africa","america","united states","australia","antarctica"]
        var tripData=this.props.tripData;
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        //console.log(tripData);

        if(!country)country={name:tripData.country}

        var tripName=tripData.name.replace(/\s+/g, '');

        var isTripNameCountry = countries.filter(function(country) {
            return country["name"].toLowerCase() === tripName.toLowerCase();
        })[0];

        var isTripNameContinent = false;

        for(var i=0;i<continents.length;i++){
            if(tripName.toLowerCase()==continents[i].toLowerCase())isTripNameContinent=true;
        }

        var isState=(country.name.toUpperCase()==="US");
        var isInAmerica=(country["alpha-2"].toUpperCase()==="US")
        var countryOrState=isState?tripData.state:country.name;

        var subTitle="";
        if(isTripNameContinent){
            subTitle="";
        }else if(isTripNameCountry||isState||isInAmerica||countryOrState===tripData.continent){
            subTitle=tripData.continent || "";
        }else{
            subTitle=countryOrState+"/"+tripData.continent
        }

        //<a href={"#/profile/"+this.props.owner.id+"/"+this.props.sherpaToken}></a>
        var profilePic=this.props.owner.serviceProfilePicture? <img className="profile-picture" src={this.props.owner.serviceProfilePicture} alt=""/>:<span></span>;

        return (
            <div className="trip-title">
                {profilePic}
                <h2>{this.props.owner.serviceUsername.toUpperCase()} TRIP TO</h2>
                <h1>{tripName.replace("Tripto","").toUpperCase()}</h1>
                <h2>{subTitle.toUpperCase()}</h2>
            </div>
        );
    }
}

TripTitle.defaultProps = {
    tripData:{},
    tripOwner:""
};

export default TripTitle;