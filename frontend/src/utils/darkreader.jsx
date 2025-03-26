import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import * as DarkReader from "darkreader";

const DarkReaderManager = () => {
  const theme = useSelector((state) => state.theme.theme); // Get the current theme from Redux

  useEffect(() => {
    if (theme === "dark") {
      DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10,
      });
    } else {
      DarkReader.disable();
    }

    // Cleanup when the component is unmounted or theme changes
    return () => {
      DarkReader.disable();
    };
  }, [theme]); // Re-run the effect when theme changes

  return null;
};

export default DarkReaderManager;
