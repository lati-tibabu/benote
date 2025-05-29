import React from "react";
import { FaCentercode, FaPause, FaPlay } from "react-icons/fa6";
import {
  startTimer,
  stopTimer,
  resetTimer,
  stopAlarm,
} from "../../../../../redux/slices/pomodoroSlice";
import { useDispatch, useSelector } from "react-redux";

const PomodoroFocus = () => {
  const dispatch = useDispatch();
  const { counting, countingTimer, selectedTimer, alarmPlaying } = useSelector(
    (state) => state.pomodoro
  );

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-2xl shadow-xl flex flex-col items-center">
      <div className="flex items-center gap-3 mb-6">
        <FaCentercode size={32} className="text-blue-600" />
        <span className="font-extrabold text-2xl tracking-tight text-gray-800">
          Focus Timer
        </span>
      </div>

      {/* Time Preset Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 w-full">
        {timerArray.map((item, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-lg font-semibold border transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-sm \
              ${
                selectedTimer === item
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
              }`}
            onClick={() => dispatch(resetTimer(item))}
            aria-pressed={selectedTimer === item}
          >
            {item >= 60 ? `${item / 60} hr` : `${item} min`}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="flex items-center justify-center text-6xl font-mono font-bold text-blue-800 mb-6 tracking-widest drop-shadow-sm select-none">
        {timerFormatter(countingTimer)}
      </div>

      {/* Play/Pause/Reset Controls */}
      <div className="flex items-center gap-6 justify-center mb-2">
        <button
          className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() =>
            counting ? dispatch(stopTimer()) : dispatch(startTimer())
          }
          aria-label={counting ? "Pause timer" : "Start timer"}
        >
          {counting ? (
            <FaPause size={28} color="white" />
          ) : (
            <FaPlay size={28} color="white" />
          )}
        </button>
        <button
          className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
          onClick={() => dispatch(resetTimer(selectedTimer))}
          aria-label="Reset timer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      {/* Alarm notification */}
      {alarmPlaying && (
        <div className="mt-4 flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg shadow animate-pulse">
          <span className="font-semibold">Time's up!</span>
          <button
            className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all text-xs font-bold"
            onClick={() => dispatch(stopAlarm())}
          >
            Stop Alarm
          </button>
        </div>
      )}
    </div>
  );
};

export default PomodoroFocus;

const timerArray = [10, 15, 25, 30, 60, 120];

const timerFormatter = (t) => {
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(t % 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
};
