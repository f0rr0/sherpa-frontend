'use strict';
import store from 'react-native-simple-store';
import config from '../../../data/config';
import styles from './styles/infoBoxStyle';

import {
    View,
    Text,
    Linking,
    TouchableHighlight,
    StyleSheet
} from 'react-native';
import React, {
    Component} from 'react';
import {removeDiacritics} from '../utils/stringUtils';


class WikpediaInfoBox extends Component {
    constructor(props){
        super(props);
        this.state={
            wikipediaDescription:""
        }
    }

    componentDidMount(){
        this.getWikipediaData(this.props.location);
    }

    getWikipediaData(query){
        var dbpediaHeaders = new Headers();
        //add json response type for dbpedia query
        dbpediaHeaders.append("accept", "application/json");

        //if the query has multiple words separated by the comma, take the first word, otherwise just use the query
        query=query.indexOf(",")>0?query.split(',')[0]:query;

        //if we know the query is a country, only look for countries
        var featureType=this.props.type=='country'?"&feature=country":"";

        //maximum listings to look through
        var maxRows=5;

        var cleardQuery=removeDiacritics(query.toLowerCase());


        //console.log("query",cleardQuery);
        var me=this;

        //query geonames to get likely results that include location data
        fetch("http://api.geonames.org/wikipediaSearchJSON?maxRows="+maxRows+"&username=travelsherpa"+featureType+"&q="+cleardQuery, {
            method: 'get'
        }).then((rawServiceResponse)=> {
            return rawServiceResponse.text();
        }).then((response)=> {

            var wikiResponse=JSON.parse(response).geonames;
            if(wikiResponse.length==0)return;

            //if all checks below fail, we'll just use the first result and check for lat/lng
            var wikiResult=wikiResponse[0];
            var titleMatch=false;

            //console.log(wikiResponse)
            var targetCountry=me.props.country?me.props.country.countryCode:me.props.countryCode;
            //console.log(wikiResponse);
            for(var i=0;i<wikiResponse.length;i++) {

                //normalize results and query by converting special characters into regular characters, i.e. "á" to "a"
                var wikiTitle = wikiResponse[i].title.split(",")[0];
                var countryMatch = wikiResponse[i].countryCode == targetCountry;
                var cleardQuery = removeDiacritics(query.toLowerCase());
                var cleardResponse = removeDiacritics(wikiTitle.toLowerCase());

                var latLngRange = 1;
                var locationCheck = this.props.type == 'default' ?
                this.props.coordinates &&
                (Math.floor(this.props.coordinates.lat) <= Math.floor(wikiResponse[i].lat) + latLngRange) &&
                (Math.floor(this.props.coordinates.lat) >= Math.floor(wikiResponse[i].lat) - latLngRange) &&
                (Math.floor(this.props.coordinates.lng) <= Math.floor(wikiResponse[i].lng + latLngRange)) &&
                (Math.floor(this.props.coordinates.lng) >= Math.floor(wikiResponse[i].lng - latLngRange)) :
                    true;


                // name matching::compare if we have :
                // a perfect match on the regular query
                // a perfect match on the normalized query
                //console.log(cleardQuery,'+++',cleardResponse)

                //console.log(this.props.isLocationView, 'is location view');
                if ((wikiTitle.toLowerCase() == query.toLowerCase() || cleardQuery == cleardResponse) && countryMatch && locationCheck) {
                    wikiResult = wikiResponse[i];
                    titleMatch = true;
                    //console.log('title match')
                    break;
                }
                //if we have no name match, check if at least the feature-type matches, so we received a country when looking for one
                //best for populated places
                else if (wikiResponse[i].feature == this.props.type && countryMatch && locationCheck) {
                    wikiResult = wikiResponse[i];
                    break;
                }
                //add another check if we at least have a result with the same countryCode
                //best for populated places
                else if (this.props.country && countryMatch && locationCheck) {
                    wikiResult = wikiResponse[i];
                    break;
                }
            }

            //console.log('wiki result',wikiResult)


            //now that we have the best likely result, we'll do another check if its withing a certain lat/lng range from our query

            //if we requested a location, it will likely not have coordinates attached by geonames for some reason
            //but also likely already passed one of the earlier tests, so we'll give it a shot without lat/lng matching.


            //console.log('location check',locationCheck);
            var partialTitleMatch=wikiResult.title.toLowerCase().indexOf(query.toLowerCase())>-1;
            //console.log('locatio check',locationCheck

            var moveForward=this.props.isLocationView?locationCheck&&titleMatch:locationCheck&& (titleMatch || partialTitleMatch);
            //console.log(this.props.isLocationView,"::",titleMatch,"::",moveForward)
            if(moveForward){

                //to get better description copy, now query dbpedia and lets hope we get the same result as from geonames
                var dbpediaQuery="";
                switch(this.props.type){
                    case 'default':
                        dbpediaQuery="QueryString="+wikiResult.title;
                        break;
                    case 'location':
                    default:
                        dbpediaQuery="QueryClass=PopulatedPlace&QueryString="+wikiResult.title;
                }

                //console.log(dbpediaQuery)

                var finalDescription;
                fetch("http://lookup.dbpedia.org/api/search/KeywordSearch?"+dbpediaQuery, {
                    method: 'get',
                    headers:dbpediaHeaders
                }).then((rawServiceResponse)=> {
                    return rawServiceResponse.text();
                }).then((response)=> {

                    var results=JSON.parse(response).results;
                    if(results.length){
                        for(var i=0;i<results.length;i++){
                            if(results[i].label&&results[i].label.toLowerCase().replace(/\s/g, '').indexOf(cleardQuery.replace(/\s/g, '').toLowerCase())>-1){
                                //get the final description
                                finalDescription=results[i].description;
                                break;
                            }
                        }
                    }
                    //if we didn't get a good description from dbpedia, lets use the geonames one
                    if(!finalDescription)finalDescription=wikiResult.summary.replace("(...)","...");

                    //finally update state
                    this.setState({"wikipediaDescription":finalDescription,"wikiURL":wikiResult.wikipediaUrl})
                })

            }
        }).catch(err=>console.log('fetch err',err));
    }

    openWikipedia(){
        Linking.openURL('http://'+this.state.wikiURL);
    }

    render() {
        var wikipedia=this.state.wikipediaDescription.length>0?
                <View style={styles.infoBoxContainer}>
                    <Text style={styles.infoBoxTitle}>WIKIPEDIA</Text>
                    <TouchableHighlight underlayColor="#dfdfdf" onPress={()=>{this.openWikipedia()}}>
                        <Text style={styles.infoBoxCopy}>{this.state.wikipediaDescription}</Text>
                    </TouchableHighlight>
                </View>
            :null;
        return(
            <View>
                {wikipedia}
            </View>
        )
    }
}

WikpediaInfoBox.defaultProps={
    location:"",
    type:"default",
    isLocationView:false
};

export default WikpediaInfoBox