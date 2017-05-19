import {
    Platform,
    NativeModules } from 'react-native';

var SherpaExif = {}

function unifyAndroid(exif) {
    var output = {}

    output.ImageWidth = parseInt(exif.ImageWidth)
    output.ImageHeight = parseInt(exif.ImageLength)
    output.Orientation = parseInt(exif.Orientation)
    output.originalUri = exif.originalUri
    return output
}

function unifyIOS(rawExif) {
    //console.log(rawExif)
    var exif=rawExif;//JSON.parse(rawExif);
    var output = {}
    //output.ImageWidth = exif.PixelWidth
    //output.ImageHeight = exif.PixelHeight
    //output.Orientation = exif.Orientation
    //output.originalUri = exif.originalUri
    //return output
    //console.log('exif',exif)
    return exif;
}

SherpaExif.getExif = function (uri) {
    var path = uri.replace('file://', '')
    return NativeModules.ReactNativeExif.getExif(path).then(result => {
        if (Platform.OS === 'android') {
            return unifyAndroid(result)
        } else {
            return unifyIOS(result)
        }
    })
}


export default SherpaExif;