'use strict';

import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    ListView
} from 'react-native';
const SCREEN_WIDTH = require('Dimensions').get('window').width;

import React, { Component } from 'react';

class PhotoSelectorGrid extends React.Component {
    constructor(props){
        super(props);

        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state={
            dataSource: ds.cloneWithRows(this._genRows({})),
        };
    }

    _pressData(){
        console.log('press data');
    }

    componentWillMount(){
        this._pressData = {};

        for (var ii = 0; ii < this.props.data.length; ii++) {
            this.props.data[ii].selected=true;
        }
    }

    render(){
        return (
            // ListView wraps ScrollView and so takes on its properties.
            // With that in mind you can use the ScrollView's contentContainerStyle prop to style the items.
            <ListView contentContainerStyle={[styles.list,this.props.wrapper]}
                      dataSource={this.state.dataSource}
                      renderHeader={this.props.headerView}
                      renderFooter={this.props.footerView}
                      renderRow={this._renderRow.bind(this)}
                      removeClippedSubviews={false}
            />
        );
    }

    _renderRow(rowData, sectionID, rowID) {
        var rowContent=rowData.type=='moment'?
            <TouchableOpacity style={styles.row} onPress={() => this._pressRow(rowID)} >
                <Image  style={styles.row} source={{uri: rowData.moment.mediaUrl}}></Image>
                <View style={[{opacity:rowData.selected?1:0,position:'absolute',top:0,left:0},styles.row]}>
                    <Image
                        style={[styles.marker, {width: 27, height: 27, right:20,bottom:20,position:'absolute'}]}
                        source={require('../../../Images/icon-check-green.png')}/>
                </View>
            </TouchableOpacity>:
            <TouchableOpacity onPress={() => rowData.callback()} >
                <View style={[styles.row,{borderWidth:1,borderColor:"#e6e6e6"}]} >
                    <Image style={{width:9,height:9}} source={require("../../../Images/icon-plus-green.png")}></Image>
                </View>
            </TouchableOpacity>;

        return rowContent;
    }

    _genRows(pressData){
        var dataBlob = [];
        for (var ii = 0; ii < this.props.data.length; ii++) {
            dataBlob.push({
                type:'moment',
                selected:!pressData[ii],
                moment:this.props.data[ii]
            });
            this.props.data[ii].selected=!pressData[ii]
        }
        if(this.props.showMore){
            dataBlob.push({
                type:'add-more',
                callback:this.props.moreCallback
            });
        }
        return dataBlob;
    }

    _pressRow(rowID) {
        this._pressData[rowID] = !this._pressData[rowID];
        this.setState({dataSource: this.state.dataSource.cloneWithRows(
            this._genRows(this._pressData)
        )});
    }
}


const styles = StyleSheet.create({
    list: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems:"center",
        paddingLeft:7,
        paddingRight:7,
        paddingTop:0,
        paddingBottom:30
    },
    row: {
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
        color:'red',
        top:0
    }
});

export default PhotoSelectorGrid;