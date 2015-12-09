import React from 'react-native';
import { connect } from 'react-redux/native';
import FeedTrip from './feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';

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
        this.itemsLoadedCallback=null;
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state= {
            dataSource:this.ds.cloneWithRows([])
        };
    }

    componentDidMount(){
    }

    shouldComponentUpdate(nextProps){
        return this.props.feed.trips!==nextProps.feed.trips;
    }
    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.trips[this.props.feed.feedPage]){
            console.log('feed state complete',this.props.feed.trips[this.props.feed.feedPage],this.props.feed.feedPage);
            this.itemsLoadedCallback(this.props.feed.trips[this.props.feed.feedPage])
        }
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
            <GiftedListView
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                firstLoader={true} // display a loader for the first fetching
                pagination={true} // enable infinite scrolling using touch to load more
                refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false} // enable sections
                customStyles={{
                    refreshableView: {
                        marginBottom:18,
                        marginTop:40
                    },
                    contentContainerStyle:styles.listView
                }}
            />
        )
    }

    _onFetch(page=1,callback){
        console.log('on fetch',page);
        if(page===1){
            callback(this.props.feed.trips[page]);
        }else{
            this.itemsLoadedCallback=callback;
            this.props.dispatch(loadFeed(this.props.user.sherpaID,this.props.user.sherpaToken,page));
        }
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

    _renderRow(tripData) {
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];

        //if country code not in ISO, don't resolve country. i.e. Kosovo uses XK but is not in ISO yet
        if(!country)country={name:tripData.country}

        var timeAgo=moment(new Date(tripData.dateStart*1000)).fromNow();
        return (
            <TouchableHighlight style={styles.listItemContainer}  onPress={() => this.showTripDetail(tripData)}>
                <View style={styles.listItem}>
                    <Image
                        style={{position:"absolute",top:0,left:0,flex:1,height:350,width:350,opacity:.7}}
                        resizeMode="cover"
                        source={{uri:tripData.moments[0].mediaUrl}}
                    />
                    <View style={{position:'absolute',top:20,left:0,right:0,flex:1,alignItems:'center',backgroundColor:'transparent'}}>
                        <Image
                            style={{height:50,width:50,opacity:1,borderRadius:25}}
                            resizeMode="cover"
                            source={{uri:tripData.owner.serviceProfilePicture}}
                        />
                    </View>

                    <Text style={{color:"#FFFFFF",fontSize:12,backgroundColor:"transparent",marginBottom:5,fontFamily:"TSTAR", fontWeight:"800"}}>{tripData.owner.serviceUsername.toUpperCase()}'S TRIP TO</Text>
                    <Text style={{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent"}}>{tripData.location.toUpperCase()}</Text>
                    <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", marginTop:5,fontWeight:"800"}}>{country.name.toUpperCase()}</Text>

                    <View style={{position:'absolute',bottom:20,backgroundColor:'transparent',flex:1,alignItems:'center',justifyContent:'center',flexDirection:'row',left:0,right:0}}>
                        <Image source={require('image!icon-images')} style={{height:7,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{tripData.moments.length}</Text>
                        <Image source={require('image!icon-watch')} style={{height:8,marginBottom:3}} resizeMode="contain"></Image>
                        <Text style={{color:"#FFFFFF",fontSize:12, fontFamily:"TSTAR", fontWeight:"500",backgroundColor:"transparent"}}>{timeAgo.toUpperCase()}</Text>
                    </View>

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