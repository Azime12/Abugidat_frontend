// src/redux/slice/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Retrieve user and token from localStorage, with better safety checks
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

// Define the initial state with better default handling for undefined or null values
const initialState = {
  user:
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null,
  token: storedToken && storedToken !== "undefined" ? storedToken : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set user credentials in the state and store them in localStorage
    setUserCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;

      // Store user and token in localStorage, ensure user is serialized
      localStorage.setItem("user", JSON.stringify(user)); // Ensure proper serialization
      localStorage.setItem("token", token);
    },
    // Logout and remove user and token from the state and localStorage
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const selectIsAuthenticated = (state) => state.auth.token;
export const selectUser = (state) => state.auth.user;

export const { setUserCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
