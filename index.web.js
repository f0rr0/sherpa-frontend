import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux';
import configureStore from './app/utils/configure.store';
import ShareTrip from './app/components/web/ShareTrip'
import ShareLocation from './app/components/web/ShareLocation'
import ShareUser from './app/components/web/ShareUser'
import ShareDetail from './app/components/web/ShareDetail'
const store = configureStore();
import 'whatwg-fetch';
import {Router, Route, hashHistory,IndexRedirect} from 'react-router';


ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/profile/:feedTarget/:sherpaToken" component={ShareUser} />
            <Route path="/trip/:feedTarget/:sherpaToken" component={ShareTrip} />
            <Route path="/location/:feedTarget/:sherpaToken" component={ShareLocation} />
            <Route path="/detail/:feedTarget/:sherpaToken" component={ShareDetail} />
        </Router>
    </Provider>,
    document.getElementById('reactContainer')
);


