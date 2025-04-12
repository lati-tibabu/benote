import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userSummary: {},
};

const aiResponseSlice = createSlice({
  name: "aiResponse",
  initialState,
  reducers: {
    setUserSummary: (state, action) => {
      state.userSummary = action.payload;
    },

    updateUserSummary: (state, action) => {
      state.userSummary = { ...state.userSummary, ...action.payload };
    },
    clearUserSummary: (state) => {
      state.userSummary = {};
    },
  },
});

export const { setUserSummary, updateUserSummary, clearUserSummary } =
  aiResponseSlice.actions;
export default aiResponseSlice.reducer;
