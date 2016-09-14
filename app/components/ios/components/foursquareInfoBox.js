'use strict';

import store from 'react-native-simple-store';
import config from '../../../data/config';
import _ from 'underscore';
const {instagram,sherpa,foursquare}=config.auth[config.environment];


import {
    View,
    Text,
    Image,
    TouchableHighlight,
    Linking,
    StyleSheet
} from 'react-native';
import React, { Component } from 'react';


var styles=StyleSheet.create({
    ratingContainer:{flex:1,flexDirection:'row',alignItems:'flex-start',justifyContent:'flex-end'},
    ratingNumber:{fontSize:8,marginTop:1,marginLeft:1},
    ratingCount:{fontSize:10,color:"#999"},

    pricingLight:{fontSize:12,color:"#333"},
    pricingDark:{fontSize:12,color:"#999"},
    pricingContainer:{marginLeft:8,flex:1,justifyContent:'center'},


    infoBoxContainer:{paddingTop:20,paddingBottom:20,paddingLeft:20,paddingRight:25,backgroundColor:'white'},
    infoBoxTitle:{marginTop:5,marginBottom:13,fontSize:10,color:"#999999"},

    venueContainer:{flex:1,flexDirection:'row',justifyContent:'space-between'},
    venueIconContainer:{width:30,height:30,backgroundColor:"#8ad78d",flex:1,alignItems:'center',justifyContent:'center',borderRadius:3},
    venueIcon:{height:16,width:16}
});

class FoursquareInfoBox extends Component {
    constructor(props){
        super(props);
        this.state={
            venue:undefined
        }

    }

    componentDidMount(){
        var location=this.props.location;
        if(location.split(",").length>=0)location=location.split(",")[0];

        //console.log('foursquare location',location);
        this.getFoursquareData(location);
    }

    getFoursquareData(query){
        var venueSearchEndpoint="https://api.foursquare.com/v2/venues/search?"+
            "client_id="+foursquare.client_id+
            "&client_secret="+foursquare.client_secret+
            "&v="+foursquare.version+
            "&ll="+this.props.coordinates.lat+","+this.props.coordinates.lng+
            "&query="+query;


        fetch(venueSearchEndpoint, {
            method: 'get'
        }).then((rawServiceResponse)=> {
            return rawServiceResponse.text();
        }).then((response)=> {
            var venueResult=JSON.parse(response).response.venues;
            if(venueResult.length==0)return;

            var targetIndex=-1;

            var s1 = query.toLowerCase();
            for(var i=0;i<venueResult.length;i++){

                var s2 = venueResult[i].name.toLowerCase();

                if(
                   s1.indexOf(s2)>-1||s2.indexOf(s1)>-1
                ){
                    targetIndex=i;
                    break;
                }
            }

            var venueQueryEndpoint="https://api.foursquare.com/v2/venues"+
                "/"+venueResult[targetIndex].id+
                "?client_id="+foursquare.client_id+
                "&client_secret="+foursquare.client_secret+
                "&v="+foursquare.version;


            if(targetIndex>-1){
                fetch(venueQueryEndpoint, {
                    method: 'get'
                }).then((rawServiceResponse)=> {
                    return rawServiceResponse.text();
                }).then((response)=> {
                    var venueInfo=JSON.parse(response).response.venue;
                    if(venueInfo.name.toLowerCase()!=query.toLowerCase())return;
                    var venueObject={
                        category:venueInfo.categories[0]?venueInfo.categories[0].name:"",
                        rating:venueInfo.rating||undefined,
                        ratingCount:venueInfo.ratingSignals||undefined,
                        price:_.findWhere(venueInfo.attributes.groups,{type: "price"}),
                        icon:venueInfo.categories[0].icon.prefix+"64"+venueInfo.categories[0].icon.suffix
                    }

                    this.setState({venue:venueObject,foursquareURL:venueInfo.canonicalUrl});

                })
            }
        }).catch(err=>console.log('device token err',err));
    }

    openFoursquare(){
        Linking.openURL(this.state.foursquareURL)
    }

    render() {
        if(!this.state.venue)return(<View></View>);
        var ratings=this.state.venue.rating?
                    <View>
                        <View style={styles.ratingContainer}>
                            <Text>{this.state.venue.rating}/</Text>
                            <Text style={styles.ratingNumber}>10</Text>
                        </View>
                        <View>
                            <Text style={styles.ratingCount}>{this.state.venue.ratingCount} Ratings</Text>
                        </View>
                    </View>
                :<View></View>


        var pricing;
            if(this.state.venue.price){
                var dollarsStart="";
                var dollarsEnd="";
                for(var i=0;i<5;i++){
                    if(i<this.state.venue.price.summary.length){
                        dollarsStart+="$"
                    }else{
                        dollarsEnd+="$";
                    }
                }
                pricing=
                    <View style={{flex:1,flexDirection:'row'}}>
                        <Text style={styles.pricingLight}>{dollarsStart}</Text>
                        <Text style={styles.pricingDark}>{dollarsEnd}</Text>
                    </View>
            }else{
                pricing=<View></View>
            }

        return(
                <View style={styles.infoBoxContainer} >
                    <TouchableHighlight underlayColor="#dfdfdf" onPress={()=>{this.openFoursquare()}}>
                        <View>
                            <Text style={styles.infoBoxTitle}>FOURSQUARE</Text>
                            <View style={styles.venueContainer}>
                                <View>
                                    <View style={styles.venueIconContainer}>
                                        <Image
                                            style={styles.venueIcon}
                                            resizeMode="contain"
                                            source={{uri:this.state.venue.icon}}
                                        />
                                    </View>
                                </View>
                                <View style={styles.pricingContainer}>
                                    <Text style={styles.pricingDark}>{this.state.venue.category}</Text>
                                    {pricing}
                                </View>
                                {ratings}
                            </View>
                        </View>
                    </TouchableHighlight>
                </View>
        )
    }
}

FoursquareInfoBox.defaultProps={
    location:""
}

export default FoursquareInfoBox