import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import {udpateFeedState,deleteMoment} from '../../../actions/feed.actions';
import {checkSuitcased} from '../../../actions/user.actions';

import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight
} from 'react-native';
import React, { Component } from 'react';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';


var styles = StyleSheet.create({
    listItemContainer:{
        flex:1,
        marginBottom:33,
        alignItems:"stretch"
    }
});

class MomentRow extends Component{
    constructor(props){
        super();
        this.state={suitcased:props.tripData.suitcased,available:true}

    }

    componentDidMount(){
    }

    suiteCaseTrip(){
        this.setState({suitcased:true});
        addMomentToSuitcase(this.props.tripData.id);
    }

    unSuiteCaseTrip(){
        this.setState({suitcased:false});
        removeMomentFromSuitcase(this.props.tripData.id);
    }

    showTripDetail(momentID){

        this.props.tripData.suitcased=this.state.suitcased;

        this.props.navigator.push({
            id: "tripDetail",
            momentID,
            trip:this.props.tripData,
            suitcase:this.suiteCaseTrip.bind(this),
            unsuitcase:this.unSuiteCaseTrip.bind(this),
            sceneConfig:"right-nodrag"
        });
    }

    componentDidUpdate(prevProps,prevState){
    }

    render(){
        var tripData = this.props.tripData;
        var imageMargin=10;
        //var baseWidth=(this.props.containerWidth/this.props.itemsPerRow)-imageMargin/2
        var baseWidth=(this.props.containerWidth - (imageMargin*(this.props.itemsPerRow-1)) ) / this.props.itemsPerRow;
        return(
            this.state.available?
                <View style={[styles.listItemContainer,{width:baseWidth,height:baseWidth,marginRight:imageMargin}]}>
                    <TouchableHighlight onPress={()=>{
                                this.showTripDetail(tripData.id);
                            }}>

                        <ImageProgress
                            style={{position:"absolute",width:baseWidth,top:0,left:0,flex:1,height:baseWidth,opacity:1}}
                            resizeMode="cover"
                            indicator={Progress.Circle}
                            indicatorProps={{
                            color: 'rgba(150, 150, 150, 1)',
                            unfilledColor: 'rgba(200, 200, 200, 0.2)'
                        }}
                            source={{uri:tripData.mediaUrl}}
                            onLoad={() => {
                            }}
                            onError={()=>{
                                this.setState({available:false})
                                deleteMoment(tripData.id);
                            }}

                        >
                            <View style={styles.darkener}></View>
                        </ImageProgress>
                    </TouchableHighlight>
                    <View style={{position:"absolute",bottom:-30,left:0,flex:1,paddingLeft:7,paddingRight:7,width:baseWidth,marginRight:imageMargin,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                        <Text ellipsizeMode="tail" numberOfLines={1} style={{width:baseWidth-35, marginTop:this.props.itemsPerRow>1?5:3,color:"#282b33",fontSize:12-this.props.itemsPerRow,fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                        <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{width:15,height:15}} onPress={()=>{
                                    if(!this.state.suitcased){
                                        this.suiteCaseTrip();
                                    }else{
                                        this.unSuiteCaseTrip();
                                    }
                                }}>
                            <View>
                                <Image
                                    style={{width:15,height:15,top:0,position:"absolute",opacity:this.state.suitcased?.5:1}}
                                    resizeMode="contain"
                                    source={require('./../../../Images/suitcase.png')}
                                />
                                <Image
                                    style={{width:10,height:10,left:5,top:4,opacity:this.state.suitcased?1:0,position:"absolute"}}
                                    resizeMode="contain"
                                    source={require('./../../../Images/suitcase-check.png')}
                                />
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>:<View></View>
        )
    }
}

export default MomentRow;