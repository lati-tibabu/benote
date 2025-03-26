import { configureStore } from "@reduxjs/toolkit";
import workspaceReducer from "./slices/workspaceSlice";
import teamReducer from "./slices/teamReducer.js";
import notesReducer from "./slices/notesSlice.js";
import pomodoroReducer from "./slices/pomodoroSlice.js";
import themeReducer from "./slices/themeSlice"; // Import the themeReducer

const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    team: teamReducer,
    notes: notesReducer,
    pomodoro: pomodoroReducer,
    theme: themeReducer, // Add theme reducer here
  },
});

export default store;
