'use strict';

var React = require('react-native');
import {updateUserData,signupUser} from '../../../actions/user.actions';
import { connect } from 'react-redux/native';
import Dimensions from 'Dimensions';
var windowSize=Dimensions.get('window');

var {
    StyleSheet,
    View,
    Component,
    Text,
    TextInput,
    TouchableHighlight,
    Image
    } = React;


var styles = StyleSheet.create({
    baseText:{
        color:"#011e5c",
        textAlign:"center"
    },
    headline:{
        fontFamily:"TSTAR-bold",
        fontSize:13,
        marginTop:40,
        letterSpacing:.5
    },
    buttonText:{
        fontFamily:"TSTAR-bold",
        color:"#FFFFFF"
    },
    description:{
        fontFamily:"Avenir LT Std",
        fontSize:12,
        lineHeight:14,
        letterSpacing:.25,
        color:"#38383a",
        marginTop:15,
        width:windowSize.width*.7>400?400:windowSize.width*.7
    },
    topArea:{
        alignItems:"center",
        height:windowSize.height*.25
    },
    middleArea:{
        flex:1,
        height:windowSize.height*.5,
        width:windowSize.width,
        alignItems:"flex-start",
        justifyContent:"flex-start"
    },
    slide:{
        flex:1
    },
    bottomArea:{
        alignItems:"center",
        justifyContent:"center",
        height:windowSize.height*.25
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        alignItems:'center',
        justifyContent:'center',
        width:windowSize.width*.8
    },
    mainComponent:{
        flex:1,
        padding:40,
        justifyContent:'center',
        marginTop:80,
        position:'absolute',
        top:180,
        width:windowSize.width
    }
});

class OnboardingScreen extends Component {
    constructor(props){
        super(props);
    }
    componentDidMount(){

    }


    render() {
        return (
            <View style={styles.slide}>
                {(()=>{if(this.props.backgroundImage){return(<Image source={this.props.backgroundImage} style={{width:windowSize.width,height:windowSize.height,position:"absolute",top:0,left:0,flex:1}} resizeMode="cover"></Image>)}})()}

                <View style={styles.topArea}>
                    <Text style={[styles.baseText,styles.headline]}>{this.props.headline}</Text>
                    <Text style={[styles.baseText,styles.description]}>{this.props.description}</Text>
                </View>

                <View style={styles.middleArea}>
                    {(()=>{if(this.props.middleImage){return(<Image source={this.props.middleImage} style={{width:windowSize.width,flex:1}} resizeMode="contain"></Image>)}})()}
                </View>

                <View style={styles.bottomArea}>
                    {this.props.continueButton}
                </View>

                <View style={styles.mainComponent}>
                    {this.props.mainComponent}
                </View>
            </View>
        );
    }
}



export default OnboardingScreen;