import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  theme: "light", // 'light' or 'dark'
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      // Persist the theme preference in localStorage
      localStorage.setItem("theme", state.theme);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      // Persist the theme preference in localStorage
      localStorage.setItem("theme", state.theme);
    },
  },
});

// Load the theme from localStorage on initial load
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  initialState.theme = savedTheme;
}

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
