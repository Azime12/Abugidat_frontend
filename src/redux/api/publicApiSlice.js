import { apiSlice } from "./apiSlice";

/**
 * Public endpoints — no auth token required.
 * Used by the landing page to show real DB tutors, approved jobs, and live stats.
 */
export const publicApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Landing page stats counter
    getPublicStats: builder.query({
      query: () => "/public/stats",
      providesTags: ["Dashboard"],
    }),
    // Public tutor list (read-only, privacy-safe fields only)
    getPublicTutors: builder.query({
      query: ({ limit = 20, subject } = {}) => {
        const params = new URLSearchParams();
        if (limit) params.set("limit", limit);
        if (subject && subject !== "All") params.set("subject", subject);
        return `/public/tutors?${params.toString()}`;
      },
      providesTags: ["Tutor"],
    }),
    // Public approved jobs list
    getPublicJobs: builder.query({
      query: ({ limit = 20, subject, level } = {}) => {
        const params = new URLSearchParams();
        if (limit) params.set("limit", limit);
        if (subject && subject !== "All") params.set("subject", subject);
        if (level && level !== "All") params.set("level", level);
        return `/public/jobs?${params.toString()}`;
      },
      providesTags: ["Job"],
    }),
    // Public job creation (parents post without login)
    createPublicJob: builder.mutation({
      query: (jobData) => ({
        url: "/public/jobs",
        method: "POST",
        body: jobData,
      }),
      invalidatesTags: ["Job"],
    }),
  }),
});

export const {
  useGetPublicStatsQuery,
  useGetPublicTutorsQuery,
  useGetPublicJobsQuery,
  useCreatePublicJobMutation,
} = publicApiSlice;
