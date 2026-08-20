// src/redux/api/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL, API_TAGS } from "../../constants/apiTags";

// Base query with token management
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // eslint-disable-next-line no-unused-vars
  prepareHeaders: (headers, { getState }) => {
    try {
      const token = localStorage.getItem("token");  // Get token from localStorage
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }
    return headers;
  },
});

// Create a base API slice
export const apiSlice = createApi({
  baseQuery,
  tagTypes: Object.values(API_TAGS),  // Set tag types for cache management
  endpoints: (builder) => ({}),       // Empty here, will extend in separate API slices
});
