'use strict';

import React from "react-native";
import MaskedView from "react-native-masked-view";
import Mapbox from "react-native-mapbox-gl";
import FeedLocation from "./feed.location.ios";
import FeedProfile from "./feed.profile.ios";
import countries from "./../../../../data/countries";
import moment from 'moment';
import {loadFeed} from '../../../../actions/feed.actions';
import {addMomentToSuitcase} from '../../../../actions/user.actions';

var {
    StyleSheet,
    Component,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight
    } = React;



class FeedDestination extends Component {
    constructor(){
        super();
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state= {
            dataSource: ds.cloneWithRows([]),
            annotations:[]
        };
    }

    componentDidUpdate(){
    }

    componentWillMount(){
        var markers=[];
        for (var i=0;i<this.props.trip.moments.length;i++){
            markers.push({
                coordinates: [this.props.trip.moments[i].lat, this.props.trip.moments[i].lng],
                type: 'point',
                title:this.props.trip.moments[i].venue,
                annotationImage: {
                    url: 'image!icon-pin',
                    height: 24,
                    width: 24
                },
                id:"markers"+i
            })
        }

        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({dataSource:ds.cloneWithRows(this.props.trip.moments),annotations:markers})
    }

    render(){
        return(
            <ListView
               dataSource={this.state.dataSource}
               renderRow={this._renderRow.bind(this)}
               contentContainerStyle={styles.listView}
               renderHeader={this._renderHeader.bind(this)}
               ref="listview"
            />
        )
    }

    suiteCaseTrip(trip){
        addMomentToSuitcase(trip.id);
    }

    showUserProfile(trip){
        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    showTripLocation(trip){
        this.props.navigator.push({
            id: "location",
            trip
        });
    }

    _renderHeader(){
        var tripData=this.props.trip;

        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.name;
        })[0];



        var photoOrPhotos=tripData.moments.length>1?"PHOTOS":"PHOTO";
        var countryOrState=country ? country.name : tripData.name;
        //var mapURI="https://api.mapbox.com/v4/mapbox.emerald/"+this.props.trip.moments[0].lng+","+this.props.trip.moments[0].lat+",8/760x1204.png?access_token=pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw";
        var mapURI=this.props.trip.moments[0].mediaUrl;
        return (
            <View style={{flex:1}}>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FAFAFA', height:550, width:380,alignItems:'center',flex:1}} >

                    <View
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:1,backgroundColor:'black' }}
                    />
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:.5 }}
                        source={{uri:mapURI}}
                    >

                    </Image>


                    <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',position:'absolute',top:160,left:0,right:0,height:20,marginTop:-5}}>
                        <TouchableHighlight style={{height:30}} onPress={() => this.showTripLocation(this.props.trip)}>
                            <Text style={{color:"#FFFFFF",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{countryOrState.toUpperCase()}</Text>
                        </TouchableHighlight>
                    </View>
                </MaskedView>
                <Mapbox
                    style={{height:200,width:350,left:15,backgroundColor:'black',flex:1,position:'absolute',top:335,fontSize:10,fontFamily:"TSTAR", fontWeight:"500"}}
                    styleURL={'mapbox://styles/thomasragger/cih7wtnk6007ybkkojobxerdy'}
                    accessToken={'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw'}
                    centerCoordinate={{latitude: this.props.trip.moments[0].lat,longitude: this.props.trip.moments[0].lng}}
                    zoomLevel={8}
                    annotations={this.state.annotations}
                    scrollEnabled={true}
                    zoomEnabled={true}
                />
                <View style={{bottom:20,backgroundColor:'white',flex:1,alignItems:'center',width:350,justifyContent:'center',flexDirection:'row',position:'absolute',height:50,left:15,top:285}}>

                    <Image source={require('image!icon-images-negative')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length} {photoOrPhotos}</Text>


                </View>

                <Image
                    style={{flex:1,height:60,top:335,position:"absolute",width:380,backgroundColor:'transparent'}}
                    resizeMode="cover"
                    source={require('image!shadow')}
                />

                <TouchableHighlight underlayColor="#011e5f" style={styles.button} onPress={() => this.showTripLocation(this.props.trip)}>
                    <View>
                        <Text style={styles.copyLarge}>EXPLORE THIS AREA</Text>
                    </View>
                </TouchableHighlight>

                {this.props.navigation}
            </View>
        )
    }

    _renderRow(tripData) {
        if(tripData.type!=='image')return(<View></View>);
        return (
            <View style={styles.listItemContainer}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.mediaUrl}}
                    />
                </View>
                <View style={{position:"absolute",bottom:-30,left:0,flex:1,width:350,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                    <TouchableHighlight>
                        <Text style={{color:"#282b33",fontSize:10,fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                    </TouchableHighlight>

                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center',
        paddingBottom:10,
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50
    },
    listItemContainer:{
        flex:1,
        width:350,
        height:350,
        marginBottom:30
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-15,
        marginBottom:13,
        marginLeft:15,
        marginRight:15,
        width:350,
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    }
});

export default FeedDestination;