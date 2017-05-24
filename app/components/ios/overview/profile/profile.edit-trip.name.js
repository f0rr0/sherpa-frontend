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

        let displayData=[];

        for(var i=0;i<props.momentData.length;i++){
            let shouldAdd=true;
            for(var j=0;j<props.deselectedMomentIDs.length;j++){

                //console.log(props.deselectedMomentIDs[j])
                if(props.momentData[i].id==props.deselectedMomentIDs[j]){
                    shouldAdd=false;
                }
            }

            if(shouldAdd){
                displayData.push(props.momentData[i]);
            }
        }



        this.state={
            remainingCharacters:20,
            text:props.tripData?props.tripData.name:"",
            positionBottom:new Animated.Value(14),
            tripData:null,
            tripName:props.tripName,
            intent:props.intent,
            momentData:props.momentData,
            deselectedMomentIDs:props.deselectedMomentIDs,
            canSubmit:true,
            displayData,
            maxLength:30
        }

    }

    componentDidMount(){
        //console.log(this.state.displayData);
        // console.log(this.state.deselectedMomentIDs)
        // console.log(this.state.displayData)
    }

    navActionRight(){


        if(this.state.text==""){
            this.refs.tripnameError.show();
        }else if(this.state.canSubmit){
            this.refs.tripnameError.hide();
            //console.log('submit submit')

            this.setState({canSubmit:false})
            var moments=[];
            var momentIDs=[];
            let addMomentsRaw=[];
            let addMomentsFinal=[];
            let coverMomentID;

            //create moments or edit moments
            for(var i=0;i<this.state.displayData.length;i++){
                if(this.state.displayData[i].id.toString().indexOf("sherpa-internal")>-1){
                    addMomentsRaw.push(this.state.displayData[i]);
                    moments.push(createMoment(this.state.displayData[i]))
                }else if(this.state.displayData[i].isCover){
                    coverMomentID=this.state.displayData[i].id;
                }
            }


            this.props.headerProgress.show();
            this.props.headerProgress.startToMiddle();


            getTripLocation(this.state.displayData).then((tripLocation)=>{

                Promise.all(moments).then((momentsRes)=>{
                    var momentUploads=[];
                    var dates=[];


                    for(var i=0;i<  addMomentsRaw.length;i++){
                            momentIDs.push(momentsRes[i].id)
                            if(addMomentsRaw[i].isCover){
                                coverMomentID=momentsRes[i].id;
                            }
                            dates.push(addMomentsRaw[i].date || new Date().getTime()/1000)
                            if(addMomentsRaw[i].id.toString().indexOf("sherpa-internal")>-1&&addMomentsRaw[i].service=='sherpa-ios'){
                                momentUploads.push(uploadMoment(addMomentsRaw[i],momentsRes[i]));
                            }
                    }

                    dates.sort(function(a,b) {
                        return a - b
                    });

                    var startDate=dates[0];
                    var endDate=dates[dates.length-1];
                    // console.log('moments uploads',momentUploads)
                    var uploadResolver=momentUploads.length>0?momentUploads:[true];

                    Promise.all(uploadResolver).then((res)=> {

                        createTrip({
                            momentIDs,
                            name: this.state.text,
                            startDate,
                            endDate,
                            coverMomentID,
                            trip: this.props.tripData,
                            addMomentIDs:momentIDs,
                            removeMomentIDs:this.state.deselectedMomentIDs
                        }, tripLocation).then(()=> {
                            this.props.headerProgress.showSuccess();
                            setTimeout(this.props.refreshCurrentScene,500)
                            this.setState({canSubmit:true})
                        }).catch((err)=> {
                            this.setState({canSubmit:true})
                            this.props.headerProgress.showError();
                        })
                    }).catch((err)=>{console.log('err from upload',err)});
                });

                this.props.navigator.popToTop();
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
                           clearButtonMode="never"
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
                                    marginLeft:15,
                                    width:SCREEN_WIDTH-30,
                                    marginBottom:10,
                                    //height:50,
                                    alignItems:"center",
                                    height: Math.max(35, this.state.height)
                                }
                            }
                                      maxLength={this.state.maxLength}
                           autoCapitalize='characters'
                           multiline={true}
                           onChange={(event) => {
                              this.setState({
                                    text: event.nativeEvent.text,
                                    height: event.nativeEvent.contentSize.height,
                                  });
                           }}
                           onFocus={this.onStart.bind(this)}
                           onBlur={this.onEnd.bind(this)}

                           placeholderTextColor="#cdcdcd"
                           onChangeText={(text) =>{this.setState({text:text.toUpperCase(),remainingCharacters:this.state.maxLength-text.length})}}
                                      value={this.state.text.toUpperCase()}
                           placeholder={'YOUR GUIDE'}

                >
                </TextInput>
                <Text style={{color:"#999999",fontFamily:Fonts.type.headline,fontSize:10,letterSpacing:.5}}>EDIT NAME HERE ({this.state.remainingCharacters})</Text>
                {this.props.navigation.default}
                <Animated.View style={{position:'absolute',bottom:this.state.positionBottom,left:7,flex:1}}>
                    <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7}} onPress={()=>{this.navActionRight()}} text="save and publish"></SimpleButton>
                </Animated.View>
                <SimpleError ref="tripnameError" errorMessage="Please add a guide name"></SimpleError>

            </View>
        )
    }
}


var styles = StyleSheet.create({

});

EditTripName.defaultProps={
    tripData:null,
    intent:null,
    momentData:[],
    deselectedMomentIDs:[]
}

export default EditTripName;