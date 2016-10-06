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

    }

    componentWillMount(){
        this._pressData = {};
    }

    render(){
        return (
            // ListView wraps ScrollView and so takes on its properties.
            // With that in mind you can use the ScrollView's contentContainerStyle prop to style the items.
            <ListView contentContainerStyle={[styles.list,this.props.wrapper]}
                      dataSource={this.state.dataSource}
                      renderRow={this._renderRow.bind(this)}
            />
        );
    }

    _renderRow(rowData, sectionID, rowID) {
        return (
            <TouchableOpacity style={styles.row} onPress={() => this._pressRow(rowID)} >
                        <Text style={styles.text}>
                            {rowData}
                        </Text>
            </TouchableOpacity>
        );
    }

    _genRows(pressData){
        var dataBlob = [];
        for (var ii = 0; ii < 100; ii++) {
            var pressedText = pressData[ii] ? ' (X)' : '';
            dataBlob.push('Cell ' + ii + pressedText);
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
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems:"center",
        padding:7
    },
    row: {
        justifyContent: 'center',
        margin: 7,
        width: SCREEN_WIDTH/2-21,
        height: SCREEN_WIDTH/2-14,
        backgroundColor: '#F6F6F6',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CCC'
    },
    thumb: {
        width: 64,
        height: 64
    },
    text: {
        flex: 1,
        marginTop: 5,
        fontWeight: 'bold'
    }
});

export default PhotoSelectorGrid;