import {configureStore} from '@reduxjs/toolkit';
import workspaceReducer from './slices/workspaceSlice';
import teamReducer from './slices/teamReducer.js';

const store = configureStore({
    reducer: {
        workspace: workspaceReducer,
        team: teamReducer,
    },
});

export default store;