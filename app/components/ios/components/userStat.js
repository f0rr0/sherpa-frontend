'use strict';

import {
    Image,
    View,
    TouchableOpacity,
    StyleSheet,
    TouchableHighlight,
    Linking,
    Text
} from 'react-native';

import React, {Component} from 'react';

class UserStat extends Component {
    constructor(props){
        super(props);
        this.mounted=false;
    }

    componentDidMount(){
        this.mounted=true;
    }

    componentWillUnmount(){
        this.mounted=false;
    }

    componentDidUpdate(prevProps,prevState){
    }

    render() {
        return(
            <TouchableOpacity activeOpacity={1} onPress={()=>{this.props.onPress()}} style={this.props.style}>
                <View style={{alignItems:'center',justifyContent:'center'}}>
                    <Image  backgroundSize="contain" source={this.props.icon} />
                    <Text style={{fontSize:8,fontFamily:"TSTAR",fontWeight:"600",letterSpacing:.5,marginTop:5}}>{this.props.description.toUpperCase()}</Text>
                </View>
            </TouchableOpacity>
        )
    }
}

UserStat.defaultProps={
    icon:null,
    description:"DESCRIPTION",
    onPress:function(){return}
}

export default UserStat;