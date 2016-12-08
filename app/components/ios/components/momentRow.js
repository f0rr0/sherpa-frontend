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
    TouchableHighlight,
TouchableOpacity
} from 'react-native';
import React, { Component } from 'react';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';


var styles = StyleSheet.create({
    listItemContainer:{
        flex:1,
        marginBottom:10,
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
            suiteCaseTrip:this.suiteCaseTrip.bind(this),
            unSuiteCaseTrip:this.suitcaseTrip.bind(this),
            isSuitcased:this.state.suitacased
        });
    }

    componentDidUpdate(prevProps,prevState){
    }

    render(){
        var tripData = this.props.tripData;
        var imageMargin=10;
        var baseWidth=(this.props.containerWidth - (imageMargin*(this.props.itemsPerRow-1)) ) / this.props.itemsPerRow;
        //console.log(this.props.itemsPerRow)
        return(
            this.state.available?

                <View style={[styles.listItemContainer,{width:baseWidth,height:baseWidth,marginRight:this.props.itemsPerRow>1&&this.props.itemRowIndex<this.props.itemsPerRow?imageMargin:0,marginBottom:50,position:'relative'}]}>

                <TouchableOpacity

                    style={{...StyleSheet.absoluteFillObject,opacity:1}}
                    onPress={()=>{
                                this.showTripDetail(tripData.id);
                            }}>
                        <ImageProgress
                            style={{...StyleSheet.absoluteFillObject}}
                            resizeMode="cover"
                            indicator={Progress.Circle}
                            indicatorProps={{
                            color: 'rgba(150, 150, 150, 1)',
                            unfilledColor: 'rgba(200, 200, 200, 0.2)'
                        }}
                            source={{uri:tripData.highresUrl||tripData.mediaUrl}}
                            onLoad={() => {
                            }}
                            onError={()=>{
                                this.setState({available:false})
                                deleteMoment(tripData.id);
                            }}

                        >
                            <View style={styles.darkener}></View>
                        </ImageProgress>
                </TouchableOpacity>

                    <View style={{position:"absolute",bottom:-36,left:0,flex:1,paddingLeft:7,paddingRight:7,width:baseWidth,marginRight:imageMargin,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                        <Text ellipsizeMode="tail" numberOfLines={1} style={{width:baseWidth-36, marginTop:this.props.itemsPerRow>1?5:3,color:"#282b33",fontSize:12-this.props.itemsPerRow,fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                        <TouchableOpacity underlayColor="rgba(0,0,0,0)" style={{width:40,height:40,marginTop:5}} onPress={()=>{
                                    if(!this.state.suitcased){
                                        this.suiteCaseTrip();
                                    }else{
                                        this.unSuiteCaseTrip();
                                    }
                                }}>
                                <Image
                                    style={{width:26,height:26,top:5,left:4,position:"absolute",opacity:this.state.suitcased?0:1}}
                                    resizeMode="contain"
                                    source={require('./../../../Images/suitcase-tapable.png')}
                                />
                                <Image
                                    style={{width:26,height:26,left:4,top:5,opacity:this.state.suitcased?1:0,position:"absolute"}}
                                    resizeMode="contain"
                                    source={require('./../../../Images/suitcase-tapped.png')}
                                />
                            </TouchableOpacity>
                    </View>
            </View>
               :<View></View>
        )
    }
}

export default MomentRow;