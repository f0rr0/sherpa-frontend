import React, { Component } from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import config from '../../../data/config';
import {setUserHometown, updateUserData,resetProfile} from '../../../actions/user.actions'


const {instagram,sherpa}=config.auth[config.environment];


class ChooseHometown extends Component {
  constructor(props){
    super(props);
    this.state={
      hometown: {'name': this.props.user.hometown},
      hometownBG: {uri: "http://www.thomasragger.com/fallback.png"},
      darken:false
    }
  }

  componentDidMount(){
    var sherpaHeaders = new Headers();
    sherpaHeaders.append("token", this.props.user.sherpaToken);
    const {endpoint,version,user_uri} = sherpa;

    fetch(endpoint+"v1/profile/"+this.props.user.serviceID+"/moments/lasthometownmoment/",{
      method:'get',
      headers:sherpaHeaders
    }).then((rawServiceResponse)=>{
      return rawServiceResponse.text();
    }).then((rawSherpaResponse)=>{
      var parsedResponse=JSON.parse(rawSherpaResponse);
      this.setState({hometownBG:{uri:parsedResponse.mediaUrl},darken:true})
    });
  }

  render() {
    return (
      <GooglePlacesAutocomplete
        placeholder={this.props.placeholder}
        ref="googlesearch"
        minLength={2} // minimum length of text to search
        autoFocus={false}


        textInputProps={{
          //onEndEditing:()=>{
          //},
          onBlur:(e)=>{
            e.preventDefault();
            //this.refs.googlesearch.setAddressText(this.state.hometown.name)
          }
        }}

        fetchDetails={true}
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true

          var hometownObject = {
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
            name: details.name
          };

          this.setState({hometown: hometownObject});

          this.props.dispatch(setUserHometown(hometownObject));
          if(this.props.rescrapeOnChange)this.props.dispatch(resetProfile());
          this.props.dispatch(updateUserData({hometown: hometownObject.name}));
        }}
        getDefaultValue={() => {
          return this.state.hometown.name; // text input default value
        }}
        query={{
          key: 'AIzaSyC8XIcEay54NdSsGEmTwt1TlfP7gXjlvXI',
          language: 'en', // language of the results
          types: '(cities)', // default: 'geocode'
        }}
        styles={this.props.styles}

        currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
        currentLocationLabel="Current location"
        nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
        GoogleReverseGeocodingQuery={{
        }}
        GooglePlacesSearchQuery={{
          rankby: 'distance'
        }}

        filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

      />)
  }

}

export default ChooseHometown;