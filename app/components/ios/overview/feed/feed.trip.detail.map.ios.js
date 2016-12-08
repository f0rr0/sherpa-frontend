import React, { Component } from 'react';
import MarkerMap from '../../components/MarkerMap'

import {
    StyleSheet,
    View,
} from 'react-native';


class TripDetailMap extends Component{
    render(){
        return(
            <View style={[styles.listViewContainer]}>
                <MarkerMap navigator={this.props.navigator} containerStyle={styles.listViewContainer} moments={this.props.trip.moments}></MarkerMap>
                {this.props.navigation.fixed}
            </View>
        )
    }
}

var styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    },
    listViewContainer: {flex: 1, backgroundColor: 'white', paddingBottom: 60},
})

export default TripDetailMap;