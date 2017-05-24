import React, { Component } from 'react';
import MarkerMap from '../../components/MarkerMap'
import MapButton from '../../components/mapButton'
import {cleanBoundingBoxArray, cleanBoundingBoxCorners} from '../../utils/mathUtils'
import {getFeed} from '../../../../actions/feed.actions';
import {BlurView} from 'react-native-blur';

import {
    StyleSheet,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    View,
} from 'react-native';
import Dimensions from 'Dimensions';

const windowSize = Dimensions.get('window');


class TripDetailMap extends Component{

    static defaultProps = {
        "mapType":"default",
        "hasTriangle":false,
        "regionData":{},
        "region":null,
        "showReload":false,
        "renderMap":false,
        "isFullscreen":false,
        "disablePins":false,
        "tripID":-1,
        "profileID":-1
    };

    constructor(props){
        super(props);
        this.state={mapMoments:props.trip?props.trip.moments:[]}
        this.isLeaving=false;
    }

    componentDidMount(){
        setTimeout(()=>{this.setState({renderMap:true})},200)
    }

    locateMe(){
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let region={
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta:.01,
                    longitudeDelta:.01
                };
                this.refs.feedlistmap.activateLocator();
                this.refs.feedlistmap.changeRegion(region);
                this.onLoadFromRegion(region)
            },
            (error) => alert(JSON.stringify(error)),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );
    }

    regionChanged(region){
        this.setState({region})
        if(this.refs.reloadRegionButton&&this.state.region)this.refs.reloadRegionButton.show();
    }

    componentDidUpdate(prevProps,prevState){
        if((!prevState.renderMap&&this.state.renderMap)&&this.props.mapType=='default'){
            this.refs.feedlistmap.showMarkers().start();
        }
    }

    onDidEnter(){
        this.setState({renderMap:true});
    }

    onLoadFromRegion(region){
        if(this.props.mapType=='default')return;
        const feedMap = {
            region: this._loadRegionMap.bind(this),
            global: this._loadGlobalMap.bind(this),
            profile: this._loadProfileMap.bind(this),
            trip: this._loadTripMap.bind(this),
        };

        feedMap[this.props.mapType](region);
    }

    _loadRegionMap(region) {
        const bbox = {
          topLeft: [region.longitude-region.longitudeDelta/2, region.latitude+region.latitudeDelta/2], // [lng, lat], geojson format
          bottomRight: [region.longitude+region.longitudeDelta/2, region.latitude-region.latitudeDelta/2] // [lng, lat], geojson format
        };

        const reqBody = {
            source: this.props.regionData.source,
            sourceId: this.props.regionData.sourceId,
            layer: this.props.regionData.layer,
            page: 1,
            bbox: cleanBoundingBoxCorners(bbox),
        };

        this.refs.feedlistmap.hideMarkers().start();
        this.refs.reloadRegionButton.load();

        getFeed(reqBody,-1,'map-search-v2').then(response => {
            if (this.isLeaving) return;

            this.setState({mapMoments: response.rawData, reqID: Math.random()});
            this.refs.feedlistmap.showMarkers().start();

            response.rawData.length === 0
                ? this.refs.reloadRegionButton.nothing()
                : this.refs.reloadRegionButton.hide();
        });

    }

    _loadGlobalMap(region) {
        const bbox = [
            region.longitude - region.longitudeDelta/2,
            region.latitude - region.latitudeDelta/2,
            region.longitude + region.longitudeDelta/2,
            region.latitude + region.latitudeDelta/2
        ];

        const reqBody = {
            limit: 50,
            bbox: cleanBoundingBoxArray(bbox)
        };

        if (this.refs.feedlistmap) this.refs.feedlistmap.hideMarkers().start();
        if (this.refs.reloadRegionButton) this.refs.reloadRegionButton.load();

        getFeed(reqBody,-1,'map-search-classic').then(response => {
            if(this.isLeaving) return;

            this.setState({mapMoments:response.data,reqID:Math.random()});
            this.refs.feedlistmap.showMarkers().start();

            response.data.length === 0
                ? this.refs.reloadRegionButton.nothing()
                : this.refs.reloadRegionButton.hide();
        }).catch(err => {
            if (this.refs.reloadRegionButton) this.refs.reloadRegionButton.nothing();
        });

    }

    _loadProfileMap(region) {
        const bbox = {
            bbox: cleanBoundingBoxCorners({
                topLeft: [region.longitude-region.longitudeDelta/2, region.latitude+region.latitudeDelta/2], // [lng, lat], geojson format
                bottomRight: [region.longitude+region.longitudeDelta/2, region.latitude-region.latitudeDelta/2] // [lng, lat], geojson format
            })
        };

        if (this.refs.feedlistmap) this.refs.feedlistmap.hideMarkers().start();
        if (this.refs.reloadRegionButton) this.refs.reloadRegionButton.load();


        getFeed({bbox:bbox, profileID: this.props.profileID}, -1, 'map-search-profile').then((response)=>{
            if (this.isLeaving) return;

            this.setState({mapMoments: response.moments, reqID: Math.random()});
            this.refs.feedlistmap.showMarkers().start();

            response.moments.length === 0
                ? this.refs.reloadRegionButton.nothing()
                : this.refs.reloadRegionButton.hide();
        }).catch(err => {
            if (this.refs.reloadRegionButton) this.refs.reloadRegionButton.nothing();
        });
    }

    _loadTripMap(region) {
        const bbox = {
            bbox: cleanBoundingBoxCorners({
                topLeft: [region.longitude-region.longitudeDelta/2, region.latitude+region.latitudeDelta/2], // [lng, lat], geojson format
                bottomRight: [region.longitude+region.longitudeDelta/2, region.latitude-region.latitudeDelta/2] // [lng, lat], geojson format
            })
        };

        if (this.refs.feedlistmap) this.refs.feedlistmap.hideMarkers().start();
        if (this.refs.reloadRegionButton) this.refs.reloadRegionButton.load();

        getFeed({bbox: bbox, tripID: this.props.tripID}, -1, 'map-search-trip').then(response => {
            if (this.isLeaving) return;

            this.setState({mapMoments: response.moments, reqID: Math.random()});
            this.refs.feedlistmap.showMarkers().start();

            response.moments.length === 0
                ? this.refs.reloadRegionButton.nothing()
                : this.refs.reloadRegionButton.hide();
        }).catch(err => {
            if (this.refs.reloadRegionButton) this.refs.reloadRegionButton.nothing();
        });
    }

    componentWillUnmount(){
        this.isLeaving=true;
    }

    componentDidUpdate(prevProps,prevState){
        if(this.state.reqID!==prevState.reqID){
            this.refs.feedlistmap.updatePins();
        }
    }

    _renderSearchableMapUI(){
        if(!this.props.mapType||this.props.mapType=='default')return null;
        return(
                <TouchableOpacity activeOpacity={1} style={{position:'absolute',bottom:30,left:30}} onPress={()=>{this.onLoadFromRegion(this.state.region)}}>
                    <MapButton initialOpacity={1} ref="reloadRegionButton" message="redo search in this area"></MapButton>
                </TouchableOpacity>
       )

    }

    _renderLocateMe(){
        if(!this.props.mapType||this.props.mapType === 'default')return null;
        return(
        <TouchableOpacity activeOpacity={1} style={{position:'absolute',right:30,bottom:30}} onPress={this.locateMe.bind(this)}>
            <MapButton icon={require("../../../../Images/map-locate-me.png")} />
        </TouchableOpacity>
        )
    }

    render(){
        const mapStyle=this.props.isFullscreen?styles.fullScreenMap:styles.map;
        const map=this.state.renderMap?
            <View style={{height:windowSize.height}}>
                <MarkerMap
                    ref="feedlistmap"
                    disablePins={this.props.disablePins}
                    loadFromRegion={this.onLoadFromRegion.bind(this)}
                    regionChanged={this.regionChanged.bind(this)}
                    navigator={this.props.navigator}
                    initialRegion={this.props.initialRegion}
                    mapType={this.props.mapType}
                    containerStyle={styles.listViewContainer}
                    moments={this.state.mapMoments}>
                </MarkerMap>
                <Image pointerEvents="none" style={{position:'absolute',width:windowSize.width,height:150,top:0,left:0}} source={require('./../../../../Images/map-top-gradient.png')} />
                <TouchableWithoutFeedback onPress={()=>{this.props.navigator.pop()}}>
                    <Image style={{position:'absolute',width:50,height:50,padding:30,top:12,left:12}} source={require('./../../../../Images/map-icon-close.png')} />
                </TouchableWithoutFeedback>
                {this._renderSearchableMapUI()}
                {this._renderLocateMe()}
            </View>
           :null;
        return(
            <View style={[styles.listViewContainer,{flex:1}]}>
                <View style={[styles.listViewContainer,{borderRadius:10,overflow:'hidden',backgroundColor:'white'},mapStyle]}>

                {map}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject
    },
    fullScreenMap:{
        position:'absolute',
        top:0,
        left:0,
        width:windowSize.width,
        height:windowSize.height
    },
    listViewContainer: {flex: 1, backgroundColor: 'black', paddingBottom: 60},
});

export default TripDetailMap;