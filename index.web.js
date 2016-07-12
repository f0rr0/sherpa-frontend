import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import configureStore from './app/utils/configure.store';
import ShareTrip from './app/components/web/ShareTrip'
import SharePage from './app/components/web/SharePage'
const store = configureStore();
import {Router, Route, hashHistory,IndexRedirect} from 'react-router';


ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/profile/:feedTarget/:sherpaToken" component={ShareTrip} />
            <Route path="/user/:feedTarget/:sherpaToken" component={ShareTrip} />
            <Route path="/trip/:feedTarget/:sherpaToken" component={ShareTrip} />
        </Router>
    </Provider>,
    document.getElementById('reactContainer')
);


