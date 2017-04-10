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
        //console.log('locus',this.props.tripData.locus)

        for (var key in locuses) {
            if(key.indexOf("_gid")>-1){
                let type=key.split("_")[0];
                if(
                    type=="neighbourhood"||
                    type=="borough"||
                    type=="locality"||
                    type=="region"||
                    type=="macro-region"||
                    type=="continent"||
                    type=="country"
                ){
                    subTitle.push({name:locuses[type],locus:locuses[key],type})
                }
                //subTitle.push({name:locuses[type],locus:locuses[key]})
            }
        }

        let sorting=['neighbourhood','locality','region','country','continent'];
        let finalSubtitles=[];
        for(var i=0;i<sorting.length;i++){
            for(var j=0;j<subTitle.length;j++){
                if(subTitle[j].type==sorting[i].type){
                    finalSubtitles.push(subTitle[j])
                }
            }
        }

        return(
            <View style={{flexDirection:'row'}}>
                {subTitle.map((el,index)=>{
                    const divider=index<subTitle.length-1?<Text style={[styles.subtitle,this.props.style,{marginHorizontal:2}]}>/</Text>:null;
                    return(
                        <View key={"subtitle-"+index} style={{flexDirection:'row'}}>
                            <TouchableOpacity onPress={()=>{this.props.goLocation(el)}} style={[{borderBottomWidth:.5,height:16,borderBottomColor:'rgba(255,255,255,.4)'},this.props.textStyle]}>
                                <Text style={[styles.subtitle,this.props.style]}>{el.name.toUpperCase()}</Text>
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