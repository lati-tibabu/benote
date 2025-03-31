import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // Uses localStorage by default
import { persistReducer, persistStore } from "redux-persist";
import { thunk } from "redux-thunk";

import workspaceReducer from "./slices/workspaceSlice";
import teamReducer from "./slices/teamReducer.js";
import notesReducer from "./slices/notesSlice.js";
import pomodoroReducer from "./slices/pomodoroSlice.js";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice.js";
import tasksReducer from "./slices/tasksSlice.js";

// configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "theme", "tasks", "notes"], // Choose which slices to persist
};

// Combine reducers
const rootReducer = combineReducers({
  workspace: workspaceReducer,
  team: teamReducer,
  notes: notesReducer,
  pomodoro: pomodoroReducer,
  theme: themeReducer,
  auth: authReducer,
  tasks: tasksReducer,
});

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"], // Prevents serialization errors
      },
    }),
});

export const persistor = persistStore(store);
export default store;
