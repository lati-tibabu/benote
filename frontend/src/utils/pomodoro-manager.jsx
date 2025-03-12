import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tickTimer } from "../redux/slices/pomodoroSlice";

const PomodoroManager = () => {
  const dispatch = useDispatch();
  const { counting, alarmPlaying } = useSelector((state) => state.pomodoro);

  useEffect(() => {
    if (counting) {
      const interval = setInterval(() => {
        dispatch(tickTimer());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [counting, dispatch]);

  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/pomodoro/alarm1.m4a");
    }
    if (alarmPlaying) {
      audioRef.current
        .play()
        .catch((error) => console.error("Audio playing error: ", error));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [alarmPlaying]);

  return null;
};

export default PomodoroManager;
