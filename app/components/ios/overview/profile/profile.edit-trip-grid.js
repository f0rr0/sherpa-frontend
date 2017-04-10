'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';
import StickyHeader from '../../components/stickyHeader';
import Header from '../../components/stickyHeader';
import SimpleButton from '../../components/simpleButton';
import SelectionThumbnail from '../../components/selectionThumb';
import RNFetchBlob from 'react-native-fetch-blob';
import PhotoSelectorGrid from '../../components/photoSelector.grid';
const SCREEN_WIDTH = require('Dimensions').get('window').width;
const SCREEN_HEIGHT = require('Dimensions').get('window').height;
import SherpaGiftedListview from '../../components/SherpaGiftedListview'
import {getFeed} from '../../../../actions/feed.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

var styles=StyleSheet.create({
    listViewContainer:{flex:1,backgroundColor:'white'},
    container: {
        flex: 1
    },
    listView:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft:7,
        paddingRight:7,
        paddingTop:65,
        paddingBottom:10
    },

    row:{
        flexDirection: 'row',
    },
    rowItem: {
        justifyContent: 'center',
        margin: 7,
        width: SCREEN_WIDTH/2-21,
        height: SCREEN_WIDTH/2-25,
        alignItems: 'center'
    },
    thumb: {
        width: 64,
        height: 64
    },
    text: {
        flex: 1,
        marginTop: 5,
        fontWeight: 'bold',
        position:'absolute',
        top:0
    }
});

class EditTripGrid extends React.Component {
    constructor(props){
        super(props)

        let displayData=props.momentData;


        console.log('display data',displayData);
        this.state= {
            momentData: props.momentData,
            tripData: props.tripData,
            containerWidth:windowSize.width-30,
            intent: props.intent,
            deselectedMomentIDs: props.deselectedMomentIDs,
            displayData
        }

    }

    _renderHeader(){
        return (
            <View style={{position:'absolute',top:0,left:0,flex:1,justifyContent:'center',height:70,marginBottom:-5,width:SCREEN_WIDTH,alignItems:'center',backgroundColor:'white',zIndex:1}}>
                {this.props.navigation.default}
            </View>
        )
    }

    _renderFooter(){
        //return null;
        let disabled=false;
        return(
                <SimpleButton style={{width:SCREEN_WIDTH-28}} disabled={disabled} onPress={()=>{this.navActionRight()}} text="next step (edit locations)"></SimpleButton>
        )
    }

    navActionLeft(){
        this.props.navigator.popToTop();
    }

    navActionRight(){
            this.props.navigator.push({
                id: "editTripNames",
                hideNav:true,
                sceneConfig:"right-nodrag",
                momentData:this.state.displayData,
                tripData:this.state.tripData,
                intent:this.state.intent,
                deselectedMomentIDs:this.state.deselectedMomentIDs
            });
    }

    _pressedCallback(data){

        let oldRowData=this.refs.listview._getRows();
        let newRowData=oldRowData.slice(0);
        let indexToUpdate=-1;

        for(var i=0;i<oldRowData.length;i++){
            if(oldRowData[i].id==data.id){
                indexToUpdate=i;
                break;
            }
        }

        if(indexToUpdate>-1){
            newRowData[indexToUpdate] = {
                ...oldRowData[indexToUpdate],
                disabled: !oldRowData[indexToUpdate].disabled,
            };
        }

        let deselectedMomentIDs=[];
        for(var i=0;i<newRowData.length;i++){
            if(newRowData[i].disabled)deselectedMomentIDs.push(newRowData[i].id)
        }
        this.setState({deselectedMomentIDs})

        this.refs.listview._updateRows(newRowData);
    }



    _renderEmpty(){
        return (
            <View style={{flex:1,justifyContent:'center',backgroundColor:"white",height:200,width:windowSize.width,alignItems:'center'}}>
                <Image style={{width: 25, height: 25}} source={require('./../../../../Images/loader@2x.gif')} />
            </View>
        )
    }


    _renderRow(rowData,sectionID,rowID) {
        let item=rowData;
        let renderEl;
            switch(item.type){
                case 'add':
                    renderEl = this._renderAddMore();
                break;
                case 'image':
                    renderEl = <SelectionThumbnail key={rowID} pressedCallback={this._pressedCallback.bind(this)} data={item} ></SelectionThumbnail>
                break;
            }

        return renderEl
    }

    _renderAddMore(){
        return(
            <TouchableOpacity key={"add-more"} style={styles.rowItem} onPress={()=>{
                        this.props.navigator.push({
                            id: "addTrip",
                            hideNav:true,
                            sceneConfig:"bottom-nodrag",
                            tripData:this.state.tripData,
                            momentData:this.state.momentData,
                            deselectedMomentIDs:this.state.deselectedMomentIDs
                        })
                    }} >
                <View style={[styles.rowItem,{borderWidth:1,borderColor:"#e6e6e6"}]} >
                    <Image style={{width:9,height:9}} source={require("../../../../Images/icon-plus-green.png")}></Image>
                </View>
            </TouchableOpacity>
        )
    }

    _onFetch(page=1,callback=this.itemsLoadedCallback){
        let moments=page==1?[{type:"add",id:-1},...this.state.displayData]:[];

        if(this.state.tripData){
            getFeed(this.state.tripData.id,page,'trip').then((result)=>{
                moments=moments.concat(result.data.moments);
                for(var i=0;i<moments.length;i++){
                    let shouldDisable=false;
                    for(var j=0;j<this.state.deselectedMomentIDs.length;j++){
                        if(moments[i].id==this.state.deselectedMomentIDs[j]){
                            shouldDisable=true;
                        }
                    }
                    moments[i].disabled=shouldDisable;
                    //console.log(shouldDisable)
                }
                callback(moments,{allLoaded:result.data.moments.length==0})
            }).catch((error)=>{
                this.props.navigator.pop();
            })
        }else{
            for(var i=0;i<moments.length;i++){
                let shouldDisable=false;
                for(var j=0;j<this.state.deselectedMomentIDs.length;j++){
                    if(moments[i].id==this.state.deselectedMomentIDs[j]){
                        shouldDisable=true;
                    }
                }
                //console.log('should disable',shouldDisable)
                moments[i].disabled=shouldDisable;
            }
            callback(moments)
        }
    }


    render(){

        return(
            <View>

            <SherpaGiftedListview
                    removeClippedSubviews={false}
                    renderHeaderOnInit={true}
                    enableEmptySections={true}
                    rowView={this._renderRow.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={false} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    withSections={false} // enable sections
                    headerView={this._renderHeader.bind(this)}
                    footerView={this._renderFooter.bind(this)}
                    refreshableTintColor={"#85d68a"}
                    onEndReachedThreshold={1200}
                    paginationFetchingView={this._renderEmpty.bind(this)}
                    onEndReached={()=>{
                         this.refs.listview._onPaginate();
                    }}
                    onScroll={(event)=>{
                    }}
                    ref="listview"
                    customStyles={{
                        contentContainerStyle:styles.listView,
                        actionsLabel:{fontSize:12}
                    }}
                />

                <StickyHeader ref="stickyHeader" navigation={this.props.navigation.fixed}></StickyHeader>
            </View>
        )
    }
}

EditTripGrid.defaultProps={
    tripData:null,
    intent:null,
    momentData:[],
    deselectedMomentIDs:[]
}


export default EditTripGrid;