import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import * as DarkReader from "darkreader";
import {
  DARK_READER_PRESETS,
  DEFAULT_DARK_READER_PRESET_ID,
} from "../config/darkReaderPresets";

const DarkReaderManager = () => {
  const theme = useSelector((state) => state.theme.theme);
  const darkReaderPreset = useSelector((state) => state.theme.darkReaderPreset);

  useEffect(() => {
    DarkReader.setFetchMethod(window.fetch);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const selectedPreset =
      DARK_READER_PRESETS.find((preset) => preset.id === darkReaderPreset) ||
      DARK_READER_PRESETS.find(
        (preset) => preset.id === DEFAULT_DARK_READER_PRESET_ID
      );

    const applyTheme = () => {
      const shouldUseDarkReader =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      if (shouldUseDarkReader) {
        DarkReader.enable(selectedPreset?.settings || {});
      } else {
        DarkReader.disable();
      }
    };

    applyTheme();

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
      DarkReader.disable();
    };
  }, [theme, darkReaderPreset]);
  return null;
};

export default DarkReaderManager;
