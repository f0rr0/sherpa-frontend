import React from 'react';
import ReactDOM from 'react-dom';
import RootWeb from './app/components/web/root.web';

import { Provider } from 'react-redux';
import configureStore from './app/utils/configure.store';
const store = configureStore();


ReactDOM.render(
    <Provider store={store}>
        <RootWeb />
    </Provider>,
    document.getElementById('container')
);


