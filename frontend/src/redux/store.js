import {configureStore} from '@reduxjs/toolkit';
import workspaceReducer from './slices/workspaceSlice';
import teamReducer from './slices/teamReducer.js';
import notesReducer from './slices/notesSlice.js';

const store = configureStore({
    reducer: {
        workspace: workspaceReducer,
        team: teamReducer,
        notes: notesReducer
    },
});

export default store;