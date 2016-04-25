'use strict';

import React from "react-native";
import FeedLocation from "./feed.location.ios";
import FeedProfile from "./feed.profile.ios";
import countries from "./../../../../data/countries";
import Mapbox from "react-native-mapbox-gl";
import MaskedView from "react-native-masked-view";
import moment from 'moment';
import {loadFeed} from '../../../../actions/feed.actions';
import {addMomentToSuitcase} from '../../../../actions/user.actions';
import {udpateFeedState} from '../../../../actions/feed.actions';

var {
    StyleSheet,
    Component,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight
    } = React;



class FeedTrip extends Component {
    constructor(){
        super();
         this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        this.state= {
            dataSource: this.ds.cloneWithRows([]),
            annotations:[],
            suitCaseChange:false
        };
    }

    componentDidUpdate(){
        console.log('component did update');
    }

    componentWillMount(){
        console.log('will mount',this.props.trip);
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

        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({dataSource:this.ds.cloneWithRows(this.props.trip.moments),annotations:markers})
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
        this.props.dispatch(udpateFeedState("reset"));

        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    showTripDetail(trip,owner){
        this.props.dispatch(udpateFeedState("reset"));

        var tripDetails={trip,owner};
        this.props.navigator.push({
            id: "tripDetail",
            tripDetails
        });
    }

    showTripLocation(trip){
        this.props.dispatch(udpateFeedState("reset"));

        this.props.navigator.push({
            id: "location",
            trip
        });
    }

    _renderHeader(){
        var tripData=this.props.trip;
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();
        var photoOrPhotos=tripData.moments.length>1?"PHOTOS":"PHOTO";
        var countryOrState=(tripData.country.toUpperCase()==="US")?tripData.state:country.name;


        return (
            <View style={{flex:1}}>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FAFAFA', height:550, width:380,alignItems:'center',flex:1}} >

                    <View
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:1,backgroundColor:'black' }}
                    />

                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:.5 }}
                        resizeMode="cover"
                        source={{uri:this.props.trip.moments[0].mediaUrl}}
                    />

                    <Text style={{color:"#FFFFFF",fontSize:14,marginTop:80,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800",}}>{this.props.trip.owner.serviceUsername.toUpperCase()}'S TRIP TO</Text>
                    <TouchableHighlight style={{height:30}} onPress={() => this.showTripLocation(this.props.trip)}>
                        <Text style={{color:"#FFFFFF",fontSize:35, fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{countryOrState.toUpperCase()}</Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={{height:50,width:50,marginTop:20,marginBottom:20}}  onPress={() => this.showUserProfile(this.props.trip)}>
                        <Image
                            style={{height:50,width:50,opacity:1,borderRadius:25}}
                            resizeMode="cover"
                            source={{uri:this.props.trip.owner.serviceProfilePicture}}
                        />
                    </TouchableHighlight>

                    <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',position:'absolute',top:260,left:0,right:0,height:20,marginTop:-5}}>
                        <Text style={{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{tripData.continent.toUpperCase()}</Text>
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
                    {/*<Image source={require('image!icon-duration-negative')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                    <Text style={{color:"#282b33",fontSize:8, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{timeAgo.toUpperCase()}</Text> */}

                    <Image source={require('image!icon-divider')} style={{height:25,marginLeft:35,marginRight:25}} resizeMode="contain"></Image>

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
        console.log('render row');
        return (
            <View style={styles.listItem} style={styles.listItemContainer}>
                    <TouchableHighlight onPress={()=>{
                        this.showTripDetail(tripData,this.props.trip.owner);
                    }}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.mediaUrl}}
                    />
                    </TouchableHighlight>
                <View style={{position:"absolute",bottom:-30,left:0,flex:1,width:350,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                    <TouchableHighlight>
                        <Text style={{color:"#282b33",fontSize:10,fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight style={{width:18,height:18}} onPress={()=>{
                        this.suiteCaseTrip(tripData);
                        tripData.suitecased=true;
                        //this.setState({suitCaseChange:true})
                        this.setState({dataSource:this.ds.cloneWithRows(this.props.trip.moments)})
                        console.log('suitcasechange');
                    }}>
                        <View>
                            <Image
                                style={{width:18,height:18,top:0,position:"absolute",opacity:tripData.suitecased?.5:1}}
                                resizeMode="contain"
                                source={require('./../../../../images/suitcase.png')}
                            />
                            <Image
                                style={{width:10,height:10,left:5,top:5,opacity:tripData.suitecased?1:0,position:"absolute"}}
                                resizeMode="contain"
                                source={require('./../../../../images/suitcase-check.png')}
                            />
                        </View>
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

export default FeedTrip;