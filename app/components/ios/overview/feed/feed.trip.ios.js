'use strict';

var React = require('react-native');
var FeedList = require('./feed.list.ios');

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
            />
        )
    }

    _renderRow(tripData) {
        return (
            <View style={styles.listItemContainer}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:.7}}
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
        marginTop:15
    },
    listItemContainer:{
        flex:1,
        width:350,
        height:350,
        marginBottom:15
    }
});

module.exports = FeedTrip;