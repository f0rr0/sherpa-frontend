import React from 'react-native';
import { connect } from 'react-redux/native';
import FeedTrip from './feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import Mapbox from "react-native-mapbox-gl";
import MaskedView from "react-native-masked-view";
import {addMomentToSuitcase} from '../../../../actions/user.actions';

var {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableHighlight
    } = React;


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
        marginBottom:215,
        marginLeft:15,
        marginRight:15,
        width:350,
        justifyContent:'center',
        alignItems:'center'
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    }
});

class TripDetail extends React.Component{
    constructor(){
        super();
        this.state={
            suitcased:false
        }
    }

    componentDidMount(){
        console.log(this.props.tripDetails,'trip details');
    }

    suiteCaseTrip(trip){
        this.setState({
            suitcased:true
        })
        addMomentToSuitcase(trip.id);
    }

    render(){
        var timeAgo=moment(new Date(this.props.tripDetails.trip.date*1000)).fromNow();

        return (
            <View style={{flex:1}}>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FAFAFA', height:550, width:380,alignItems:'center',flex:1}} >

                    <View
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:1,backgroundColor:'black' }}
                    />

                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:.5 }}
                        resizeMode="cover"
                        source={{uri:this.props.tripDetails.trip.mediaUrl}}
                    />

                    <Text style={{color:"#FFFFFF",fontSize:14,marginTop:80,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800",}}>{this.props.tripDetails.owner.serviceUsername.toUpperCase()}'S TRIP TO</Text>

                    <TouchableHighlight style={{height:50,width:50,marginTop:20,marginBottom:0}}>
                        <Image
                            style={{height:50,width:50,opacity:1,borderRadius:25}}
                            resizeMode="cover"
                            source={{uri:this.props.tripDetails.owner.serviceProfilePicture}}
                        />
                    </TouchableHighlight>

                    <View style={{backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',position:'absolute',top:210,left:0,right:0,height:20,marginTop:-5}}>
                        <Text style={{color:"#FFFFFF",fontSize:20, marginTop:0,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{this.props.tripDetails.trip.venue.toUpperCase()}</Text>
                    </View>
                </MaskedView>
                <Mapbox
                    style={{height:150,width:350,left:15,backgroundColor:'black',flex:1,position:'absolute',bottom:70,fontSize:10,fontFamily:"TSTAR", fontWeight:"500"}}
                    styleURL={'mapbox://styles/thomasragger/cih7wtnk6007ybkkojobxerdy'}
                    accessToken={'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw'}
                    centerCoordinate={{latitude:this.props.tripDetails.trip.lat,longitude: this.props.tripDetails.trip.lng}}
                    zoomLevel={8}
                    annotations={[
                        {
                            coordinates: [this.props.tripDetails.trip.lat, this.props.tripDetails.trip.lng],
                            type: 'point',
                            title:this.props.tripDetails.trip.venue,
                            annotationImage: {
                                url: 'image!icon-pin',
                                height: 24,
                                width: 24
                            },
                            id:"markers1"
                        }
                    ]}
                    scrollEnabled={true}
                    zoomEnabled={true}
                />

                <TouchableHighlight underlayColor="#011e5f" style={[styles.button,{backgroundColor:this.state.suitcased?'#8ad78d':'#001545'}]} onPress={() => this.suiteCaseTrip(this.props.tripDetails.trip)}>
                    <View>
                        <Text style={styles.copyLarge}>ADD TO SUITCASE</Text>
                    </View>
                </TouchableHighlight>

                {this.props.navigation}
            </View>
        )
    }
}

export default TripDetail;