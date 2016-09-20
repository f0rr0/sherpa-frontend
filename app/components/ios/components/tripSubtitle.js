import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import React, {Component} from 'react';
import countries from '../../../data/countries'

var styles=StyleSheet.create({
        subtitle:{color:"#FFFFFF",fontSize:10, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}
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


        var tripCountry=tripData.country;
        if(tripData.country.length==2){
            tripCountry=country.name=countries.filter(function(country) {
                return country["alpha-2"].toLowerCase() === tripData.country.toLowerCase();
            })[0].name;
        }


        if(!country)country={name:tripCountry||""};


        var isTripNameCountry = countries.filter(function(country) {
            return country["name"].toLowerCase() === tripName.toLowerCase();
        })[0];

        var isTripNameContinent = false;

        for(var i=0;i<continents.length;i++){
            if(tripName.toLowerCase()==continents[i].toLowerCase())isTripNameContinent=true;
        }



        var isState=tripData.type=='state';
        var isInAmerica=tripData.country=="US"||((country["alpha-2"]&&country["alpha-2"].toUpperCase()==="US")||country.name.toLowerCase()=='united states'||country.name.toLowerCase()=='america'||tripData.name.toUpperCase().indexOf("AMERICA")>-1);
        var countryOrState=isState?tripData.state:country.name;

        if(tripData.type=='location')countryOrState=isInAmerica?tripData.state:country.name;
        if(tripData.type=='state')countryOrState=country.name;


        var subTitle="";
        if(isTripNameContinent){
            subTitle="";
        }
        else if(((tripData.type=='state'&&!isInAmerica) || tripData.type=='region' || tripData.type=='location' )&&countryOrState!=tripData.continent){
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