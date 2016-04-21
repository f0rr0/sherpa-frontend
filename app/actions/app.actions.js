import * as types from '../constants/app.actiontypes'

export function updateTab(currentTab){
    return {
        type:types.UPDATE_TAB,
        currentTab
    };
}