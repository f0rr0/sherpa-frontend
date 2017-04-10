'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
} from 'react-native';
import React, { Component } from 'react';
import StickyHeader from '../../components/stickyHeader';
import Header from '../../components/stickyHeader';
import SimpleButton from '../../components/simpleButton';
import LocationName from '../../components/locationName';
import RNFetchBlob from 'react-native-fetch-blob';
import PhotoSelectorGrid from '../../components/photoSelector.grid';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import Dimensions from 'Dimensions';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import { Fonts, Colors } from '../../../../Themes/'
import SimpleError from '../../components/simpleError';
import { ScrollView } from 'react-native'
import AddPaging from 'react-native-paged-scroll-view/index'
var PagedScrollView = AddPaging(ScrollView)
var windowSize=Dimensions.get('window');
const SCREEN_WIDTH = require('Dimensions').get('window').width;
const CARD_PREVIEW_WIDTH = 10
const CARD_MARGIN = 3;
const CARD_WIDTH = Dimensions.get('window').width - (CARD_MARGIN + CARD_PREVIEW_WIDTH) * 2;
import {getFeed} from '../../../../actions/feed.actions';

import {createMoment} from "../../../../actions/trip.edit.actions"



class EditMomentNames extends React.Component {
    constructor(props){
        super(props)

        let displayData=props.deselectedMomentIDs.length>0?this.filterMomentsByDeselected(props.momentData,props.deselectedMomentIDs):props.momentData;

        this.state= {
            navOpacity:new Animated.Value(1),
            momentData: props.momentData,
            tripData: props.tripData,
            intent: props.intent,
            deselectedMomentIDs: props.deselectedMomentIDs,
            displayData,
            page:1,
            loadMore:props.tripData,
            isReady:false
        }
    }

    filterMomentsByDeselected(momentData,deselected){
        let displayData=[];
        for(var i=0;i<momentData.length;i++){
            let shouldAdd=true;

            for(var j=0;j<deselected.length;j++){
                if(momentData[i].id==deselected[j]){
                    shouldAdd=false;
                }
            }

            if(shouldAdd){
                displayData.push(momentData[i]);
            }
        }
        return displayData;
    }

    componentDidMount(){
        this.onEndReached();
    }

    componentDidUpdate(prevProps,prevState){
        if(!prevState.isReady&&this.state.isReady){
            this.makeCoverPhoto(0)
        }
    }


    _renderHeader(){
        return (
            <View style={{flex:1,justifyContent:'center',height:70,width:SCREEN_WIDTH,alignItems:'center',backgroundColor:'white'}}>
                {this.props.navigation.default}
            </View>
        )
    }


    navActionRight(){
        if(this.checkEmpty()){
            this.refs.locationError.show();
        }else{
            if(this.state.intent=='edit-moment'){

                createMoment(this.state.displayData[0]).then(()=>{
                    this.props.navigator.popToTop();
                })
            }else{
                this.refs.locationError.hide();
                this.props.navigator.push({
                    id: "editTripName",
                    hideNav:true,
                    tripData:this.props.tripData,
                    momentData:this.state.displayData,
                    sceneConfig:"right-nodrag",
                    selection:this.props.selection
                });
            }
        }
    }

    checkEmpty(){

        var isEmpty=false;
        for(var i=0;i<this.state.displayData.length;i++){
            let currDisplayData=this.state.displayData[i];
            isEmpty=!currDisplayData.venue||(currDisplayData.venue.length==0);
            if(isEmpty)break;
        }
        return isEmpty;
    }

    hideNav(){
        Animated.timing(this.state.navOpacity, {toValue: 0,duration:.8}).start();
    }

    showNav(){
        Animated.timing(this.state.navOpacity, {toValue: 1,duration:8}).start();
    }

    makeCoverPhoto(targetIndex){
        if(this.state.intent=='edit-moment')return;
        let newDisplayData=[];

        this.state.displayData.map((moment,index)=>{
            let isCover=targetIndex==index;
            newDisplayData.push(this.state.displayData[index])
            newDisplayData[index].isCover=isCover;
            this.refs["location-"+index].isCover(isCover);
        })

        this.setState({displayData:newDisplayData})
    }

    handlePageChange(e){

        if(e.currentHorizontalPage==e.totalHorizontalPages){
            this.onEndReached();
        }
        this.state.displayData.map((moment,index)=>{
            this.refs["location-"+index].moveDown();
        })
    }

    onEndReached(){
        let moments=this.state.displayData;

        if(this.state.intent!=='edit-moment'&&this.state.loadMore&&this.state.tripData){
            getFeed(this.state.tripData.id,this.state.page,'trip').then((result)=>{
                let displayData=this.filterMomentsByDeselected(result.data.moments,this.state.deselectedMomentIDs);
                moments=moments.concat(displayData);
                this.setState({isReady:true,displayData:moments,page:this.state.page+1,loadMore:result.data.moments.length>0})
            }).catch((error)=>{
                console.log('error',error);
            })
        }else{
            this.setState({isReady:true})
        }
    }

    updateInfo(data,momentIndex){
        let newDisplayData=[];
        this.state.displayData.map((moment,index)=>{
                let newMoment=index==momentIndex?Object.assign({}, moment, {
                    lat:data.lat || moment.lat,
                    lng:data.lng || moment.lng,
                    location:data.name || moment.name,
                    venue:data.venue || moment.venue,
                    state:data.state || moment.state,
                    country:data.country || moment.country
                }):moment;
                newDisplayData.push(newMoment)
        })

        this.setState({displayData:newDisplayData})

    }

    _renderListView(){
        return(
            <View>
            <PagedScrollView
                style={styles.container}
                automaticallyAdjustInsets={false}
                horizontal={true}
                decelerationRate={0}
                ref="scrollview"
                snapToInterval={CARD_WIDTH + CARD_MARGIN*2}
                snapToAlignment="start"
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps={true}
                showsHorizontalScrollIndicator={false}
                onPageChange={this.handlePageChange.bind(this)}
            >
                {this.state.displayData.map((moment,index)=>{
                    return <LocationName showCover={this.state.intent!=='edit-moment'} updateInfo={this.updateInfo.bind(this)} makeCoverPhoto={this.makeCoverPhoto.bind(this)} ref={"location-"+index} locationIndex={index} key={index} cardWidth={CARD_WIDTH} hideNav={this.hideNav.bind(this)} showNav={this.showNav.bind(this)} style={styles.card} moment={moment}></LocationName>;
                })}
            </PagedScrollView>
            <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7,position:'absolute',bottom:14,left:7}} onPress={()=>{this.navActionRight()}} text={this.state.intent!=='edit-moment'?"next step (edit tripname)":"save location name"}></SimpleButton>
            </View>
    )
    }

    _renderEmpty(){
        return (
            <View style={{justifyContent:'center',backgroundColor:"white",height:windowSize.height,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }

    render(){
        let currentView=this.state.isReady?this._renderListView():this._renderEmpty();

        return(
            <View style={{backgroundColor:'white'}}>
                {currentView}
                <Animated.View style={[{flex:1,position:'absolute',top:0},{opacity:this.state.navOpacity}]}>
                    {this.props.navigation.default}
                </Animated.View>
                <SimpleError ref="locationError" errorMessage="Please add a location name to each photo"></SimpleError>
            </View>
        )
    }
}


var styles = StyleSheet.create({
    container: {
        minHeight:windowSize.height,
        backgroundColor:'transparent',
    },
    content: {
        marginTop: 130,
        backgroundColor:'transparent',
        paddingHorizontal: CARD_PREVIEW_WIDTH,
        alignItems: 'flex-start',

    },
    card: {
        backgroundColor: 'transparent',
        width: CARD_WIDTH,
        margin: CARD_MARGIN,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex:2
    },
});

EditMomentNames.defaultProps={
    tripData:null,
    intent:null,
    deselectedMomentIDs:[],
    momentData:[]
}


export default EditMomentNames;