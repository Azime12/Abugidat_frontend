import { apiSlice } from "./apiSlice";

export const tutorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTutors: builder.query({
      query: () => "/tutors",
      providesTags: ["Tutor"],
    }),
    getTutorById: builder.query({
      query: (id) => `/tutors/${id}`,
      providesTags: (result, error, id) => [{ type: "Tutor", id }],
    }),
    updateTutor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tutors/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tutor"],
    }),
    deleteTutor: builder.mutation({
      query: (id) => ({
        url: `/tutors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tutor"],
    }),
  }),
});

export const {
  useGetTutorsQuery,
  useGetTutorByIdQuery,
  useUpdateTutorMutation,
  useDeleteTutorMutation,
} = tutorApiSlice;
