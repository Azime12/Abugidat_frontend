"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/routing";
import {
  Star,
  MapPin,
  BadgeCheck,
  ArrowRight,
  User,
  Crosshair,
  Clock,
  Home,
  Search,
  X,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { tutorService, type TutorMapPoint } from "@/services/api/tutors";
import { locationService, type LocationSuggestion } from "@/services/api/location";
import {
  getCachedUserLocation,
  preDetectUserLocation,
  getFastUserLocation,
  getRecentLocations,
  saveRecentLocation,
  clearRecentLocations,
  getSavedHome,
  saveHome,
  POPULAR_ADDIS_AREAS,
  DEFAULT_ADDIS_COORDS,
  type RecentLocationItem,
} from "@/lib/locationCache";
import toast from "react-hot-toast";

export function isValidLatLng(coords?: [number, number] | null): coords is [number, number] {
  if (!coords || !Array.isArray(coords) || coords.length < 2) return false;
  const lat = Number(coords[0]);
  const lng = Number(coords[1]);
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function MapController({
  points,
  userLocation,
  selectedPoint,
}: {
  points: TutorMapPoint[];
  userLocation?: [number, number];
  selectedPoint?: TutorMapPoint | null;
}) {
  const map = useMap();
  const hasInitialized = useRef(false);

  // Center on user location if valid
  useEffect(() => {
    if (isValidLatLng(userLocation)) {
      map.flyTo(userLocation, 14, { duration: 1.2 });
    }
  }, [userLocation, map]);

  // Center on selected tutor marker
  useEffect(() => {
    if (
      selectedPoint &&
      isValidLatLng([Number(selectedPoint.lat), Number(selectedPoint.lng)])
    ) {
      map.flyTo(
        [Number(selectedPoint.lat), Number(selectedPoint.lng)],
        Math.max(map.getZoom(), 14),
        { duration: 0.8 }
      );
    }
  }, [selectedPoint, map]);

  // Initial fit bounds or center
  useEffect(() => {
    if (hasInitialized.current || points.length === 0) return;
    if (isValidLatLng(userLocation)) return; // userLocation handles itself

    const valid = points.filter((p) =>
      p && isValidLatLng([Number(p.lat), Number(p.lng)])
    );
    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.setView([Number(valid[0].lat), Number(valid[0].lng)], 13);
    } else {
      const bounds = L.latLngBounds(valid.map((p) => [Number(p.lat), Number(p.lng)]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
    hasInitialized.current = true;
  }, [points, userLocation, map]);

  return null;
}

type Group = {
  key: string;
  lat: number;
  lng: number;
  tutors: TutorMapPoint[];
};

// ── Custom DivIcon Creators ────────────────────────────────────────────────

const createSingleTutorIcon = (tutor: TutorMapPoint, isSelected: boolean) => {
  const displayName = tutor.firstName || tutor.name.split(" ")[0] || "Tutor";
  const isFeatured = !!tutor.is_featured;

  return L.divIcon({
    className: "tutor-marker-container",
    html: `
      <div class="tutor-icon-pin ${isFeatured ? "featured" : ""} ${isSelected ? "selected" : ""}">
        <div class="tutor-pin-head">
          <span class="tutor-pin-cap-icon">🎓</span>
        </div>
        <div class="tutor-pin-tail"></div>
        <span class="tutor-pin-chip">${displayName}</span>
      </div>
    `,
    iconSize: [44, 54],
    iconAnchor: [22, 38],
    popupAnchor: [0, -38],
  });
};

const createClusterIcon = (tutors: TutorMapPoint[], isSelected: boolean) => {
  const count = tutors.length;
  const hasFeatured = tutors.some((t) => t.is_featured);

  return L.divIcon({
    className: "tutor-marker-container",
    html: `
      <div class="tutor-cluster-icon-pin ${hasFeatured ? "featured" : ""} ${isSelected ? "selected" : ""}">
        <div class="tutor-cluster-head">
          <span>👥</span><span>${count}</span>
        </div>
        <div class="tutor-cluster-tail"></div>
        <span class="tutor-cluster-chip">${count} Tutors</span>
      </div>
    `,
    iconSize: [48, 54],
    iconAnchor: [24, 40],
    popupAnchor: [0, -40],
  });
};

const createSelectedPinIcon = () =>
  L.divIcon({
    className: "selected-location-marker",
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;">
        <div style="background:#007B8A;color:white;width:34px;height:34px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:16px;">
          📍
        </div>
        <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #007B8A;margin-top:-2px;"></div>
      </div>
    `,
    iconSize: [34, 40],
    iconAnchor: [17, 40],
    popupAnchor: [0, -40],
  });

const createUserLocationIcon = () =>
  L.divIcon({
    className: "tutor-marker-container",
    html: `
      <div class="user-concentric-beacon">
        <div class="user-beacon-ripple"></div>
        <div class="user-beacon-ripple-outer"></div>
        <div class="user-beacon-core"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

function MapBridge({
  onReady,
  onMapClick,
}: {
  onReady: (map: L.Map) => void;
  onMapClick: (coords: [number, number]) => void;
}) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

export interface TutorMapProps {
  userLocation?: [number, number];
  points?: TutorMapPoint[];
  selectedTutorId?: string | number | null;
  onSelectTutor?: (tutor: TutorMapPoint) => void;
  onLocationSelect?: (coords: [number, number], label?: string) => void;
  className?: string;
  heightClass?: string;
}

export function TutorMap({
  userLocation,
  points: externalPoints,
  selectedTutorId,
  onSelectTutor,
  onLocationSelect,
  className = "",
  heightClass = "h-[500px]",
}: TutorMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState<[number, number] | null>(null);
  const [pinnedLabel, setPinnedLabel] = useState<string>("");
  const [recentSearches, setRecentSearches] = useState<RecentLocationItem[]>([]);
  const [savedHome, setSavedHomeState] = useState<{ address: string; coords: [number, number] } | null>(null);
  const [isSettingHome, setIsSettingHome] = useState(false);
  const [homeInput, setHomeInput] = useState("");
  const [cachedUserCoords, setCachedUserCoords] = useState<[number, number] | null>(null);
  const [apiSuggestions, setApiSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-detect user location silently and load real history from localStorage
  useEffect(() => {
    preDetectUserLocation();
    const cached = getCachedUserLocation();
    if (cached) setCachedUserCoords(cached);

    setRecentSearches(getRecentLocations());
    const home = getSavedHome();
    if (home) {
      setSavedHomeState(home);
      setHomeInput(home.address);
    }

    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setCachedUserCoords(e.detail);
      }
    };
    window.addEventListener("abugida_location_updated", handleLocationUpdate);
    return () => window.removeEventListener("abugida_location_updated", handleLocationUpdate);
  }, []);

  // Live map search via Nominatim & landmarks database
  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2 || inputValue === pinnedLabel) {
      setApiSuggestions([]);
      return;
    }

    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = setTimeout(async () => {
      try {
        setIsSearchingApi(true);
        const res = await locationService.suggest(inputValue.trim());
        if (res.data?.success && Array.isArray(res.data.suggestions)) {
          setApiSuggestions(res.data.suggestions);
        }
      } catch {
        // Fallback
      } finally {
        setIsSearchingApi(false);
      }
    }, 250);

    return () => {
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    };
  }, [inputValue, pinnedLabel]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If points are passed directly from search/filters, use them; otherwise fetch from map endpoint
  const { data: fetchedPoints = [], isLoading } = useQuery({
    queryKey: ["tutors", "map"],
    queryFn: () => tutorService.map(),
    enabled: !externalPoints,
    staleTime: 60_000,
  });

  const rawPoints = externalPoints ?? fetchedPoints;

  // Filter valid coordinates
  const validPoints = useMemo(() => {
    return rawPoints.filter(
      (p) => p && isValidLatLng([Number(p.lat), Number(p.lng)])
    );
  }, [rawPoints]);

  // Group tutors that share the same snapped point into one concentrated cluster (§4.13)
  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, TutorMapPoint[]>();
    for (const p of validPoints) {
      const key = `${Number(p.lat).toFixed(4)},${Number(p.lng).toFixed(4)}`;
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return [...map.entries()].map(([key, tutors]) => {
      const [lat, lng] = key.split(",").map(Number);
      return { key, lat, lng, tutors };
    });
  }, [validPoints]);

  const selectedPoint = useMemo(() => {
    if (!selectedTutorId) return null;
    return validPoints.find((p) => String(p.id) === String(selectedTutorId)) || null;
  }, [selectedTutorId, validPoints]);

  const getNearbyAreaLabel = (coords: [number, number]) => {
    for (const area of POPULAR_ADDIS_AREAS) {
      const dLat = Math.abs(area.coords[0] - coords[0]);
      const dLng = Math.abs(area.coords[1] - coords[1]);
      if (dLat < 0.015 && dLng < 0.015) {
        return `Near ${area.name}`;
      }
    }
    return `Pin (${coords[0].toFixed(3)}, ${coords[1].toFixed(3)})`;
  };

  const handleMapClick = (coords: [number, number]) => {
    setPinnedLocation(coords);
    const label = getNearbyAreaLabel(coords);
    setPinnedLabel(label);
    setInputValue(label);
    setIsDropdownOpen(false);

    // Save real user click into recent searches
    const updated = saveRecentLocation(label, coords, "Pinned on Map");
    setRecentSearches(updated);

    if (mapRef.current) {
      mapRef.current.flyTo(coords, Math.max(mapRef.current.getZoom(), 14), { duration: 0.8 });
    }
    onLocationSelect?.(coords, label);
  };

  const handlePickUserLocation = async () => {
    setIsDropdownOpen(false);

    // Instant: Check if location is already pre-detected in background (zero wait time!)
    const cached = cachedUserCoords || getCachedUserLocation();
    if (cached) {
      setPinnedLocation(cached);
      setPinnedLabel("Your location");
      setInputValue("Your location");
      if (mapRef.current) {
        mapRef.current.flyTo(cached, 15, { duration: 1.0 });
      }
      onLocationSelect?.(cached, "Your location");
      return;
    }

    // Fast fallback with short timeout (does not hang)
    try {
      const coords = await getFastUserLocation();
      setCachedUserCoords(coords);
      setPinnedLocation(coords);
      setPinnedLabel("Your location");
      setInputValue("Your location");
      if (mapRef.current) {
        mapRef.current.flyTo(coords, 15, { duration: 1.0 });
      }
      onLocationSelect?.(coords, "Your location");
    } catch {
      toast.error("Could not obtain location. Center map manually.");
    }
  };

  const handleSelectLocationItem = (item: { name: string; subtitle?: string; coords: [number, number] }) => {
    setPinnedLocation(item.coords);
    setPinnedLabel(item.name);
    setInputValue(item.name);
    setIsDropdownOpen(false);

    // Save to real recent searches
    const updated = saveRecentLocation(item.name, item.coords, item.subtitle);
    setRecentSearches(updated);

    if (mapRef.current) {
      mapRef.current.flyTo(item.coords, 14, { duration: 1 });
    }
    onLocationSelect?.(item.coords, item.name);
  };

  const handleSaveHome = () => {
    if (!homeInput.trim()) return;
    const coords = pinnedLocation || cachedUserCoords || DEFAULT_ADDIS_COORDS;
    saveHome(homeInput.trim(), coords);
    setSavedHomeState({ address: homeInput.trim(), coords });
    setIsSettingHome(false);
    toast.success("Home address saved!");
  };

  const handleClearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentLocations();
    setRecentSearches([]);
    toast.success("Recent searches cleared");
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (apiSuggestions.length > 0) {
        const top = apiSuggestions[0];
        handleSelectLocationItem({
          name: top.displayName || top.name,
          subtitle: top.area || "Map search result",
          coords: [top.lat, top.lng],
        });
        return;
      }
      if (inputValue.trim()) {
        const geo = await locationService.geocode(inputValue.trim());
        if (geo) {
          handleSelectLocationItem({
            name: geo.displayName || inputValue.trim(),
            subtitle: "Geocoded from map",
            coords: [geo.lat, geo.lng],
          });
        }
      }
    }
  };

  const handleClearLocation = () => {
    setInputValue("");
    setPinnedLocation(null);
    setPinnedLabel("");
    setApiSuggestions([]);
  };

  // Filter items matching user search query
  const query = inputValue.trim().toLowerCase();
  const isSelectedLabel = query === pinnedLabel.toLowerCase();

  const filteredRecent = useMemo(() => {
    if (!query || isSelectedLabel) return recentSearches;
    return recentSearches.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        (r.subtitle && r.subtitle.toLowerCase().includes(query))
    );
  }, [recentSearches, query, isSelectedLabel]);

  const filteredPopular = useMemo(() => {
    if (!query || isSelectedLabel) return POPULAR_ADDIS_AREAS;
    return POPULAR_ADDIS_AREAS.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(query))
    );
  }, [query, isSelectedLabel]);

  if (isLoading && !externalPoints) {
    return (
      <div className={`w-full ${heightClass} animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-medium`}>
        Loading interactive map...
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm ${heightClass} ${className}`}>
      {/* ── Location Picker Floating Search Bar & Panel ── */}
      <div
        ref={dropdownRef}
        className="absolute left-3 top-3 sm:left-4 sm:top-4 z-[1000] w-[calc(100%-1.5rem)] max-w-sm sm:w-96 select-none"
      >
        <div className="relative">
          {/* Outlined Input Box with teal/cyan border */}
          <div className="relative flex items-center shadow-lg rounded-xl">
            <input
              type="text"
              value={inputValue}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsDropdownOpen(true);
              }}
              placeholder="Search location from map (e.g. Bole, Mexico)"
              className="w-full rounded-xl border-2 border-[#007B8A] bg-white py-2.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#007B8A]/30"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClearLocation}
                className="absolute right-9 text-gray-400 hover:text-gray-600 p-1"
                title="Clear"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="pointer-events-none absolute right-3 text-[#007B8A]">
              {isSearchingApi ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#007B8A]" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </div>
          </div>

          {/* Dynamic real-time dropdown panel */}
          {isDropdownOpen && (
            <div className="mt-1.5 max-h-80 overflow-y-auto rounded-2xl border border-gray-100 bg-white/98 p-1.5 shadow-2xl backdrop-blur-md">
              <div className="space-y-1">
                {/* 1. Live Map Search Suggestions (Nominatim / Addis Ababa Landmarks) */}
                {apiSuggestions.length > 0 && (
                  <div className="pb-1.5 border-b border-gray-100">
                    <div className="px-2.5 pb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#007B8A]">
                        Map Locations Found
                      </span>
                    </div>
                    {apiSuggestions.map((item, idx) => (
                      <button
                        key={`api-sugg-${item.name}-${idx}`}
                        type="button"
                        onClick={() =>
                          handleSelectLocationItem({
                            name: item.displayName || item.name,
                            subtitle: item.area || "Map search location",
                            coords: [item.lat, item.lng],
                          })
                        }
                        className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-cyan-50/70"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E0F7FA] text-[#007B8A]">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs sm:text-sm font-semibold text-gray-800">
                            {item.displayName || item.name}
                          </p>
                          {item.area && (
                            <p className="truncate text-[11px] text-gray-400">{item.area}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Your Location (Instant GPS) */}
                <button
                  type="button"
                  onClick={handlePickUserLocation}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-cyan-50/70"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E0F7FA] text-[#007B8A]">
                    <Crosshair className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">Your location</p>
                    <p className="text-xs text-emerald-600 font-medium">
                      {cachedUserCoords ? "GPS detected • Ready" : "Detect current location"}
                    </p>
                  </div>
                </button>

                {/* 2. Real Saved Home Location */}
                {savedHome ? (
                  <div className="flex w-full items-center justify-between rounded-xl p-2.5 transition hover:bg-gray-50">
                    <button
                      type="button"
                      onClick={() => handleSelectLocationItem({ name: "Home", subtitle: savedHome.address, coords: savedHome.coords })}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                        <Home className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800">Home</p>
                        <p className="truncate text-xs text-gray-500">{savedHome.address}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSettingHome(!isSettingHome)}
                      className="ml-2 text-xs font-semibold text-[#007B8A] hover:underline shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl px-2.5 py-1">
                    {isSettingHome ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={homeInput}
                          onChange={(e) => setHomeInput(e.target.value)}
                          placeholder="Enter your home address..."
                          className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveHome}
                          className="rounded-lg bg-[#007B8A] px-2 py-1 text-xs font-bold text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsSettingHome(true)}
                        className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-[#007B8A]"
                      >
                        <Home className="h-3.5 w-3.5 text-gray-400" />
                        <span>+ Add Home location</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 3. Real Recent Searches (Dynamic from localStorage) */}
                {filteredRecent.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-2.5 pb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAllRecent}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Clear</span>
                      </button>
                    </div>

                    {filteredRecent.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectLocationItem(item)}
                        className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-gray-50"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                          {item.subtitle && (
                            <p className="truncate text-xs text-gray-500">{item.subtitle}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 4. Popular Addis Ababa Neighborhoods */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="px-2.5 pb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Popular Neighborhoods
                    </span>
                  </div>

                  {filteredPopular.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectLocationItem(item)}
                      className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-gray-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F4F8] text-[#0096D6]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-800">{item.name}</p>
                        {item.subtitle && (
                          <p className="truncate text-xs text-gray-500">{item.subtitle}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={isValidLatLng(userLocation) ? userLocation : [9.02, 38.76]} // Addis Ababa
        zoom={12}
        minZoom={10}
        maxZoom={16}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBridge
          onReady={(m) => {
            mapRef.current = m;
          }}
          onMapClick={handleMapClick}
        />

        <MapController
          points={validPoints}
          userLocation={userLocation}
          selectedPoint={selectedPoint}
        />

        {/* Selected / Pinned Location Marker */}
        {pinnedLocation && isValidLatLng(pinnedLocation) && (
          <Marker position={pinnedLocation} icon={createSelectedPinIcon()}>
            <Popup>
              <div className="p-1 text-center font-bold text-xs text-[#007B8A]">
                📍 {pinnedLabel || "Starting point"}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Concentric User Location Marker */}
        {isValidLatLng(userLocation) && (
          <Marker position={userLocation} icon={createUserLocationIcon()}>
            <Popup>
              <div className="py-1 text-center font-bold text-xs text-[#0096D6]">
                📍 You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Tutor Markers (Named pills and Concentrated clusters) */}
        {groups.map((group) => {
          const isSingle = group.tutors.length === 1;
          const isSelected = group.tutors.some(
            (t) => selectedTutorId && String(t.id) === String(selectedTutorId)
          );

          const icon = isSingle
            ? createSingleTutorIcon(group.tutors[0], isSelected)
            : createClusterIcon(group.tutors, isSelected);

          return (
            <Marker
              key={group.key}
              position={[group.lat, group.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  // M9: cluster clicks select the first tutor in the group.
                  // The popup lists all of them, so this is only used to
                  // scroll the corresponding card into view — not to hide
                  // the others.
                  if (onSelectTutor) {
                    onSelectTutor(group.tutors[0]);
                  }
                },
              }}
            >
              <Popup className="tutor-custom-popup">
                <div className="min-w-[230px] p-1 text-sm">
                  {/* Header */}
                  <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {isSingle ? "Tutor in area" : `${group.tutors.length} Tutors in area`}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500">
                      {group.tutors[0].city}
                    </span>
                  </div>

                  {/* List of tutors in this location */}
                  <div className="max-h-[240px] space-y-3 overflow-y-auto pr-1">
                    {group.tutors.map((tutor) => {
                      const initials = (tutor.name || "T")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("");

                      return (
                        <div
                          key={tutor.id}
                          className="group/item rounded-xl border border-gray-100 bg-gray-50/70 p-2.5 transition hover:border-[#0096D6]/40 hover:bg-white"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F4F8] text-sm font-bold text-[#0096D6]">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <p className="truncate font-bold text-[#2D2A32]">
                                  {tutor.name}
                                </p>
                                {tutor.is_featured && (
                                  <span className="rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                                    ⭐
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-gray-500">
                                {tutor.subjects}
                              </p>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-xs font-bold text-[#0096D6]">
                                  {tutor.rate} ETB/hr
                                </span>
                                {tutor.rating != null && (
                                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-gray-700">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {tutor.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2.5 flex items-center gap-1.5 border-t border-gray-100 pt-2">
                            <Link
                              href={`/tutors/${tutor.id}`}
                              className="flex-1 rounded-lg border border-gray-200 bg-white py-1 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Profile
                            </Link>
                            <Link
                              href={`/tutors/${tutor.id}/request`}
                              className="flex-1 rounded-lg bg-[#0096D6] py-1 text-center text-xs font-bold text-white hover:bg-[#007FB8]"
                            >
                              Request
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
