'use strict';
import store from 'react-native-simple-store';
import config from '../../../data/config';

const {instagram,sherpa}=config.auth[config.environment];

import {
    View,
    Text,
    Linking,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';


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


    //add latitude/longitude and location type (settlement,country,continent)
    getWikipediaData(query){
        var dbpediaHeaders = new Headers();
        dbpediaHeaders.append("accept", "application/json");

        query=query.indexOf(",")>0?query.split(',')[0]:query;


        var strVar="";
        strVar += "PREFIX geo: <http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#>";
        strVar += "PREFIX dbo: <http:\/\/dbpedia.org\/ontology\/>";
        strVar += "PREFIX dbpedia-owl: <http:\/\/dbpedia.org\/ontology\/>";
        strVar += "PREFIX dbprop: <http:\/\/dbpedia.org\/property\/>";
        strVar += "";
        strVar += "SELECT DISTINCT *";
        strVar += "WHERE {";
        strVar += "   ?place rdf:type dbpedia-owl:Place ;";
        strVar += "         rdfs:label \""+query+"\" ;";
        strVar += "         dbpedia-owl:country ?country;";
        strVar += "         dbpedia-owl:abstract ?abstract;";
        strVar += "         geo:lat ?lat;";
        strVar += "         geo:long ?long.";
        strVar += "   FILTER ( lang(?abstract) = 'en')";
        strVar += "}";

        var dbQuery = [strVar].join(" ");
        var url="http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=";
        var queryUrl = url + encodeURIComponent(dbQuery) +"&format=json&timeout=30000&debug=on";


        console.log("http://api.geonames.org/wikipediaSearchJSON?maxRows=1&username=travelsherpa&q="+query);
        fetch("http://api.geonames.org/wikipediaSearchJSON?maxRows=1&username=travelsherpa&q="+query, {
            method: 'get',
            headers: dbpediaHeaders
        }).then((rawServiceResponse)=> {
            return rawServiceResponse.text();
        }).then((response)=> {
            var wikiResponse=JSON.parse(response).geonames;
            if(wikiResponse.length==0)return;

            var wikiResult=wikiResponse[0];
            console.log( this.props.coordinates.lat.toFixed(1),wikiResult.lat.toFixed(1),
                this.props.coordinates.lng.toFixed(1),wikiResult.lng.toFixed(1));
            if(
                (!this.props.coordinates||
                (this.props.coordinates&&
                Math.round(this.props.coordinates.lat)===Math.round(wikiResult.lat))&&
                Math.round(this.props.coordinates.lng)===Math.round(wikiResult.lng))&&
                wikiResult.title.toLowerCase().indexOf(query.toLowerCase())>-1
            ){
                console.log(wikiResult)
                console.log('fetch result')

                //http://lookup.dbpedia.org/api/search/KeywordSearch?QueryClass=place&QueryString=berlin
                fetch("https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+wikiResult.title, {
                    method: 'get',
                    headers: dbpediaHeaders
                }).then((rawServiceResponse)=>{
                    return rawServiceResponse.text();
                }).then((response)=>{
                    var jsonResp=JSON.parse(response);
                    console.log('response json',jsonResp)

                    var res;
                    for(var page in jsonResp.query.pages){
                        res = jsonResp.query.pages[page];
                        break;
                    }

                    console.log('res',res)
                    var abstract=res.extract.replace(/<\/?[^>]+(>|$)/g, "");
                    var abstractSentences = abstract.match( /[^\.!\?]+[\.!\?]+/g );
                    console.log(abstractSentences);
                    var shortAbstract="";
                    for(var i=0;i<4;i++){
                        shortAbstract+=abstractSentences[i];
                    }
                    //console.log(abstract);
                    //wikiResult.summary=wikiResult.summary.replace("(...)","...");
                    //console.log(wikiResult);
                    this.setState({"wikipediaDescription":shortAbstract,"wikiURL":wikiResult.wikipediaUrl})
                })

            }
        }).catch(err=>console.log('device token err',err));
    }

    openWikipedia(){
        console.log('open url',this.state.wikiURL);
        Linking.openURL('http://'+this.state.wikiURL);
    }

    render() {
        var wikipedia=this.state.wikipediaDescription.length>0?
                <View style={{paddingTop:28,paddingBottom:20,paddingLeft:20,paddingRight:20,marginLeft:10,marginRight:10,backgroundColor:'white'}}>
                    <Text style={{position:'absolute',left:8,top:8,fontSize:10,color:"#999999"}}>WIKIPEDIA</Text>
                    <TouchableHighlight underlayColor="#dfdfdf" onPress={()=>{this.openWikipedia()}}>
                        <Text style={{fontSize:13}}>{this.state.wikipediaDescription}</Text>
                    </TouchableHighlight>
                </View>
            :<View></View>;
        return(
            <View>
                {wikipedia}
            </View>
        )
    }
}

WikpediaInfoBox.defaultProps={
    location:""
}

export default WikpediaInfoBox