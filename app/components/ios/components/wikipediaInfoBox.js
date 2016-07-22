'use strict';

var React = require('react-native');
import store from 'react-native-simple-store';
import config from '../../../data/config';

const {instagram,sherpa}=config.auth[config.environment];

var {
    Component,
    View,
    Text
    } = React;

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


        //console.log(queryUrl);
                fetch("http://lookup.dbpedia.org/api/search/KeywordSearch?QueryClass=place&QueryString="+query, {

        //fetch(queryUrl, {
            method: 'get',
            headers: dbpediaHeaders
        }).then((rawServiceResponse)=> {
            return rawServiceResponse.text();
        }).then((response)=> {
            //console.log('response',JSON.parse(response))
            //this.setState({"wikipediaDescription":JSON.parse(response).results.bindings[0].abstract.value})
            this.setState({"wikipediaDescription":JSON.parse(response).results[0].description})
        }).catch(err=>console.log('device token err',err));
    }

    render() {
        var wikipedia=this.state.wikipediaDescription.length>0?<View style={{paddingTop:28,paddingBottom:20,paddingLeft:20,paddingRight:20,marginLeft:10,marginRight:10,backgroundColor:'white'}}>
            <Text style={{position:'absolute',left:8,top:8,fontSize:10,color:"#999999"}}>WIKIPEDIA</Text>
            <Text style={{fontSize:13}}>{this.state.wikipediaDescription}</Text>
        </View>:<View></View>;
        //console.log('wikipedia',wikipedia)
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