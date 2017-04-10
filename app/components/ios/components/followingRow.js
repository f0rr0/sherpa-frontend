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
import {checkFollowing,follow,unfollow} from '../../../actions/user.actions'
var windowSize=Dimensions.get('window');
var styles=StyleSheet.create({
});

class FollowingRow extends Component {
    constructor(props) {
        super(props);
        this.state={
            isFollowing:true
        }

        //console.log(this.props.data);
    }

    componentDidMount(){
        checkFollowing(this.props.data.id).then((res)=>{
            this.setState({isRowReady:true,isFollowing:res})
        })
    }


    followUser(){
        if(this.state.isFollowing){
            unfollow(this.props.data.id);
            this.setState({isFollowing:false})
        }else{
            follow(this.props.data.id);
            this.setState({isFollowing:true})
        }
    }


    render() {
        if(!this.state.isRowReady)return null;
        return(
            <View style={{marginTop:-1,height:20,height:75,justifyContent:'center',marginHorizontal:20,borderTopWidth:1,borderBottomWidth:1,borderColor:"#F0F0F0"}}>
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
                        <TouchableOpacity activeOpacity={1} onPress={()=>{this.followUser()}}>
                            <View style={{width:20,height:20,borderRadius:20,borderColor:'rgba(0,0,0,.3)',borderWidth:1}}>
                            </View>

                            <View style={{opacity:this.state.isFollowing?1:0,position:'absolute',marginTop:-20,left:0,backgroundColor:'#8ad78d',width:20,height:20,borderRadius:20}}>
                                <Image style={{width:20,height:20}} resizeMode="contain" source={require('../../../Images/icons/following-on-button.png')}></Image>
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        )
    }
}



export default FollowingRow;

