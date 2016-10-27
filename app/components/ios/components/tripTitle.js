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
    tripTitleSmall:{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",letterSpacing:1,backgroundColor:"transparent",textAlign:"center"},
    tripTitleStandaloneContainer:{position:'absolute',top:160,left:0,right:0,height:20,marginTop:-5}
});

class TripTitle extends Component {
    constructor(props) {
        super(props);

        //define title
        let tripTitle="";
        switch(props.type){
            case 'trip':
                tripTitle="TRIP";
            break;
        }

        //define styling
        let containerStyle=styles.tripTitleContainer;
        if(props.standalone)containerStyle=[styles.tripTitleContainer,styles.tripTitleStandaloneContainer];


        this.state={
            tripTitle,
            containerStyle
        }
    }


    render() {
        var tripData=this.props.tripData;

        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.name;
        })[0];

        var tripName=country ? country.name : tripData.name.trim();

        var subTitle=this.props.showSubtitle?<TripSubtitle tripData={this.props.tripData}></TripSubtitle>:null;
        switch(this.props.type){

        }

        return (
            <View style={[this.state.containerStyle,this.props.style]}>
                <Text style={styles.tripTitleLarge}>{this.props.tripOwner.toUpperCase()}{this.state.tripTitle}</Text>
                <Text style={styles.tripTitleSmall}>{tripName.toUpperCase()}</Text>
                {subTitle}
            </View>
        );
    }
}

TripTitle.defaultProps = {
    tripData:{},
    tripOwner:"",
    showSubtitle:true,
    standalone:false,
    type:'trip'
};

export default TripTitle;