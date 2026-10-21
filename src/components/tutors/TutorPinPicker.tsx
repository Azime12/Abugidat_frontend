"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ShieldCheck, MapPin, Check, Loader2 } from "lucide-react";
import client from "@/lib/api-client";
import toast from "react-hot-toast";

const pinIcon = L.divIcon({
  className: "pin-picker-marker",
  html: `
    <div style="background:#0096D6;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3);"></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function TutorPinPicker({
  tutorId,
  initialLat = 9.0180,
  initialLng = 38.7670,
  travelKm = 3,
  onSaved,
  onChange,
  hideSaveButton = false,
}: {
  tutorId?: number | string;
  initialLat?: number;
  initialLng?: number;
  travelKm?: number;
  onSaved?: (snapped: { latitude: number; longitude: number }) => void;
  onChange?: (coords: { latitude: number; longitude: number }) => void;
  hideSaveButton?: boolean;
}) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [snappedPosition, setSnappedPosition] = useState<[number, number]>([
    Math.round(initialLat / 0.0045) * 0.0045,
    Math.round(initialLng / 0.0045) * 0.0045,
  ]);
  const [saving, setSaving] = useState(false);

  const handlePick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    // Server grid snapping preview (~500m grid)
    const snappedLat = Math.round(lat / 0.0045) * 0.0045;
    const snappedLng = Math.round(lng / 0.0045) * 0.0045;
    setSnappedPosition([snappedLat, snappedLng]);
    if (onChange) {
      onChange({ latitude: snappedLat, longitude: snappedLng });
    }
  };

  const handleSave = async () => {
    if (!tutorId) return;
    try {
      setSaving(true);
      const res = await client.patch(`/tutors/${tutorId}/base-point`, {
        latitude: position[0],
        longitude: position[1],
      });
      toast.success("Base point saved with privacy grid-snapping (500m)!");
      if (onSaved && res.data?.snapped_base_point) {
        onSaved(res.data.snapped_base_point);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save base point");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#0096D6]" />
            <h3 className="text-base font-bold text-[#2D2A32]">Tutor Base Point Picker</h3>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            Click or drag the pin to set your general neighborhood location on the map.
          </p>
        </div>
        {!hideSaveButton && tutorId ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0096D6] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#007FB8] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save Base Point
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold text-[#0096D6]">
            <MapPin size={12} />
            {snappedPosition[0].toFixed(4)}, {snappedPosition[1].toFixed(4)}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-[#E8F4F8] p-3 text-xs text-[#006A9B]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#0096D6] mt-0.5" />
        <div>
          <span className="font-bold">Privacy Guarantee:</span> Never drop the pin directly on your
          house. Pick a nearby junction or landmark. The server automatically snaps your location to a
          ~500m grid zone (blue circle) before saving.
        </div>
      </div>

      <div className="h-[360px] overflow-hidden rounded-xl border border-gray-200 relative">
        <MapContainer
          center={position}
          zoom={13}
          minZoom={11}
          maxZoom={16}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={handlePick} />

          {/* Draggable user pin */}
          <Marker
            position={position}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                handlePick(pos.lat, pos.lng);
              },
            }}
          />

          {/* Privacy Zone: ~500m Snapped Base Area (radius ~250m) */}
          <Circle
            center={snappedPosition}
            radius={250}
            pathOptions={{
              color: "#0096D6",
              fillColor: "#0096D6",
              fillOpacity: 0.2,
              weight: 2,
              dashArray: "4, 4",
            }}
          />

          {/* Travel Radius Preview Circle */}
          <Circle
            center={snappedPosition}
            radius={travelKm * 1000}
            pathOptions={{
              color: "#FFB800",
              fillColor: "#FFB800",
              fillOpacity: 0.08,
              weight: 1.5,
            }}
          />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 backdrop-blur-sm border border-gray-200 p-2 text-[10px] space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full bg-[#0096D6]" /> Your selected pin
          </div>
          <div className="flex items-center gap-1.5 font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full border border-dashed border-[#0096D6] bg-[#0096D6]/30" />
            Snapped 500m privacy area
          </div>
          <div className="flex items-center gap-1.5 font-medium text-gray-700">
            <span className="h-2 w-2 rounded-full border border-[#FFB800] bg-[#FFB800]/20" />
            {travelKm} km travel radius
          </div>
        </div>
      </div>
    </div>
  );
}
