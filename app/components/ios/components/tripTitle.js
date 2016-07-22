var React = require('react-native');
import TripSubtitle from '../components/tripSubtitle'
import countries from '../../../data/countries'

var {
    Component,
    View,
    Text
    } = React;

class TripTitle extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount(){
    }


    render() {
        var tripData=this.props.tripData;
        var tripName=tripData.name.trim();

        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center',left:0,right:0}}>
                <Text style={{color:"#FFFFFF",fontSize:12,backgroundColor:"transparent",marginBottom:5,fontFamily:"TSTAR", fontWeight:"800"}}>{this.props.tripOwner.toUpperCase()} TRIP TO</Text>
                <Text style={{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",letterSpacing:1,backgroundColor:"transparent",textAlign:"center"}}>{tripName.toUpperCase()}</Text>
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