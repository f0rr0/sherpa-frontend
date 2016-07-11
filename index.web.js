import React from 'react';
import ReactDOM from 'react-dom';
import RootWeb from './app/components/web/root.web';

import { Provider } from 'react-redux';
import configureStore from './app/utils/configure.store';
const store = configureStore();

console.log(document.getElementById('reactContainer'),'react container bitch');

ReactDOM.render(
    <Provider store={store}>
        <RootWeb />
    </Provider>,
    document.getElementById('reactContainer')
);


