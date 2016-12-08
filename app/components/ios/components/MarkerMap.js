import React, { Component } from 'react';
import MapView from 'react-native-maps';
import supercluster from 'supercluster'
import {getClusters} from './get-clusters';
const DEFAULT_PADDING = { top: 100, right: 60, bottom: 100, left: 60 };
import StickyHeader from './stickyHeader';
import Header from './header'

import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight,
    Alert,
    PanResponder,
    Animated,
    ScrollView,
    TouchableOpacity,

} from 'react-native';


class TripDetailMap extends Component{

    constructor(props){
        super(props);
        this.state={
            moments:props.moments,
            region:null,
            markers:[],
            markerScale:new Animated.Value(1)
        }
    }

    componentDidMount(){
        var markers=[];
        var momentIDs=[];

        for (var i=0;i<this.state.moments.length;i++){
            markers.push({
                latitude:parseFloat(this.state.moments[i].lat),
                longitude:parseFloat(this.state.moments[i].lng),
                moment:this.state.moments[i],
                data:this.state.moments[i],
                geometry:{coordinates:[this.state.moments[i].lng,this.state.moments[i].lat]}
            });

            momentIDs.push(this.state.moments[i].id);
        }

        this.map.fitToCoordinates(markers, {
            edgePadding: DEFAULT_PADDING
        });

        const clusters = supercluster({
            radius: 60,
            maxZoom: 16
        });

        clusters.load(markers);

        this.setState({annotations:markers,clusters});

        if(this.props.hideOnInit){
            Animated.timing(this.state.markerScale, {
                duration: 0,
                toValue: 0
            }).start()
        }else{
            this.showMarkers().start()
        }
    }

    _regionUpdated(region){
        const padding = .2;
        const markers = this.state.clusters.getClusters([
            region.longitude - (region.longitudeDelta * (0.5 + padding)),
            region.latitude - (region.latitudeDelta * (0.5 + padding)),
            region.longitude + (region.longitudeDelta * (0.5 + padding)),
            region.latitude + (region.latitudeDelta * (0.5 + padding)),
        ], this.getZoomLevel(region));

        this.setState({markers});
    }

    shouldComponentUpdate(nextProps,nextState){
        return((this.state.markers.length!== nextState.markers.length)||(this.props.interactive!==nextProps.interactive)||(this.props.moments!==nextProps.moments))
    }

    getZoomLevel(region = this.state.region) {
        // http://stackoverflow.com/a/6055653
        const angle = region.longitudeDelta;

        // 0.95 for finetuning zoomlevel grouping
        return Math.round(Math.log(360 / angle) / Math.LN2);
    }

    createMarkersForRegion() {
        if (this.state.markers) {
            return this.state.markers.map((marker,i) => this.renderMarker(marker,i));
        }
        return [];
    }

    goToTripDetail(momentID){
        if(!this.props.navigator)return;
        this.props.navigator.push({
            id: "tripDetail",
            momentID,
        });

        this.props.onLeave();

    }

    showMarkers(){
        return Animated.spring(this.state.markerScale, {
            toValue: 1
        })
    }


    hideMarkers(){
        this.map.fitToCoordinates(this.state.annotations, {
            edgePadding: DEFAULT_PADDING
        });
        return Animated.timing(this.state.markerScale, {
            toValue: 0,
            duration:0
        })
    }

    renderMarker(marker,i){
        let clustercount=null;
        //if(marker.properties&&marker.properties.cluster){
        //    clustercount=<View style={{position:'absolute',bottom:-3,right:-3,backgroundColor:'white',width:20,height:20,borderRadius:10,justifyContent:'center',alignItems:'center'}}><Text style={{color:'black',fontSize:10}}>{marker.properties.point_count}</Text></View>
        //}
        return(
            <MapView.Marker ref="marker" onPress={()=>{this.goToTripDetail(marker.data.id)}} key={i} coordinate={{latitude:parseFloat(marker.geometry.coordinates[1]),longitude:parseFloat(marker.geometry.coordinates[0])}}>
                <Animated.View style={{width:45,height:45,borderRadius:45,backgroundColor:'white',transform: [{scale: this.state.markerScale}]}}>
                    <Image
                        style={{width:39,height:39,borderRadius:20,marginLeft:3,marginTop:3}}
                        source={{uri:marker.data.mediaUrl}}
                    ></Image>
                    {clustercount}
                </Animated.View>
            </MapView.Marker>
        )
    }


    render(){

        return(

                <MapView
                    style={styles.map}
                    region={this.props.region}
                    zoomEnabled={this.props.interactive}
                    scrollEnabled={this.props.interactive}
                    showsPointsOfInterest={!this.props.interactive}
                    onRegionChangeComplete={this._regionUpdated.bind(this)}
                    ref={ref => { this.map = ref; }}
                    rotateEnabled={false}
                    minDelta={this.props.minDelta}

                >
                    {this.createMarkersForRegion()}
                </MapView>
        )
    }
}

var styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    },
})


TripDetailMap.defaultProps={
    interactive:true,
    moments:[],
    hideOnInit:false,
    onLeave:function(){}
}

export default TripDetailMap;