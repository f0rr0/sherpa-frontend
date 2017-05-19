import {
    View,
    TouchableHighlight,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';
import React, { Component } from 'react';
import Dimensions from 'Dimensions';
import UserImage from "./userImage";
import {checkFollowing,subscribe,unsubscribe,checkSubscribing} from '../../../actions/user.actions'
var windowSize=Dimensions.get('window');
var styles=StyleSheet.create({
});

class FollowingRow extends Component {
    constructor(props) {
        super(props);
        let subscriptionID;

        switch(this.props.data.type){
            case "profile":
                subscriptionID=this.props.data.id;
            break;
            case "location":
                subscriptionID=this.props.data.location[this.props.data.location.layer+"_gid"];
            break;
        }

        this.state={
            isFollowing:true,
            subscriptionID
        }

    }

    componentDidMount(){
        checkSubscribing(this.state.subscriptionID,this.props.data.type).then((res)=>{
            //console.log(res);
            this.setState({isRowReady:true,isFollowing:res})
        })
    }


    toggleSubscribe(){
        if(this.state.isFollowing){
            unsubscribe(this.state.subscriptionID,this.props.data.type);
            this.setState({isFollowing:false})
        }else{
            subscribe(this.state.subscriptionID,this.props.data.type);
            this.setState({isFollowing:true})
        }
    }


    render() {
        //console.log(this.props.data,"::",this.state.isFollowing);

        let locationLayer;
        if(this.props.data.type=='location'){
        switch(this.props.data.location.layer){
            case "neighbourhood":
                locationLayer="Neighborhood";
                break;
            case "locality":
                locationLayer="City";
                break;
            case "borough":
                locationLayer="Borough";
                break;
            case "region":
                locationLayer="State / Province";
                break;
            case "macro-region":
                locationLayer="Region";
                break;
            case "country":
                locationLayer="Country";
                break;
            case "continent":
                locationLayer="Continent";
                break;
            default:
                locationLayer="";
        }
        }

        if(!this.state.isRowReady)return null;
            let data;
            switch(this.props.data.type){
                case "profile":
                    data=<View style={{marginTop:-1,height:20,height:75,justifyContent:'center',marginHorizontal:20,borderTopWidth:1,borderBottomWidth:1,borderColor:"#F0F0F0"}}>
                        <TouchableWithoutFeedback onPress={() => {}} activeOpacity={1} >
                            <View style={{paddingHorizontal:20,flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
                                <UserImage
                                    radius={25}
                                    border={false}
                                    onPress={()=>{this.props.onPress(this.props.data)}}
                                    userID={this.props.data.id}
                                    imageURL={this.props.data.serviceProfilePicture}
                                ></UserImage>
                                <View style={{width:220}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={{fontFamily:"Akkurat",color:'black',fontSize:12}}>{this.props.data.serviceUsername}</Text>
                                    </View>
                                    <Text style={{fontFamily:"Akkurat",color:'black',fontSize:9,opacity:.7}}>{this.props.data.serviceFullName}</Text>
                                </View>
                                {!this.props.isMe?<TouchableOpacity activeOpacity={1} onPress={()=>{this.toggleSubscribe()}}>
                                    <View style={{width:20,height:20,borderRadius:20,borderColor:'rgba(0,0,0,.3)',borderWidth:1}}>
                                    </View>

                                    <View style={{opacity:this.state.isFollowing?1:0,position:'absolute',left:0,backgroundColor:'#8ad78d',width:20,height:20,borderRadius:20}}>
                                        <Image style={{width:20,height:20}} resizeMode="contain" source={require('../../../Images/icons/following-on-button.png')}></Image>
                                    </View>
                                </TouchableOpacity>:<View style={{width:20}}></View>}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                break;
                case "location":
                    data=<View style={{marginTop:-1,height:20,height:75,justifyContent:'center',marginHorizontal:20,borderTopWidth:1,borderBottomWidth:1,borderColor:"#F0F0F0"}}>
                        <TouchableWithoutFeedback onPress={() => {}} activeOpacity={1} >
                            <View style={{paddingHorizontal:20,flex:1,justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
                                <View style={{width:25,marginRight:10}}>
                                    <Image source={{uri:this.props.data.mediaUrl||null}}  style={{width:25,height:25}}></Image>
                                </View>
                                <View style={{width:220}}>
                                    <View style={{flexDirection:'row'}}>
                                        <Text style={{fontFamily:"Akkurat",color:'black',fontSize:12}}>{this.props.data.location[this.props.data.location.layer]}</Text>
                                    </View>
                                    <Text style={{fontFamily:"Akkurat",color:'black',fontSize:9,opacity:.7}}>{locationLayer}</Text>
                                </View>
                                <TouchableOpacity activeOpacity={1} onPress={()=>{this.toggleSubscribe()}}>
                                    <View style={{width:20,height:20,borderRadius:20,borderColor:'rgba(0,0,0,.3)',borderWidth:1}}>
                                    </View>

                                    <View style={{opacity:this.state.isFollowing?1:0,position:'absolute',left:0,backgroundColor:'#8ad78d',width:20,height:20,borderRadius:20}}>
                                        <Image style={{width:20,height:20}} resizeMode="contain" source={require('../../../Images/icons/following-on-button.png')}></Image>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                break;
            }

        return data
    }
}



export default FollowingRow;

