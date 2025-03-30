import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  taskRecent: [],
};

const tasksSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTasksRecent: (state, action) => {
      state.taskRecent = action.payload;
    },
    updateTasksRecent: (state, action) => {
      state.taskRecent.map((task) =>
        task.id === action.payload.id ? { ...task, ...action.payload } : task
      );
    },
    clearTasksRecent: (state) => {
      state.taskRecent = [];
    },
  },
});

export const { setTasksRecent, updateTasksRecent, clearTasksRecent } =
  tasksSlice.actions;
export default tasksSlice.reducer;
