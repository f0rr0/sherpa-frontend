import {Animated,StyleSheet} from 'react-native';
import React, {
    Component} from 'react';

var styles=StyleSheet.create({
    headerContainer:{height:70,top: this.topOffset,position:'absolute',backgroundColor:'transparent'}
});

class StickyHeader extends Component {

    constructor(props) {
        super(props);
        this.topOffset = new Animated.Value(-100);
        this.enabled=false;
    }

    _setAnimation(enable) {
        if(this.enabled!=enable){
            this.enabled=enable;
            Animated.timing(this.topOffset, {
                duration: 400,
                toValue: enable? 0 : -100
            }).start()
        }
    }

    reset(){
        this.props.reset();
    }

    render() {
        return (
            <Animated.View style={[styles.headerContainer, this.props.style]}>
                    {this.props.navigation}
            </Animated.View>
        );
    }
}

export default StickyHeader;