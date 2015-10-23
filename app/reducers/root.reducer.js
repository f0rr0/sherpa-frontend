import { combineReducers } from 'redux';
import onBoardingReducer from './onboarding.reducer';
import appReducer from './app.reducer';


const rootReducer = combineReducers({
    onBoardingReducer,
    appReducer
});

export default rootReducer;