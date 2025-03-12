import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    counting: false,
    countingTimer: 25 * 60,
    selectedTimer: 25,
    alarmPlaying: false    
}

const pomodoroSlice = createSlice({
    name: 'pomodoro',
    initialState,
    reducers: {
        startTimer: (state) => {
            state.counting = true;
        },
        stopTimer: (state) => {
            state.counting = false;
        },
        resetTimer: (state, action) => {
            state.counting = false;
            state.countingTimer = action.payload * 60;
            state.selectedTimer = action.payload;
            state.alarmPlaying = false
        },
        tickTimer: (state) => {
            if(state.countingTimer > 0){
                state.countingTimer -= 1;
            } else {
                state.counting = false;
                state.alarmPlaying = true;
            }
        },
        stopAlarm: (state) => {
            state.alarmPlaying = false;
        }
    }
});

export const { startTimer, stopTimer, resetTimer, tickTimer, stopAlarm } = pomodoroSlice.actions;
export default pomodoroSlice.reducer;
