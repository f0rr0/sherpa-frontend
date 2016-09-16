import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import {udpateFeedState} from '../../../actions/feed.actions';

import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';


var styles = StyleSheet.create({
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center',
        paddingBottom:10,
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:38,
    }
});

class MomentRow extends Component{
    constructor(props){
        super();
        this.state={suitcased:props.tripData.suitcased}

    }

    componentDidMount(){
    }

    suiteCaseTrip(){
        this.setState({suitcased:true});
        addMomentToSuitcase(this.props.tripData.id);
    }

    unSuiteCaseTrip(){
        this.setState({suitcased:false});
        removeMomentFromSuitcase(this.props.tripData.id);
    }

    showTripDetail(trip,owner){
        this.props.dispatch(udpateFeedState("reset"));

        trip.suitcased=this.state.suitcased;

        var tripDetails={trip,owner,group:this.props.trip,row:this};
        this.props.navigator.push({
            id: "tripDetail",
            tripDetails
        });
    }

    componentDidUpdate(){
    }

    render(){

        var tripData = this.props.tripData;
        return(
            <View style={styles.listItem} style={styles.listItemContainer}>
                <TouchableHighlight onPress={()=>{
                            this.showTripDetail(tripData,this.props.trip.owner);
                        }}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:windowSize.width-30,width:windowSize.width-30,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.mediaUrl}}
                    />
                </TouchableHighlight>
                <View style={{position:"absolute",bottom:-30,left:0,flex:1,width:windowSize.width-30,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                    <TouchableHighlight>
                        <Text style={{color:"#282b33",fontSize:12,fontFamily:"Akkurat", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{width:18,height:18}} onPress={()=>{
                                if(!this.state.suitcased){
                                    this.suiteCaseTrip();
                                }else{
                                    this.unSuiteCaseTrip();
                                }
                            }}>
                        <View>
                            <Image
                                style={{width:18,height:18,top:0,position:"absolute",opacity:this.state.suitcased?.5:1}}
                                resizeMode="contain"
                                source={require('./../../../Images/suitcase.png')}
                            />
                            <Image
                                style={{width:10,height:10,left:5,top:5,opacity:this.state.suitcased?1:0,position:"absolute"}}
                                resizeMode="contain"
                                source={require('./../../../Images/suitcase-check.png')}
                            />
                        </View>
                    </TouchableHighlight>
                </View>
            </View>
        )
    }
}

export default MomentRow;