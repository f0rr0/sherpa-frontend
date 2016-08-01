'use strict';

var React = require('react-native');
import store from 'react-native-simple-store';
import config from '../../../data/config';

const {instagram,sherpa}=config.auth[config.environment];

var {
    Component,
    Image,
    View,
    TouchableHighlight
    } = React;

class UserImage extends Component {
    constructor(props){
        super(props);
        this.state={
            imageURL:this.props.imageURL
        }

        this.mounted=false;
    }

    componentDidMount(){
        this.mounted=true;
    }

    componentWillUnmount(){
        this.mounted=false;
    }

    componentDidUpdate(prevProps,prevState){
        if(!this.state.imageURL||this.state.imageURL!=this.props.imageURL)this.rescrapeImage();
    }

    rescrapeImage(){
        store.get('user').then((user) => {
            if (user) {
                const {endpoint,version,user_uri} = sherpa;

                console.log("URI",endpoint + version + "/profile/"+user.sherpa+"/refreshuserimage");
                var sherpaHeaders = new Headers();
                sherpaHeaders.append("token", user.sherpaToken);
                sherpaHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                fetch(endpoint + version + "/profile/"+this.props.userID+"/refreshuserimage", {
                    method: 'post',
                    headers: sherpaHeaders
                })
                    .then((rawServiceResponse)=> {
                        return rawServiceResponse.text();
                    }).then((response)=> {
                    if(this.mounted)this.setState({imageURL:response});
                }).catch(err=>console.log('device token err',err));
            }
        });
    }

    render() {
        var imageURL=this.state.imageURL?this.state.imageURL:this.props.imageURL;
        return(
            <TouchableHighlight onPress={()=>{this.props.onPress()}}>
                <Image
                    style={{height:this.props.radius,width:this.props.radius,opacity:1,borderRadius:this.props.radius/2}}
                    resizeMode="cover"
                    source={{uri:imageURL}}
                />
            </TouchableHighlight>
        )
    }
}

UserImage.defaultProps={
    radius:50,
    imageURL:"",
    userID:""
}

export default UserImage