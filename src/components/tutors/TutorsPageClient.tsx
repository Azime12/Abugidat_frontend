"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Map,
  List,
  LocateFixed,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { TutorCard } from "@/components/tutors/TutorCard";
import { TutorFilters } from "@/components/tutors/TutorFilters";
import { tutorService, applyFilters, type TutorMapPoint } from "@/services/api/tutors";
import { getApiErrorMessage } from "@/lib/api-errors";
import {
  preDetectUserLocation,
  getCachedUserLocation,
  getFastUserLocation,
  saveRecentLocation,
} from "@/lib/locationCache";
import type { TutorSearchFilters, Tutor } from "@/types/tutor";

const TutorMap = dynamic(
  () => import("@/components/tutors/TutorMap").then((m) => m.TutorMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] w-full animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-400">
        Loading interactive map...
      </div>
    ),
  }
);

type ViewMode = "list" | "map";

const DEFAULT_FILTERS: TutorSearchFilters = {
  query: "",
  gradeLevels: [],
  minPrice: 100,
  maxPrice: 1000,
  distanceBands: [],
  onlineOnly: false,
  sortBy: "nearest",
};

export function TutorsPageClient() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<TutorSearchFilters>(DEFAULT_FILTERS);
  const [inputValue, setInputValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Silently pre-detect user location in background on mount
  useEffect(() => {
    preDetectUserLocation();
  }, []);

  // Sync URL query params (from Hero search bar or direct deep-links)
  useEffect(() => {
    const gradeParam = searchParams.get("grade");
    const areaParam = searchParams.get("area") || searchParams.get("location");
    const qParam = searchParams.get("query") || searchParams.get("q");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    const isYourLocation =
      areaParam &&
      (areaParam.toLowerCase().includes("your location") ||
        areaParam.toLowerCase().includes("my location"));

    // Don't pollute filters.query with "Your location" or GPS coordinates
    const textQuery = qParam || (!isYourLocation && !latParam ? areaParam : "") || "";

    setFilters((prev) => ({
      ...prev,
      gradeLevels: gradeParam ? [gradeParam as any] : prev.gradeLevels,
      query: textQuery,
    }));
    if (textQuery) {
      setInputValue(textQuery);
    }

    if (latParam && lngParam) {
      const lat = parseFloat(latParam);
      const lng = parseFloat(lngParam);
      if (!isNaN(lat) && !isNaN(lng)) {
        setView("map");
        handleLocationPicked(
          [lat, lng],
          isYourLocation ? "Your location" : areaParam || "Selected location"
        );
      }
    }
  }, [searchParams]);

  // L2: clear pending debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedTutorId, setSelectedTutorId] = useState<string | number | null>(null);

  // User location state
  const [nearbyActive, setNearbyActive] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyTutors, setNearbyTutors] = useState<Tutor[]>([]);
  const [userCoords, setUserCoords] = useState<[number, number] | undefined>(undefined);

  const handleLocationPicked = async (coords: [number, number], label?: string) => {
    setUserCoords(coords);
    setNearbyActive(true);
    setNearbyLoading(true);
    try {
      const list = await tutorService.nearbyTutors(coords[0], coords[1]);
      setNearbyTutors(list);
      if (label && !label.toLowerCase().includes("your location")) {
        saveRecentLocation(label, coords);
      }
      toast.success(
        `Found ${list.length} tutor${list.length !== 1 ? "s" : ""} near ${label || "selected location"}`,
        { icon: "📍" }
      );
    } catch (err) {
      console.error("Failed to load nearby tutors:", err);
      toast.error("Could not load tutors for this location");
    } finally {
      setNearbyLoading(false);
    }
  };

  // Debounce search input → update filters.query after 350 ms
  const handleSearchInput = (val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, query: val }));
    }, 350);
  };

  const clearSearch = () => {
    setInputValue("");
    setFilters((prev) => ({ ...prev, query: "" }));
  };

  const { data, isLoading } = useQuery({
    queryKey: ["tutors", "search", filters],
    queryFn: () => tutorService.search(filters),
    staleTime: 30_000,
  });

  // Apply filters (including query) to nearby results too
  const filteredNearby = nearbyActive
    ? applyFilters(nearbyTutors, filters)
    : [];

  const tutors = nearbyActive ? filteredNearby : (data?.tutors ?? []);
  const total = nearbyActive ? filteredNearby.length : (data?.total ?? 0);

  // Convert current filtered tutors to map points
  const currentMapPoints: TutorMapPoint[] = useMemo(() => {
    return tutors
      .filter((t) => t.lat != null && t.lng != null && !isNaN(Number(t.lat)) && !isNaN(Number(t.lng)))
      .map((t) => ({
        id: t.id,
        name: t.fullName,
        firstName: t.firstName || t.fullName.split(" ")[0],
        city: t.areaName,
        subjects: t.subjects.join(", "),
        rate: t.price,
        lat: Number(t.lat),
        lng: Number(t.lng),
        is_featured: t.isFeatured,
        rating: t.ratingAvg,
        ratingCount: t.ratingCount,
      }));
  }, [tutors]);

  const handleNearMe = async () => {
    if (nearbyActive) {
      setNearbyActive(false);
      setNearbyTutors([]);
      setUserCoords(undefined);
      return;
    }

    // 1. Instant: Check if location is already pre-detected in background
    const cached = getCachedUserLocation();
    if (cached) {
      handleLocationPicked(cached, "Your location");
      return;
    }

    // 2. Fast fallback (uses short timeout, non-blocking)
    setNearbyLoading(true);
    try {
      const coords = await getFastUserLocation();
      handleLocationPicked(coords, "Your location");
    } catch {
      toast.error("Could not detect location. Center map manually.");
    } finally {
      setNearbyLoading(false);
    }
  };

  const handleSelectTutorFromMap = (point: TutorMapPoint) => {
    setSelectedTutorId(point.id);
    const element = document.getElementById(`tutor-card-${point.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* ── Page Header ── */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#2D2A32]">
                Find an Abugida Tutor
              </h1>
              <p className="mt-0.5 text-xs text-gray-500">
                {nearbyLoading
                  ? "Detecting nearest tutors around you..."
                  : nearbyActive
                    ? `${total} tutor${total !== 1 ? "s" : ""} concentrated near your location${filters.query ? ` matching "${filters.query}"` : ""}`
                    : isLoading
                      ? "Searching..."
                      : `${total} tutor${total !== 1 ? "s" : ""} available${filters.query ? ` matching "${filters.query}"` : ""}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[73px] z-20 border-b border-gray-100 bg-[#FFF8F0]/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          {/* ── Search Bar Row (sticky) ── */}
          <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="tutor-search"
                  type="text"
                  placeholder="Search by tutor name, subject or area…"
                  value={inputValue}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white py-2 pl-10 pr-9 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
                  autoComplete="off"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 lg:hidden"
                type="button"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </button>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20"
              >
                <option value="nearest">Sort: Nearest</option>
                <option value="rating">Sort: Rating</option>
                <option value="price_low">Price (low → high)</option>
                <option value="price_high">Price (high → low)</option>
              </select>

              {/* Concentric Near Me Button */}
              <button
                onClick={handleNearMe}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm ${
                  nearbyActive
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-600/30"
                    : "border border-gray-300 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-700"
                }`}
                type="button"
              >
                <LocateFixed className={`h-3.5 w-3.5 ${nearbyActive ? "animate-pulse" : ""}`} />
                <span>{nearbyLoading ? "Locating…" : nearbyActive ? "Near me ✓" : "Near me"}</span>
              </button>

              {/* View Switcher Button Group */}
              <div className="flex items-center rounded-xl border border-gray-300 bg-white p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    view === "list"
                      ? "bg-[#0096D6] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="List view"
                >
                  <List className="h-3.5 w-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setView("map")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    view === "map"
                      ? "bg-[#0096D6] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Map view"
                >
                  <Map className="h-3.5 w-3.5" />
                  <span>Map</span>
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable content: Sidebar + Results ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar – sticky on desktop */}
          <div className={`${showFilters ? "block" : "hidden"} shrink-0 lg:block lg:w-72 lg:self-start lg:sticky lg:top-[140px] lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto`}>
            <TutorFilters
              filters={filters}
              onChange={setFilters}
              onReset={() => {
                setFilters(DEFAULT_FILTERS);
                setInputValue("");
              }}
            />
          </div>

          {/* Results area */}
          <div className="flex-1 min-w-0">
            {/* Active search badge */}
            {filters.query && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Results for <strong>&ldquo;{filters.query}&rdquo;</strong>
                </span>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <X className="h-3 w-3" /> Clear
                </button>
              </div>
            )}

            {/* ── Main View Area ── */}
            {isLoading || nearbyLoading ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : tutors.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <div className="text-5xl">🔍</div>
                <h3 className="mt-4 text-lg font-bold">No tutors found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {filters.query
                    ? `No tutors match "${filters.query}". Try a different name, subject or area.`
                    : nearbyActive
                      ? "No tutors within 25 km. Try again from a different location."
                      : "Try changing your filters or searching a different area."}
                </p>
                <button
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    setInputValue("");
                  }}
                  className="mt-6 rounded-xl bg-[#0096D6] px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#007FB8]"
                  type="button"
                >
                  Reset filters
                </button>
              </div>
            ) : view === "map" ? (
              /* ── MAP VIEW ── */
              <div className="space-y-6">
                <TutorMap
                  userLocation={userCoords}
                  points={currentMapPoints.length > 0 ? currentMapPoints : undefined}
                  selectedTutorId={selectedTutorId}
                  onSelectTutor={handleSelectTutorFromMap}
                  onLocationSelect={handleLocationPicked}
                  heightClass="h-[580px]"
                />
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-base font-bold text-gray-800 mb-4">
                    Available tutors ({total})
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {tutors.map((tutor) => (
                      <TutorCard
                        key={tutor.id}
                        tutor={tutor}
                        isSelected={String(tutor.id) === String(selectedTutorId)}
                        onMouseEnter={() => setSelectedTutorId(tutor.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* ── LIST VIEW ── */
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {tutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    isSelected={String(tutor.id) === String(selectedTutorId)}
                    onMouseEnter={() => setSelectedTutorId(tutor.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
