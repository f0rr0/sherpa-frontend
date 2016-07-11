var React = require('react-native');

var {
    Component,
    Animated,
    View
    } = React;

class StickyHeader extends Component {
    constructor(props) {
        super(props);
        this.topOffset = new Animated.Value(-100);
        this.enabled=false;
    }

    componentDidMount(){
        this.props.navigation.props.routeName='bla'
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
            <Animated.View style={{height:70,top: this.topOffset,position:'absolute',backgroundColor:'transparent'}}>
                    {this.props.navigation}
            </Animated.View>
        );
    }
}

export default StickyHeader;