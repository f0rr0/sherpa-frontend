import React, { Component } from 'react';
import MapView from 'react-native-maps';

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


class SherpaMapMarker extends Component{

    constructor(props){
        super(props);
        this.state={markerScale:new Animated.Value(0)}
    }

    componentDidMount(){
    }

    componentWillUpdate(nextProps){
        let coords=this.props.markerData.geometry.coordinates;
        let prevCoords=nextProps.markerData.geometry.coordinates;
        if(coords[0]!==prevCoords[0]&&coords[1]!==prevCoords[1]){
            this.moveMarker().start()
        }
    }

    moveMarker(){
        return Animated.stagger(100,
            [
                this.hideMarker(),
                this.showMarker()
            ]
        )
    }

    hideMarker(){
        return Animated.spring(this.state.markerScale, {
            toValue: 0
        })
    }


    showMarker(){
        return Animated.spring(this.state.markerScale, {
            toValue: 1
        })
    }

    render(){

        let markerData=this.props.markerData;
        //console.log('props markerdata',markerData);
        let clustercount=null;

        if(markerData.properties&&markerData.properties.cluster){
            clustercount=<View style={{position:'absolute',bottom:-3,right:-3,backgroundColor:'white',width:20,height:20,borderRadius:10,justifyContent:'center',alignItems:'center'}}><Text style={{color:'black',fontSize:10}}>{markerData.properties.point_count}</Text></View>
        }
        return(
            <MapView.Marker identifier={this.props.identifier} ref="marker" onPress={this.props.onPress} coordinate={{latitude:parseFloat(markerData.geometry.coordinates[1]),longitude:parseFloat(markerData.geometry.coordinates[0])}}>
                <Animated.View style={{width:45,height:45,transform: [{scale: this.props.outsideScale}]}}>
                    <Animated.View style={{width:45,height:45,borderRadius:45,backgroundColor:'white',transform: [{scale: this.state.markerScale}]}}>
                        <Image
                            style={{width:39,height:39,borderRadius:20,marginLeft:3,marginTop:3}}
                            source={{uri:markerData.data.mediaUrl}}
                            onLoad={()=>{if(!this.props.hideOnInit)this.showMarker.bind(this)().start()}}
                        ></Image>
                        {clustercount}
                    </Animated.View>
                </Animated.View>
            </MapView.Marker>
        )
    }
}
SherpaMapMarker.defaultProps={
    outsideScale:new Animated.Value(1)
}
export default SherpaMapMarker;