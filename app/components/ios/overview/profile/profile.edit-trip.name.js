'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
    ScrollView,
    TextInput,
    Alert
} from 'react-native';
import React, { Component } from 'react';
import SimpleButton from '../../components/simpleButton';
import Dimensions from 'Dimensions';
import { Fonts, Colors } from '../../../../Themes/'
const SCREEN_WIDTH = require('Dimensions').get('window').width;
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import {createMoment,uploadMoment,getGps,createTrip,getTripLocation} from "../../../../actions/trip.edit.actions"



class EditTripName extends React.Component {
    constructor(props){
        super(props)
        this.state={
            remainingCharacters:30,
            text:"",
            positionBottom:new Animated.Value(14)
        }
    }

    componentDidMount(){
        //console.log(this.props.momentData);
    }

    navActionRight(){

        var moments=[];
        var momentIDs=[];
        //create moments
        for(var i=0;i<this.props.momentData.length;i++){
            let momentPromise = createMoment({
                "lat":this.props.momentData[i].moment.lat,
                "lng":this.props.momentData[i].moment.lng,
                "shotDate": this.props.momentData[i].moment.shotDate,
                "location": this.props.momentData[i].moment.location,
                "state": this.props.momentData[i].moment.state,
                "country": this.props.momentData[i].moment.country
            });
            moments.push(momentPromise)
        }


        getTripLocation(this.props.momentData).then((tripLocation)=>{
            Promise.all(moments).then((momentsRes)=>{
                //console.log('trip location',tripLocation);

                var momentUploads=[];
                var dates=[]
                for(var i=0;i<  this.props.momentData.length;i++){
                    momentIDs.push(momentsRes[i].id)
                    this.props.momentData[i].data=momentsRes[i];
                    dates.push(this.props.momentData[i].moment.shotDate)
                    momentUploads.push(uploadMoment(this.props.momentData[i]));
                }

                dates.sort(function(a,b) {
                    return new Date(a.start).getTime() - new Date(b.start).getTime()
                });

                //console.log(dates);
                var startDate=new Date(dates[0]).getTime()/1000;
                var endDate=dates[dates.length-1].getTime()/1000;

                //console.log('start date',startDate);
                //console.log('end date',endDate);

                Promise.all(momentUploads).then((res)=>{

                    createTrip({
                        momentIDs,
                        name:this.state.text,
                        startDate,
                        endDate
                    },tripLocation).then(()=>{
                        Alert.alert(
                            'Upload Successful',
                            'Your trip has been created'
                        )
                    }).catch((err)=>{
                        Alert.alert(
                            'Upload Failed',
                            'Your trip creation has failed'
                        )
                    })

                }).catch((err)=>{console.log('err')});
            })

            this.props.navigator.push({
                id: "own-profile",
                hideNav:false,
                momentData:this.props.momentData,
                sceneConfig:"bottom-nodrag"
            });
        });


    }

    onStart(){
        Animated.spring(this.state.positionBottom, {toValue: 280,friction:7}).start();
    }

    onEnd(){
        Animated.spring(this.state.positionBottom, {toValue: 14,friction:7}).start();
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'white',width:SCREEN_WIDTH,justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                <AutoGrowingTextInput clearTextOnFocus={true}
                           clearButtonMode="while-editing"
                           style={
                                {
                                    fontSize:35,
                                    color:"black",
                                    fontWeight:"500",
                                    fontFamily:Fonts.type.headline,
                                    marginTop:-190,
                                    textAlign:"center",
                                    letterSpacing:1,
                                    marginBottom:10
                                }
                            }
                                      maxLength={30}
                           onFocus={this.onStart.bind(this)}
                           onBlur={this.onEnd.bind(this)}
                           onChangeText={(text) =>{this.setState({text:text.toUpperCase(),remainingCharacters:30-text.length})}}
                                      value={this.state.text}
                                      placeholder={'NAME YOUR TRIP'}
                >
                </AutoGrowingTextInput>
                <Text style={{color:"#999999",fontFamily:Fonts.type.headline,fontSize:10,letterSpacing:.5}}>EDIT YOUR TRIP NAME HERE ({this.state.remainingCharacters})</Text>
                {this.props.navigation.default}
                <Animated.View style={{position:'absolute',bottom:this.state.positionBottom,left:7,flex:1}}>
                    <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7}} onPress={()=>{this.navActionRight()}} text="save and publish trip"></SimpleButton>
                </Animated.View>

            </View>
        )
    }
}


var styles = StyleSheet.create({

});



export default EditTripName;