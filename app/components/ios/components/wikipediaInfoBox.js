'use strict';
import store from 'react-native-simple-store';
import config from '../../../data/config';

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


var styles=StyleSheet.create({
    infoBoxContainer:{paddingTop:48,paddingBottom:20,paddingLeft:20,paddingRight:20,backgroundColor:'white'},
    infoBoxTitle:{position:'absolute',left:20,top:28,fontSize:10,color:"#999999"},
    infoBoxCopy:{fontSize:13}
})

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
            for(var i=0;i<maxRows;i++){
                //normalize results and query by converting special characters into regular characters, i.e. "á" to "a"
                var wikiTitle=wikiResponse[i].title.split(",")[0];
                var cleardQuery=removeDiacritics(query.toLowerCase());
                var cleardResponse=removeDiacritics(wikiTitle.toLowerCase());
                //console.log('loop max rows');
                //console.log(wikiTitle,query);

                // name matching::compare if we have :
                // a perfect match on the regular query
                // a perfect match on the normalized query
                //console.log(wikiTitle,'::',query,'==')
                if(wikiTitle.toLowerCase()==query.toLowerCase() || cleardQuery==cleardResponse){
                    //console.log('title match');
                    wikiResult=wikiResponse[i];
                    titleMatch=true;
                    break;
                }
                //if we have no name match, check if at least the feature-type matches, so we received a country when looking for one
                //best for populated places
                else if(wikiResponse[i].feature==this.props.type){
                    wikiResult=wikiResponse[i];
                    break;
                }
                //add another check if we at least have a result with the same countryCode
                //best for populated places
                else if(this.props.country&&wikiResponse[i].countryCode==this.props.country.countryCode){
                    wikiResult=wikiResponse[i];
                    break;
                }
            }

            //console.log('wiki result',wikiResult)


            //now that we have the best likely result, we'll do another check if its withing a certain lat/lng range from our query

            //if we requested a location, it will likely not have coordinates attached by geonames for some reason
            //but also likely already passed one of the earlier tests, so we'll give it a shot without lat/lng matching.

            var latLngRange=1;
            //console.log(this.props.coordinates,"::",wikiResult)
            var locationCheck=this.props.type=='default'?
            this.props.coordinates&&
            (Math.floor(this.props.coordinates.lat)<=Math.floor(wikiResult.lat)+latLngRange)&&
            (Math.floor(this.props.coordinates.lat)>=Math.floor(wikiResult.lat)-latLngRange)&&
            (Math.floor(this.props.coordinates.lng)<=Math.floor(wikiResult.lng+latLngRange))&&
            (Math.floor(this.props.coordinates.lng)>=Math.floor(wikiResult.lng-latLngRange)):
                true;

            var partialTitleMatch=wikiResult.title.toLowerCase().indexOf(query.toLowerCase())>-1;
            //console.log('locatio check',locationCheck)

            if(
                locationCheck&&
                (titleMatch || partialTitleMatch)
            ){

                //to get better description copy, now query dbpedia and lets hope we get the same result as from geonames
                var dbpediaQuery="";
                switch(this.props.type){
                    case 'default':
                        dbpediaQuery="QueryString="+cleardQuery;
                        break;
                    case 'location':
                    default:
                        dbpediaQuery="QueryClass=PopulatedPlace&QueryString="+cleardQuery;
                }

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
                            //another round of name matching, remove spaces from results because there were some anomalies
                            if(results[i].label&&results[i].label.toLowerCase().replace(/\s/g, '').indexOf(cleardQuery.replace(/\s/g, '').toLowerCase())>-1&&results[i].countryCode==me.props.countryCode){
                                //get the final description
                                finalDescription=results[i].description;

                                //sometimes dbpedia returns result with the label missing from the first sentence, if thats the case, lets add it
                                //if(finalDescription.indexOf(results[i].label)!==0)finalDescription=results[i].label+""+finalDescription;
                                break;
                            }
                        }
                    }
                    //if we didn't get a good description from dbpedia, lets use the geonames one
                    if(!finalDescription)finalDescription=wikiResult.summary.replace("(...)","...");

                    //finally update state
                    //console.log('geonames result',wikiResult);
                    //console.log('dbpedia result',finalDescription);
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
    type:"default"
};

export default WikpediaInfoBox