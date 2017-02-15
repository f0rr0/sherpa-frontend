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
const SCREEN_HEIGHT = require('Dimensions').get('window').height;
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import {createMoment,uploadMoment,getGps,createTrip,getTripLocation} from "../../../../actions/trip.edit.actions"
import SimpleError from '../../components/simpleError';



class EditTripName extends React.Component {
    constructor(props){
        super(props)
        //console.log('props',props);
        this.state={
            remainingCharacters:30,
            text:props.tripData?props.tripData.name:"",
            positionBottom:new Animated.Value(14)
        }
    }

    componentDidMount(){
        //console.log(this.props.momentData);
    }

    navActionRight(){


        if(this.state.text==""){
            this.refs.tripnameError.show();
        }else{
            this.refs.tripnameError.hide();

            var moments=[];
            var momentIDs=[];

            //create moments or edit moments
            for(var i=0;i<this.props.momentData.length;i++){
                console.log('moment[i]',this.props.momentData[i]);
                let momentPromise = createMoment(this.props.momentData[i]);
                console.log('create moment promise')
                moments.push(momentPromise)
            }


            this.props.headerProgress.show();
            this.props.headerProgress.startToMiddle();

            getTripLocation(this.props.momentData).then((tripLocation)=>{
                console.log('got trip location',tripLocation)
                Promise.all(moments).then((momentsRes)=>{
                    console.log('moments res',momentsRes);

                    var momentUploads=[];
                    var dates=[];
                    var coverMomentID="";
                    for(var i=0;i<  this.props.momentData.length;i++){
                        if(this.props.selection[i].selected){
                            momentIDs.push(momentsRes[i].id)
                            console.log(this.props.selection[i],'selection')
                            if(this.props.selection[i].isCover){
                                console.log('moment',momentsRes[i])
                                coverMomentID=momentsRes[i].id;
                            }
                            this.props.selection[i].data=momentsRes[i];
                            dates.push(this.props.momentData[i].date || new Date().getTime()/1000)
                            if(!this.props.momentData[i].id&&this.props.momentData[i].service=='sherpa-ios')momentUploads.push(uploadMoment(this.props.momentData[i],momentsRes[i]));
                        }
                    }

                    dates.sort(function(a,b) {
                        return a - b
                    });

                    //console.log(dates);
                    var startDate=dates[0];
                    var endDate=dates[dates.length-1];

                    //console.log('start date',startDate);
                    //console.log('end date',endDate);


                    var uploadResolver=momentUploads.length>0?momentUploads:[true];

                    Promise.all(uploadResolver).then((res)=> {
                        console.log('uploaded moments',{
                            momentIDs,
                            name: this.state.text,
                            startDate,
                            endDate,
                            coverMomentID,
                            trip: this.props.tripData
                        },'trip location::',tripLocation);
                        createTrip({
                            momentIDs,
                            name: this.state.text,
                            startDate,
                            endDate,
                            coverMomentID,
                            trip: this.props.tripData
                        }, tripLocation).then(()=> {
                            this.props.headerProgress.showSuccess();
                            setTimeout(this.props.refreshCurrentScene,500)
                        }).catch((err)=> {
                            console.log('create trip error',err);
                            this.props.headerProgress.showError();
                        })
                    }).catch((err)=>{console.log('err from upload')});
                });

                //console.log(this.props.navigator.getCurrentRoutes())
                this.props.navigator.popToTop();
                //this.props.navigator.push({
                //    id: "own-profile",
                //    hideNav:false,
                //    momentData:this.props.momentData,
                //    refresh:true,
                //    sceneConfig:"bottom-nodrag"
                //});
            });
        }


    }

    onStart(){
        Animated.spring(this.state.positionBottom, {toValue: 280,friction:7}).start();
    }

    onEnd(){
        Animated.spring(this.state.positionBottom, {toValue: 14,friction:7}).start();
    }

    render(){
        return(
            <View style={{backgroundColor:'white',width:SCREEN_WIDTH,height:SCREEN_HEIGHT,justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                <TextInput clearTextOnFocus={true}
                           clearButtonMode="while-editing"
                           style={
                                {
                                    fontSize:35,
                                    backgroundColor:'white',
                                    color:"black",
                                    fontWeight:"500",
                                    fontFamily:Fonts.type.headline,
                                    marginTop:-190,
                                    textAlign:"center",
                                    letterSpacing:1,
                                    width:SCREEN_WIDTH,
                                    marginBottom:10,
                                    height:50,
                                    alignItems:"center"
                                }
                            }
                                      maxLength={30}
                           onFocus={this.onStart.bind(this)}
                           onBlur={this.onEnd.bind(this)}
                           onChangeText={(text) =>{this.setState({text:text.toUpperCase(),remainingCharacters:30-text.length})}}
                                      value={this.state.text}
                                      placeholder={'NAME YOUR TRIP'}
                >
                </TextInput>
                <Text style={{color:"#999999",fontFamily:Fonts.type.headline,fontSize:10,letterSpacing:.5}}>EDIT YOUR TRIP NAME HERE ({this.state.remainingCharacters})</Text>
                {this.props.navigation.default}
                <Animated.View style={{position:'absolute',bottom:this.state.positionBottom,left:7,flex:1}}>
                    <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7}} onPress={()=>{this.navActionRight()}} text="save and publish trip"></SimpleButton>
                </Animated.View>
                <SimpleError ref="tripnameError" errorMessage="Please add a trip name"></SimpleError>

            </View>
        )
    }
}


var styles = StyleSheet.create({

});



export default EditTripName;