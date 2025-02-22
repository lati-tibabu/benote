import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    team: {}
}

const teamSlice = createSlice({
    name: 'team',
    initialState,
    reducers: {
        setTeam: (state, action) => {
            state.team = action.payload;
        },
        updateTeam: (state, action) => {
            state.team = {...state.team, ...action.payload};
        },
        clearTeam: (state) => {
            state.team = {};
        },
    },
});

export const { setTeam, updateTeam, clearTeam } = teamSlice.actions;
export default teamSlice.reducer;