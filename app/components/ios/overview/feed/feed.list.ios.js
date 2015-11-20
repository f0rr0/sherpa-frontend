import React from 'react-native';
import { connect } from 'react-redux/native';
import FeedTrip from './feed.trip.ios'

var {
    View,
    Text,
    StyleSheet,
    Image,
    ListView,
    TouchableHighlight
    }=React;

var styles=StyleSheet.create({
    logo:{
        width:85,
        marginTop:10,
        marginBottom:10
    },
    listView:{
        alignItems:'center',
        justifyContent:"center"
    },
    listItem:{
        flex:1,
        backgroundColor:"black",
        justifyContent:"center",
        alignItems:'center'
    },
    listItemContainer:{
        flex:1,
        width:350,
        height:350,
        marginBottom:18
    }
});

class FeedList extends React.Component{
    constructor(){
        super();
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state= {
            dataSource:ds.cloneWithRows([]),
        };
    }

    componentDidMount(){
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({dataSource:ds.cloneWithRows(this.props.feed.trips)})
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

    _renderHeader(){
        return (
            <Image
                 resizeMode="contain"
                 style={styles.logo}
                 source={require('image!logo-sherpa')}
            />
        )
    }

    _renderRow(tripData: string, sectionID: number, rowID: number) {
        return (
            <TouchableHighlight style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:.7}}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    />
                    <Text style={{color:"#FFFFFF",fontSize:14,backgroundColor:"transparent",fontFamily:"TSTAR", fontWeight:"800",}}>{tripData.owner.serviceUsername}'s</Text>
                    <Text style={{color:"#FFFFFF",fontSize:35, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent"}}>{tripData.name}</Text>
                </View>
            </TouchableHighlight>
        );
    }
}


function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer
    };
}


export default connect(select)(FeedList);