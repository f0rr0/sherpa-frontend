import React from 'react'
import { TouchableHighlight,TouchableOpacity, Text,StyleSheet,View,TouchableWithoutFeedback } from 'react-native'

import {
    Image,
    Animated
} from 'react-native';


const SCREEN_WIDTH = require('Dimensions').get('window').width;
const SCREEN_HEIGHT = require('Dimensions').get('window').height;

let styles=StyleSheet.create({
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
})

class SelectionThumbnail extends React.Component {

    static propTypes = {
    }

    static defaultProps={
        active:true,
        data:null
    }


    render () {

        let item=this.props.data;
        //console.log(item);
        return (
            <TouchableOpacity activeOpacity={1} key={item.id+""+item.disabled} style={[styles.rowItem]} onPress={() => this.props.pressedCallback(item)} >
                <Image  style={styles.rowItem} source={{uri: item.mediaUrl}}></Image>
                <View style={[{opacity:item.disabled?0:1,position:'absolute',top:0,left:0},styles.rowItem]}>
                    <Image
                        style={[styles.marker, {width: 27, height: 27, right:20,bottom:20,position:'absolute'}]}
                        source={require('../../../Images/icon-check-green.png')}
                    />
                </View>
            </TouchableOpacity>
        )
    }
}

export default SelectionThumbnail;