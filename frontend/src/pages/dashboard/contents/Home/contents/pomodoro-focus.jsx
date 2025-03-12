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
    <div className="grow flex-1 p-4 flex flex-col items-center">
      <div className="mb-4 flex items-center gap-3">
        <FaCentercode size={30} className="text-blue-500" />
        <span className="font-bold text-lg">Focus</span>
      </div>

      <div className="border p-4 rounded-lg bg-white shadow-md w-full max-w-md flex flex-col items-stretch">
        {/* Time Preset Buttons */}
        <div className="p-2 flex mb-4 items-start sm:items-center justify-center shadow bg-gray-100 rounded-lg h-14 overflow-y-auto">
          <div className="flex gap-2 justify-around flex-col sm:flex-row">
            {timerArray.map((item, index) => (
              <div
                className={`border-2 p-1 text-sm rounded-md font-bold cursor-pointer transition-all duration-100 ${
                  selectedTimer === item
                    ? "border-blue-600 bg-blue-100"
                    : "border-gray-300 "
                }`}
                key={index}
                onClick={() => dispatch(resetTimer(item))}
              >
                {item >= 60 ? `${item / 60} hr` : `${item} Min`}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center text-5xl font-black">
          {timerFormatter(countingTimer)}
        </div>
        {/* Play/Pause Button */}

        <div className="flex items-center justify-center">
          <div className="p-2 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:shadow-md">
            {counting ? (
              <FaPause color="white" onClick={() => dispatch(stopTimer())} />
            ) : (
              <FaPlay color="white" onClick={() => dispatch(startTimer())} />
            )}
          </div>
        </div>
      </div>
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
