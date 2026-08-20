import { apiSlice } from "./apiSlice";

export const jobApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: (status) => `/jobs${status ? `?status=${status}` : ""}`,
      providesTags: ["Job"],
    }),
    getJobById: builder.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: "Job", id }],
    }),
    createJob: builder.mutation({
      query: (jobData) => ({
        url: "/jobs",
        method: "POST",
        body: jobData,
      }),
      invalidatesTags: ["Job"],
    }),
    updateJobStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/jobs/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Job"],
    }),
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Job"],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobByIdQuery,
  useCreateJobMutation,
  useUpdateJobStatusMutation,
  useDeleteJobMutation,
} = jobApiSlice;
