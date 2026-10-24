import client from "@/lib/api-client";

export interface LocationSuggestion {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  area?: string;
}

export interface Landmark {
  name: string;
  area: string;
  lat: number;
  lng: number;
  type: string;
  distanceMeters: number;
}

export const locationService = {
  suggest: (q: string) =>
    client.get<{ success: boolean; suggestions: LocationSuggestion[] }>("/location/suggest", {
      params: { q },
    }),

  reverseGeocode: (lat: number, lng: number) =>
    client.get<{ success: boolean; displayName: string; area?: string }>("/location/reverse-geocode", {
      params: { lat, lng },
    }),

  nearbyLandmarks: (lat: number, lng: number, radius = 1500, limit = 8) =>
    client.get<{ success: boolean; nearbyLandmarks: Landmark[] }>("/location/nearby-landmarks", {
      params: { lat, lng, radius, limit },
    }),

  geocode: async (location: string): Promise<{ lat: number; lng: number; displayName?: string } | null> => {
    try {
      const res = await client.get<any>("/location/geocode", {
        params: { location },
      });
      const data = res.data;
      const lat = Number(data.lat ?? data.latitude);
      const lng = Number(data.lng ?? data.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, displayName: data.displayName || data.formattedAddress || location };
      }
    } catch {
      // Fallback
    }
    return null;
  },
};