"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { Search, Shield, MapPin, Clock, X, Crosshair, Loader2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useCurriculum } from "@/hooks/useCurriculum";
import { preDetectUserLocation, getCachedUserLocation, getFastUserLocation } from "@/lib/locationCache";
import { locationService, type LocationSuggestion } from "@/services/api/location";

const FALLBACK_SPECIFIC_GRADES = [
  "KG 1",
  "KG 2",
  "KG 3",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11 Natural",
  "Grade 11 Social",
  "Grade 12 Natural",
  "Grade 12 Social",
  "University",
];

export function Hero() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  // Grade dropdown state
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const gradeContainerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic location search state
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationContainerRef = useRef<HTMLDivElement | null>(null);
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-detect user GPS coordinates in the background silently before any button click
  useEffect(() => {
    preDetectUserLocation();
  }, []);

  // Close grade dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (gradeContainerRef.current && !gradeContainerRef.current.contains(e.target as Node)) {
        setIsGradeOpen(false);
      }
      if (locationContainerRef.current && !locationContainerRef.current.contains(e.target as Node)) {
        setIsSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Query location suggestions from map database as user types
  const handleAreaChange = (val: string) => {
    setSelectedArea(val);
    setSelectedCoords(null);

    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setIsSuggestOpen(false);
      return;
    }

    setIsSuggestOpen(true);
    suggestTimerRef.current = setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);
        const res = await locationService.suggest(val.trim());
        if (res.data?.success && Array.isArray(res.data.suggestions)) {
          setSuggestions(res.data.suggestions);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250);
  };

  const handlePickCurrentLocation = async () => {
    setIsSuggestOpen(false);
    const cached = getCachedUserLocation();
    if (cached) {
      setSelectedArea("Your location");
      setSelectedCoords(cached);
      return;
    }

    try {
      const coords = await getFastUserLocation();
      setSelectedArea("Your location");
      setSelectedCoords(coords);
    } catch {
      // Ignore
    }
  };

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setSelectedArea(item.displayName || item.name);
    setSelectedCoords([item.lat, item.lng]);
    setIsSuggestOpen(false);
  };

  const { data: curriculumConfig } = useCurriculum();
  const ethiopian = curriculumConfig?.curriculums?.find((c) => c.id === "et-national");
  const specificGrades =
    ethiopian?.grades?.map((g) => g.label).filter((g) => g !== "All Levels") ??
    FALLBACK_SPECIFIC_GRADES;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    let coords = selectedCoords;

    // If user typed an area without selecting from dropdown, geocode it from map
    if (!coords && selectedArea.trim()) {
      const trimmed = selectedArea.trim().toLowerCase();
      if (trimmed === "your location" || trimmed === "my location") {
        coords = getCachedUserLocation();
      } else {
        const geo = await locationService.geocode(selectedArea.trim());
        if (geo) {
          coords = [geo.lat, geo.lng];
        }
      }
    }

    const params = new URLSearchParams();
    if (selectedGrade.trim()) params.set("grade", selectedGrade.trim());
    if (selectedArea.trim()) params.set("area", selectedArea.trim());
    if (coords) {
      params.set("lat", coords[0].toString());
      params.set("lng", coords[1].toString());
    }

    const qs = params.toString();
    router.push(`/tutors${qs ? `?${qs}` : ""}`);
    setIsSubmitting(false);
  };

  return (
    <section className="relative bg-gradient-to-br from-[#E8F4F8] via-[#F0F9FF] to-[#FFF8F0]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left side */}
          <div>
            <h1 className="text-4xl font-black leading-tight tracking-tight text-[#2D2A32] md:text-6xl">
              Find a <span className="text-[#0096D6]">verified Abugida Tutor</span>
              <br />
              near you in
              <br />
              <span className="underline decoration-[#F59E0B] decoration-8 underline-offset-4">
                under a minute
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Say goodbye to paper cards and phone chains. Choose your child's grade, share your area, and see verified tutors nearby.
            </p>

            {/* Clean search bar that searches real map locations with coordinates */}
            <form
              onSubmit={handleSearch}
              className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl sm:flex-row relative z-[100]"
              style={{ isolation: "isolate", overflow: "visible" }}
            >
              {/* Grade / Subject custom dropdown */}
              <div
                ref={gradeContainerRef}
                className="relative flex flex-1 items-center gap-2.5 px-3.5 py-2.5 cursor-pointer"
                style={{ overflow: "visible" }}
                onClick={() => setIsGradeOpen((o) => !o)}
              >
                <span className="text-lg">🎓</span>
                <span
                  className={`w-full select-none bg-transparent text-sm font-semibold outline-none ${
                    selectedGrade ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {selectedGrade || "Grade or subject (e.g. Grade 4)"}
                </span>
                {selectedGrade ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedGrade(""); setIsGradeOpen(false); }}
                    className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
                    title="Clear grade"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isGradeOpen ? "rotate-180" : ""}`} />
                )}

                {/* Grade dropdown list */}
                {isGradeOpen && (
                  <div className="absolute left-0 top-full mt-2 z-[9999] max-h-64 w-full min-w-[220px] overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl">
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Select grade</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {specificGrades.map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedGrade(grade); setIsGradeOpen(false); }}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-[#F0F9FF] ${
                            selectedGrade === grade
                              ? "bg-[#E8F4F8] font-bold text-[#0096D6]"
                              : "font-medium text-gray-800"
                          }`}
                        >
                          {selectedGrade === grade && (
                            <span className="text-[#0096D6] text-xs">✓</span>
                          )}
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden w-px bg-gray-200 sm:block" />

              {/* Area / City Input with real-time map location search */}
              {/* NOTE: dropdown MUST be inside this ref div so clicks on suggestions don't fire outside-click */}
              <div ref={locationContainerRef} className="relative flex flex-1 items-center gap-2.5 px-3.5 py-2.5" style={{ overflow: "visible" }}>
                <span className="text-lg">📍</span>
                <input
                  type="text"
                  value={selectedArea}
                  onFocus={() => {
                    if (selectedArea.trim().length >= 2 || suggestions.length > 0) {
                      setIsSuggestOpen(true);
                    }
                  }}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  placeholder="Search location from map (e.g. Bole)"
                  className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder-gray-400 outline-none"
                />
                {selectedArea && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArea("");
                      setSelectedCoords(null);
                      setSuggestions([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Clear area"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}

                {/* ── Location suggestions dropdown – inside ref so outside-click works correctly ── */}
                {isSuggestOpen && (
                  <div
                    className="absolute left-0 right-0 top-full mt-2 z-[9999] max-h-72 overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-2xl"
                    style={{ minWidth: "max-content", width: "max(100%, 320px)" }}
                  >
                  {/* Header label */}
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Map locations</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {/* GPS User Location Option */}
                    <button
                      type="button"
                      onClick={handlePickCurrentLocation}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cyan-50 active:bg-cyan-100"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2] text-[#007B8A] shadow-sm">
                        <Crosshair className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">Use my current location</p>
                    </button>

                    {/* Divider */}
                    {suggestions.length > 0 && !isLoadingSuggestions && (
                      <div className="mx-3 my-1 border-t border-gray-100" />
                    )}

                    {/* Map Suggestions */}
                    {isLoadingSuggestions ? (
                      <div className="flex items-center gap-2.5 px-3 py-3 text-xs text-gray-400 font-medium">
                        <Loader2 className="h-4 w-4 animate-spin text-[#0096D6]" />
                        <span>Searching map locations…</span>
                      </div>
                    ) : (
                      suggestions.map((item, idx) => (
                        <button
                          key={`${item.name}-${idx}`}
                          type="button"
                          onClick={() => handleSelectSuggestion(item)}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0F9FF] text-[#0096D6]">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="whitespace-normal break-words text-sm font-semibold leading-snug text-gray-800">{item.displayName || item.name}</p>
                            {item.area && (
                              <p className="text-xs text-gray-400 mt-0.5">{item.area}</p>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
              </div>

              {/* Search Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0096D6] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#007FB8] shadow-sm shrink-0 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>Search</span>
              </button>
            </form>

            {/* Trust chips */}
            <div className="mt-8 flex flex-wrap gap-6 text-sm font-semibold text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Verified tutors only
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Location stays private
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Reply in 24 hours
              </div>
            </div>
          </div>

          {/* Right side photo */}
          <div className="relative">
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-2xl ring-1 ring-black/5">
              <Image
                src="/images/hero-tutor.jpg"
                alt="Ethiopian female tutor tutoring a student"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-8 rounded-xl border border-gray-100 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">ID Verified</p>
                  <p className="text-xs text-gray-500">+ 2 references called</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 rounded-xl border border-gray-100 bg-white/95 p-5 shadow-xl backdrop-blur-sm">
              <div className="text-xl text-yellow-400">⭐⭐⭐⭐⭐</div>
              <p className="mt-1 text-lg font-bold text-gray-900">4.9 average</p>
              <p className="text-xs text-gray-500">From 1,200+ Ethiopian parents</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
