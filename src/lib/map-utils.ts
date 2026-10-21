/**
 * Map utilities for road directions and direct coordinate links
 */

export function getMapLocationUrl(params: {
  lat?: number | string | null;
  lng?: number | string | null;
  locationName?: string | null;
}): string {
  const { lat, lng, locationName } = params;
  const numLat = lat != null ? Number(lat) : NaN;
  const numLng = lng != null ? Number(lng) : NaN;

  if (
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  ) {
    return `https://www.google.com/maps/search/?api=1&query=${numLat},${numLng}`;
  }

  const query = locationName?.trim()
    ? `${locationName.trim()}, Addis Ababa, Ethiopia`
    : "Addis Ababa, Ethiopia";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getDirectionsUrl(params: {
  lat?: number | string | null;
  lng?: number | string | null;
  locationName?: string | null;
}): string {
  const { lat, lng, locationName } = params;
  const numLat = lat != null ? Number(lat) : NaN;
  const numLng = lng != null ? Number(lng) : NaN;

  if (
    !isNaN(numLat) &&
    !isNaN(numLng) &&
    numLat >= -90 &&
    numLat <= 90 &&
    numLng >= -180 &&
    numLng <= 180
  ) {
    return `https://www.google.com/maps/dir/?api=1&destination=${numLat},${numLng}`;
  }

  const query = locationName?.trim()
    ? `${locationName.trim()}, Addis Ababa, Ethiopia`
    : "Addis Ababa, Ethiopia";

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}
