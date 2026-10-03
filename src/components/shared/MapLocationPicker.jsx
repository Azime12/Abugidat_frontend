import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLazyReverseGeocodeQuery, useLazyGeocodeLocationQuery } from "../../redux/api/locationApiSlice";

const ETHIOPIA_PRESETS = [
  { name: "Bole Atlas, Addis Ababa", lat: 9.0102, lng: 38.7812 },
  { name: "Kazanchis, Addis Ababa", lat: 9.0185, lng: 38.7682 },
  { name: "Sarbet, Addis Ababa", lat: 8.9954, lng: 38.7368 },
  { name: "Piassa / Arada, Addis Ababa", lat: 9.0345, lng: 38.7521 },
  { name: "Megenagna, Addis Ababa", lat: 9.0211, lng: 38.8023 },
  { name: "CMC, Addis Ababa", lat: 9.0255, lng: 38.8415 },
  { name: "Gerji, Addis Ababa", lat: 8.9972, lng: 38.8089 },
  { name: "Lebu / Jomo, Addis Ababa", lat: 8.9612, lng: 38.7185 },
  { name: "Hawassa Center", lat: 7.0504, lng: 38.4955 },
  { name: "Adama (Nazret)", lat: 8.5414, lng: 39.2689 },
  { name: "Bahir Dar", lat: 11.5936, lng: 37.3908 },
];

export default function MapLocationPicker({
  initialLat = 9.0102,
  initialLng = 38.7612,
  initialLocationName = "Bole Atlas, Addis Ababa",
  onSelectLocation,
  onClose,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({
    lat: initialLat || 9.0102,
    lng: initialLng || 38.7612,
  });
  const [locationName, setLocationName] = useState(initialLocationName || "Bole Atlas, Addis Ababa");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [triggerReverseGeocode] = useLazyReverseGeocodeQuery();
  const [triggerGeocode] = useLazyGeocodeLocationQuery();

  // Reverse geocode handler
  const fetchAddress = useCallback(async (lat, lng) => {
    setIsLoadingAddress(true);
    try {
      // Find closest preset first if very close
      const closePreset = ETHIOPIA_PRESETS.find(
        (p) => Math.abs(p.lat - lat) < 0.008 && Math.abs(p.lng - lng) < 0.008
      );
      if (closePreset) {
        setLocationName(closePreset.name);
        setIsLoadingAddress(false);
        return;
      }

      // Try Nominatim API via backend or fallback
      const res = await triggerReverseGeocode({ lat, lng }).unwrap();
      if (res?.address) {
        setLocationName(res.address);
      } else if (res?.city) {
        setLocationName(`${res.city}, Ethiopia`);
      } else {
        setLocationName(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
      }
    } catch {
      setLocationName(`Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsLoadingAddress(false);
    }
  }, [triggerReverseGeocode]);

  // Initialize MapLibre
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
      center: [coords.lng, coords.lat],
      zoom: 14,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // Custom Marker Element
    const el = document.createElement("div");
    el.className = "custom-map-pin";
    el.innerHTML = `
      <div style="
        background: #E8703A;
        width: 38px;
        height: 38px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(232, 112, 58, 0.5);
        border: 3px solid #ffffff;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 16px;
          display: flex;
        ">📍</div>
      </div>
    `;

    const marker = new maplibregl.Marker({
      element: el,
      draggable: true,
      anchor: "bottom",
    })
      .setLngLat([coords.lng, coords.lat])
      .addTo(map);

    markerRef.current = marker;
    mapRef.current = map;

    // Handle marker drag
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      const newLat = parseFloat(lngLat.lat.toFixed(6));
      const newLng = parseFloat(lngLat.lng.toFixed(6));
      setCoords({ lat: newLat, lng: newLng });
      fetchAddress(newLat, newLng);
    });

    // Handle map click
    map.on("click", (e) => {
      const newLat = parseFloat(e.lngLat.lat.toFixed(6));
      const newLng = parseFloat(e.lngLat.lng.toFixed(6));
      marker.setLngLat([newLng, newLat]);
      setCoords({ lat: newLat, lng: newLng });
      fetchAddress(newLat, newLng);
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update marker position & map center
  const updatePosition = (lat, lng, name = null) => {
    setCoords({ lat, lng });
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
    if (name) {
      setLocationName(name);
    } else {
      fetchAddress(lat, lng);
    }
  };

  // Device Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
        updatePosition(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err.message);
        // Fallback to Bole Atlas preset if GPS denied
        updatePosition(9.0102, 38.7812, "Bole Atlas, Addis Ababa");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Place Search
  const handleSearchSubmit = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    // Check local preset first
    const matchedPreset = ETHIOPIA_PRESETS.find((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matchedPreset) {
      updatePosition(matchedPreset.lat, matchedPreset.lng, matchedPreset.name);
      return;
    }

    try {
      const res = await triggerGeocode(searchQuery).unwrap();
      if (res?.latitude && res?.longitude) {
        updatePosition(res.latitude, res.longitude, res.name || searchQuery);
      }
    } catch {
      // Fallback
    }
  };

  const handleConfirm = () => {
    if (onSelectLocation) {
      onSelectLocation({
        latitude: coords.lat,
        longitude: coords.lng,
        locationName: locationName || "Addis Ababa",
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-tm-border shadow-lg">
      {/* Top Search & Presets Bar */}
      <div className="p-3 bg-white border-b border-gray-100 z-10">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area (e.g. Bole, Kazanchis, CMC)..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-tm-navy focus:outline-none focus:border-tm-blue transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-tm-blue text-white text-xs font-semibold rounded-xl hover:bg-blue-600 transition-colors"
          >
            Find
          </button>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-tm-navy rounded-xl transition-colors text-xs flex items-center justify-center"
            title="Use My GPS Location"
          >
            <i className={`ti ti-current-location text-base ${isLocating ? "animate-spin text-tm-blue" : ""}`} />
          </button>
        </form>

        {/* Quick Area Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          {ETHIOPIA_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => updatePosition(preset.lat, preset.lng, preset.name)}
              className="px-2.5 py-1 bg-gray-100 hover:bg-tm-blue-light hover:text-tm-blue rounded-full whitespace-nowrap transition-colors text-gray-700 font-medium flex-shrink-0"
            >
              {preset.name.split(",")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative flex-1 min-h-[260px] w-full">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
        
        {/* Floating Instruction Banner */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-gray-200 text-[11px] font-medium text-tm-navy flex items-center gap-1.5 pointer-events-none z-10">
          <i className="ti ti-hand-click text-tm-coral" />
          <span>Click map or drag pin to adjust location</span>
        </div>
      </div>

      {/* Bottom Selected Location Bar */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between gap-3 z-10">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase font-bold text-tm-muted tracking-wider">
            Selected Location
          </div>
          <div className="font-semibold text-xs text-tm-navy truncate flex items-center gap-1.5 mt-0.5">
            <i className="ti ti-map-pin text-tm-coral text-sm flex-shrink-0" />
            <span className="truncate">{isLoadingAddress ? "Locating address..." : locationName}</span>
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-tm-coral text-white text-xs font-bold rounded-xl shadow-xs hover:bg-coral-600 transition-colors flex items-center gap-1"
          >
            <i className="ti ti-check text-sm" />
            <span>Confirm Pin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
