'use strict';

var React = require('react-native');
import {addNotificationsDeviceToken} from '../../../actions/user.actions';
import { connect } from 'react-redux/native';
import Dimensions from 'Dimensions';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';


var windowSize=Dimensions.get('window');

var {
    StyleSheet,
    View,
    Component,
    Text,
    TouchableHighlight,
    PushNotificationIOS,
    Image
    } = React;


var styles = StyleSheet.create({
    container: {
        flexDirection:'column',
        flex:1,
        backgroundColor:'transparent'
    },
    copy:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:10
    },
    copyCenter:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:9,
        textAlign:'center'
    },
    bg:{
        position:'absolute',
        left:windowSize.width*.3,
        top:-60,
        width:windowSize.width*.4,
        height:windowSize.height
    },
    login:{
        flex:1,
        padding:40,
        justifyContent:'center',
        marginTop:80
    },
    textInput:{
        height: 50,
        marginTop:3,
        marginBottom:10,
        backgroundColor:'white',
        padding:10,
        borderWidth: 0,
        fontSize:11,
        fontFamily:"TSTAR-bold"
    },

    imageContainer:{
        flex: 1,
        alignItems: 'stretch'
    },
    bgImage:{
        flex:1
    },
    copyIntro:{
        color:'#001545',
        fontFamily:"TSTAR-bold",
        fontSize:15,
        paddingLeft:15,
        paddingRight:15,
        marginBottom:15,
        textAlign:"center"
    },
    copyLarge:{
        color:'white',
        fontFamily:"TSTAR-bold",
        fontSize:12
    },
    copyButton:{
        marginTop:12
    },
    button:{
        backgroundColor:'#001545',
        height:50,
        justifyContent:'center',
        alignItems:'center'
    }
});

class OnboardingNotifications extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
    }
    allowNotifications(){
        PushNotificationIOS.addEventListener('register', this._onRegister.bind(this));
        PushNotificationIOS.requestPermissions();
    }

    _onRegister(deviceToken){
        this.props.dispatch(addNotificationsDeviceToken(deviceToken))
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.login}>
                    <Image
                        style={{width:10,height:10,left:60,top:55,position:"absolute"}}
                        resizeMode="contain"
                        source={require('./../../../images/pin.png')}
                    />
                    <Text style={styles.copyIntro}>SELECT YOUR HOMETOWN</Text>

                    <GooglePlacesAutocomplete
                        placeholder='Search'
                        minLength={2} // minimum length of text to search
                        autoFocus={false}
                        fetchDetails={true}
                        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                          console.log(data);
                          console.log(details);
                        }}
                        getDefaultValue={() => {
                          return this.props.user.hometown; // text input default value
                        }}
                        query={{
                          // available options: https://developers.google.com/places/web-service/autocomplete
                          key: 'AIzaSyAyiaituPu_vKF5CB50o3XrQw8PLy1QFMY',
                          language: 'en', // language of the results
                          types: '(cities)', // default: 'geocode'
                        }}
                        styles={{
                          description: {
                            fontWeight: 'normal',
                            fontFamily:"TSTAR-bold"
                          },
                          predefinedPlacesDescription: {
                            color: '#FFFFFF',
                          },
                          poweredContainer: {
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity:0
                          },
                          textInput: {
                            backgroundColor: '#001645',
                            height: 50,
                            borderRadius: 0,
                            paddingTop: 4.5,
                            paddingBottom: 4.5,
                            paddingLeft: 30,
                            paddingRight: 10,
                            marginTop:0,
                            marginLeft: 0,
                            marginRight: 0,
                            marginBottom:10,
                            fontSize: 15,
                            color:'white',
                            fontFamily:"TSTAR-bold"
                          },
                           textInputContainer: {
                            backgroundColor: '#FFFFFF',
                            height: 50,
                            borderTopColor: '#FFFFFF',
                            borderBottomColor: '#FFFFFF',
                            borderTopWidth: 0,
                            borderBottomWidth: 0,
                          },
                          row:{
                          },
                          separator: {
                            height: 0,
                            backgroundColor: '#c8c7cc'
                          }
                        }}

                        currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                        currentLocationLabel="Current location"
                        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                        GoogleReverseGeocodingQuery={{
                          // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                        }}
                        GooglePlacesSearchQuery={{
                          // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                          rankby: 'distance',
                          types: 'food',
                        }}

                        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                      />
                    <Text style={styles.copyIntro}>Allow Notifications to learn about new trips your friends are taking.</Text>
                        <TouchableHighlight style={styles.button} underlayColor="white" onPress={this.allowNotifications.bind(this)}>
                            <Text style={styles.copyLarge}>ALLOW NOTIFICATIONS</Text>
                        </TouchableHighlight>

                    <TouchableHighlight style={[styles.button,{marginTop:10}]} underlayColor="white" onPress={this._onRegister.bind(this)}>
                        <Text style={styles.copyLarge}>SKIP</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }
}



function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer
    };
}

export default connect(select)(OnboardingNotifications);