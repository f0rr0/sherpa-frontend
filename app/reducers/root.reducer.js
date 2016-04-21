import { combineReducers } from 'redux';
import userReducer from './user.reducer';
import feedReducer from './feed.reducer';
import appReducer from './app.reducer';


const rootReducer = combineReducers({
    userReducer,
    feedReducer,
    appReducer
});

export default rootReducer;