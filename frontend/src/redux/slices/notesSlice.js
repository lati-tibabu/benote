import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notes: []
}

const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        setNotes: (state, action) => {
            state.notes = action.payload;
        },
        updateNotes: (state, action) => {
            state.notes.map((note) => 
            note.id === action.payload.id ? {...note, ...action.payload}: note
        );
    },
        clearNotes: (state) => {
            state.notes = [];
        },
    },
});

export const { setNotes, updateNotes, clearNotes } = notesSlice.actions;
export default notesSlice.reducer;