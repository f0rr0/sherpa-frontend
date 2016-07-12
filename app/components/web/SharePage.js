import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
var { Component } = React;
import _ from 'underscore';

class SharePage extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        console.log(this.props.children)
        return(
            <div className="module-container">{this.props.children}</div>
        )
    }
}

export default SharePage