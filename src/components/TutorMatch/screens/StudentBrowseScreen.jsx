import React, { useState } from "react";
import NearbyTutorsMap from "../../shared/NearbyTutorsMap";
import MapLocationPicker from "../../shared/MapLocationPicker";

export default function StudentBrowseScreen({
  tutors = [],
  searchTerm,
  setSearchTerm,
  selectedSubject,
  setSelectedSubject,
  onOpenFilters,
  onSelectTutor,
}) {
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"
  const [radiusKm, setRadiusKm] = useState("10");
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // User / Parent's chosen search coordinates
  const [userLocation, setUserLocation] = useState({
    latitude: 9.0102,
    longitude: 38.7812,
    locationName: "Bole Atlas, Addis Ababa",
  });

  const subjectsList = [
    "All subjects",
    "Mathematics",
    "Physics",
    "English",
    "Chemistry",
    "Coding / IT",
    "Biology",
    "Economics",
  ];

  // Calculate distance in km
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 1.5;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const defaultLocations = [
    { name: "Bole Atlas", lat: 9.0102, lng: 38.7812 },
    { name: "Kazanchis", lat: 9.0185, lng: 38.7682 },
    { name: "Sarbet", lat: 8.9954, lng: 38.7368 },
    { name: "Piassa", lat: 9.0345, lng: 38.7521 },
    { name: "Megenagna", lat: 9.0211, lng: 38.8023 },
    { name: "CMC", lat: 9.0255, lng: 38.8415 },
  ];

  // Enrich tutors with computed distance
  const tutorsWithDistance = tutors.map((tutor, idx) => {
    const loc = defaultLocations[idx % defaultLocations.length];
    const tutorLat = tutor.latitude ? parseFloat(tutor.latitude) : loc.lat;
    const tutorLng = tutor.longitude ? parseFloat(tutor.longitude) : loc.lng;
    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      tutorLat,
      tutorLng
    );
    return {
      ...tutor,
      latitude: tutorLat,
      longitude: tutorLng,
      distanceKm: dist,
      locationArea: tutor.city || loc.name,
    };
  });

  const filteredTutors = tutorsWithDistance.filter((tutor) => {
    const searchLow = searchTerm.toLowerCase();
    const subjectsStr = Array.isArray(tutor.subjects)
      ? tutor.subjects.join(" ")
      : tutor.subjects || "";

    const matchesSearch =
      (tutor.name || "").toLowerCase().includes(searchLow) ||
      subjectsStr.toLowerCase().includes(searchLow) ||
      (tutor.locationArea || "").toLowerCase().includes(searchLow);

    const matchesSubject =
      selectedSubject === "All subjects" ||
      subjectsStr.toLowerCase().includes(selectedSubject.toLowerCase());

    const matchesRadius =
      radiusKm === "all" || tutor.distanceKm <= parseFloat(radiusKm);

    return matchesSearch && matchesSubject && matchesRadius;
  });

  const handleLocationSelected = (selected) => {
    setUserLocation(selected);
    setIsLocationPickerOpen(false);
  };

  return (
    <div className="tm-screen pb-4 animate-fadeIn" id="s-browse">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-tm-navy tracking-tight">Find a tutor</h1>
          <p className="text-[12px] text-tm-muted">
            Verified tutors nearby your location
          </p>
        </div>

        {/* View Mode Toggle Button */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-tm-border shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-tm-blue text-white shadow-2xs"
                : "text-tm-muted hover:text-tm-navy"
            }`}
          >
            <i className="ti ti-list text-sm" />
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "map"
                ? "bg-tm-coral text-white shadow-2xs"
                : "text-tm-muted hover:text-tm-navy"
            }`}
          >
            <i className="ti ti-map-2 text-sm" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Parent's Interactive Location Bar */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-tm-border shadow-2xs mb-3">
        <div
          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition-opacity"
          onClick={() => setIsLocationPickerOpen(true)}
          title="Click to change location on map"
        >
          <div className="w-7 h-7 bg-tm-coral-light text-tm-coral rounded-xl flex items-center justify-center text-sm flex-shrink-0">
            <i className="ti ti-map-pin" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase font-bold text-tm-muted leading-none">
              Your Location
            </div>
            <div className="font-bold text-xs text-tm-navy truncate mt-0.5">
              {userLocation.locationName}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsLocationPickerOpen(true)}
          className="px-2.5 py-1 bg-tm-blue-light text-tm-blue hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 flex-shrink-0 shadow-2xs"
        >
          <i className="ti ti-map-pin-plus text-xs" />
          <span>Change</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-tm-muted text-base" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subject, tutor, or area (e.g. Bole)..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue transition-colors shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-tm-muted hover:text-tm-navy text-xs"
            >
              <i className="ti ti-x" />
            </button>
          )}
        </div>
        <button
          className="tm-btn tm-btn-outline-blue !w-auto !py-2.5 !px-3.5 flex items-center justify-center shadow-2xs"
          onClick={onOpenFilters}
          title="Open filters"
        >
          <i className="ti ti-adjustments-horizontal text-lg" />
        </button>
      </div>

      {/* Subject Chips */}
      <div className="tm-chip-row mb-3">
        {subjectsList.map((sub) => (
          <div
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`tm-chip shadow-2xs ${
              selectedSubject === sub ? "active" : ""
            }`}
          >
            {sub}
          </div>
        ))}
      </div>

      {/* ── MAP VIEW ── */}
      {viewMode === "map" && (
        <div className="animate-fadeIn">
          <NearbyTutorsMap
            userLat={userLocation.latitude}
            userLng={userLocation.longitude}
            userLocationName={userLocation.locationName}
            tutors={filteredTutors}
            onSelectTutor={onSelectTutor}
            radiusKm={radiusKm}
            onChangeRadius={setRadiusKm}
            onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
          />
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <div className="space-y-3 mt-1 animate-fadeIn">
          {/* Proximity Radius Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 mb-1">
            <span className="text-[11px] font-bold text-tm-muted uppercase mr-1">Radius:</span>
            {["3", "5", "10", "25", "all"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all ${
                  String(radiusKm) === String(r)
                    ? "bg-tm-coral text-white shadow-2xs"
                    : "bg-white text-tm-navy border border-tm-border hover:bg-gray-50"
                }`}
              >
                {r === "all" ? "All" : `${r} km`}
              </button>
            ))}
          </div>

          {filteredTutors.length === 0 ? (
            <div className="tm-card text-center py-8">
              <i className="ti ti-search-off text-3xl text-tm-muted mb-2 block" />
              <p className="font-semibold text-tm-navy text-sm">No tutors found nearby</p>
              <p className="text-xs text-tm-muted mt-1">
                Try widening your search radius or clearing subject filters.
              </p>
              <button
                onClick={() => setRadiusKm("all")}
                className="mt-3 px-3 py-1.5 bg-tm-blue-light text-tm-blue font-bold rounded-xl text-xs hover:bg-blue-100 transition-colors inline-block"
              >
                Show All Tutors in Addis
              </button>
            </div>
          ) : (
            filteredTutors.map((tutor) => (
              <div
                key={tutor.id}
                className="tm-card tm-tutor-card shadow-2xs hover:border-tm-coral/40 transition-all cursor-pointer"
                onClick={() => onSelectTutor(tutor)}
              >
                <div
                  className="tm-avatar w-12 h-12 text-sm font-bold text-white shadow-xs"
                  style={{ backgroundColor: tutor.avatarBg || "var(--coral)" }}
                >
                  {tutor.initials || "AB"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-bold text-tm-navy text-[15px] truncate">
                      {tutor.name}
                    </div>
                    {/* Proximity Pill */}
                    <span className="text-[10px] font-bold text-tm-green bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-0.5 flex-shrink-0">
                      <i className="ti ti-bolt text-[10px]" />
                      <span>{tutor.distanceKm} km</span>
                    </span>
                  </div>

                  <div className="text-xs text-tm-muted my-0.5 truncate">
                    {tutor.subjects} · <span className="font-semibold text-tm-coral">{tutor.rate || tutor.hourly_rate} ETB/hr</span>
                  </div>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <div className="tm-stars">
                      <i className="ti ti-star-filled text-xs text-amber-500" />
                      <span className="text-xs font-semibold text-tm-navy">
                        {tutor.rating || 4.9}
                      </span>
                      <span className="text-xs text-tm-muted">
                        ({tutor.reviewsCount || 24})
                      </span>
                    </div>
                    <span className="text-[11px] text-tm-muted truncate">
                      📍 {tutor.locationArea}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Interactive Map Location Picker Modal ── */}
      {isLocationPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-lg h-[520px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3.5 bg-tm-blue text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ti ti-map-pin text-xl text-tm-coral" />
                <span className="font-bold text-sm">Pin Your Search Location</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <i className="ti ti-x text-lg" />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <MapLocationPicker
                initialLat={userLocation.latitude}
                initialLng={userLocation.longitude}
                initialLocationName={userLocation.locationName}
                onSelectLocation={handleLocationSelected}
                onClose={() => setIsLocationPickerOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
