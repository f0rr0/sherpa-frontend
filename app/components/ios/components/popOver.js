var React = require('react-native');

var {
    Component,
    Animated,
    View,
    TouchableHighlight,
    Text,
    StyleSheet
    } = React;

import ActivityView from "react-native-activity-view";
import { deleteUser,logoutUser } from '../../../actions/user.actions';

var styles = StyleSheet.create({
    button:{
        borderStyle:"solid",
        borderTopWidth:.5,
        borderColor:"#d8d8d8",
        paddingLeft:20,
        height:70,
        flex:1,
        justifyContent:"center"
    },
    buttonCopy:{
        fontFamily:"TSTAR",
        letterSpacing:1,
        fontSize:11,
        fontWeight:"600"
    },
    container:{
        backgroundColor:'white',
        left:0,
        flex:1,
        right:0,
        position:'absolute',
        paddingBottom:50
    }
});

class PopOver extends Component {
    constructor(props) {
        super(props);
        this.bottomOffset = new Animated.Value(-250);
        this.enabled=false;
    }

    componentDidMount(){
    }

    _setAnimation(enable) {
        if(enable=="toggle")enable=!this.enabled;
        if(this.enabled!=enable){
            this.enabled=enable;
            Animated.spring(this.bottomOffset, {
                toValue: enable?-40:-250   // return to start
            }).start()
        }
    }

    reset(){
        this.props.reset();
    }

    openShare(){
        ActivityView.show({
            text: "Sherpa turns instagram into a travel guide",
            url: this.props.shareURL
        });

        this._setAnimation("toggle");
    }

    logoutUser(){

    }

    deleteUser(){

    }

    render() {

        /*
        var shareButton=this.props.showShare?
            <TouchableHighlight onPress={this.openShare.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={styles.buttonCopy}>SHARE YOUR TRIP</Text>
            </TouchableHighlight>:<View></View>;

        var logoutButton=this.props.showLogout?
            <TouchableHighlight underlayColor="#011e5f" style={styles.button} onPress={() => {this.props.dispatch(deleteUser())}}>
                <View>
                    <Text style={styles.buttonCopy}>Logout</Text>
                </View>
            </TouchableHighlight>:<View></View>;

        var deleteButton=this.props.showDelete?
            <TouchableHighlight underlayColor="#011e5f" style={styles.button} onPress={() => {this.props.dispatch(logoutUser())}}>
                <View>
                    <Text style={styles.buttonCopy}>Delete Account</Text>
                </View>
            </TouchableHighlight>:<View></View>;



        return (
            <Animated.View style={styles.container}>
                {deleteButton}
                {logoutButton}
                {shareButton}
            </Animated.View>
        );
        */

        var shareButton=this.props.showShare?
            <TouchableHighlight onPress={this.openShare.bind(this)} underlayColor="#ececec" style={styles.button}>
                <Text style={styles.buttonCopy}>{this.props.shareCopy}</Text>
            </TouchableHighlight>:<View></View>;

        var logoutButton=this.props.showLogout?
            <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this.props.dispatch(deleteUser())}}>
                <Text style={styles.buttonCopy}>LOGOUT</Text>
            </TouchableHighlight>:<View></View>;

        var deleteButton=this.props.showDelete?
            <TouchableHighlight underlayColor="#ececec" style={styles.button} onPress={() => {this.props.dispatch(logoutUser())}}>
                <Text style={styles.buttonCopy}>DELETE ACCOUNT</Text>
            </TouchableHighlight>:<View></View>;

        return (
            <Animated.View style={[styles.container,{bottom: this.bottomOffset}]}>
                {shareButton}
                {logoutButton}
                {deleteButton}
            </Animated.View>
        );
    }
}

PopOver.defaultProps = {
    showShare:true,
    showLogout:false,
    showDelete:false,
    shareURL:"http://trysherpa.com/",
    shareCopy:"SHARE THIS TRIP"
}

export default PopOver;