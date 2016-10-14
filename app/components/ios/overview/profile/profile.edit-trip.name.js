'use strict';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Animated,
    ScrollView,
    TextInput
} from 'react-native';
import React, { Component } from 'react';
import SimpleButton from '../../components/simpleButton';
import Dimensions from 'Dimensions';
import { Fonts, Colors } from '../../../../Themes/'
const SCREEN_WIDTH = require('Dimensions').get('window').width;
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';



class EditTripName extends React.Component {
    constructor(props){
        super(props)
        this.state={
            remainingCharacters:30,
            text:"",
            positionBottom:new Animated.Value(14)
        }
    }

    componentDidMount(){
    }

    navActionRight(){
        this.props.navigator.push({
            id: "own-profile",
            hideNav:true,
            momentData:this.props.momentData,
            sceneConfig:"bottom-nodrag"
        });
    }

    onStart(){
        Animated.spring(this.state.positionBottom, {toValue: 280,friction:7}).start();
    }

    onEnd(){
        Animated.spring(this.state.positionBottom, {toValue: 14,friction:7}).start();
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'white',width:SCREEN_WIDTH,justifyContent:"center",alignItems:"center",flexDirection:"column"}}>
                <AutoGrowingTextInput clearTextOnFocus={true}
                           clearButtonMode="while-editing"
                           style={
                                {
                                    fontSize:35,
                                    color:"black",
                                    fontWeight:"500",
                                    fontFamily:Fonts.type.headline,
                                    marginTop:-190,
                                    textAlign:"center",
                                    letterSpacing:1,
                                    marginBottom:10
                                }
                            }
                                      maxLength={30}
                           onFocus={this.onStart.bind(this)}
                           onBlur={this.onEnd.bind(this)}
                           onChangeText={(text) =>{this.setState({text:text.toUpperCase(),remainingCharacters:30-text.length})}}
                                      value={this.state.text}
                                      placeholder={'NAME YOUR TRIP'}
                >
                </AutoGrowingTextInput>
                <Text style={{color:"#999999",fontFamily:Fonts.type.headline,fontSize:10,letterSpacing:.5}}>EDIT YOUR TRIP NAME HERE ({this.state.remainingCharacters})</Text>
                {this.props.navigation.default}
                <Animated.View style={{position:'absolute',bottom:this.state.positionBottom,left:7,flex:1}}>
                    <SimpleButton style={{width:SCREEN_WIDTH-28,marginLeft:7}} onPress={()=>{this.navActionRight()}} text="save and publish trip"></SimpleButton>
                </Animated.View>

            </View>
        )
    }
}


var styles = StyleSheet.create({

});



export default EditTripName;