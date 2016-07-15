import React from 'react-native';
import { connect } from 'react-redux/native';
import FeedTrip from './feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import Mapbox from "react-native-mapbox-gl";
import MaskedView from "react-native-masked-view";
import {removeMomentFromSuitcase,addMomentToSuitcase} from '../../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import PopOver from '../../components/popOver';


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
        marginTop:-5,
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
    constructor(props){
        super();
        this.state={
            suitcased:props.tripDetails.trip.suitcased
        }
    }

    componentDidMount(){
    }

    showUserProfile(trip){
        console.log('show user profile',trip);
        this.props.navigator.push({
            id: "profile",
            trip
        });
    }

    toggleNav(){
        this.refs.popover._setAnimation("toggle");
    }

    suiteCaseTrip(trip){
        trip.suitcased=!trip.suitcased;
        this.setState({suitcased:trip.suitcased});
        if(trip.suitcased){
            addMomentToSuitcase(trip.id);
        }else{
            removeMomentFromSuitcase(trip.id);
        }
    }

    reset(){
        return true;
    }

    render(){
        var timeAgo=moment(new Date(this.props.tripDetails.trip.date*1000)).fromNow();
        return (
            <View style={{flex:1}}>

                    <Image
                        style={{marginTop:70,marginLeft:15,height:350,width:350 }}
                        resizeMode="cover"
                        source={{uri:this.props.tripDetails.trip.mediaUrl}}
                    />


                    <TouchableHighlight style={{height:30,width:30,top:80,right:20,position:'absolute'}}   onPress={() => this.showUserProfile(this.props.tripDetails)}>
                        <Image
                            style={{height:30,width:30,opacity:1,borderRadius:15}}
                            resizeMode="cover"
                            source={{uri:this.props.tripDetails.owner.serviceProfilePicture}}
                        />
                    </TouchableHighlight>

                <MaskedView maskImage='mask-bottom' style={{height:250,width:windowSize.width,left:0,flex:1,position:'absolute',bottom:0,fontSize:10}} >

                <Mapbox
                    style={{height:250,width:windowSize.width,left:0,flex:1,position:'absolute',bottom:0,fontSize:10,fontFamily:"TSTAR", fontWeight:"500"}}
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
                                height: 7,
                                width: 7
                            },
                            id:"markers1"
                        }
                    ]}
                    scrollEnabled={true}
                    zoomEnabled={true}
                />

                </MaskedView>

                <TouchableHighlight underlayColor="#011e5f" style={[styles.button,{backgroundColor:this.state.suitcased?'#8ad78d':'#001545'}]} onPress={() => this.suiteCaseTrip(this.props.tripDetails.trip)}>
                    <View>
                        <Text style={styles.copyLarge}>{this.state.suitcased?"SAVED TO SUITCASE":"SAVE TO SUITCASE"}</Text>
                    </View>
                </TouchableHighlight>



                {this.props.navigation}
                <PopOver ref="popover"></PopOver>
            </View>
        )
    }
}

export default TripDetail;