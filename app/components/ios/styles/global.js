import Dimensions from 'Dimensions';
var React = require('react-native');
var {StyleSheet} = React;
var windowSize=Dimensions.get('window');


var listView = StyleSheet.create({

});


var basic = StyleSheet.create({
    width:windowSize.width
});


setTimeout(()=>console.log('dimensions',basic),2000);



var GlobalStyles={listView,basic};

export default GlobalStyles;