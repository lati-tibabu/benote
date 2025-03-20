import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  workspace: {},
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
  },
});

export const { setWorkspace, updateWorkspace, clearWorkspace } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;
