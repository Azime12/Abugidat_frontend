import { apiSlice } from "./apiSlice";

export const configApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSystemConfig: builder.query({
      query: () => "/config",
      providesTags: ["Config"],
    }),
    updateSystemConfig: builder.mutation({
      query: (data) => ({
        url: "/config",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Config"],
    }),
  }),
});

export const {
  useGetSystemConfigQuery,
  useUpdateSystemConfigMutation,
} = configApiSlice;
