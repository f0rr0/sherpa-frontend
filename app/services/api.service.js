export function showTripLocation(trip){
    var tripData=this.props.trip;
    var country = countries.filter(function(country) {
        return country["alpha-2"] === tripData.name;
    })[0];
    var countryOrState=country ? country.name : tripData.name;

    var tripLocation=tripData.name;
    trip.name=countryOrState;

    this.props.navigator.push({
        id: "location",
        data:trip,
        location:tripLocation,
        isCountry:country?true:false
    });
}