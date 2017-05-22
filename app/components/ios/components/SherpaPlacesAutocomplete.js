import React, { PropTypes } from 'react';
import { TextInput, View, ListView, Image, Text, Dimensions, TouchableHighlight,TouchableOpacity, TouchableWithoutFeedback, Platform, ActivityIndicator, PixelRatio,Animated } from 'react-native';
const defaultStyles = {
    container: {
        flex: 1,
    },
    textInputContainer: {
        backgroundColor: '#C9C9CE',
        height: 44,
        borderTopColor: '#7e7e7e',
        borderBottomColor: '#b5b5b5',
        borderTopWidth: 1 / PixelRatio.get(),
        borderBottomWidth: 1 / PixelRatio.get(),
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        height: 28,
        borderRadius: 5,
        paddingTop: 4.5,
        paddingBottom: 4.5,
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 7.5,
        marginLeft: 8,
        marginRight: 8,
        fontSize: 15,
    },
    poweredContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    powered: {
        marginTop: 15,
    },
    listView: {
        // flex: 1,
    },
    row: {
        padding: 13,
        height: 40,
        flexDirection: 'row',
    },
    separator: {
        height: 1,
        backgroundColor: '#c8c7cc',
    },
    description: {
    },
    loader: {
        // flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        height: 20,
    },
    androidLoader: {
        marginRight: -15,
    },
};

const SherpaPlacesAutocomplete = React.createClass({

    propTypes: {
        placeholder: React.PropTypes.string,
        placeholderTextColor: React.PropTypes.string,
        onPress: React.PropTypes.func,
        onPressProfile: React.PropTypes.func,
        minLength: React.PropTypes.number,
        fetchDetails: React.PropTypes.bool,
        autoFocus: React.PropTypes.bool,
        getDefaultValue: React.PropTypes.func,
        timeout: React.PropTypes.number,
        onTimeout: React.PropTypes.func,
        query: React.PropTypes.object,
        MapzenReverseGeocodingQuery: React.PropTypes.object,
        MapzenPlacesSearchQuery: React.PropTypes.object,
        styles: React.PropTypes.object,
        textInputProps: React.PropTypes.object,
        enablePoweredByContainer: React.PropTypes.bool,
        predefinedPlaces: React.PropTypes.array,
        currentLocation: React.PropTypes.bool,
        currentLocationLabel: React.PropTypes.string,
        nearbyPlacesAPI: React.PropTypes.string,
        filterReverseGeocodingByTypes: React.PropTypes.array,
        predefinedPlacesAlwaysVisible: React.PropTypes.bool,
        enableEmptySections: React.PropTypes.bool,
        apiKey: React.PropTypes.string,
        baseUrl:React.PropTypes.string
    },

    getDefaultProps() {
        return {
            placeholder: 'Search',
            placeholderTextColor: '#A8A8A8',
            onPress: () => {},
            minLength: 0,
            fetchDetails: false,
            autoFocus: false,
            getDefaultValue: () => '',
            timeout: 20000,
            onTimeout: () => console.warn('mapzen places autocomplete: request timeout'),
            query: {
                key: 'missing api key',
                language: 'en',
                types: 'geocode',
            },
            MapzenReverseGeocodingQuery: {
            },
            MapzenPlacesSearchQuery: {
                rankby: 'distance',
                types: 'food',
            },
            styles: {
            },
            textInputProps: {},
            enablePoweredByContainer: true,
            predefinedPlaces: [],
            currentLocation: false,
            currentLocationLabel: 'Current location',
            nearbyPlacesAPI: 'MapzenPlacesSearch',
            filterReverseGeocodingByTypes: [],
            predefinedPlacesAlwaysVisible: false,
            enableEmptySections: true
        };
    },

    getInitialState() {
        const ds = new ListView.DataSource({rowHasChanged: function rowHasChanged(r1, r2) {
            if (typeof r1.isLoading !== 'undefined') {
                return true;
            }
            return r1 !== r2;
        }});
        return {
            text: this.props.getDefaultValue(),
            dataSource: ds.cloneWithRows(this.buildRowsFromResults([])),
            listViewDisplayed: false,
            uiState:'clear'
        };
    },



    setAddressText(address) {
        this.setState({ text: address })
    },

    buildRowsFromResults(results) {
        var res = null;
        results=results.slice(0,4);

        //console.log(results.length,':: resultss')

        if (results.length === 0 || this.props.predefinedPlacesAlwaysVisible === true) {
            res = [...this.props.predefinedPlaces];
            if (this.props.currentLocation === true) {
                res.unshift({
                    properties: {label: "Current location"},
                    description: this.props.currentLocationLabel,
                    isCurrentLocation: true,
                });
            }
        } else {
            res = [];
        }

        res = res.map(function(place) {
            return {
                ...place,
                isPredefinedPlace: true,
            }
        });

        return [...res, ...results];
    },

    componentDidUpdate(prevProps,prevState){
          if(this.state.uiState!==prevState.uiState){

          }
    },

    _renderHelperRow(){
        let helperRowContent=null;
        switch(this.state.uiState){
            case "results":
            case "clear":
                helperRowContent=null;
            break;
            case "searching":
                helperRowContent=
                    <View style={[defaultStyles.row, this.props.styles.row,{}]}>
                        <Image style={{marginRight:20,marginTop:-7,width: 16, height: 16}} source={require('./../../../Images/loader@2x.gif')} />
                        <Text style={[defaultStyles.description, this.props.styles.description,{opacity:.5,fontSize:12}]} numberOfLines={1}>
                            Searching for {this.state.text} ...
                        </Text>
                    </View>
            break;
            case "noresults":
                helperRowContent=
                    <View style={[defaultStyles.row, this.props.styles.row,{alignItems:'center'}]}>
                        <Text style={[defaultStyles.description, this.props.styles.description,{opacity:.8,fontSize:12,alignItems:'center',marginLeft:14}]} numberOfLines={1}>
                            No results for "{this.state.text}"
                        </Text>
                    </View>
            break;
        }

        return helperRowContent
    },

    componentWillUnmount() {
        this._abortRequests();
    },

    _abortRequests() {
        for (let i = 0; i < this._placeRequests.length; i++) {
            this._placeRequests[i].abort();
        }
        this._placeRequests = [];

        for (let i = 0; i < this._peopleRequests.length; i++) {
            this._peopleRequests[i].abort();
        }
        this._peopleRequests = [];
    },

    /**
     * This method is exposed to parent components to focus on textInput manually.
     * @public
     */
    triggerFocus() {
        if (this.refs.textInput) this.refs.textInput.focus();
    },

    /**
     * This method is exposed to parent components to blur textInput manually.
     * @public
     */
    triggerBlur() {
        if (this.refs.textInput) this.refs.textInput.blur();
    },

 
    getLowAccuracyLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
            },
            (error) => {
                this._disableRowLoaders();
                if (error.code <= 2) { // timeout
                    alert("you have no gps or other problem - low accuracy");
                }
                if (error.code == 3) { // timeout
                    alert("search timed out with low accuracy");
                }
            },
            {enableHighAccuracy: false, timeout: 5000, maximumAge: 1000}
        );
    },

    _enableRowLoader(rowData) {
        let rows = this.buildRowsFromResults(this._results);
        // console.log(rows);
        for (let i = 0; i < rows.length; i++) {
            if ((rows[i].place_id === rowData.place_id) || (rows[i].isCurrentLocation === true && rowData.isCurrentLocation === true)) {
                rows[i].isLoading = true;
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(rows),
                });
                break;
            }
        }
    },
    _disableRowLoaders() {
        if (this.isMounted()) {
            for (let i = 0; i < this._results.length; i++) {
                if (this._results[i].isLoading === true) {
                    this._results[i].isLoading = false;
                }
            }
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults(this._results)),
            });
        }
    },
    _onPress(rowData) {
            this.setState({
                text: rowData.properties.label,
            });

            this._onBlur();

            delete rowData.isLoading;

            let predefinedPlace = this._getPredefinedPlace(rowData);

            // sending predefinedPlace as details for predefined places
            this.props.onPress(predefinedPlace, predefinedPlace);
    },
    _onPressProfile(rowData) {
        this._onBlur();
        this.props.onPressProfile(rowData);
    },
    _results: [],
    _placeRequests: [],
    _peopleRequests: [],

    _getPredefinedPlace(rowData) {
        if (rowData.isPredefinedPlace !== true) {
            return rowData;
        }
        for (let i = 0; i < this.props.predefinedPlaces.length; i++) {
            // if (this.props.predefinedPlaces[i].properties.label === rowData.properties.name) {
            return this.props.predefinedPlaces[i];
            // }
        }
        return rowData;
    },

    _filterResultsByTypes(responseJSON, types) {
        if (types.length === 0) return responseJSON.results;

        var results = [];
        for (let i = 0; i < responseJSON.results.length; i++) {
            let found = false;
            for (let j = 0; j < types.length; j++) {
                if (responseJSON.results[i].types.indexOf(types[j]) !== -1) {
                    found = true;
                    break;
                }
            }
            if (found === true) {
                results.push(responseJSON.results[i]);
            }
        }
        return results;
    },

    _request(text){
        this._abortRequests();

        this._results = [];
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults([])),
        });

        this.setState({uiState:'searching'});

        if (text.length > this.props.minLength) {
            this._requestPeople(text);
            this._requestPlaces(text);
        }else{
            this.setState({uiState:'clear'});
        }
    },

    _requestPeople(text){
        const request = new XMLHttpRequest();
        this._placeRequests.push(request);
        request.timeout = this.props.timeout;
        request.ontimeout = this.props.onTimeout;
        request.onreadystatechange = () => {
            if (request.readyState !== 4) {
                return;
            }
            if (request.status === 200) {
                //console.log(request,'search response');
                const responseJSON = JSON.parse(request.responseText);
                //console.log('people response',responseJSON);
                // console.log(responseJSON.features[0].properties);
                //if (typeof responseJSON.features !== 'undefined') {
                    if (this.isMounted()) {
                        for(var i=0;i<responseJSON.profiles.length;i++){
                            var profile=responseJSON.profiles[i];
                            profile.type='profile';
                            if(i<3)this._results.push(profile);
                        }
                        //this._results=this._results.concat(responseJSON.features);

                        this.setState({
                            results:this._results,
                            dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults( this._results)),
                        });
                        if(this._results.length==0){
                            this.setState({uiState:'noresults'});
                        }else{
                            this.setState({uiState:'results'});
                        }
                    }
                //}
                if (typeof responseJSON.error_message !== 'undefined') {
                    //console.warn('mapzen places autocomplete: ' + responseJSON.error_message);
                }
            } else {

                // console.warn("mapzen places autocomplete: request could not be completed or has been aborted");
            }
        };

        var mapzenSearch = this.props.baseUrl+'/search/profile/autocomplete?size=2&q='+encodeURIComponent(text);
        request.open('GET', mapzenSearch);
        request.send();
    },

    _requestPlaces(text) {
            const request = new XMLHttpRequest();
            this._placeRequests.push(request);
            request.timeout = this.props.timeout;
            request.ontimeout = this.props.onTimeout;
            request.onreadystatechange = () => {
                if (request.readyState !== 4) {
                    return;
                }
                if (request.status === 200) {
                    const responseJSON = JSON.parse(request.responseText);
                    // console.log(responseJSON.features[0].properties);
                    if (typeof responseJSON.features !== 'undefined') {
                        if (this.isMounted()) {
                            for(var i=0;i<responseJSON.features.length;i++){
                                let feature=responseJSON.features[i];
                                feature.type='location';
                                if(i<3)this._results.unshift(feature);
                            }
                            //this._results=this._results.concat(responseJSON.features);
                            this.setState({
                                results:this._results,
                                dataSource: this.state.dataSource.cloneWithRows(this.buildRowsFromResults(this._results)),
                            });
                            // console.log(responseJSON)
                            if(this._results.length==0){
                                this.setState({uiState:'noresults'});
                            }else{
                                this.setState({uiState:'results'});
                            }
                        }
                    }
                    if (typeof responseJSON.error_message !== 'undefined') {
                        console.warn('mapzen places autocomplete: ' + responseJSON.error_message);
                    }
                } else {

                    // console.warn("mapzen places autocomplete: request could not be completed or has been aborted");
                }
            };

            var mapzenSearch = this.props.baseUrl+'/geosearch/autocomplete?layers=borough,locality,county,macrocounty,neighbourhood,region,macroregion,country&text=' +encodeURIComponent(text);
            //console.log('search',mapzenSearch)
            request.open('GET', mapzenSearch);
            request.send();
    },
    _onChangeText(text) {
        this._request(text);
        this.setState({
            text: text,
            listViewDisplayed: true,
        });
    },

    _getRowLoader() {
        return (
            <ActivityIndicator
                animating={true}
                size="small"
            />
        );
    },

    _renderLoader(rowData) {
        if (rowData.isLoading === true) {
        //    console.log('render row loader');
            return (
                <View
                    style={[defaultStyles.loader, this.props.styles.loader]}
                >
                    {this._getRowLoader()}
                </View>
            );
        }
        return null;
    },

    _renderLocationRow(rowData){

        let locationLayer;

        switch(rowData.properties.layer){
            case "neighbourhood":
                locationLayer="Neighborhood";
            break;
            case "locality":
                locationLayer="City";
                break;
            case "borough":
                locationLayer="Borough";
            break;
            case "region":
                locationLayer="State / Province";
            break;
            case "macro-region":
                locationLayer="Region";
            break;
            case "county":
                locationLayer="Region";
                break;
            case "country":
                locationLayer="Country";
            break;
            case "continent":
                locationLayer="Continent";
            break;
            default:
                locationLayer="";
        }

        return(
            <TouchableHighlight
                onPress={() =>
          this._onPress(rowData)
        }
                underlayColor="#c8c7cc"
            >
                <View>
                    <View style={[defaultStyles.separator, this.props.styles.separator]} />
                    <View style={[defaultStyles.row, this.props.styles.row]}>
                        <View style={{flexDirection:"row"}}>
                            <Image style={{marginRight:16,marginLeft:8,marginTop:0}} source={require('../../../Images/icons/pin.png')}></Image>
                        </View>
                        <View style={[{flex:1,height:20,top:locationLayer.length==0?4:0}]}>
                            <Text
                                style={[ defaultStyles.description, this.props.styles.description]}
                                numberOfLines={1}
                            >
                                {rowData.properties.label}
                            </Text>
                            <Text style={{fontSize:10,color:'rgba(0,0,0,.5)',letterSpacing:.25,marginTop:-2}}>{locationLayer}</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        )
    },

    _renderProfileRow(rowData){
        //console.log(rowData)
        return(
            <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
          this._onPressProfile(rowData)
        }
                underlayColor="#c8c7cc"
            >
                <View>
                    <View style={[defaultStyles.separator, this.props.styles.separator]} />
                    <View style={[defaultStyles.row, this.props.styles.row]}>
                        <View style={{flexDirection:"row"}}>
                            <Image style={{marginRight:10,marginTop:0,width:25,height:25,borderRadius:12,overflow:"hidden"}} source={{uri:rowData.payload.serviceProfilePicture}}></Image>
                            <View style={[{flex:1,height:20}]}>
                                <Text
                                    style={[ defaultStyles.description, this.props.styles.description]}
                                    numberOfLines={1}
                                >
                                    @{rowData.payload.serviceUsername}
                                </Text>
                                <Text style={{fontSize:10,color:'rgba(0,0,0,.5)',letterSpacing:.25,marginTop:-2}}>{rowData.payload.serviceFullName}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    },

    _renderRow(rowData = {}) {

        //console.log(rowData);
        // rowData.properties.name = rowData.properties.name || rowData.formatted_address || rowData.properties.region;

        switch(rowData.type){
            case 'location':
                return this._renderLocationRow(rowData);
                break;
            case 'profile':
                return this._renderProfileRow(rowData);
                break;

        }

    },

    _onBlur() {
        this.triggerBlur();
        this.setState({listViewDisplayed: false});
    },

    _onFocus() {
        this.setState({listViewDisplayed: true});
    },

    _getListView() {
        if ((this.state.text !== '' || this.props.predefinedPlaces.length || this.props.currentLocation === true) && this.state.listViewDisplayed === true) {
            // console.log(this.state.dataSource);
            return (
                <ListView
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="on-drag"
                    style={[defaultStyles.listView, this.props.styles.listView]}
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow}
                    automaticallyAdjustContentInsets={false}

                    {...this.props}
                />
            );
        }

        if(this.props.enablePoweredByContainer) {
            return (
                <View
                    style={[defaultStyles.poweredContainer, this.props.styles.poweredContainer]}
                >
                </View>
            );
        }

        return null;
    },
    render() {
        let { onChangeText, onFocus, ...userProps } = this.props.textInputProps;
        return (
            <Animated.View
                style={[defaultStyles.container, this.props.styles.container]}
            >
                <Animated.View
                    style={[defaultStyles.textInputContainer, this.props.styles.textInputContainer]}
                >
                    <TextInput
                        { ...userProps }
                        ref="textInput"
                        onSubmitEditing={()=>{
                           if(this._results.length==1) this.props.onSubmitEditing(this._results[0])
                        }}
                        autoFocus={this.props.autoFocus}
                        style={[defaultStyles.textInput, this.props.styles.textInput]}
                        onChangeText={onChangeText ? text => {this._onChangeText(text); onChangeText(text)} : this._onChangeText}
                        value={this.state.text}
                        placeholder={this.props.placeholder}
                        placeholderTextColor={this.props.placeholderTextColor}
                        onFocus={onFocus ? () => {this._onFocus(); onFocus()} : this._onFocus}
                        clearButtonMode="always"
                        returnKeyType='search'
                    />
                </Animated.View>
                {this._renderHelperRow()}
                {this._getListView()}
            </Animated.View>
        );
    },
});


// this function is still present in the library to be retrocompatible with version < 1.1.0
const create = function create(options = {}) {
    return React.createClass({
        render() {
            return (
                <MapzenPlacesAutocomplete ref="MapzenPlacesAutocomplete"
                    {...options}
                />
            );
        },
    });
};


module.exports = {SherpaPlacesAutocomplete, create};

