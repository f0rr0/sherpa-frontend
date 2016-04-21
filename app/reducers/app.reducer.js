import * as types from '../constants/app.actiontypes';

const initialState={
    currentTab:"none"
};

export default function appReducer(state=initialState,action){
    switch(action.type){
        case types.UPDATE_TAB:
            return Object.assign({}, state, {
                currentTab:action.currentTab || state.currentTab
            });
        break;
    }

    return state;
}