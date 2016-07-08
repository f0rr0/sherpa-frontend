'use strict';

var React = require('react-native');
import {addNotificationsDeviceToken} from '../../../actions/user.actions';
import { connect } from 'react-redux/native';
import Dimensions from 'Dimensions';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Swiper from 'react-native-swiper';
import OnboardingScreen from './onboarding.screen.ios'


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
        left:0,
        top:0,
        width:windowSize.width,
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
        alignItems:'center',
        justifyContent:'center',
        width:windowSize.width*.8
    },
    buttonHalf:{
        width:windowSize.width*.4
    },
    dot:{
        width: 4,
        height: 4,
        borderRadius: 2,
        marginLeft: 2,
        marginRight: 2,
        marginTop: 2,
        marginBottom: 2,
        backgroundColor:'#c1c1c1'
    },
    dotHover:{
        backgroundColor: '#001645'
    },
    baseText:{
        color:"#011e5c",
        textAlign:"center"
    },
    buttonText:{
        fontFamily:"TSTAR-bold",
        color:"#FFFFFF"
    }
});

class OnboardingSteps extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
    }

    allowNotifications() {
        console.log(':: allow notifictions, request permissions ::')
        PushNotificationIOS.addEventListener('register', this._onRegister.bind(this));
        PushNotificationIOS.requestPermissions();
    }

    _onRegister(deviceToken){
        console.log('on register - device token:: ',deviceToken);
        this.props.dispatch(addNotificationsDeviceToken(deviceToken))
    }

    render() {
        return (
            <Swiper ref="onboardingSlider" style={styles.wrapper} showsButtons={false} loop={false} bounces={true} dot={<View style={styles.dot} />} activeDot={<View style={[styles.dot,styles.dotHover]} />}>
                    <OnboardingScreen
                        backgroundImage={require('./../../../images/onboarding_1.png')}
                        headline="WHERE DO YOU LIVE?"
                        description="This will help our algorithms determine when you are traveling."
                        continueButton={<TouchableHighlight style={styles.button} underlayColor="white" onPress={()=>this.refs.onboardingSlider.scrollTo(1)}><Text style={[styles.baseText,styles.buttonText]}>OK LET'S GO</Text></TouchableHighlight>}
                        mainComponent={
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
                                     backgroundColor: '#FFFFFF',
                                     height: 50,
                                     borderRadius: 0,
                                     paddingTop:0,
                                     paddingBottom:0,
                                     fontSize: 20,
                                     color:'#001645',
                                     fontFamily:"TSTAR-bold"
                                 },
                                 textInputContainer: {
                                     backgroundColor: '#FFFFFF',
                                     height:66,
                                     borderTopColor: '#d1d1d1',
                                     borderBottomColor: '#d1d1d1',
                                     borderLeftColor:"#d1d1d1",
                                     borderRightColor:"#d1d1d1",
                                     borderTopWidth: 1,
                                     borderLeftWidth:1,
                                     borderRightWidth:1,
                                     borderBottomWidth: 1
                                 },
                                 separator: {
                                     height: 0,
                                     backgroundColor: '#FFFFFF'
                                 }
                             }}

                             currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
                             currentLocationLabel="Current location"
                             nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                             GoogleReverseGeocodingQuery={{
                             }}
                             GooglePlacesSearchQuery={{
                                rankby: 'distance'
                             }}

                             filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                         />
                        }

                    />
                    <OnboardingScreen
                        middleImage={require('./../../../images/onboarding_2.png')}
                        headline="TAG YOUR TRIPS"
                        description="Location tag your travel photos on Instagram and we’ll automatically turn them into sharable trip summaries."
                        continueButton={<TouchableHighlight style={styles.button} underlayColor="white" onPress={()=>this.refs.onboardingSlider.scrollTo(1)}><Text style={[styles.baseText,styles.buttonText]}>OK NICE!</Text></TouchableHighlight>}
                    />
                    <OnboardingScreen
                        middleImage={require('./../../../images/onboarding_3.png')}
                        headline="SAVE PLACES"
                        description="Tap the suitcase button anytime you see a place you’d like to visit."
                        continueButton={<TouchableHighlight style={styles.button} underlayColor="white" onPress={()=>this.refs.onboardingSlider.scrollTo(1)}><Text style={[styles.baseText,styles.buttonText]}>GOT IT!</Text></TouchableHighlight>}
                    />
                    <OnboardingScreen
                        middleImage={require('./../../../images/onboarding_4.png')}
                        headline="STAY CONNECTED"
                        description="Get notified when people save your trips and when new photos are shared from places you want to go."
                        continueButton={
                            <View style={{flex:1,flexDirection:"row",alignItems:"center"}}>
                                <TouchableHighlight style={[styles.button,styles.buttonHalf,{marginRight:10,backgroundColor:"#bcbec4"}]} underlayColor="white" onPress={this._onRegister.bind(this)}>
                                    <Text style={[styles.baseText,styles.buttonText]}>MAYBE LATER</Text>
                                </TouchableHighlight>
                                 <TouchableHighlight style={[styles.button,styles.buttonHalf]} underlayColor="white" onPress={this.allowNotifications.bind(this)}>
                                    <Text style={[styles.baseText,styles.buttonText]}>OK, GOT IT!</Text>
                                </TouchableHighlight>
                            </View>
                        }
                    />
                </Swiper>


        );
    }
}



function select(state) {
    return {
        user: state.userReducer,
        feed: state.feedReducer
    };
}

export default connect(select)(OnboardingSteps);