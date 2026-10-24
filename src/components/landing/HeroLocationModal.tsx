"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, X, Check, LocateFixed } from "lucide-react";
import toast from "react-hot-toast";

const pinIcon = L.divIcon({
  className: "hero-modal-pin",
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;">
      <div style="background:#007B8A;color:white;width:34px;height:34px;border-radius:50%;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:16px;">
        📍
      </div>
      <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #007B8A;margin-top:-2px;"></div>
    </div>
  `,
  iconSize: [34, 40],
  iconAnchor: [17, 40],
});

function MapClickHandler({
  onPick,
}: {
  onPick: (coords: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function LocateController({
  target,
}: {
  target?: [number, number];
}) {
  const map = useMap();
  if (target) {
    map.flyTo(target, 14, { duration: 0.8 });
  }
  return null;
}

const ADDIS_NEIGHBORHOODS: { name: string; coords: [number, number] }[] = [
  { name: "Bole", coords: [8.9984, 38.7865] },
  { name: "Kirkos / Mexico", coords: [9.0105, 38.7455] },
  { name: "Yeka / Megenagna", coords: [9.025, 38.805] },
  { name: "Arada / Piazza", coords: [9.035, 38.752] },
  { name: "Gulele", coords: [9.06, 38.73] },
  { name: "Lideta", coords: [9.012, 38.732] },
  { name: "Akaki Kaliti / Tulu Dimtu", coords: [8.895, 38.775] },
  { name: "Nifas Silk-Lafto / Sarbet", coords: [8.96, 38.725] },
  { name: "Kolfe Keranio", coords: [9.025, 38.705] },
  { name: "Addis Ketema", coords: [9.032, 38.735] },
  { name: "Lemi Kura / CMC", coords: [9.027, 38.845] },
];

function getNearestAreaName(lat: number, lng: number): string {
  let nearest = "Addis Ababa";
  let minDistance = Infinity;
  for (const n of ADDIS_NEIGHBORHOODS) {
    const d = Math.hypot(lat - n.coords[0], lng - n.coords[1]);
    if (d < minDistance) {
      minDistance = d;
      nearest = n.name;
    }
  }
  return nearest;
}

export interface HeroLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (name: string, coords: [number, number]) => void;
  initialCoords?: [number, number];
}

export function HeroLocationModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialCoords = [9.02, 38.76],
}: HeroLocationModalProps) {
  const [position, setPosition] = useState<[number, number]>(initialCoords);
  const [areaName, setAreaName] = useState(() =>
    getNearestAreaName(initialCoords[0], initialCoords[1])
  );

  if (!isOpen) return null;

  const handlePick = (coords: [number, number]) => {
    setPosition(coords);
    const nearest = getNearestAreaName(coords[0], coords[1]);
    setAreaName(nearest);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by browser");
      return;
    }
    toast.loading("Detecting your location...", { id: "geo" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss("geo");
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(c);
        const nearest = getNearestAreaName(c[0], c[1]);
        setAreaName(`Your Location (${nearest})`);
      },
      () => {
        toast.dismiss("geo");
        toast.error("Permission denied. Tap on the map to choose.");
      }
    );
  };

  const handleConfirm = () => {
    onSelectLocation(areaName, position);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex h-[580px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E0F7FA] text-[#007B8A]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Choose Location on Map
              </h3>
              <p className="text-xs text-gray-500">
                Click anywhere in Addis Ababa to set your tutor search point
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative flex-1">
          <MapContainer
            center={position}
            zoom={13}
            minZoom={10}
            maxZoom={17}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onPick={handlePick} />
            <LocateController target={position} />
            <Marker position={position} icon={pinIcon} />
          </MapContainer>

          {/* Quick GPS Floating button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="absolute right-4 top-4 z-[1000] flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-800 shadow-md transition hover:bg-cyan-50 hover:text-[#007B8A]"
          >
            <LocateFixed className="h-4 w-4 text-[#007B8A]" />
            <span>Use GPS</span>
          </button>
        </div>

        {/* Footer with selected area info & confirm button */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3.5">
          <div className="min-w-0 flex-1 pr-3">
            <span className="text-[11px] font-semibold uppercase text-gray-400">
              Selected Point
            </span>
            <p className="truncate text-sm font-bold text-gray-900">
              📍 {areaName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 rounded-xl bg-[#0096D6] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#007FB8]"
            >
              <Check className="h-4 w-4" />
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
