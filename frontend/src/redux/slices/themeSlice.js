import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_DARK_READER_PRESET_ID } from "../../config/darkReaderPresets";

const initialState = {
  theme: "system", // 'system' | 'light' | 'dark'
  darkReaderPreset: DEFAULT_DARK_READER_PRESET_ID,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      // Persist the theme preference in localStorage
      localStorage.setItem("theme", state.theme);
    },
    setTheme: (state, action) => {
      const allowedThemes = ["system", "light", "dark"];
      state.theme = allowedThemes.includes(action.payload)
        ? action.payload
        : "system";
      // Persist the theme preference in localStorage
      localStorage.setItem("theme", state.theme);
    },
    setDarkReaderPreset: (state, action) => {
      state.darkReaderPreset = action.payload;
      localStorage.setItem("darkReaderPreset", state.darkReaderPreset);
    },
  },
});

// Load the theme from localStorage on initial load
const savedTheme = localStorage.getItem("theme");
if (savedTheme && ["system", "light", "dark"].includes(savedTheme)) {
  initialState.theme = savedTheme;
}

const savedDarkReaderPreset = localStorage.getItem("darkReaderPreset");
if (savedDarkReaderPreset) {
  initialState.darkReaderPreset = savedDarkReaderPreset;
}

export const { toggleTheme, setTheme, setDarkReaderPreset } = themeSlice.actions;
export default themeSlice.reducer;
