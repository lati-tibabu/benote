import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../../../../redux/slices/themeSlice";

const Settings = () => {
  const theme = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-4">
        <button
          onClick={() => dispatch(toggleTheme())}
          className={`px-4 py-2 rounded-sm text-white ${
            theme === "light" ? "bg-gray-500" : "bg-gray-800"
          }`}
        >
          Switch to {theme === "light" ? "Dark" : "Light"} Mode
        </button>
      </div>
    </div>
  );
};

export default Settings;
