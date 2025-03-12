import {configureStore} from '@reduxjs/toolkit';
import workspaceReducer from './slices/workspaceSlice';
import teamReducer from './slices/teamReducer.js';
import notesReducer from './slices/notesSlice.js';
import pomodoroReducer from './slices/pomodoroSlice.js';

const store = configureStore({
    reducer: {
        workspace: workspaceReducer,
        team: teamReducer,
        notes: notesReducer,
        pomodoro: pomodoroReducer
    },
});

export default store;