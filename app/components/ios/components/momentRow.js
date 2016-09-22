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
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center',
        paddingBottom:10,
    },
    listItemContainer:{
        flex:1,
        width:windowSize.width-30,
        height:windowSize.width-30,
        marginBottom:38,
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
            unsuitcase:this.unSuiteCaseTrip.bind(this)
        });
    }

    componentDidUpdate(prevProps,prevState){
    }

    render(){
        var tripData = this.props.tripData;
        return(
            this.state.available?<View style={styles.listItem} style={styles.listItemContainer}>
                <TouchableHighlight onPress={()=>{
                            this.showTripDetail(tripData.id);
                        }}>

                    <ImageProgress
                        style={{position:"absolute",top:0,left:0,flex:1,height:windowSize.width-30,width:windowSize.width-30,opacity:1}}
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
                <View style={{position:"absolute",bottom:-30,left:0,flex:1,width:windowSize.width-30,flexDirection:"row", alignItems:"center",justifyContent:"space-between",height:30}}>
                    <TouchableHighlight>
                        <Text style={{color:"#282b33",fontSize:12,fontFamily:"Akkurat", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.venue}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="rgba(0,0,0,0)" style={{width:18,height:18}} onPress={()=>{
                                if(!this.state.suitcased){
                                    this.suiteCaseTrip();
                                }else{
                                    this.unSuiteCaseTrip();
                                }
                            }}>
                        <View>
                            <Image
                                style={{width:18,height:18,top:0,position:"absolute",opacity:this.state.suitcased?.5:1}}
                                resizeMode="contain"
                                source={require('./../../../Images/suitcase.png')}
                            />
                            <Image
                                style={{width:10,height:10,left:5,top:5,opacity:this.state.suitcased?1:0,position:"absolute"}}
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