// src/redux/api/userApiSlice.js
import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["User"],
    }),

    // New endpoint for fetching user data
    getUserData: builder.query({
      query: () => "/users/userData",
      providesTags: ["User"],
    }),
    getPendingUsers: builder.query({
      query: () => "/users/pendingStatus",
      providesTags: ["User", { type: "User", id: "PENDING" }],
    }),
    createUser: builder.mutation({
      query: (newUser) => ({
        url: "/users",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),
    editUser: builder.mutation({
      query: (userData) => ({
        url: "/users/updateInfo",
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserPassword: builder.mutation({
      query: (userData) => ({
        url: "/users/updatePassword",
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDataQuery,
  useGetPendingUsersQuery,
  useCreateUserMutation,
  useEditUserMutation,
  useUpdateUserPasswordMutation,
} = userApiSlice;
