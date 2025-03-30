import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  team: {},
  teamList: [],
};

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setTeam: (state, action) => {
      state.team = action.payload;
    },
    updateTeam: (state, action) => {
      state.team = { ...state.team, ...action.payload };
    },
    clearTeam: (state) => {
      state.team = {};
    },
    //team list
    setTeamList: (state, action) => {
      state.teamList = action.payload;
    },
    updateTeamList: (state, action) => {
      state.teamList.map((team) =>
        team.id === action.payload.id ? { ...team, ...action.payload } : team
      );
    },
    clearTeamList: (state) => {
      state.teamList = [];
    },
  },
});

export const {
  setTeam,
  updateTeam,
  clearTeam,
  setTeamList,
  updateTeamList,
  clearTeamList,
} = teamSlice.actions;
export default teamSlice.reducer;
