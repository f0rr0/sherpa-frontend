'use strict';
import store from 'react-native-simple-store';
import config from '../../../data/config';

import {
    View,
    Text,
    Linking,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';
import {removeDiacritics} from '../utils/stringUtils';


var styles=StyleSheet.create({
    infoBoxContainer:{paddingTop:28,paddingBottom:20,paddingLeft:20,paddingRight:20,marginLeft:10,marginRight:10,backgroundColor:'white'},
    infoBoxTitle:{position:'absolute',left:8,top:8,fontSize:10,color:"#999999"},
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
        dbpediaHeaders.append("accept", "application/json");
        query=query.indexOf(",")>0?query.split(',')[0]:query;
        var featureType=this.props.type=='country'?"&feature=country":"";
        fetch("http://api.geonames.org/wikipediaSearchJSON?maxRows=5&username=travelsherpa"+featureType+"&q="+query, {
            method: 'get'
        }).then((rawServiceResponse)=> {
            return rawServiceResponse.text();
        }).then((response)=> {
            var wikiResponse=JSON.parse(response).geonames;
            if(wikiResponse.length==0)return;

            var wikiResult=wikiResponse[0];
            var titleMatch=false;

            for(var i=0;i<5;i++){
                var cleardQuery=removeDiacritics(query.toLowerCase());
                var cleardResponse=removeDiacritics(wikiResponse[i].title.toLowerCase());

                if(wikiResponse[i].title.toLowerCase()==query.toLowerCase()|| wikiResponse[i].title.toLowerCase().indexOf(query.toLowerCase())>-1 || cleardQuery==cleardResponse){
                    wikiResult=wikiResponse[i];
                    titleMatch=true;
                    break;
                }
                else if(wikiResponse[i].feature==this.props.type){
                    wikiResult=wikiResponse[i];
                    break;
                }else if(this.props.country&&wikiResponse[i].countryCode==this.props.country.countryCode){
                    wikiResult=wikiResponse[i];
                    break;
                }
            }

            var locationCheck=this.props.type=='default'?
            this.props.coordinates&&
            (Math.floor(this.props.coordinates.lat)<=Math.floor(wikiResult.lat)+1)&&
            (Math.floor(this.props.coordinates.lat)>=Math.floor(wikiResult.lat)-1)&&
            (Math.floor(this.props.coordinates.lng)<=Math.floor(wikiResult.lng+1))&&
            (Math.floor(this.props.coordinates.lng)>=Math.floor(wikiResult.lng-1)):
                true;

            if(
                locationCheck&&
                (wikiResult.title.toLowerCase().indexOf(query.toLowerCase())>-1||titleMatch)
            ){

                if(this.props.type!="default"){
                    var finalDescription;
                    fetch("http://lookup.dbpedia.org/api/search/KeywordSearch?QueryClass=PopulatedPlace&QueryString="+cleardQuery, {
                        method: 'get',
                        headers:dbpediaHeaders
                    }).then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {

                        var results=JSON.parse(response).results;
                        if(results.length){
                            for(var i=0;i<results.length;i++){
                                if(results[i].label&&results[i].label.toLowerCase().replace(/\s/g, '').indexOf(cleardQuery.replace(/\s/g, '').toLowerCase())>-1){
                                        finalDescription=results[i].description;
                                        if(finalDescription.indexOf(results[i].label)==-1)finalDescription=results[i].label+" "+finalDescription;
                                    break;
                                }
                            }
                        }
                        finalDescription=finalDescription || wikiResult.summary.replace(" (...)","...");
                        this.setState({"wikipediaDescription":finalDescription,"wikiURL":wikiResult.wikipediaUrl})

                    })
                }else{
                    var finalDescription;
                    fetch("http://lookup.dbpedia.org/api/search/KeywordSearch?QueryString="+cleardQuery, {
                        method: 'get',
                        headers:dbpediaHeaders
                    }).then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                        var results=JSON.parse(response).results;
                        for(var i=0;i<results.length;i++){
                            if(results[i].label&&results[i].label.toLowerCase().replace(/\s/g, '').indexOf(cleardQuery.replace(/\s/g, '').toLowerCase())>-1){
                                finalDescription=results[i].description;
                                if(finalDescription.indexOf(results[i].label)==-1)finalDescription=results[i].label+" "+finalDescription;
                                break;
                            }
                        }

                        finalDescription=finalDescription || wikiResult.summary.replace(" (...)","...");
                        this.setState({"wikipediaDescription":finalDescription,"wikiURL":wikiResult.wikipediaUrl})
                    })

                }


            }
        }).catch(err=>console.log('device token err',err));
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