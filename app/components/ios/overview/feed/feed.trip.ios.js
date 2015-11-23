'use strict';

var React = require('react-native');
var FeedList = require('./feed.list.ios');
var MaskedView = require('react-native-masked-view');
var Mapbox = require('react-native-mapbox-gl');

var {
    StyleSheet,
    NavigatorIOS,
    Component,
    View,
    Text,
    ListView,
    Image
    } = React;

class FeedTrip extends Component {
    constructor(){
        super();
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state= {
            dataSource: ds.cloneWithRows([]),
        };
    }

    componentDidMount(){
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({dataSource:ds.cloneWithRows(this.props.trip.moments)})
    }

    showTripDetail(trip) {
        this.props.navigator.push({
            title: trip.name,
            component: FeedTrip,
            passProps: {trip}
        });
    }

    render(){
        return(

                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow.bind(this)}
                    contentContainerStyle={styles.listView}
                    renderHeader={this._renderHeader.bind(this)}

                />
        )
    }

    _r0enderHeader(){
        return (
            <View>
                <MaskedView maskImage='mask-test' style={{backgroundColor:'#FAFAFA', height:550, width:380,alignItems:'center',flex:1}} >
                    <View
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:1,backgroundColor:'black' }}
                    />

                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:602,width:380,opacity:.5 }}
                        resizeMode="cover"
                        source={{uri:this.props.trip.moments[0].mediaUrl}}
                    />

                    <Image
                        style={{height:50,width:50,opacity:1,marginTop:100,marginBottom:20,borderRadius:25}}
                        resizeMode="cover"
                        source={{uri:this.props.trip.owner.serviceProfilePicture}}
                    />

                    <Text style={{color:"#FFFFFF",fontSize:14,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800",}}>{this.props.trip.owner.serviceUsername}'s</Text>
                    <Text style={{color:"#FFFFFF",fontSize:35, width:300,fontFamily:"TSTAR", textAlign:'center',fontWeight:"500", letterSpacing:1,backgroundColor:"transparent"}}>{this.props.trip.name}</Text>
                </MaskedView>
                <Mapbox
                    style={{height:200,width:350,left:15,backgroundColor:'black',flex:1,position:'absolute',top:335}}
                    styleURL={'mapbox://styles/thomasragger/cih7wtnk6007ybkkojobxerdy'}
                    accessToken={'pk.eyJ1IjoidGhvbWFzcmFnZ2VyIiwiYSI6ImNpaDd3d2pwMTAwMml2NW0zNjJ5bG83ejcifQ.-IlKvZ3XbN8ckIam7-W3pw'}
                    centerCoordinate={{latitude: this.props.trip.moments[0].lat,longitude: this.props.trip.moments[0].lng}}
                    zoomLevel={11}
                    scrollEnabled={false}
                />
            </View>
        )
    }

    _renderRow(tripData) {
        return (
            <View style={styles.listItemContainer}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:1}}
                        resizeMode="cover"
                        source={{uri:tripData.mediaUrl}}
                    />
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center'
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
    },
    listItemContainer:{
        flex:1,
        width:350,
        height:350,
        marginBottom:15
    }
});

module.exports = FeedTrip;