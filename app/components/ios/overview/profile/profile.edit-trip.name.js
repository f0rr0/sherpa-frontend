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

                console.log(props.deselectedMomentIDs[j])
                if(props.momentData[i].id==props.deselectedMomentIDs[j]){
                    shouldAdd=false;
                }
            }

            if(shouldAdd){
                displayData.push(props.momentData[i]);
            }
        }



        this.state={
            remainingCharacters:30,
            text:props.tripData?props.tripData.name:"",
            positionBottom:new Animated.Value(14),
            tripData:null,
            tripName:props.tripName,
            intent:props.intent,
            momentData:props.momentData,
            deselectedMomentIDs:props.deselectedMomentIDs,
            canSubmit:true,
            displayData
        }

    }

    componentDidMount(){
        console.log(this.state.displayData);
    }

    navActionRight(){


        if(this.state.text==""){
            this.refs.tripnameError.show();
        }else if(this.state.canSubmit){
            this.refs.tripnameError.hide();
            console.log('submit submit')

            this.setState({canSubmit:false})
            var moments=[];
            var momentIDs=[];

            //create moments or edit moments
            for(var i=0;i<this.state.displayData.length;i++){
                //console.log('moment[i]',this.state.displayData[i]);
                let momentPromise = createMoment(this.state.displayData[i]);
                moments.push(momentPromise)
            }


            this.props.headerProgress.show();
            this.props.headerProgress.startToMiddle();


            getTripLocation(this.state.displayData).then((tripLocation)=>{

                Promise.all(moments).then((momentsRes)=>{
                    var momentUploads=[];
                    var dates=[];
                    var coverMomentID="";
                    for(var i=0;i<  this.state.displayData.length;i++){
                            momentIDs.push(momentsRes[i].id)
                            if(this.state.displayData[i].isCover){
                                console.log('cover is ',momentsRes[i])
                                coverMomentID=momentsRes[i].id;
                            }
                            dates.push(this.state.displayData[i].date || new Date().getTime()/1000)
                            if(this.state.displayData[i].id.toString().indexOf("sherpa-internal")>-1&&this.state.displayData[i].service=='sherpa-ios'){
                                momentUploads.push(uploadMoment(this.state.displayData[i],momentsRes[i]));
                                console.log('add to moment uploads')
                            }
                    }

                    dates.sort(function(a,b) {
                        return a - b
                    });

                    var startDate=dates[0];
                    var endDate=dates[dates.length-1];
                    console.log('moments uploads',momentUploads)
                    var uploadResolver=momentUploads.length>0?momentUploads:[true];

                    Promise.all(uploadResolver).then((res)=> {
                        //console.log('uploaded moments',{
                        //    momentIDs,
                        //    name: this.state.text,
                        //    startDate,
                        //    endDate,
                        //    coverMomentID,
                        //    trip: this.props.tripData
                        //},'trip location::',tripLocation);
                        console.log("cover moment id",coverMomentID);
                        console.log("create trip!!!!!")
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
                            this.setState({canSubmit:true})
                        }).catch((err)=> {
                            this.setState({canSubmit:true})
                            this.props.headerProgress.showError();
                        })
                    }).catch((err)=>{console.log('err from upload')});
                });

                //console.log(this.props.navigator.getCurrentRoutes())
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
                                      placeholder={'YOUR ALBUM'}
                >
                </TextInput>
                <Text style={{color:"#999999",fontFamily:Fonts.type.headline,fontSize:10,letterSpacing:.5}}>EDIT NAME HERE ({this.state.remainingCharacters})</Text>
                {this.props.navigation.default}
                <Animated.View style={{position:'absolute',bottom:this.state.positionBottom,left:7,flex:1}}>
                    <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7}} onPress={()=>{this.navActionRight()}} text="save and publish"></SimpleButton>
                </Animated.View>
                <SimpleError ref="tripnameError" errorMessage="Please add an album name"></SimpleError>

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