import { apiSlice } from "./apiSlice";

export const locationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Find tutors near coordinates / location
    findNearbyTutors: builder.mutation({
      query: (body) => ({
        url: "/location/nearby-tutors",
        method: "POST",
        body,
      }),
    }),

    // Geocode place name to coordinates
    geocodeLocation: builder.query({
      query: (location) => `/location/geocode?location=${encodeURIComponent(location)}`,
    }),

    // Reverse geocode coordinates to place name
    reverseGeocode: builder.query({
      query: ({ lat, lng }) => `/location/reverse-geocode?lat=${lat}&lng=${lng}`,
    }),

    // Get autocomplete suggestions
    getLocationSuggestions: builder.query({
      query: (q) => `/location/suggest?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const {
  useFindNearbyTutorsMutation,
  useLazyGeocodeLocationQuery,
  useLazyReverseGeocodeQuery,
  useGetLocationSuggestionsQuery,
} = locationApiSlice;
