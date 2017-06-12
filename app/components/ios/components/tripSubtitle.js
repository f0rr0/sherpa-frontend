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
        //console.log('locuses',locuses)
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
            }
        }

        //console.log(subTitle)

        //console.log('subtitle',subTitle);
        let sorting=['neighbourhood','borough','locality','region','country'];
        if(this.props.maxLength)sorting.push('continent');
        let finalSubtitles=[];

        // console.log(subTitle)
        let counter=0;
        //console.log('yoyo',this.props)
        //if(this.props.limitLength){
        let locusLayer=this.props.tripData.locus?this.props.tripData.locus.layer:null;
        let layerType=this.props.tripData.type||this.props.tripData.layer||locusLayer;
        // console.log(this.props.tripData)
            var charcount=0;
            for(var i=0;i<sorting.length;i++){
                for(var j=0;j<subTitle.length;j++){
                        //console.log(subTitle[j].type,'i',i,':',)
                    if(subTitle[j].type==sorting[i]){
                        if(this.props.maxCharCount&&charcount<this.props.maxCharCount){
                            finalSubtitles.push(subTitle[j]);
                            charcount+=subTitle[j].name.length;
                        }else if(finalSubtitles.length<this.props.maxLength){
                            let isSelf=subTitle[j].type==layerType;
                            if(this.props.showSelf){
                                finalSubtitles.push(subTitle[j]);
                            }else{
                                if(!isSelf)finalSubtitles.push(subTitle[j]);
                            }
                        }
                    }
                }
            }
        //}

        // if(this.props.maxLength)finalSubtitles=finalSubtitles.slice(finalSubtitles.length-this.props.maxLength,finalSubtitles.length)

        // console.log('final subtitles',finalSubtitles);

        // console.log("++++++++++")

        if(finalSubtitles==[]){
            finalSubtitles=subTitle;
        }


        //console.log('final subtitles',finalSubtitles)
        //console.log('my type',this.props.tripData.type)

        return(
            <View style={{flexDirection:'row'}}>
                {finalSubtitles.map((el,index)=>{
                    const divider=index<finalSubtitles.length-1?<Text style={[styles.subtitle,this.props.style,{marginHorizontal:2,marginTop:2}]}>/</Text>:null;
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
    limitLength:true,
    maxLength:3,
    showSelf:false,
    maxCharCount:NaN,
    goLocation:function(el){}
};

export default TripSubtitle;