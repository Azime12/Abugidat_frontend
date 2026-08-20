import { apiSlice } from "./apiSlice";

export const matchApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMatches: builder.query({
      query: () => "/matches",
      providesTags: ["Match"],
    }),
    createMatch: builder.mutation({
      query: (matchData) => ({
        url: "/matches",
        method: "POST",
        body: matchData,
      }),
      invalidatesTags: ["Match", "Job", "Application"],
    }),
  }),
});

export const {
  useGetMatchesQuery,
  useCreateMatchMutation,
} = matchApiSlice;
