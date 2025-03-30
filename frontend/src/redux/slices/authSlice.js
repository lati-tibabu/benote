import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {
    id: "",
    name: "",
    email: "",
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedUser: (state, action) => {
      state.user = action.payload;
    },
    updateAuthenticatedUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearAuthenticatedUser: (state) => {
      state.user = {
        id: "",
        name: "",
        email: "",
      };
    },
  },
});

export const {
  setAuthenticatedUser,
  updateAuthenticatedUser,
  clearAuthenticatedUser,
} = authSlice.actions;
export default authSlice.reducer;
