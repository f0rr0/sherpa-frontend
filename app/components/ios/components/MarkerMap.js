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
            region:null,
            markers:[],
            markerScale:new Animated.Value(1)
        };

        this.recluster()


    }

    componentDidMount(){

        if(this.props.hideOnInit){
            Animated.timing(this.state.markerScale, {
                duration: 0,
                toValue: 0
            }).start()
        }else{
            this.showMarkers().start()
        }

        this.map.fitToCoordinates(this.markers, {
            edgePadding: DEFAULT_PADDING
        });
    }

    recluster(){
        let moments=this.props.moments;
        //console.log('moments',moments)
        let markers=[];

        for (var i=0;i<moments.length;i++){
            markers.push({
                latitude:parseFloat(moments[i].lat),
                longitude:parseFloat(moments[i].lng),
                moment:moments[i],
                data:moments[i],
                geometry:{coordinates:[parseFloat(moments[i].lng),parseFloat(moments[i].lat)]}
            });
        }

        this.clusters = supercluster({
            radius: 60,
            maxZoom: 16
        });
        this.clusters.load(markers);
        this.markers=markers;
        //console.log('did re-cluster',markers);
        return markers
    }

    componentDidUpdate(){
    }

    _regionUpdated(region=this.state.region){
        const padding = .2;
        //const markers = this.markers;
        let markers=this.clusters.getClusters([
            region.longitude - (region.longitudeDelta * (0.5 + padding)),
            region.latitude - (region.latitudeDelta * (0.5 + padding)),
            region.longitude + (region.longitudeDelta * (0.5 + padding)),
            region.latitude + (region.latitudeDelta * (0.5 + padding)),
        ], this.getZoomLevel(region));

        var newZoomLevel=this.getZoomLevel(region);
        if(newZoomLevel!==this.state.zoomLevel){
            this.props.zoomChanged(region);
        }

        this.props.regionChanged(region);
        this.setState({markers,zoomLevel:newZoomLevel,region});
    }

    getZoomLevel(region = this.state.region) {
        // http://stackoverflow.com/a/6055653
        const angle = region.longitudeDelta;

        // 0.95 for finetuning zoomlevel grouping
        return Math.round(Math.log(360 / angle) / Math.LN2);
    }

    createMarkersForRegion() {
        if (this.state.markers) {
            //console.log('did render new markers',this.state.markers)
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
        return Animated.timing(this.state.markerScale, {
            toValue: 0,
            duration:0
        })
    }

    renderMarker(marker,i){
        let clustercount=null;
        if(marker.properties&&marker.properties.cluster){
            clustercount=<View style={{position:'absolute',bottom:-3,right:-3,backgroundColor:'white',width:20,height:20,borderRadius:10,justifyContent:'center',alignItems:'center'}}><Text style={{color:'black',fontSize:10}}>{marker.properties.point_count}</Text></View>
        }
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
    onLeave:function(){},
    zoomChanged:function(){},
    regionChanged:function(){}
}

export default TripDetailMap;