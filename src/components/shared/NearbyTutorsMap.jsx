import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function NearbyTutorsMap({
  userLat = 9.0102,
  userLng = 38.7812,
  userLocationName = "Bole Atlas, Addis Ababa",
  tutors = [],
  selectedTutor,
  onSelectTutor,
  radiusKm = 10,
  onChangeRadius,
  onOpenLocationPicker,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const tutorMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [activeTutor, setActiveTutor] = useState(selectedTutor || null);

  // Sync active tutor when prop changes
  useEffect(() => {
    if (selectedTutor) {
      setActiveTutor(selectedTutor);
    }
  }, [selectedTutor]);

  // Calculate distance helper
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Ensure tutors have valid mock/real coordinates clustered around Addis Ababa for visual display
  const tutorsWithCoords = tutors.map((t, idx) => {
    let lat = t.latitude ? parseFloat(t.latitude) : null;
    let lng = t.longitude ? parseFloat(t.longitude) : null;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      // Deterministic slight offsets around user location
      const offsets = [
        { dLat: 0.006, dLng: 0.008, loc: "Bole Atlas" },
        { dLat: -0.008, dLng: 0.005, loc: "Kazanchis" },
        { dLat: 0.012, dLng: -0.010, loc: "Sarbet" },
        { dLat: -0.015, dLng: -0.007, loc: "Piassa" },
        { dLat: 0.009, dLng: 0.018, loc: "Megenagna" },
        { dLat: -0.005, dLng: 0.022, loc: "Gerji" },
      ];
      const offset = offsets[idx % offsets.length];
      lat = userLat + offset.dLat;
      lng = userLng + offset.dLng;
    }

    const dist = getDistance(userLat, userLng, lat, lng);
    return {
      ...t,
      lat,
      lng,
      distanceKm: t.distance || dist,
    };
  });

  // Filter tutors within selected radius
  const filteredTutors = tutorsWithCoords.filter(
    (t) => radiusKm === "all" || parseFloat(t.distanceKm) <= parseFloat(radiusKm)
  );

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [userLng, userLat],
      zoom: 13.5,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add User Pin (Blue Home/Student Pin with pulsing ring)
    const userEl = document.createElement("div");
    userEl.className = "user-location-marker";
    userEl.innerHTML = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 38px;
          height: 38px;
          background: rgba(59, 125, 216, 0.25);
          border-radius: 50%;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
        <div style="
          background: #3B7DD8;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          font-size: 13px;
        ">🏠</div>
      </div>
    `;

    const userMarker = new maplibregl.Marker({ element: userEl, anchor: "center" })
      .setLngLat([userLng, userLat])
      .addTo(map);

    userMarkerRef.current = userMarker;
    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [userLat, userLng]);

  // Update Tutor Markers on Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous markers
    tutorMarkersRef.current.forEach((m) => m.remove());
    tutorMarkersRef.current = [];

    filteredTutors.forEach((tutor) => {
      const isSelected = activeTutor?.id === tutor.id;
      const el = document.createElement("div");
      el.className = "tutor-map-pin cursor-pointer transition-transform duration-200 hover:scale-110";
      
      const badgeColor = isSelected ? "#E8703A" : "#22364A";
      const initials = (tutor.name || "Tutor")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      el.innerHTML = `
        <div style="
          background: ${badgeColor};
          color: white;
          padding: 3px 8px;
          border-radius: 20px;
          border: 2px solid white;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          white-space: nowrap;
          transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
          transition: transform 0.2s ease;
        ">
          <span style="
            background: white;
            color: ${badgeColor};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 800;
          ">${initials}</span>
          <span>${tutor.rate || tutor.hourly_rate || 300} Br</span>
        </div>
      `;

      el.addEventListener("click", () => {
        setActiveTutor(tutor);
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [tutor.lng, tutor.lat], zoom: 14.5 });
        }
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([tutor.lng, tutor.lat])
        .addTo(mapRef.current);

      tutorMarkersRef.current.push(marker);
    });
  }, [filteredTutors, activeTutor]);

  // Recenter to user
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [userLng, userLat], zoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden border border-tm-border shadow-md bg-tm-cream flex flex-col">
      {/* Top Floating Location Header & Radius Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-col gap-2 pointer-events-none">
        {/* Parent's Location Pill */}
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-sm border border-gray-200 pointer-events-auto">
          <div
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onOpenLocationPicker}
            title="Change search location"
          >
            <div className="w-6 h-6 bg-blue-100 text-tm-blue rounded-full flex items-center justify-center text-xs flex-shrink-0">
              <i className="ti ti-map-pin" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-bold text-tm-muted leading-tight">
                Your Search Area
              </div>
              <div className="font-bold text-xs text-tm-navy truncate">
                {userLocationName || "Bole Atlas, Addis Ababa"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onOpenLocationPicker && (
              <button
                type="button"
                onClick={onOpenLocationPicker}
                className="px-2.5 py-1 bg-tm-blue-light text-tm-blue hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors"
              >
                Change
              </button>
            )}
            <button
              type="button"
              onClick={handleRecenter}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-tm-navy rounded-lg transition-colors text-xs"
              title="Recenter Map"
            >
              <i className="ti ti-focus-2 text-sm" />
            </button>
          </div>
        </div>

        {/* Proximity Radius Filter Chips */}
        {onChangeRadius && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
            {["3", "5", "10", "25", "all"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChangeRadius(r)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs flex-shrink-0 ${
                  String(radiusKm) === String(r)
                    ? "bg-tm-coral text-white scale-105"
                    : "bg-white/90 text-tm-navy hover:bg-white border border-gray-200"
                }`}
              >
                {r === "all" ? "All Addis" : `Within ${r} km`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MapLibre Canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Floating Bottom Tutor Card Preview */}
      {activeTutor && (
        <div className="absolute bottom-3 left-3 right-3 z-10 animate-fadeIn">
          <div className="bg-white rounded-2xl p-3.5 shadow-xl border border-tm-border flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="tm-avatar w-10 h-10 text-xs font-bold text-white shadow-xs flex-shrink-0"
                  style={{ background: activeTutor.avatarBg || "#E8703A" }}
                >
                  {activeTutor.initials ||
                    (activeTutor.name || "T")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-tm-navy truncate">
                    {activeTutor.name}
                  </div>
                  <div className="text-[11px] text-tm-muted flex items-center gap-1 mt-0.5">
                    <span className="font-bold text-tm-coral">
                      {activeTutor.rate || activeTutor.hourly_rate || 300} ETB/hr
                    </span>
                    <span>•</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      ★ {activeTutor.rating || 4.9}
                    </span>
                  </div>
                </div>
              </div>

              {/* Distance Proximity Pill */}
              <div className="bg-tm-green-light px-2.5 py-1 rounded-full text-tm-green font-bold text-[11px] flex items-center gap-1 border border-green-200 flex-shrink-0">
                <i className="ti ti-bolt text-xs" />
                <span>{activeTutor.distanceKm || "1.2"} km away</span>
              </div>
            </div>

            {/* Subjects tags */}
            <div className="flex flex-wrap gap-1 text-[10px]">
              {(activeTutor.subjectList ||
                (typeof activeTutor.subjects === "string"
                  ? activeTutor.subjects.split(",")
                  : activeTutor.subjects) || ["Mathematics"]).map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 bg-gray-100 text-tm-navy font-semibold rounded-md"
                >
                  {s.trim()}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => onSelectTutor && onSelectTutor(activeTutor)}
                className="flex-1 py-2 bg-tm-coral text-white text-xs font-bold rounded-xl hover:bg-coral-600 transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <i className="ti ti-calendar text-sm" />
                <span>View & Book Tutor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTutor(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 text-xs"
                title="Close"
              >
                <i className="ti ti-x text-base" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tutor Count Badge */}
      {!activeTutor && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-tm-navy/90 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur flex items-center gap-1.5 pointer-events-none z-10">
          <i className="ti ti-users text-tm-coral" />
          <span>{filteredTutors.length} tutors near {userLocationName.split(",")[0]}</span>
        </div>
      )}
    </div>
  );
}
