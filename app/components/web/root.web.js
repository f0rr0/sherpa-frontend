//import React from 'react';
//import ReactDOM from 'react-dom';
//import {signupUser} from '../../actions/user.actions.web';
//import {connect} from 'react-redux';
//var { Component } = React;
//
//
//class RootWeb extends Component{
//    constructor(props) {
//        super(props);
//    }
//
//    signupUser(){
//        this.props.dispatch(signupUser());
//    }
//
//    render(){
//        return(
//            <div onClick={this.signupUser.bind(this)}>This should be working</div>
//        )
//    }
//}
//
//function select(state) {
//    return {
//        user: state.userReducer,
//        feed: state.feedReducer
//    };
//}
//export default connect(select)(RootWeb);
