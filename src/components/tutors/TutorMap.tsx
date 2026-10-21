"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/routing";
import { Star, MapPin, BadgeCheck, ArrowRight, User } from "lucide-react";
import { tutorService, type TutorMapPoint } from "@/services/api/tutors";

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

// ── Main Component ──────────────────────────────────────────────────────────

export interface TutorMapProps {
  userLocation?: [number, number];
  points?: TutorMapPoint[];
  selectedTutorId?: string | number | null;
  onSelectTutor?: (tutor: TutorMapPoint) => void;
  className?: string;
  heightClass?: string;
}

export function TutorMap({
  userLocation,
  points: externalPoints,
  selectedTutorId,
  onSelectTutor,
  className = "",
  heightClass = "h-[500px]",
}: TutorMapProps) {
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

  if (isLoading && !externalPoints) {
    return (
      <div className={`w-full ${heightClass} animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-medium`}>
        Loading interactive map...
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm ${heightClass} ${className}`}>
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

        <MapController
          points={validPoints}
          userLocation={userLocation}
          selectedPoint={selectedPoint}
        />

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
