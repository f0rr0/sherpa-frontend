import React from 'react-native';
import { connect } from 'react-redux/native';
import FeedTrip from './feed.trip.ios'
import countries from './../../../../data/countries'
import moment from 'moment';
import GiftedListView from 'react-native-gifted-listview';
import {loadFeed} from '../../../../actions/feed.actions';

var {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight
    }=React;

var styles=StyleSheet.create({
    logo:{
        height:25,
        marginTop:15,
        marginBottom:15
    },
    listView:{
        alignItems:'center',
        justifyContent:"center",
        paddingBottom:50
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
        marginBottom:14
    }
});

class FeedList extends React.Component{

    constructor(){
        super();
        this.itemsLoadedCallback=null;

    }

    componentDidUpdate(){
        if(this.props.feed.feedState==='ready'&&this.props.feed.userTrips[this.props.feed.userTripsPage]){
            this.itemsLoadedCallback(this.props.feed.userTrips[this.props.feed.userTripsPage])
        }else if(this.props.feed.feedState==='reset'){
            //this.refs.listview._refresh()
        }
    }

    showTripDetail(trip) {
        this.props.navigator.push({
            id: "trip",
            trip
        });
    }

    _onFetch(page=1,callback){
        this.itemsLoadedCallback=callback;
        this.props.dispatch(loadFeed(this.props.user.sherpaID,this.props.user.sherpaToken,page));
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

    render(){
        return(
            <GiftedListView
                rowView={this._renderRow.bind(this)}
                onFetch={this._onFetch.bind(this)}
                firstLoader={true} // display a loader for the first fetching
                pagination={true} // enable infinite scrolling using touch to load more
                refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                withSections={false} // enable sections
                headerView={this._renderHeader.bind(this)}
                ref="listview"
                customStyles={{
                    contentContainerStyle:styles.listView,
                    actionsLabel:{fontSize:12}
                }}
            />
        )
    }


    _renderRow(tripData) {
        var country = countries.filter(function(country) {
            return country["alpha-2"] === tripData.country;
        })[0];
        var countryOrState=(tripData.country.toUpperCase()==="US")?tripData.state:country.name;

        //if country code not in ISO, don't resolve country. i.e. Kosovo uses XK but is not in ISO yet
        if(!country)country={name:tripData.country}
        var timeAgo=moment(new Date(tripData.dateEnd*1000)).fromNow();

        return (
            <TouchableHighlight style={styles.listItemContainer} pressRetentionOffset={{top:1,left:1,bottom:1,right:1}} onPress={() => this.showTripDetail(tripData)}>
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
                    <Text style={{color:"#FFFFFF",fontSize:30, fontFamily:"TSTAR", fontWeight:"500",textAlign:'center', letterSpacing:1,backgroundColor:"transparent"}}>{tripData.name.toUpperCase()}</Text>
                    <Text style={{color:"#FFFFFF",fontSize:12, marginTop:2,fontFamily:"TSTAR",textAlign:'center', letterSpacing:1,backgroundColor:"transparent", fontWeight:"800"}}>{countryOrState.toUpperCase()}/{tripData.continent.toUpperCase()}</Text>

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


export default FeedList;