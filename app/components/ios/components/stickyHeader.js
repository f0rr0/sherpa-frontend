import {Animated,StyleSheet} from 'react-native';
import React, {
    Component} from 'react';

var styles=StyleSheet.create({
    headerContainer:{height:70,position:'absolute'}
});

class StickyHeader extends Component {

    constructor(props) {
        super(props);
        this.enabled=false;
        this.state={topOffset:new Animated.Value(-100)}
    }

    _setAnimation(enable) {
        if(this.enabled!=enable){
            this.enabled=enable;
            Animated.timing(this.state.topOffset, {
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
            <Animated.View style={[styles.headerContainer,{top: this.state.topOffset}]}>
                    {this.props.navigation}
            </Animated.View>
        );
    }
}

export default StickyHeader;