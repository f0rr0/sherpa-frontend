import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import React, {Component} from 'react';
import countries from '../../../data/countries'

var styles=StyleSheet.create({
        subtitle:{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}
});

class TripSubtitle extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var tripData=this.props.tripData;
        var tripName=tripData.name.trim();


        var continents=["europe","asia","africa","america","united states","australia","antarctica"];
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];



        if(!country)country={name:tripData.country||""};

        var isTripNameCountry = countries.filter(function(country) {
            return country["name"].toLowerCase() === tripName.toLowerCase();
        })[0];

        var isTripNameContinent = false;

        for(var i=0;i<continents.length;i++){
            if(tripName.toLowerCase()==continents[i].toLowerCase())isTripNameContinent=true;
        }

        var isState=(country["alpha-2"].toUpperCase()==="US"||tripData.name.toUpperCase().indexOf("UNITED STATES OF AMERICA")>-1);
        var isInAmerica=((country["alpha-2"]&&country["alpha-2"].toUpperCase()==="US")||country.name.toLowerCase()=='united states');
        var countryOrState=isState?tripData.state:country.name;

        var subTitle="";
        if(isTripNameContinent){
            subTitle="";
        }
        else if(isInAmerica&&isState&&countryOrState!=tripData.continent){
            subTitle=countryOrState+"/"+tripData.continent
        }
        else if(isTripNameCountry||isState||countryOrState===tripData.continent){
            subTitle=tripData.continent || "";
        }else{
            subTitle=countryOrState+"/"+tripData.continent
        }


        return (
            <Text style={styles.subtitle}>{subTitle.toUpperCase()}</Text>
        );
    }
}

TripSubtitle.defaultProps = {
    tripData:{}
};

export default TripSubtitle;