import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './../reducers/root.reducer';
import createLogger from 'redux-logger';

const logger = createLogger();

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);


export default function configureStore(initialState) {
    return createStoreWithMiddleware(rootReducer, initialState);
};