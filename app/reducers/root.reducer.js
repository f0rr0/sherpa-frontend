import { combineReducers } from 'redux';
import userReducer from './user.reducer';
import feedReducer from './feed.reducer';


const rootReducer = combineReducers({
    userReducer,
    feedReducer
});

export default rootReducer;