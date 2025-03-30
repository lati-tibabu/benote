import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  workspace: {},
  workspaceList: [],
  workspaceRecent: [],
  workspaceTeam: [],
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setWorkspace: (state, action) => {
      state.workspace = action.payload;
    },
    updateWorkspace: (state, action) => {
      state.workspace = { ...state.workspace, ...action.payload };
    },
    clearWorkspace: (state) => {
      state.workspace = {};
    },
    //workspace List
    setWorkspaceList: (state, action) => {
      state.workspaceList = action.payload;
    },
    updateWorkspaceList: (state, action) => {
      state.workspaceList.map((workspace) =>
        workspace.id === action.payload.id
          ? { ...workspace, ...action.payload }
          : workspace
      );
    },
    clearWorkspaceList: (state) => {
      state.workspaceList = [];
    },
    //workspaceRecent
    setWorkspaceRecent: (state, action) => {
      state.workspaceRecent = action.payload;
    },

    updateWorkspaceRecent: (state, action) => {
      state.workspaceRecent.map((workspace) =>
        workspace.id === action.payload.id
          ? { ...workspace, ...action.payload }
          : workspace
      );
    },
    clearWorkspaceRecent: (state) => {
      state.workspaceRecent = [];
    },
    // team workspace

    setWorkspaceTeam: (state, action) => {
      state.workspaceTeam = action.payload;
    },

    updateWorkspaceTeam: (state, action) => {
      state.workspaceTeam.map((workspace) =>
        workspace.id === action.payload.id
          ? { ...workspace, ...action.payload }
          : workspace
      );
    },
    clearWorkspaceTeam: (state) => {
      state.workspaceTeam = [];
    },
  },
});

export const {
  setWorkspace,
  updateWorkspace,
  clearWorkspace,
  setWorkspaceList,
  updateWorkspaceList,
  clearWorkspaceList,
  setWorkspaceRecent,
  updateWorkspaceRecent,
  clearWorkspaceRecent,
  setWorkspaceTeam,
  updateWorkspaceTeam,
  clearWorkspaceTeam,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
