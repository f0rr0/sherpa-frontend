var React = require('react-native');
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
        var continents=["europe","asia","africa","america","united states","australia","antarctica"]
        var tripData=this.props.tripData;
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        if(!country)country={name:tripData.country}

        var tripName=tripData.name.replace(/\s+/g, '');

        var isTripNameCountry = countries.filter(function(country) {
            return country["name"].toLowerCase() === tripName.toLowerCase();
        })[0];

        var isTripNameContinent = false;

        for(var i=0;i<continents.length;i++){
            if(tripName.toLowerCase()==continents[i].toLowerCase())isTripNameContinent=true;
        }

        var isState=(country.name.toUpperCase()==="US");
        var isInAmerica=(country["alpha-2"].toUpperCase()==="US")
        var countryOrState=isState?tripData.state:country.name;

        var subTitle="";
        if(isTripNameContinent){
            subTitle="";
        }else if(isTripNameCountry||isState||isInAmerica||countryOrState===tripData.continent){
            subTitle=tripData.continent;
        }else{
            subTitle=countryOrState+"/"+tripData.continent
        }


        return (
            <View style={{flex:1,justifyContent:'center',alignItems:'center',left:0,right:0}}>
                <Text style={{color:"#FFFFFF",fontSize:12,backgroundColor:"transparent",marginBottom:5,fontFamily:"TSTAR", fontWeight:"800"}}>{this.props.tripOwner.toUpperCase()} TRIP TO</Text>
                <Text style={{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",letterSpacing:1,backgroundColor:"transparent"}}>{tripName.toUpperCase()}</Text>
                <Text style={{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{subTitle.toUpperCase()}</Text>
            </View>
        );
    }
}

TripTitle.defaultProps = {
    tripData:{},
    tripOwner:""
};

export default TripTitle;