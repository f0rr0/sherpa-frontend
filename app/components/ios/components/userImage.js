'use strict';

import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

class UserImage extends Component {
    compoonentDidMount(){

    }

    imageExists(image_url){
        var http = new XMLHttpRequest();

        http.open('HEAD', image_url, false);
        http.send();

        return http.status != 404;
    }

    render() {
        let image = this.props.image;
        if (_.isNull(this.props.image) || this.props.image === '') {
            image = Constants.defaultAvatar;
        }
        return <Image>

        </Image>;
    }
}

UserImage.propTypes = {
    image: PropTypes.string
};

UserImage.defaultProps = {
    className: 'user-image',
    image: Constants.defaultAvatar
};

module.exports = UserImage;