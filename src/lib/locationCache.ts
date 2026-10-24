/**
 * Location caching, pre-detection, and real recent searches management
 */

export interface RecentLocationItem {
  id: string;
  name: string;
  subtitle?: string;
  coords: [number, number];
  timestamp?: number;
  type: "user" | "recent" | "home" | "popular";
}

const CACHE_KEY = "abugida_user_coords";
const RECENT_KEY = "abugida_recent_locations";
const HOME_KEY = "abugida_saved_home";

export const DEFAULT_ADDIS_COORDS: [number, number] = [9.0192, 38.7525];

export const POPULAR_ADDIS_AREAS: RecentLocationItem[] = [
  {
    id: "pop-bole",
    name: "Bole Medhanialem",
    subtitle: "Cameroon St, Bole, Addis Ababa",
    coords: [8.9984, 38.7865],
    type: "popular",
  },
  {
    id: "pop-cmc",
    name: "CMC / Ayat",
    subtitle: "Bole & Yeka Sub-city, Addis Ababa",
    coords: [9.0145, 38.835],
    type: "popular",
  },
  {
    id: "pop-megenagna",
    name: "Megenagna",
    subtitle: "Yeka Sub-city, Addis Ababa",
    coords: [9.0205, 38.8021],
    type: "popular",
  },
  {
    id: "pop-piassa",
    name: "Piassa / Churchill Ave",
    subtitle: "Arada Sub-city, Addis Ababa",
    coords: [9.0345, 38.7523],
    type: "popular",
  },
  {
    id: "pop-sarbet",
    name: "Sarbet / Old Airport",
    subtitle: "Kirkos / Nifas Silk, Addis Ababa",
    coords: [8.9912, 38.7365],
    type: "popular",
  },
  {
    id: "pop-kazanchis",
    name: "Kazanchis",
    subtitle: "Kirkos Sub-city, Addis Ababa",
    coords: [9.0175, 38.7695],
    type: "popular",
  },
];

/**
 * Read cached user GPS coordinates from localStorage (valid for up to 2 hours)
 */
export function getCachedUserLocation(): [number, number] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.coords) &&
      parsed.coords.length === 2 &&
      !isNaN(Number(parsed.coords[0])) &&
      !isNaN(Number(parsed.coords[1])) &&
      Date.now() - (parsed.timestamp || 0) < 2 * 60 * 60 * 1000 // 2 hours
    ) {
      return [Number(parsed.coords[0]), Number(parsed.coords[1])];
    }
  } catch {
    // Ignore storage parse error
  }
  return null;
}

/**
 * Save user GPS coordinates to localStorage
 */
export function setCachedUserLocation(coords: [number, number]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ coords, timestamp: Date.now() })
    );
    window.dispatchEvent(
      new CustomEvent("abugida_location_updated", { detail: coords })
    );
  } catch {
    // Ignore storage quota error
  }
}

/**
 * Pre-detect user location silently in the background before the user even clicks.
 * Uses fast network/cell/wifi triangulation (enableHighAccuracy: false) to return in <400ms.
 */
let isPreDetecting = false;
export function preDetectUserLocation(): void {
  if (typeof window === "undefined" || !navigator.geolocation || isPreDetecting) {
    return;
  }

  // If already cached recently (within last 30 minutes), skip querying
  const cached = getCachedUserLocation();
  if (cached) return;

  isPreDetecting = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isPreDetecting = false;
      const coords: [number, number] = [
        pos.coords.latitude,
        pos.coords.longitude,
      ];
      setCachedUserLocation(coords);
    },
    () => {
      isPreDetecting = false;
      // Silently ignore background failure / permission prompt denial
    },
    {
      enableHighAccuracy: false, // FAST! Does not block for hardware GPS lock
      timeout: 4000,
      maximumAge: 300000, // 5 minutes
    }
  );
}

/**
 * Fast lookup: returns cached location immediately if present,
 * or queries geolocation quickly with short timeout.
 */
export async function getFastUserLocation(): Promise<[number, number]> {
  const cached = getCachedUserLocation();
  if (cached) return cached;

  if (typeof window === "undefined" || !navigator.geolocation) {
    return DEFAULT_ADDIS_COORDS;
  }

  return new Promise<[number, number]>((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(DEFAULT_ADDIS_COORDS);
      }
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          const coords: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setCachedUserLocation(coords);
          resolve(coords);
        }
      },
      () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(DEFAULT_ADDIS_COORDS);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 300000,
      }
    );
  });
}

/**
 * Get real recent searches stored in localStorage
 */
export function getRecentLocations(): RecentLocationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      return list.filter(
        (item) =>
          item &&
          item.name &&
          Array.isArray(item.coords) &&
          item.coords.length === 2 &&
          !isNaN(Number(item.coords[0])) &&
          !isNaN(Number(item.coords[1]))
      );
    }
  } catch {
    // Ignore storage parse error
  }
  return [];
}

/**
 * Save a real location search or map pick to localStorage
 */
export function saveRecentLocation(
  name: string,
  coords: [number, number],
  subtitle?: string
): RecentLocationItem[] {
  if (typeof window === "undefined" || !name.trim()) return [];
  try {
    const trimmed = name.trim();
    const existing = getRecentLocations();
    // Remove if already exists (by name or very close coordinates)
    const filtered = existing.filter(
      (item) =>
        item.name.toLowerCase() !== trimmed.toLowerCase() &&
        (Math.abs(item.coords[0] - coords[0]) > 0.001 ||
          Math.abs(item.coords[1] - coords[1]) > 0.001)
    );

    const newItem: RecentLocationItem = {
      id: `recent-${Date.now()}`,
      name: trimmed,
      subtitle: subtitle || "Recently searched",
      coords,
      timestamp: Date.now(),
      type: "recent",
    };

    const updated = [newItem, ...filtered].slice(0, 8); // Keep top 8
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

/**
 * Clear recent location searches
 */
export function clearRecentLocations(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Saved Home location
 */
export function getSavedHome(): { address: string; coords: [number, number] } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.address && Array.isArray(parsed.coords)) {
      return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function saveHome(address: string, coords: [number, number]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      HOME_KEY,
      JSON.stringify({ address, coords, timestamp: Date.now() })
    );
  } catch {
    // Ignore
  }
}
