import { apiSlice } from "./apiSlice";

export const applicationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: (params) => {
        const query = new URLSearchParams(params || {}).toString();
        return `/applications${query ? `?${query}` : ""}`;
      },
      providesTags: ["Application"],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/applications/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Application", "Job"],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
} = applicationApiSlice;
