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
        console.log('query',query);

        query=query.indexOf(",")>0?query.split(',')[0]:query;


        ////
        //var strVar="";
        //strVar += "PREFIX geo: <http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#>";
        //strVar += "PREFIX dbo: <http:\/\/dbpedia.org\/ontology\/>";
        //strVar += "PREFIX dbpedia-owl: <http:\/\/dbpedia.org\/ontology\/>";
        //strVar += "PREFIX dbprop: <http:\/\/dbpedia.org\/property\/>";
        //strVar += "";
        //strVar += "SELECT DISTINCT *";
        //strVar += "WHERE {";
        //strVar += "   ?place rdf:type dbpedia-owl:Place ;";
        //strVar += "         rdfs:label \""+query+"\" ;";
        //strVar += "         dbpedia-owl:country ?country;";
        //strVar += "         dbpedia-owl:abstract ?abstract;";
        //strVar += "         geo:lat ?lat;";
        //strVar += "         geo:long ?long.";
        //strVar += "   FILTER ( lang(?abstract) = 'en')";
        //strVar += "}";
        //
        //var dbQuery = [strVar].join(" ");
        //var url="http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&query=";
        //var queryUrl = url + encodeURIComponent(dbQuery) +"&format=json&timeout=30000&debug=on";

        var featureType=this.props.type=='country'?"&feature=country":"";
        fetch("http://api.geonames.org/wikipediaSearchJSON?maxRows=5&username=travelsherpa"+featureType+"&q="+query, {
            method: 'get'
        }).then((rawServiceResponse)=> {
            return rawServiceResponse.text();
        }).then((response)=> {
            var wikiResponse=JSON.parse(response).geonames;
            if(wikiResponse.length==0)return;

            var wikiResult=wikiResponse[0];

            for(var i=0;i<5;i++){
                if(wikiResponse[i].feature==this.props.type){
                    wikiResult=wikiResponse[i];
                    break;
                }else if(wikiResponse[i].countryCode==this.props.country){
                    wikiResult=wikiResponse[i];
                    break;
                }
            }

            var locationCheck=this.props.type=='default'?
            this.props.coordinates&&
            (Math.floor(this.props.coordinates.lat)===Math.floor(wikiResult.lat))&&
            (Math.floor(this.props.coordinates.lng)===Math.floor(wikiResult.lng)):
                true;

            if(
                locationCheck&&
                (wikiResult.title.toLowerCase().indexOf(query.toLowerCase())>-1)
            ){

                if(this.props.type!="default"){

                    fetch("http://lookup.dbpedia.org/api/search/KeywordSearch?QueryClass=place&QueryString="+query, {
                        method: 'get',
                        headers:dbpediaHeaders
                    }).then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                        console.log('dbpedia response',response)
                        this.setState({"wikipediaDescription":JSON.parse(response).results[0].description,"wikiURL":wikiResult.wikipediaUrl})
                    })
                }else{
                    fetch("https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles="+wikiResult.title, {
                        method: 'get',
                        headers: dbpediaHeaders
                    }).then((rawServiceResponse)=>{
                        return rawServiceResponse.text();
                    }).then((response)=>{
                        var jsonResp=JSON.parse(response);
                        //console.log('response json',jsonResp)

                        var res;
                        for(var page in jsonResp.query.pages){
                            res = jsonResp.query.pages[page];
                            break;
                        }

                        //console.log('res',res)
                        var abstract=res.extract.replace(/<\/?[^>]+(>|$)/g, "");
                        var abstractSentences = abstract.match( /[^\.!\?]+[\.!\?]+/g );
                        console.log(abstractSentences);
                        var shortAbstract="";
                        var maxSentences=4;
                        var targetSentences=abstractSentences.length>=maxSentences?maxSentences:abstractSentences.length;
                        for(var i=0;i<targetSentences;i++){
                            shortAbstract+=abstractSentences[i];
                        }
                        //shortAbstract+="..";
                        //console.log(abstract);
                        //wikiResult.summary=wikiResult.summary.replace("(...)","...");
                        //console.log(wikiResult);
                        this.setState({"wikipediaDescription":shortAbstract,"wikiURL":wikiResult.wikipediaUrl})
                    })
                }


            }
        }).catch(err=>console.log('device token err',err));
    }

    openWikipedia(){
        //console.log('open url',this.state.wikiURL);
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
    location:"",
    type:"default"
}

export default WikpediaInfoBox