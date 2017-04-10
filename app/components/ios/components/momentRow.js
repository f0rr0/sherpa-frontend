import {addMomentToSuitcase,removeMomentFromSuitcase} from '../../../actions/user.actions';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');
import {udpateFeedState,deleteMoment} from '../../../actions/feed.actions';
import {checkSuitcased} from '../../../actions/user.actions';
import { BlurView, VibrancyView } from 'react-native-blur';

import {
    StyleSheet,
    View,
    Text,
    ListView,
    Image,
    TouchableHighlight,
TouchableOpacity,
Animated
} from 'react-native';
import React, { Component } from 'react';
import ImageProgress from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import {updateUserData,storeUser} from '../../../actions/user.actions'

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
        this.state={
            suitcased:props.tripData.suitcased||props.isSuitcased,
            available:true,
            loadedImageOpacity:new Animated.Value(0),
            tooltipOpacity:new Animated.Value(1)
        }
        this.unmounting=false;

    }

    componentDidMount(){
        checkSuitcased(this.props.tripData.id).then((res)=>{
            this.setState({suitcased:res==='true'})
        })
    }

    suiteCaseTrip(){
        //console.log('suitcase trip')
        this.setState({suitcased:true});
        this.hideTooltip();

        addMomentToSuitcase(this.props.tripData.id);
    }

    componentWillUnmount(){
        this.unmounting=true;
    }

    unSuiteCaseTrip(){
        //console.log('unsuitcase trip')
        this.setState({suitcased:false});
        removeMomentFromSuitcase(this.props.tripData.id);
    }

    hideTooltip(){
        Animated.timing(this.state.tooltipOpacity,{toValue:0,duration:100}).start();
        this.props.dispatch(updateUserData({usedSuitcase:true}))
        this.props.dispatch(storeUser())
    }


    checkSuitcased(){
        checkSuitcased(this.props.tripData.id).then((res)=>{
            if(!this.unmounting)this.setState({suitcased:res==='true'})
        })
    }

    showTripDetail(momentID){

        this.props.tripData.suitcased=this.state.suitcased;

        this.props.navigator.push({
            id: "tripDetail",
            momentID,
            refreshCurrentScene:this.props.refreshCurrentScene,
            suiteCaseTrip:this.suiteCaseTrip.bind(this),
            unSuiteCaseTrip:this.unSuiteCaseTrip.bind(this),
            isSuitcased:this.state.suitcased
        });
    }

    componentDidUpdate(prevProps,prevState){
        if(this.unmounting)return;
        if(prevState.suitcased!==this.state.suitcased)return;
    }

    render(){
        var tripData = this.props.tripData;
        var imageMargin=10;
        var baseWidth=(this.props.containerWidth - (imageMargin*(this.props.itemsPerRow-1)) ) / this.props.itemsPerRow;
        const tooltip=this.props.isNotCurrentUsersTrip&&this.props.rowIndex==0&&this.props.itemRowIndex==1&&!this.props.user.usedSuitcase? <TouchableOpacity style={{position:'absolute',right:-10,bottom:29}} onPress={()=>{this.hideTooltip()}}><Animated.Image ref="tooltip" source={require('./../../../Images/tooltip-suitcase.png')} resizeMode="contain" style={{opacity:this.state.tooltipOpacity,width:365,height:53}}></Animated.Image></TouchableOpacity>: null;

        return(
            this.state.available?

                <View style={[styles.listItemContainer,{width:baseWidth,height:baseWidth,marginRight:this.props.itemsPerRow>1&&this.props.itemRowIndex<this.props.itemsPerRow?imageMargin:0,marginBottom:50,position:'relative'}]}>

                <TouchableOpacity
                    activeOpacity={1}
                    style={{...StyleSheet.absoluteFillObject,opacity:1}}
                    onPress={()=>{
                                this.showTripDetail(tripData.id);
                            }}>

                    <Image
                            style={{...StyleSheet.absoluteFillObject,opacity:1}}
                            resizeMode="cover"
                            indicator={Progress.Circle}
                            indicatorProps={{
                            color: 'rgba(150, 150, 150, 1)',
                            unfilledColor: 'rgba(200, 200, 200, 0.2)'
                        }}
                            //tripData.serviceJson.images.thumbnail.url
                            source={{uri:tripData.serviceJson?tripData.serviceJson.images.thumbnail.url:tripData.mediaUrl}}
                            onLoad={() => {
                            }}
                            onError={()=>{
                                this.setState({available:false})
                                deleteMoment(tripData.id);
                            }}

                        >
                            <View style={styles.darkener}></View>
                        <BlurView blurType="light" blurAmount={100} style={{...StyleSheet.absoluteFillObject}}></BlurView>

                    </Image>
                    <Animated.Image
                        style={{...StyleSheet.absoluteFillObject,opacity:this.state.loadedImageOpacity}}
                        resizeMode="cover"
                        source={{uri:tripData.highresUrl||tripData.mediaUrl}}
                        onLoad={() => {
                                Animated.timing(this.state.loadedImageOpacity,{toValue:1,duration:200}).start()
                            }}
                        onError={()=>{
                                this.setState({available:false})
                                deleteMoment(tripData.id);
                            }}

                    >
                        <View style={styles.darkener}></View>

                    </Animated.Image>

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
                        {tooltip}
                    </View>
            </View>
               :<View></View>
        )
    }
}

export default MomentRow;