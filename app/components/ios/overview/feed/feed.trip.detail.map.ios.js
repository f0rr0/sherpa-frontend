import React, { Component } from 'react';
import MarkerMap from '../../components/MarkerMap'
import {getFeed} from '../../../../actions/feed.actions';
import {BlurView} from 'react-native-blur';
import {
    StyleSheet,
    View,
} from 'react-native';


class TripDetailMap extends Component{

    constructor(props){
        super(props);
        this.state={mapMoments:this.props.trip.moments}
    }

    onZoomChange(region){
        if(this.props.regionMap){
            var reqBody={
                "limit": 50,
                "bbox": [region.longitude-region.longitudeDelta/2,region.latitude-region.latitudeDelta/2,region.longitude+region.longitudeDelta/2,region.latitude+region.latitudeDelta/2]
            };

            //console.log('get map momnets');
            getFeed(reqBody,-1,'map-search').then((response)=>{
                //console.log('set map moments',response.data);
                this.setState({mapMoments:response.data,reqID:Math.random()})
            })
        }
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.reqID!==prevState.reqID){
            this.refs.feedlistmap.recluster()
        }
    }

    render(){
        return(
            <View style={[styles.listViewContainer]}>
                <MarkerMap
                    ref="feedlistmap"
                    regionChanged={this.onZoomChange.bind(this)}
                    navigator={this.props.navigator}
                    containerStyle={styles.listViewContainer}
                    moments={this.state.mapMoments}>
                </MarkerMap>
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