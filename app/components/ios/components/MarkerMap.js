import React, { Component } from 'react';
import MapView from 'react-native-maps';
import supercluster from 'supercluster'
import {getClusters} from './get-clusters';
const DEFAULT_PADDING = { top: 0, right: 60, bottom: 80, left: 60 };
import StickyHeader from './stickyHeader';
import Header from './header'
import SherpaMapMarker from './SherpaMapMarker';
import ReactTransitionGroup  from 'react-addons-transition-group';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');


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
        let initialRegion=props.initialRegion;
        if(props.moments.length==1){
            initialRegion =
            {
                latitude: parseFloat(props.moments[0].lat),
                longitude: parseFloat(props.moments[0].lng),
                latitudeDelta: 2.5,
                longitudeDelta: 2.5
            }
        }


        this.state={
            markers:this.recluster(),
            markerScale:new Animated.Value(1),
            region:initialRegion,
            mapType:'default',
            changeState:'never',
            initialRegion:initialRegion,
            locator:false
        };
        this.isLeaving=false;
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

        if(!this.region){
            this.map.fitToCoordinates(this.markers, {
                edgePadding: DEFAULT_PADDING
            });
        }


    }

    recluster(){
        let moments=this.props.moments;
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
        return markers
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.changeState=='first'&&prevState.changeState=='never'){
            this.updatePins();
        }

        if(this.region&&this.getZoomLevel(this.region)!==this.state.zoomLevel){
            this.props.zoomChanged(this.state.zoomLevel);
        }
    }

    componentWillUnmount(){
        this.isLeaving=true;
    }

    _regionUpdated(region){
        if(this.isLeaving)return;
        let changeState;
        if(this.state.changeState=='never'){
            this.props.loadFromRegion(region)
            this.updatePins(region);
            changeState='first';
        }else{
            changeState='changed';
            this.props.regionChanged(region);
            this.updatePins(region);
        }

        this.region=region;
        this.setState({zoomLevel:this.getZoomLevel(region),changeState})
    }

    _onRegionChange(region) {
    }

    changeRegion(region){
        this.map.animateToRegion(region);
    }

    updatePins(region=this.region){
        const padding = .2;
        this.recluster();


        //get clusters for area
        let markers=this.clusters.getClusters([
            region.longitude - (region.longitudeDelta * (0.5 + padding)),
            region.latitude - (region.latitudeDelta * (0.5 + padding)),
            region.longitude + (region.longitudeDelta * (0.5 + padding)),
            region.latitude + (region.latitudeDelta * (0.5 + padding)),
        ], this.getZoomLevel(region));

        this.setState({markers:markers});
    }

    activateLocator(){
        this.setState({locator:true})
    }

    getZoomLevel(region = this.region) {
        // http://stackoverflow.com/a/6055653
        const angle = region.longitudeDelta;

        // 0.95 for finetuning zoomlevel grouping
        return Math.round(Math.log(360 / angle) / Math.LN2);
    }

    createMarkersForRegion() {
        if (this.state.markers&&this.state.markers.length>0) {
            return this.state.markers.map((marker,i) => this.renderMarker(marker,i));
        }
        return [];
    }

    goToTripDetail(momentID){
        if(!this.props.navigator||this.props.disablePins)return;
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
        return Animated.spring(this.state.markerScale, {
            toValue: 0
        })
    }

    renderMarker(markerData,i){

        return(
            <SherpaMapMarker outsideScale={this.state.markerScale}  markerData={markerData} onPress={()=>{this.goToTripDetail(markerData.data.id)}} key={i}></SherpaMapMarker>
        )
    }


    render(){
        return(

                <MapView
                    style={[styles.map,this.props.style]}
                    //region={this.region}
                    zoomEnabled={!!this.props.interactive}
                    scrollEnabled={!!this.props.interactive}
                    initialRegion={this.state.initialRegion}
                    showsPointsOfInterest={!this.props.interactive}
                    onRegionChange={this._onRegionChange.bind(this)}
                    onRegionChangeComplete={this._regionUpdated.bind(this)}
                    ref={ref => { this.map = ref; }}
                    rotateEnabled={false}
                    showsUserLocation={this.state.locator}
                    minDelta={this.props.minDelta}
                >
                        {this.createMarkersForRegion()}
                </MapView>
        )
    }
}

var styles = StyleSheet.create({
    map: {
        backgroundColor:'transparent',
        ...StyleSheet.absoluteFillObject,
        //left:0,
        //top:0,
        //position:'absolute',
        //width:windowSize.width,
        //height:windowSize.height
    },
})


TripDetailMap.defaultProps={
    interactive:true,
    moments:[],
    hideOnInit:false,
    mapType:'default',
    onLeave:function(){},
    zoomChanged:function(){},
    regionChanged:function(){},
    loadFromRegion:function(){}
}

export default TripDetailMap;