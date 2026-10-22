"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { locationService, type Landmark } from "@/services/api/location";

export interface PickedLocation {
  lat: number;
  lng: number;
  displayName: string;
  area?: string;
}

interface Props {
  value?: PickedLocation | null;
  onChange: (loc: PickedLocation) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const SNAP_GRID = 0.0045;
const snap = (v: number) => Math.round(v / SNAP_GRID) * SNAP_GRID;

export function LocationPicker({ value, onChange, placeholder, required, disabled }: Props) {
  const [query, setQuery] = useState(value?.displayName ?? "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [loading, setLoading] = useState<"idle" | "search" | "geo">("idle");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 2 || query === value?.displayName) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading("search");
      try {
        const res = await locationService.suggest(query.trim());
        setSuggestions(res.data?.suggestions ?? []);
        setOpen(true);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Search failed");
      } finally {
        setLoading("idle");
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, value?.displayName]);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading("geo");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = snap(pos.coords.latitude);
          const lng = snap(pos.coords.longitude);
          const [rev, near] = await Promise.all([
            locationService.reverseGeocode(lat, lng),
            locationService.nearbyLandmarks(lat, lng, 1500, 8),
          ]);
          const displayName =
            rev.data?.displayName || "Near " + lat.toFixed(4) + ", " + lng.toFixed(4);
          setQuery(displayName);
          setLandmarks(near.data?.nearbyLandmarks ?? []);
          setOpen(true);
          onChange({ lat, lng, displayName, area: rev.data?.area });
        } catch (e: any) {
          setError(e?.response?.data?.message || "Could not resolve your location");
        } finally {
          setLoading("idle");
        }
      },
      (err) => {
        setLoading("idle");
        setError(err.code === 1 ? "Location permission denied" : "Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onChange]);

  const pickSuggestion = (s: any) => {
    const lat = snap(Number(s.lat));
    const lng = snap(Number(s.lng));
    const displayName = s.displayName || s.name;
    setQuery(displayName);
    setOpen(false);
    setSuggestions([]);
    onChange({ lat, lng, displayName, area: s.area });
    locationService.nearbyLandmarks(lat, lng, 1500, 8)
      .then((res) => setLandmarks(res.data?.nearbyLandmarks ?? []))
      .catch(() => setLandmarks([]));
  };

  const pickLandmark = (l: Landmark) => {
    const lat = snap(l.lat);
    const lng = snap(l.lng);
    setQuery(l.name);
    setOpen(false);
    setLandmarks([]);
    onChange({ lat, lng, displayName: l.name, area: l.area });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setError(null); }}
            onFocus={() => { if (suggestions.length || landmarks.length) setOpen(true); }}
            placeholder={placeholder || "Search area, landmark, or junction..."}
            required={required}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-9 text-sm font-medium text-gray-800 outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 disabled:bg-gray-50"
          />
          {loading === "search" && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          )}
          {query && loading !== "search" && !disabled && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSuggestions([]); setLandmarks([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleNearMe}
          disabled={disabled || loading === "geo"}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#0096D6] bg-[#0096D6]/5 px-3 py-2.5 text-xs font-bold text-[#0096D6] hover:bg-[#0096D6]/10 disabled:opacity-50"
        >
          {loading === "geo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Near me
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {value?.lat && value?.lng && (
        <p className="mt-1 text-xs text-gray-500">
          {value.lat.toFixed(4)}, {value.lng.toFixed(4)} — snapped to 500m grid
        </p>
      )}

      {open && (suggestions.length > 0 || landmarks.length > 0) && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-72 overflow-y-auto">
          {suggestions.length > 0 && (
            <div className="p-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Search results</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-800">{s.name || s.displayName}</p>
                    <p className="truncate text-xs text-gray-500">{s.area || s.displayName}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {landmarks.length > 0 && (
            <div className="border-t border-gray-100 p-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Nearby landmarks</p>
              {landmarks.map((l, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => pickLandmark(l)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0096D6]" />
                    <span className="truncate font-semibold text-gray-800">{l.name}</span>
                  </div>
                  <span className="ml-2 shrink-0 text-xs text-gray-400">{Math.round(l.distanceMeters)}m</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LocationPicker;