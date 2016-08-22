import TripSubtitle from '../components/tripSubtitle'
import countries from '../../../data/countries'
import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';

var styles=StyleSheet.create({
    tripTitleContainer:{flex:1,justifyContent:'center',alignItems:'center',left:0,right:0},
    tripTitleLarge: {color:"#FFFFFF",fontSize:12,backgroundColor:"transparent",marginBottom:5,fontFamily:"TSTAR", fontWeight:"800"},
    tripTitleSmall:{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",letterSpacing:1,backgroundColor:"transparent",textAlign:"center"}
});

class TripTitle extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var tripData=this.props.tripData;
        var tripName=tripData.name.trim();
        if(tripName.toLowerCase()=="united states of america")tripName="united states";

        return (
            <View style={styles.tripTitleContainer}>
                <Text style={styles.tripTitleLarge}>{this.props.tripOwner.toUpperCase()} TRIP TO</Text>
                <Text style={styles.tripTitleSmall}>{tripName.toUpperCase()}</Text>
                <TripSubtitle tripData={this.props.tripData}></TripSubtitle>
            </View>
        );
    }
}

TripTitle.defaultProps = {
    tripData:{},
    tripOwner:""
};

export default TripTitle;