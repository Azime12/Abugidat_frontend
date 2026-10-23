"use client";

import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink } from "lucide-react";
import { getMapLocationUrl } from "@/lib/map-utils";

const pinIcon = L.divIcon({
  className: "admin-location-pin",
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#0096D6;transform:rotate(-45deg);
    border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

/**
 * Read-only map showing a tutor/job's EXACT location (admin only).
 */
export function AdminLocationMap({
  lat,
  lng,
  label,
}: {
  lat?: number | null;
  lng?: number | null;
  label?: string;
}) {
  const hasCoords =
    lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng));

  if (!hasCoords) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
        No exact coordinates recorded for this tutor.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="h-64 w-full">
        <MapContainer
          center={[Number(lat), Number(lng)]}
          zoom={15}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[Number(lat), Number(lng)]} icon={pinIcon} />
          {/* ~50m radius ring for visual context around the exact point */}
          <Circle
            center={[Number(lat), Number(lng)]}
            radius={50}
            pathOptions={{ color: "#0096D6", fillOpacity: 0.06, weight: 1.5, dashArray: "3,3" }}
          />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
        <span>
          {label && <span className="font-semibold text-gray-700">{label}</span>}
          <span className="ml-2 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
            Exact (admin only)
          </span>
        </span>
        <a
          href={getMapLocationUrl({ lat, lng, locationName: label })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0096D6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8]"
        >
          <ExternalLink size={13} />
          Open in Map
        </a>
      </div>
    </div>
  );
}
