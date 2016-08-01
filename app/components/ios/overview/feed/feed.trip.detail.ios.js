import React from 'react-native';
import { connect } from 'react-redux';
import FeedTrip from './feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import Mapbox from "react-native-mapbox-gl";
import MaskedView from "react-native-masked-view";
import {removeMomentFromSuitcase,addMomentToSuitcase} from '../../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import PopOver from '../../components/popOver';
import UserImage from '../../components/userImage';
import StickyHeader from '../../components/stickyHeader';
import WikipediaInfoBox from '../../components/wikipediaInfoBox';
import FoursquareInfoBox from '../../components/foursquareInfoBox';


var {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
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
        width:windowSize.width,
        height:windowSize.width-30,
        marginBottom:30
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        marginTop:-5,
        marginBottom:215,
        marginLeft:15,
        marginRight:15,
        width:windowSize.width-30,
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
        var profilePic= this.props.tripDetails.owner?
            <View style={{height:30,width:30,top:80,right:20,position:'absolute'}}>
                <UserImage onPress={()=>{this.showUserProfile(this.props.tripDetails)}} radius={30} imageURL={this.props.tripDetails.owner.serviceProfilePicture}></UserImage>
            </View>:<View></View>

        return (
            <ScrollView style={{flex:1,backgroundColor:'white'}}>

                <Image
                    style={{marginTop:70,marginLeft:15,height:windowSize.width-30,width:windowSize.width-30 }}
                    resizeMode="cover"
                    source={{uri:this.props.tripDetails.trip.mediaUrl}}
                />


                {profilePic}

                <MaskedView maskImage='mask-bottom' style={{height:250,width:windowSize.width,left:0,flex:1,position:'absolute',bottom:0,fontSize:10}} >

                    <Mapbox
                        style={{height:250,width:windowSize.width,left:0,flex:1,position:'absolute',bottom:0,fontSize:10,fontFamily:"TSTAR", fontWeight:"500"}}
                        styleURL={'mapbox://styles/thomasragger/cih7wtnk6007ybkkojobxerdy'}
                        accessToken={'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw'}
                        centerCoordinate={{latitude:this.props.tripDetails.trip.lat,longitude: this.props.tripDetails.trip.lng}}
                        zoomLevel={8}
                        onScroll={(event)=>{
                             var currentOffset = event.nativeEvent.contentOffset.y;
                             var direction = currentOffset > this.offset ? 'down' : 'up';
                             this.offset = currentOffset;
                             if(direction=='down'||currentOffset<30){
                                this.refs.stickyHeader._setAnimation(false);
                             }else{
                                this.refs.stickyHeader._setAnimation(true);
                             }
                        }}
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
                <WikipediaInfoBox location={this.props.tripDetails.trip.venue} coordinates={{lat:this.props.tripDetails.trip.lat,lng:this.props.tripDetails.trip.lng}}></WikipediaInfoBox>
                <FoursquareInfoBox location={this.props.tripDetails.trip.venue} coordinates={{lat:this.props.tripDetails.trip.lat,lng:this.props.tripDetails.trip.lng}}></FoursquareInfoBox>

                <TouchableHighlight underlayColor="#011e5f" style={[styles.button,{backgroundColor:this.state.suitcased?'#8ad78d':'#001545'}]} onPress={() => this.suiteCaseTrip(this.props.tripDetails.trip)}>
                    <View>
                        <Text style={styles.copyLarge}>{this.state.suitcased?"SAVED TO SUITCASE":"SAVE TO SUITCASE"}</Text>
                    </View>
                </TouchableHighlight>


                {this.props.navigation.default}
                <PopOver ref="popover"></PopOver>
                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </ScrollView>
        )
    }
}

export default TripDetail;