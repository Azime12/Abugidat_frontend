// src/redux/slices/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const stateSlice = createSlice({
  name: "state",
  initialState: {
    isSidebarOpen: true,
    allowedRoles: [],
  },
  reducers: {
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setAllowedRoles(state, action) {
      state.allowedRoles = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setAllowedRoles,
} = stateSlice.actions;
export default stateSlice.reducer;
