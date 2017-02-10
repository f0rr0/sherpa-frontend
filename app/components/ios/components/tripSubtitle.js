import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import React, {Component} from 'react';
import countries from '../../../data/countries'

var styles=StyleSheet.create({
        subtitle:{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}
});

class TripSubtitle extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        var locuses=this.props.tripData.locus;
        let subTitle=[];

        for (var key in locuses) {
            if(key.indexOf("_gid")>-1){
                let type=key.split("_")[0];
                subTitle.push({name:locuses[type],locus:locuses[key]})
            }
        }

        return(
            <View style={{flexDirection:'row'}}>
                {subTitle.map((el,index)=>{
                    const divider=index<subTitle.length-1?<Text style={[styles.subtitle,{marginHorizontal:2}]}>/</Text>:null;
                    return(
                        <View key={"subtitle-"+index} style={{flexDirection:'row'}}>
                            <TouchableOpacity onPress={()=>{this.props.goLocation(el)}} style={{borderBottomWidth:.5,height:16,borderBottomColor:'rgba(255,255,255,.4)'}}>
                                <Text style={[styles.subtitle]}>{el.name.toUpperCase()}</Text>
                            </TouchableOpacity>
                            {divider}
                        </View>
                    )
                })}
            </View>
        );
    }
}

TripSubtitle.defaultProps = {
    tripData:{},
    goLocation:function(el){}
};

export default TripSubtitle;