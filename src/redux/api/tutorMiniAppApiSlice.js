import { apiSlice } from "./apiSlice";

export const tutorMiniAppApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Authenticate via Telegram Mini App initData
    tutorAuth: builder.mutation({
      query: (initData) => ({
        url: "/tutor/auth",
        method: "POST",
        body: { initData },
      }),
    }),

    // List approved jobs for tutors (no parent contact info)
    listTutorJobs: builder.query({
      query: () => "/tutor/jobs",
      providesTags: ["Job"],
    }),

    // Get a single job's detail for focused view
    getTutorJob: builder.query({
      query: (id) => `/tutor/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: "Job", id }],
    }),

    // Apply for a job (full Stage 1-3 pipeline)
    applyForJob: builder.mutation({
      query: ({ job_id, initData }) => ({
        url: "/tutor/apply",
        method: "POST",
        body: { job_id, initData },
      }),
      invalidatesTags: ["Application"],
    }),
  }),
});

export const {
  useTutorAuthMutation,
  useListTutorJobsQuery,
  useGetTutorJobQuery,
  useApplyForJobMutation,
} = tutorMiniAppApiSlice;
