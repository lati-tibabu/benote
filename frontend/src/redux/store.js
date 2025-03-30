import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "./slices/workspaceSlice";
import teamReducer from "./slices/teamReducer.js";
import notesReducer from "./slices/notesSlice.js";
import pomodoroReducer from "./slices/pomodoroSlice.js";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice.js";
import tasksReducer from "./slices/tasksSlice.js";

const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    team: teamReducer,
    notes: notesReducer,
    pomodoro: pomodoroReducer,
    theme: themeReducer,
    auth: authReducer,
    tasks: tasksReducer,
  },
});

export default store;
