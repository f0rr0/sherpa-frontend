import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
var { Component } = React;


class RootWeb extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        return(
            <div>This should be working</div>
        )
    }
}

export default RootWeb