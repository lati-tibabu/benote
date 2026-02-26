import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { PiCheckBold, PiDesktop, PiMoonStars, PiSun } from "react-icons/pi";
import { setDarkReaderPreset, setTheme } from "../../../../redux/slices/themeSlice";
import { DARK_READER_PRESETS } from "../../../../config/darkReaderPresets";

const Settings = () => {
  const theme = useSelector((state) => state.theme.theme);
  const darkReaderPreset = useSelector((state) => state.theme.darkReaderPreset);
  const dispatch = useDispatch();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control app mode and Dark Reader theme presets.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="font-semibold text-lg text-blue-600">Theme</h2>
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-2 max-w-sm">
          {[
            { id: "system", label: "System", icon: PiDesktop },
            { id: "light", label: "Light", icon: PiSun },
            { id: "dark", label: "Dark", icon: PiMoonStars },
          ].map((mode) => {
            const isActive = theme === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => dispatch(setTheme(mode.id))}
                className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-white border-2 border-blue-500 text-gray-900"
                    : "text-gray-700 hover:bg-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={24} />
                  <span className="text-2xl font-medium">{mode.label}</span>
                </span>
                {isActive && <PiCheckBold size={24} className="text-blue-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <h2 className="font-semibold text-lg text-gray-900">Dark Reader Presets</h2>
        <p className="text-sm text-gray-500 mb-4">
          Pick one of five visual presets (brightness, contrast, sepia).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DARK_READER_PRESETS.map((preset) => {
            const isActive = darkReaderPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => dispatch(setDarkReaderPreset(preset.id))}
                className={`text-left rounded-xl border p-4 transition-all ${
                  isActive
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{preset.name}</h3>
                  {isActive && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-white/20">
                      Active
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-1 ${
                    isActive ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {preset.description}
                </p>
                <p
                  className={`text-xs mt-2 ${
                    isActive ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  B {preset.settings.brightness}% | C {preset.settings.contrast}% |
                  S {preset.settings.sepia}%
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;
