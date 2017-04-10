import React, {Component} from 'react'
import {
    CameraRoll,
    Image,
    Platform,
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    ListView,
    ActivityIndicator,
} from 'react-native'
import Camera from 'react-native-camera';
const SCREEN_HEIGHT = require('Dimensions').get('window').height;
const SCREEN_WIDTH = require('Dimensions').get('window').width;


class SherpaCameraRollPicker extends Component {
    constructor(props) {
        super(props);


        this.state = {
            images: [],
            selected: this.props.selected,
            lastCursor: null,
            loadingMore: false,
            noMore: false,
            dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
        };
        //console.log('sherpa camera roll constructor',this.props.selected)
    }


    componentWillMount() {
        //this.resetSelected();
        var {width} = Dimensions.get('window');
        var {imageMargin, imagesPerRow, containerWidth} = this.props;

        if(typeof containerWidth != "undefined") {
            width = containerWidth;
        }
        //console.log('component will mount');
        this._imageSize = (width - (imagesPerRow) ) / imagesPerRow;

        this.fetch();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            selected: nextProps.selected,
        });
    }

    fetch() {
        if (!this.state.loadingMore) {
            this.setState({loadingMore: true}, () => { this._fetch(); });
        }
    }

    _fetch() {
        var {groupTypes, assetType} = this.props;

        var fetchParams = {
            first: 1000,
            groupTypes: groupTypes,
            assetType: assetType,
        };

        if (Platform.OS === "android") {
            // not supported in android
            delete fetchParams.groupTypes;
        }

        if (this.state.lastCursor) {
            fetchParams.after = this.state.lastCursor;
        }

        CameraRoll.getPhotos(fetchParams)
            .then((data) => this._appendImages(data), (e) => console.log(e));
    }

    _appendImages(data) {
        var assets = data.edges;
        var newState = {
            loadingMore: false,
        };

        if (!data.page_info.has_next_page) {
            newState.noMore = true;
        }

        if (assets.length > 0) {
            newState.lastCursor = data.page_info.end_cursor;
            newState.images = this.state.images.concat(assets);
            //console.log('data source->append images');
            newState.dataSource = this.state.dataSource.cloneWithRows(
                this._nEveryRow(newState.images, this.props.imagesPerRow)
            );
        }

        this.setState(newState);
    }

    render() {
        var {scrollRenderAheadDistance, initialListSize, pageSize, removeClippedSubviews, imageMargin, backgroundColor} = this.props;
        return (
            <View
                style={[styles.wrapper, {padding: 0, paddingRight: 0, backgroundColor: backgroundColor},this.props.wrapper]}>
                <View style={[{opacity:this.state.loadingMore?1:0,width:SCREEN_WIDTH,height:SCREEN_HEIGHT,position:'absolute',top:0,left:0,justifyContent:'center',alignItems:'center'},this.props.wrapper]}><ActivityIndicator style={styles.spinner} /></View>

                <ListView
                    style={{flex: 1,}}
                    scrollRenderAheadDistance={scrollRenderAheadDistance}
                    initialListSize={initialListSize}
                    pageSize={pageSize}
                    removeClippedSubviews={removeClippedSubviews}
                    renderFooter={this._renderFooterSpinner.bind(this)}
                    onEndReached={this._onEndReached.bind(this)}
                    dataSource={this.state.dataSource}
                    renderRow={rowData => this._renderRow(rowData)} />
            </View>
        );
    }

    _renderImage(item) {
        var {selectedMarker, imageMargin} = this.props;
        //console.log(this.state.selected,'check selected');

        var marker = selectedMarker ? selectedMarker :
            <Image
                style={[styles.marker, {width: 25, height: 25, right: imageMargin + 5,bottom:imageMargin+5}]}
                source={require('../../../Images/icon-check-green.png')}
            />;

        //console.log(this.state.selected,'selected')
        var isSelected=(this._arrayObjectIndexOf(this.state.selected, 'uri', item.node.image.uri) >= 0);

        return (
            <View key={item.node.image.uri}>
                <View style={{flex:1,position:'absolute',backgroundColor:'transparent',top:0,width:this._imageSize,height:this._imageSize}}></View>
                <TouchableOpacity
                    activeOpacity={1}
                    style={{marginBottom: imageMargin, marginRight: imageMargin}}
                    onPress={event => this._selectImage(item.node.image)}>
                    <Image
                        source={{uri: item.node.image.uri}}
                        style={{height: this._imageSize, width: this._imageSize,opacity:isSelected?.7:1}} >
                        { isSelected ? marker : null }
                    </Image>
                </TouchableOpacity>
            </View>
        );
    }

    _captureImage(){

    }

    _renderCapture(){
        var {selectedMarker, imageMargin} = this.props;

        return(
            <View key='capture'>
                <TouchableOpacity onPress={event => this._captureImage()}>
                    <View style={{flex:1,backgroundColor:'#3f3f3f',top:0,width:this._imageSize,height:this._imageSize,marginBottom: imageMargin, marginRight: imageMargin,justifyContent:'center',alignItems:'center'}}>
                        <Image
                            source={require('../../../Images/icon-camera-grey.png')}
                            style={{height: 13, width: 17}} >
                        </Image>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }


    takePicture() {
        this.camera.capture()
            .then((data) => console.log(data))
            .catch(err => console.error(err));
    }

    _renderRow(rowData) {
        var items = rowData.map((item) => {
            if (item === null) {
                return null;
            }


            var gridEL;
            switch(item.type){
                case 'capture':
                   gridEL=this._renderCapture();
                break;
                default:
                    gridEL=this._renderImage(item);
            }

            return gridEL
        });

        return (
            <View style={styles.row}>
                {items}
            </View>
        );
    }

    _renderFooterSpinner() {
        if (!this.state.noMore) {
            return null;
        }
        return null;
    }

    _onEndReached() {
        if (!this.state.noMore) {
            this.fetch();
        }
    }

    _selectImage(image) {
        var {maximum, imagesPerRow, callback} = this.props;

        var selected = this.state.selected,
            index = this._arrayObjectIndexOf(selected, 'uri', image.uri);

        if (index >= 0) {
            selected.splice(index, 1);
        } else {
            if (selected.length < maximum) {
                selected.push(image);
            }
        }
        //console.log('data source->select image');
        this.setState({
            selected: selected,
            dataSource: this.state.dataSource.cloneWithRows(
                this._nEveryRow(this.state.images, imagesPerRow)
            )
        });

        callback(selected, image);
    }

    _nEveryRow(data, n) {
        var result = [],
            temp = [];

        //push 'take picture' element
        //temp.push({type:'capture'});

        for (var i = 0; i < data.length; ++i) {
            temp['type']='photo';
            if (i > 0 && i % n === 0) {
                result.push(temp);
                temp = [];
            }
            temp.push(data[i]);
        }

        if (temp.length > 0) {
            while (temp.length !== n) {
                temp.push(null);
            }
            result.push(temp);
        }

        return result;
    }

    _arrayObjectIndexOf(array, property, value) {
        return array.map((o) => { return o[property]; }).indexOf(value);
    }

}

const styles = StyleSheet.create({
    wrapper:{
        flex: 1,
    },
    row:{
        flexDirection: 'row',
        flex: 1,
    },
    marker: {
        position: 'absolute',
        backgroundColor: 'transparent',
    },
})

SherpaCameraRollPicker.propTypes = {
    scrollRenderAheadDistance: React.PropTypes.number,
    initialListSize: React.PropTypes.number,
    pageSize: React.PropTypes.number,
    removeClippedSubviews: React.PropTypes.bool,
    groupTypes: React.PropTypes.oneOf([
        'Album',
        'All',
        'Event',
        'Faces',
        'Library',
        'PhotoStream',
        'SavedPhotos',
    ]),
    maximum: React.PropTypes.number,
    assetType: React.PropTypes.oneOf([
        'Photos',
        'Videos',
        'All',
    ]),
    imagesPerRow: React.PropTypes.number,
    imageMargin: React.PropTypes.number,
    containerWidth: React.PropTypes.number,
    callback: React.PropTypes.func,
    selected: React.PropTypes.array,
    selectedMarker: React.PropTypes.element,
    backgroundColor: React.PropTypes.string,
}

SherpaCameraRollPicker.defaultProps = {
    scrollRenderAheadDistance: 500,
    initialListSize: 1,
    pageSize: 3,
    removeClippedSubviews: false,
    groupTypes: 'SavedPhotos',
    maximum: 15,
    imagesPerRow: 3,
    imageMargin: 4,
    assetType: 'Photos',
    backgroundColor: 'white',
    selected: [],
    callback: function(selectedImages, currentImage) {
        //console.log(currentImage);
        //console.log(selectedImages);
    },
}

export default SherpaCameraRollPicker;
