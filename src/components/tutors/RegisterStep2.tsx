"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import client from "@/lib/api-client";
import {
  Check, MapPin, FileText, X, Loader2, BookOpen,
  Search, CheckCircle2, Navigation, AlertCircle, Building2,
  Plus, Sparkles, GraduationCap,
} from "lucide-react";
import type { GradeLevel, TutorRegisterTeachingDetails } from "@/types/tutor";

// ── Bot-aligned grade & subject constants ─────────────────────────────────────

// Must match bot's GRADE_OPTIONS exactly (tutorRegistrationService.js)
export const STANDARD_GRADES: { id: GradeLevel; label: string }[] = [
  { id: "KG",        label: "KG / Nursery" },
  { id: "1-4",       label: "Grade 1-4" },
  { id: "5-6",       label: "Grade 5-6" },
  { id: "7-8",       label: "Grade 7-8" },
  { id: "9-10",      label: "Grade 9-10" },
  { id: "11-12-NS",  label: "Grade 11-12 (Natural Science)" },
  { id: "11-12-SS",  label: "Grade 11-12 (Social Science)" },
  { id: "Exam",      label: "Exam Prep" },
  { id: "Uni",       label: "University" },
];

// Full subject pool shown when All Levels / University selected (matches bot SUBJECTS)
export const CORE_SUBJECTS = [
  "Mathematics",
  "English",
  "Amharic",
  "Afaan Oromo",
  "Environmental Science",
  "General Science",
  "Social Science",
  "Citizenship Education",
  "Information Technology",
  "Work & Technical Education",
  "Health & Physical Education",
  "Art",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "History",
  "Economics",
  "Agriculture",
  "Other",
];

// Per-grade subject mapping — matches bot's CURRICULUM_SUBJECTS_BY_GRADE
export const GRADE_SUBJECT_RECOMMENDATIONS: Record<string, string[]> = {
  "KG": [
    "Basic Math & Numbers",
    "Spoken English & Phonics",
    "Amharic Fidel (ፊደል)",
    "Afaan Oromo",
    "Drawing & Creativity",
    "General Knowledge",
  ],
  "1-4": [
    "Mathematics",
    "English",
    "Environmental Science",
    "Amharic",
    "Afaan Oromo",
    "Moral Education",
    "Art & Music",
  ],
  "5-6": [
    "Mathematics",
    "English",
    "General Science",
    "Social Studies",
    "Amharic",
    "Afaan Oromo",
    "Citizenship",
  ],
  "7-8": [
    "Mathematics",
    "General Science",
    "Social Studies",
    "English",
    "Amharic",
    "Afaan Oromo",
    "Citizenship Education",
    "Career & Technical (CTE)",
    "Information Technology",
  ],
  "9-10": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Amharic",
    "Afaan Oromo",
    "History",
    "Geography",
    "Economics",
    "Citizenship",
    "Information Technology",
  ],
  "11-12-NS": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Information Technology",
    "Technical Drawing",
    "Aptitude / National Exam Prep",
  ],
  "11-12-SS": [
    "Mathematics",
    "History",
    "Geography",
    "Economics",
    "English",
    "Citizenship / Civics",
    "Business / General Business",
    "Aptitude / National Exam Prep",
  ],
  "Exam": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Economics",
    "Aptitude / National Exam Prep",
  ],
  "Uni": [...CORE_SUBJECTS],
};

// Popular Addis Ababa neighbourhoods with known base coordinates (snapped privately)
const POPULAR_AREAS = [
  { name: "Bole", lat: 8.995, lng: 38.788 },
  { name: "Kazanchis", lat: 9.019, lng: 38.772 },
  { name: "Piassa", lat: 9.035, lng: 38.752 },
  { name: "Merkato", lat: 9.030, lng: 38.739 },
  { name: "CMC", lat: 9.022, lng: 38.835 },
  { name: "Gerji", lat: 9.002, lng: 38.805 },
  { name: "Ayat", lat: 9.018, lng: 38.868 },
  { name: "Megenagna", lat: 9.020, lng: 38.802 },
  { name: "4 Kilo", lat: 9.036, lng: 38.761 },
  { name: "6 Kilo", lat: 9.047, lng: 38.762 },
  { name: "Sarbet", lat: 8.997, lng: 38.745 },
  { name: "Saris", lat: 8.955, lng: 38.767 },
  { name: "Lebu", lat: 8.966, lng: 38.718 },
  { name: "Mexico", lat: 9.011, lng: 38.745 },
  { name: "Gotera", lat: 8.988, lng: 38.756 },
  { name: "Akaki", lat: 8.878, lng: 38.790 },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function snapToGrid(val: number, step = 0.0045) {
  return Math.round(val / step) * step;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface Landmark {
  name: string;
  area: string;
  lat: number;
  lng: number;
  type?: "hotel" | "mall" | "square" | "junction" | "landmark";
}

// Curated specific landmarks, hotels, plazas, and junctions across Addis Ababa
const SPECIFIC_LANDMARKS: Landmark[] = [
  // Bole area
  { name: "Ethiopian Skylight Hotel", area: "Bole", lat: 8.9892, lng: 38.7885, type: "hotel" },
  { name: "Bole Medhanialem", area: "Bole", lat: 8.9961, lng: 38.7882, type: "landmark" },
  { name: "Edna Mall", area: "Bole", lat: 8.9975, lng: 38.7874, type: "mall" },
  { name: "Atlas Junction", area: "Bole", lat: 9.0063, lng: 38.7818, type: "junction" },
  { name: "Dembel City Center", area: "Bole", lat: 9.0068, lng: 38.7675, type: "mall" },
  { name: "Friendship City Center", area: "Bole", lat: 8.9955, lng: 38.7845, type: "mall" },
  { name: "Ramada Hotel", area: "Bole", lat: 8.9920, lng: 38.7830, type: "hotel" },
  { name: "Harmony Hotel", area: "Bole", lat: 8.9980, lng: 38.7860, type: "hotel" },
  { name: "Bole Brass / Japan Embassy", area: "Bole", lat: 8.9950, lng: 38.7770, type: "landmark" },
  { name: "Bole Bulbula 93 Mazoria", area: "Bole", lat: 8.9730, lng: 38.7890, type: "junction" },
  { name: "Bole Bulbula Mariam", area: "Bole", lat: 8.9680, lng: 38.7950, type: "landmark" },
  { name: "Bole 24 St. Gabriel", area: "Bole", lat: 8.9985, lng: 38.7990, type: "landmark" },
  { name: "Rwanda Embassy Roundabout", area: "Bole", lat: 9.0015, lng: 38.7735, type: "junction" },
  { name: "Peacock Park", area: "Bole", lat: 9.0020, lng: 38.7690, type: "landmark" },

  // Kazanchis & Kirkos
  { name: "Radisson Blu Hotel", area: "Kazanchis", lat: 9.0150, lng: 38.7660, type: "hotel" },
  { name: "Hilton Hotel", area: "Kazanchis", lat: 9.0205, lng: 38.7610, type: "hotel" },
  { name: "Inter Luxury Hotel", area: "Kazanchis", lat: 9.0185, lng: 38.7690, type: "hotel" },
  { name: "Kazanchis Total", area: "Kazanchis", lat: 9.0195, lng: 38.7725, type: "junction" },
  { name: "Bambis / Jomo Kenyatta", area: "Kazanchis", lat: 9.0135, lng: 38.7670, type: "landmark" },
  { name: "UNECA Africa Hall", area: "Kazanchis", lat: 9.0165, lng: 38.7620, type: "landmark" },
  { name: "Kirkos Church", area: "Kirkos", lat: 9.0060, lng: 38.7580, type: "landmark" },
  { name: "Flamingo Restaurant", area: "Bole Road", lat: 9.0080, lng: 38.7640, type: "landmark" },

  // Megenagna & 22
  { name: "Zefmesh Grand Mall", area: "Megenagna", lat: 9.0205, lng: 38.8020, type: "mall" },
  { name: "Diaspora Square", area: "Megenagna", lat: 9.0220, lng: 38.8035, type: "square" },
  { name: "22 Golagol Tower", area: "22 Mazoria", lat: 9.0145, lng: 38.7865, type: "junction" },
  { name: "Lem Hotel / 22", area: "22 Mazoria", lat: 9.0130, lng: 38.7895, type: "hotel" },
  { name: "Shola Market", area: "Megenagna", lat: 9.0260, lng: 38.7940, type: "landmark" },
  { name: "Hayahulet Mazoria", area: "Hayahulet", lat: 9.0155, lng: 38.7815, type: "junction" },
  { name: "Zerihun Building", area: "22 Mazoria", lat: 9.0160, lng: 38.7850, type: "landmark" },

  // CMC, Ayat & Summit
  { name: "CMC Michael Square", area: "CMC", lat: 9.0225, lng: 38.8350, type: "square" },
  { name: "CMC St. Michael Church", area: "CMC", lat: 9.0240, lng: 38.8375, type: "landmark" },
  { name: "Century Mall Gurd Shola", area: "CMC", lat: 9.0180, lng: 38.8150, type: "mall" },
  { name: "Civil Service University", area: "CMC", lat: 9.0250, lng: 38.8240, type: "landmark" },
  { name: "Salite Mehret Church", area: "CMC", lat: 9.0170, lng: 38.8280, type: "landmark" },
  { name: "Sunshine Real Estate Meri", area: "CMC", lat: 9.0305, lng: 38.8470, type: "landmark" },
  { name: "Ayat Zone 2 Roundabout", area: "Ayat", lat: 9.0185, lng: 38.8680, type: "junction" },
  { name: "Ayat Total Roundabout", area: "Ayat", lat: 9.0230, lng: 38.8620, type: "junction" },
  { name: "Ayat Train Terminal", area: "Ayat", lat: 9.0190, lng: 38.8710, type: "square" },
  { name: "Summit Condominium", area: "Summit", lat: 9.0090, lng: 38.8550, type: "landmark" },
  { name: "Summit Pepsi Factory", area: "Summit", lat: 9.0120, lng: 38.8490, type: "landmark" },
  { name: "Figa Mazoria", area: "Summit", lat: 9.0140, lng: 38.8420, type: "junction" },

  // Gerji
  { name: "Imperial Roundabout", area: "Gerji", lat: 9.0010, lng: 38.7980, type: "square" },
  { name: "Gerji Mebrat Hayl", area: "Gerji", lat: 9.0040, lng: 38.8080, type: "landmark" },
  { name: "Gerji Unity University", area: "Gerji", lat: 8.9980, lng: 38.8120, type: "landmark" },
  { name: "Jackros Salite Mehret", area: "Gerji", lat: 9.0130, lng: 38.8260, type: "junction" },
  { name: "Roba Bakery Gerji", area: "Gerji", lat: 9.0030, lng: 38.8020, type: "landmark" },
  { name: "Alfoz Plaza Gerji", area: "Gerji", lat: 9.0060, lng: 38.8050, type: "mall" },

  // Sarbet, Old Airport & Bisrate Gabriel
  { name: "African Union HQ", area: "Sarbet", lat: 9.0010, lng: 38.7390, type: "landmark" },
  { name: "Vatican Embassy Roundabout", area: "Sarbet", lat: 8.9940, lng: 38.7420, type: "junction" },
  { name: "Bisrate Gabriel Church", area: "Old Airport", lat: 8.9870, lng: 38.7310, type: "landmark" },
  { name: "Laphto Mall", area: "Old Airport", lat: 8.9830, lng: 38.7320, type: "mall" },
  { name: "ICS International School", area: "Old Airport", lat: 8.9890, lng: 38.7350, type: "landmark" },
  { name: "Torhailoch Square", area: "Torhailoch", lat: 9.0080, lng: 38.7280, type: "square" },
  { name: "Karl Square", area: "Sarbet", lat: 8.9980, lng: 38.7360, type: "square" },

  // Mexico, Lideta & Gotera
  { name: "Mexico Square", area: "Mexico", lat: 9.0105, lng: 38.7445, type: "square" },
  { name: "Balcha Hospital", area: "Lideta", lat: 9.0120, lng: 38.7380, type: "landmark" },
  { name: "Lideta Condominium", area: "Lideta", lat: 9.0160, lng: 38.7370, type: "landmark" },
  { name: "Gotera Interchange", area: "Gotera", lat: 8.9880, lng: 38.7560, type: "junction" },
  { name: "Kera Slaughterhouse", area: "Kera", lat: 8.9950, lng: 38.7510, type: "landmark" },
  { name: "Commerce College", area: "Mexico", lat: 9.0115, lng: 38.7480, type: "landmark" },
  { name: "Tegbare-ed Polytechnic", area: "Mexico", lat: 9.0090, lng: 38.7470, type: "landmark" },

  // Piassa, 4 Kilo & 6 Kilo
  { name: "Piassa De Gaulle Square", area: "Piassa", lat: 9.0350, lng: 38.7520, type: "square" },
  { name: "Taitu Hotel / Churchill", area: "Piassa", lat: 9.0320, lng: 38.7530, type: "hotel" },
  { name: "St. George Cathedral", area: "Piassa", lat: 9.0380, lng: 38.7490, type: "landmark" },
  { name: "Arat Kilo / Parliament", area: "4 Kilo", lat: 9.0360, lng: 38.7610, type: "landmark" },
  { name: "Sidist Kilo AAU Campus", area: "6 Kilo", lat: 9.0470, lng: 38.7620, type: "landmark" },
  { name: "Yekatit 12 Hospital", area: "6 Kilo", lat: 9.0450, lng: 38.7590, type: "landmark" },
  { name: "Jan Meda Sports Ground", area: "6 Kilo", lat: 9.0410, lng: 38.7680, type: "landmark" },

  // Merkato
  { name: "Anwar Mosque", area: "Merkato", lat: 9.0310, lng: 38.7380, type: "landmark" },
  { name: "Merkato Raguel", area: "Merkato", lat: 9.0340, lng: 38.7320, type: "landmark" },
  { name: "Autobus Tera", area: "Merkato", lat: 9.0330, lng: 38.7410, type: "junction" },
  { name: "Military Tera", area: "Merkato", lat: 9.0280, lng: 38.7350, type: "landmark" },
  { name: "Sebategna", area: "Merkato", lat: 9.0290, lng: 38.7420, type: "junction" },

  // Lebu & Jemo
  { name: "Lebu Varnero Roundabout", area: "Lebu", lat: 8.9660, lng: 38.7180, type: "square" },
  { name: "Lebu Musika Bet", area: "Lebu", lat: 8.9690, lng: 38.7230, type: "junction" },
  { name: "Jemo 1 Roundabout", area: "Jemo", lat: 8.9580, lng: 38.7050, type: "junction" },
  { name: "Jemo 2 Roundabout", area: "Jemo", lat: 8.9520, lng: 38.6980, type: "junction" },
  { name: "Haile Garment Roundabout", area: "Lebu", lat: 8.9620, lng: 38.7350, type: "junction" },

  // Saris, Kality & Akaki
  { name: "Saris Abo Church", area: "Saris", lat: 8.9560, lng: 38.7680, type: "landmark" },
  { name: "Saris Dama Hotel", area: "Saris", lat: 8.9610, lng: 38.7650, type: "hotel" },
  { name: "Kality Roundabout", area: "Kality", lat: 8.9240, lng: 38.7610, type: "junction" },
  { name: "Kality Square", area: "Kality", lat: 8.9180, lng: 38.7580, type: "square" },
  { name: "Akaki Bridge", area: "Akaki", lat: 8.8780, lng: 38.7900, type: "landmark" },
  { name: "Akaki Total", area: "Akaki", lat: 8.8820, lng: 38.7880, type: "junction" },

  // Kolfe, Wingate & Asko & Bethel
  { name: "Kolfe 18 Mazoria", area: "Kolfe", lat: 9.0230, lng: 38.7120, type: "junction" },
  { name: "Keranio Medhanialem", area: "Kolfe", lat: 9.0150, lng: 38.7050, type: "landmark" },
  { name: "Wingate Ring Road Roundabout", area: "Wingate", lat: 9.0490, lng: 38.7150, type: "junction" },
  { name: "Asko Roundabout", area: "Asko", lat: 9.0550, lng: 38.7080, type: "square" },
  { name: "Pastor Square", area: "Wingate", lat: 9.0420, lng: 38.7230, type: "square" },
  { name: "Bethel Hospital", area: "Bethel", lat: 9.0010, lng: 38.7020, type: "landmark" },
  { name: "Total Torhailoch", area: "Torhailoch", lat: 9.0050, lng: 38.7210, type: "junction" },
];

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Return ONLY landmarks that are within maxMeters (default 1500m / 1.5km)
function getNearbyLandmarks(
  lat: number,
  lng: number,
  maxMeters = 1500,
  limit = 8
): (Landmark & { distanceMeters: number })[] {
  const withDistance = SPECIFIC_LANDMARKS.map((lm) => {
    const km = distanceKm(lat, lng, lm.lat, lm.lng);
    return { ...lm, distanceMeters: Math.round(km * 1000) };
  })
    .filter((lm) => lm.distanceMeters <= maxMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
  return withDistance.slice(0, limit);
}

function getNearestPopularArea(lat: number, lng: number): string {
  let closest = POPULAR_AREAS[0];
  let minD = Infinity;
  for (const a of POPULAR_AREAS) {
    const d = Math.hypot(a.lat - lat, a.lng - lng);
    if (d < minD) {
      minD = d;
      closest = a;
    }
  }
  return closest.name;
}

async function reverseGeocodeToLandmark(lat: number, lng: number): Promise<string> {
  // 1. Try our backend proxy to Nominatim (no CORS issues)
  try {
    const res = await client.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
    const data = res.data;
    if (data?.success) {
      const addr = data.address || {};
      const specific =
        addr.hotel ||
        addr.amenity ||
        addr.building ||
        addr.tourism ||
        addr.shop ||
        addr.road ||
        addr.suburb;
      const suburb = addr.suburb || addr.neighbourhood || addr.city_district || "";
      if (specific) {
        return suburb && !specific.toLowerCase().includes(suburb.toLowerCase())
          ? `Near ${specific}, ${suburb}`
          : `Near ${specific}`;
      }
      if (data.displayName) {
        const parts = data.displayName.split(",").map((p: string) => p.trim());
        if (parts.length > 0 && parts[0]) {
          return parts.slice(0, 2).join(", ");
        }
      }
    }
  } catch {
    // proceed to local landmark database
  }

  // 2. High-precision local landmark database match (strictly within 1.5km)
  const nearestList = getNearbyLandmarks(lat, lng, 1500, 1);
  const nearest = nearestList[0];
  if (nearest && nearest.distanceMeters <= 1500) {
    const distText = nearest.distanceMeters < 500 ? "" : ` (~${Math.round(nearest.distanceMeters / 100) * 100}m)`;
    return `Near ${nearest.name}, ${nearest.area}${distText}`;
  }

  return getNearestPopularArea(lat, lng);
}

// ── PlaceSearch component ─────────────────────────────────────────────────────

function PlaceSearch({
  onSelect,
}: {
  onSelect: (place: { name: string; lat: number; lng: number }) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);            // dropdown visible
  const [selected, setSelected] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

  // Compute nearby landmarks ONLY when user coordinates are actually detected!
  // Prevents showing false Atlas/Dembel when user is in other parts of Addis
  const nearbyLandmarks = useMemo(() => {
    if (!userCoords) return [];
    return getNearbyLandmarks(userCoords[0], userCoords[1], 1500, 8);
  }, [userCoords]);

  // Geolocation detection
  const [geoState, setGeoState] = useState<"idle" | "detecting" | "ok" | "denied">("idle");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect my location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGeoState("detecting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const rawLat = pos.coords.latitude;
        const rawLng = pos.coords.longitude;
        const lat = snapToGrid(rawLat);
        const lng = snapToGrid(rawLng);

        setUserCoords([rawLat, rawLng]);
        let placeName = await reverseGeocodeToLandmark(rawLat, rawLng);
        if (!placeName) {
          placeName = getNearestPopularArea(rawLat, rawLng);
        }

        setGeoState("ok");
        setQuery(placeName);
        setSelected(placeName);
        setOpen(false);
        onSelect({ name: placeName, lat, lng });
      },
      () => setGeoState("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const searchNominatim = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: q + ", Addis Ababa, Ethiopia",
        format: "json",
        limit: "7",
        countrycodes: "et",
        addressdetails: "0",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(null);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchNominatim(val), 350);
  };

  const handleSelectResult = (r: NominatimResult) => {
    const shortName = r.display_name.split(",")[0].trim();
    setQuery(shortName);
    setSelected(shortName);
    setUserCoords([parseFloat(r.lat), parseFloat(r.lon)]);
    setResults([]);
    setOpen(false);
    onSelect({
      name: shortName,
      lat: snapToGrid(parseFloat(r.lat)),
      lng: snapToGrid(parseFloat(r.lon)),
    });
  };

  const handleSelectLandmark = (lm: Landmark & { distanceMeters?: number }) => {
    const fullName = `${lm.name}, ${lm.area}`;
    setQuery(fullName);
    setSelected(fullName);
    setUserCoords([lm.lat, lm.lng]);
    setResults([]);
    setOpen(false);
    onSelect({
      name: fullName,
      lat: snapToGrid(lm.lat),
      lng: snapToGrid(lm.lng),
    });
  };

  const handleSelectPopular = (area: { name: string; lat: number; lng: number }) => {
    setQuery(area.name);
    setSelected(area.name);
    setUserCoords([area.lat, area.lng]);
    setResults([]);
    setOpen(false);
    onSelect({
      name: area.name,
      lat: snapToGrid(area.lat),
      lng: snapToGrid(area.lng),
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasSearchText = query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Search neighbourhood, landmark or area…"
          autoComplete="off"
          className={`w-full rounded-xl border py-3 pl-9 pr-10 text-sm outline-none transition
            focus:ring-2 focus:ring-[#0096D6]/20
            ${selected === "current"
              ? "border-emerald-400 bg-emerald-50 text-emerald-800"
              : selected
              ? "border-emerald-400 bg-emerald-50 text-emerald-800"
              : "border-gray-300 bg-white focus:border-[#0096D6]"
            }`}
        />
        {/* Right icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : selected ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : query ? (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setSelected(null); setOpen(true); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">

          {/* ── "Use my current location" button — ALWAYS at top of dropdown ── */}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); detectLocation(); }}
            disabled={geoState === "detecting"}
            className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left text-sm font-bold transition ${
              geoState === "ok"
                ? "bg-emerald-50 text-emerald-700"
                : "text-[#0096D6] hover:bg-[#E8F4F8]"
            }`}
          >
            {geoState === "detecting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : geoState === "ok" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : geoState === "denied" ? (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            <div className="flex-1 min-w-0">
              <span className="block truncate">
                {geoState === "detecting"
                  ? "Detecting nearest landmark…"
                  : geoState === "ok" && selected
                  ? `Current: ${selected}`
                  : geoState === "denied"
                  ? "Location denied — pick an area below"
                  : "Use my current location"}
              </span>
              <span className="block text-[11px] font-normal text-gray-400">
                Finds your nearest landmark or neighborhood
              </span>
            </div>
          </button>

          {/* ── Nominatim search results when typing ── */}
          {hasSearchText && (
            <div>
              {loading && results.length === 0 && (
                <div className="flex items-center gap-2 p-4 text-xs text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0096D6]" />
                  Searching &ldquo;{query}&rdquo; in Addis Ababa…
                </div>
              )}
              {!loading && results.length === 0 && query.trim().length >= 2 && (
                <div className="p-4 text-xs text-gray-400 text-center">
                  No areas found for &ldquo;{query}&rdquo;. Try a popular neighborhood below.
                </div>
              )}
              {results.length > 0 && (
                <ul className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                  {results.map((r) => (
                    <li key={r.place_id}>
                      <button
                        type="button"
                        onMouseDown={() => handleSelectResult(r)}
                        className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-[#E8F4F8] transition"
                      >
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0096D6]" />
                        <span className="text-gray-700 line-clamp-2">{r.display_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Divided: 1. Nearby Landmarks (~500m - 1km) and 2. Popular Areas ── */}
          {(!hasSearchText || (results.length === 0 && !loading)) && (
            <div className="divide-y divide-gray-100">
              {/* Section 1: Nearby Landmarks (~500m – 1km) */}
              {userCoords ? (
                nearbyLandmarks.length > 0 ? (
                  <div className="p-3 bg-blue-50/40">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#0096D6] flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-[#0096D6]" /> Nearby Landmarks (~500m – 1km)
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Near your location
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {nearbyLandmarks.map((lm) => (
                        <button
                          key={lm.name}
                          type="button"
                          onMouseDown={() => handleSelectLandmark(lm)}
                          className="flex items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-blue-900 hover:border-[#0096D6] hover:bg-[#E8F4F8] hover:text-[#0096D6] shadow-2xs transition"
                        >
                          <MapPin className="h-3 w-3 text-[#0096D6]" />
                          <span>{lm.name}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            ({lm.distanceMeters < 1000 ? `${lm.distanceMeters}m` : `${(lm.distanceMeters / 1000).toFixed(1)}km`})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/60 text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>No known landmark within 1.2km of your location. Selected: <strong>{selected || "Current location"}</strong>. You can choose a neighborhood below:</span>
                  </div>
                )
              ) : (
                <div className="p-2.5 bg-blue-50/50 flex items-center gap-2 text-xs text-blue-900">
                  <Navigation className="h-3.5 w-3.5 text-[#0096D6] shrink-0" />
                  <span>Tap <strong>&ldquo;Use my current location&rdquo;</strong> above to show landmarks within 500m – 1km of you.</span>
                </div>
              )}

              {/* Section 2: Popular Areas */}
              <div className="p-3 bg-gray-50/50">
                <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                  Popular Areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_AREAS.map((area) => (
                    <button
                      key={area.name}
                      type="button"
                      onMouseDown={() => handleSelectPopular(area)}
                      className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700 hover:border-[#0096D6] hover:bg-[#E8F4F8] hover:text-[#0096D6] shadow-2xs transition"
                    >
                      <MapPin className="h-3 w-3 text-[#0096D6]" />
                      {area.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected confirmation */}
      {selected && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Location set to &ldquo;{selected}&rdquo;
        </p>
      )}
    </div>
  );
}

// ── FileUploadButton ──────────────────────────────────────────────────────────

function FileUploadButton({
  label,
  hint,
  accept,
  value,
  onChange,
  error,
}: {
  label: string;
  hint: string;
  accept: string;
  value?: string;
  onChange: (base64: string | undefined) => void;
  error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("File must be under 10 MB"); return; }
    try {
      setLoading(true);
      const base64 = await fileToBase64(file);
      setFileName(file.name);
      onChange(base64);
    } catch {
      alert("Could not read file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasFile = !!value;
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-[#2D2A32]">{label}</label>
      <div
        className={`relative flex items-center gap-3 rounded-xl border-2 border-dashed px-4 py-3.5 transition cursor-pointer ${
          hasFile ? "border-[#0096D6] bg-[#E8F4F8]" : "border-gray-200 bg-gray-50 hover:border-[#0096D6]/50 hover:bg-[#E8F4F8]/40"
        }`}
        onClick={() => ref.current?.click()}
      >
        <FileText className={`h-6 w-6 shrink-0 ${hasFile ? "text-[#0096D6]" : "text-gray-400"}`} />
        <div className="flex-1 min-w-0">
          {hasFile
            ? <p className="truncate text-sm font-semibold text-[#0096D6]">{fileName || "File attached ✓"}</p>
            : <p className="text-sm text-gray-500">{hint}</p>}
        </div>
        {loading
          ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" />
          : hasFile
          ? <button type="button" onClick={(ev) => { ev.stopPropagation(); onChange(undefined); setFileName(undefined); if (ref.current) ref.current.value = ""; }} className="shrink-0 rounded-full p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><X className="h-4 w-4" /></button>
          : <div className="shrink-0 rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-bold text-gray-600">Browse</div>}
        <input ref={ref} type="file" accept={accept} onChange={handleFile} className="hidden" />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface Props {
  initial: TutorRegisterTeachingDetails;
  onBack: () => void;
  onSubmit: (data: TutorRegisterTeachingDetails) => void;
  submitting: boolean;
}

export function RegisterStep2({ initial, onBack, onSubmit, submitting }: Props) {
  const [subjects, setSubjects] = useState<string[]>(initial.subjects || []);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>(initial.gradeLevels || []);
  const [areaName, setAreaName] = useState(initial.areaName || "");
  const [latitude, setLatitude] = useState<number | undefined>(initial.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initial.longitude);
  const [bio, setBio] = useState(initial.bio || "");
  const [teachingMode, setTeachingMode] = useState<"In-person" | "Online" | "Both">(
    initial.teachingMode || (initial.onlineOk ? "Both" : "In-person")
  );
  const [cvFile, setCvFile] = useState<string | undefined>(initial.cvFile);
  const [educationFile, setEducationFile] = useState<string | undefined>(initial.educationFile);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Custom grade & subject inputs
  const [showCustomGrade, setShowCustomGrade] = useState(false);
  const [customGradeInput, setCustomGradeInput] = useState("");
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [customSubjectInput, setCustomSubjectInput] = useState("");

  const toggle = <T,>(arr: T[], val: T, setter: (a: T[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  // Grade level helpers
  const allStandardGradeIds = useMemo(() => STANDARD_GRADES.map((g) => g.id), []);
  const isAllGradesSelected = useMemo(
    () => allStandardGradeIds.length > 0 && allStandardGradeIds.every((id) => gradeLevels.includes(id)),
    [allStandardGradeIds, gradeLevels]
  );

  const toggleAllGrades = () => {
    if (isAllGradesSelected) {
      setGradeLevels(gradeLevels.filter((g) => !allStandardGradeIds.includes(g as any)));
    } else {
      const combined = Array.from(new Set([...gradeLevels, ...allStandardGradeIds]));
      setGradeLevels(combined);
    }
  };

  const handleAddCustomGrade = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = customGradeInput.trim();
    if (!val) return;
    if (!gradeLevels.includes(val as any)) {
      setGradeLevels([...gradeLevels, val as any]);
    }
    setCustomGradeInput("");
    setShowCustomGrade(false);
  };

  const removeCustomGrade = (g: GradeLevel) => {
    setGradeLevels(gradeLevels.filter((item) => item !== g));
  };

  // Subject helpers & recommendations based on selected grades
  const recommendedSubjects = useMemo(() => {
    if (gradeLevels.length === 0) return new Set(CORE_SUBJECTS);
    const recs = new Set<string>();
    for (const g of gradeLevels) {
      const list = GRADE_SUBJECT_RECOMMENDATIONS[g] || [];
      list.forEach((s) => recs.add(s));
    }
    return recs;
  }, [gradeLevels]);

  const isAllSubjectsSelected = useMemo(
    () => CORE_SUBJECTS.every((s) => subjects.includes(s)),
    [subjects]
  );

  const toggleAllSubjects = () => {
    if (isAllSubjectsSelected) {
      setSubjects(subjects.filter((s) => !CORE_SUBJECTS.includes(s)));
    } else {
      const combined = Array.from(new Set([...subjects, ...CORE_SUBJECTS]));
      setSubjects(combined);
    }
  };

  const selectRecommendedSubjects = () => {
    const combined = Array.from(new Set([...subjects, ...Array.from(recommendedSubjects)]));
    setSubjects(combined);
  };

  const handleAddCustomSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = customSubjectInput.trim();
    if (!val) return;
    if (!subjects.includes(val)) {
      setSubjects([...subjects, val]);
    }
    setCustomSubjectInput("");
    setShowCustomSubject(false);
  };

  const removeCustomSubject = (sub: string) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const customGrades = useMemo(() => {
    return gradeLevels.filter((g) => !allStandardGradeIds.includes(g as any));
  }, [gradeLevels, allStandardGradeIds]);

  const customSubjects = useMemo(() => {
    return subjects.filter((s) => !CORE_SUBJECTS.includes(s));
  }, [subjects]);

  const hasSpecificGradeSelection =
    gradeLevels.length > 0 && !isAllGradesSelected && gradeLevels.length < STANDARD_GRADES.length;

  const recommendedCore = useMemo(() => {
    return CORE_SUBJECTS.filter((s) => recommendedSubjects.has(s));
  }, [recommendedSubjects]);

  const otherCore = useMemo(() => {
    return CORE_SUBJECTS.filter((s) => !recommendedSubjects.has(s));
  }, [recommendedSubjects]);

  const handleLocationSelect = (place: { name: string; lat: number; lng: number }) => {
    setAreaName(place.name);
    setLatitude(place.lat);
    setLongitude(place.lng);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (subjects.length === 0) next.subjects = "Select at least one subject";
    if (gradeLevels.length === 0) next.gradeLevels = "Select at least one grade";
    if (!bio.trim() || bio.trim().length < 20)
      next.bio = "Add a short bio (at least 20 characters)";
    if (!cvFile) next.cvFile = "Please upload your CV / Resume";
    if (!educationFile) next.educationFile = "Please upload your Education Certificate or Degree";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      subjects,
      gradeLevels,
      areaName: areaName || "Addis Ababa",
      latitude,
      longitude,
      travelKm: 5,         // set by admin, not tutor
      price: 400,          // set by admin/match, not shown here
      bio: bio.trim(),
      teachingMode,
      onlineOk: teachingMode !== "In-person",
      cvFile,
      educationFile,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* ── 1. Grade Levels (FIRST) ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <GraduationCap className="h-4 w-4 text-[#0096D6]" />
              Grade levels <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400">
              Select the grades you teach — subjects below will highlight relevant options
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAllGrades}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold transition ${
              isAllGradesSelected
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-gray-200 bg-white text-gray-700 hover:border-[#0096D6] hover:text-[#0096D6]"
            }`}
          >
            <Sparkles className="h-3 w-3 text-[#0096D6]" />
            {isAllGradesSelected ? "Deselect All Grades" : "Teach All Grades"}
          </button>
        </div>

        {/* Standard Grade Chips */}
        <div className="flex flex-wrap gap-2">
          {STANDARD_GRADES.map((g) => {
            const active = gradeLevels.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggle(gradeLevels, g.id, setGradeLevels)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                  active
                    ? "border-[#0096D6] bg-[#0096D6] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                }`}
              >
                {active && <Check className="h-3 w-3" />}
                {g.label}
              </button>
            );
          })}

          {/* Custom Grades */}
          {customGrades.map((cg) => (
            <span
              key={cg}
              className="flex items-center gap-1.5 rounded-full border border-blue-400 bg-blue-50 text-blue-900 px-3 py-1 text-xs font-bold shadow-2xs"
            >
              <span>{cg}</span>
              <button
                type="button"
                onClick={() => removeCustomGrade(cg)}
                className="hover:text-red-600 rounded-full"
                title="Remove custom grade"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {/* + Other Grade Button */}
          {!showCustomGrade && (
            <button
              type="button"
              onClick={() => setShowCustomGrade(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-gray-50/80 px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-[#0096D6] hover:bg-white hover:text-[#0096D6] transition"
            >
              <Plus className="h-3 w-3" />
              <span>Other Grade</span>
            </button>
          )}
        </div>

        {/* Inline input for custom grade */}
        {showCustomGrade && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              value={customGradeInput}
              onChange={(e) => setCustomGradeInput(e.target.value)}
              placeholder="e.g. Preschool, SAT Prep, IGCSE..."
              autoFocus
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#0096D6] focus:ring-1 focus:ring-[#0096D6] w-64"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomGrade();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomGrade}
              className="rounded-lg bg-[#0096D6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomGrade(false);
                setCustomGradeInput("");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              Cancel
            </button>
          </div>
        )}

        {errors.gradeLevels && <p className="mt-1 text-xs text-red-500">{errors.gradeLevels}</p>}
      </div>

      {/* ── 2. Subjects (SECOND, based on selected grades) ── */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
              <BookOpen className="h-4 w-4 text-[#0096D6]" />
              Subjects you teach <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400">
              {hasSpecificGradeSelection
                ? "Recommendations highlighted for your selected grades"
                : "Select the subjects you specialize in"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasSpecificGradeSelection && (
              <button
                type="button"
                onClick={selectRecommendedSubjects}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0096D6] hover:bg-blue-100 transition"
              >
                <span>🎯 Select Recommended</span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleAllSubjects}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold transition ${
                isAllSubjectsSelected
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[#0096D6] hover:text-[#0096D6]"
              }`}
            >
              <Sparkles className="h-3 w-3 text-[#0096D6]" />
              {isAllSubjectsSelected ? "Deselect All Subjects" : "Teach All Subjects"}
            </button>
          </div>
        </div>

        {/* If a specific grade subset is chosen, divide into Recommended & Additional */}
        {hasSpecificGradeSelection ? (
          <div className="space-y-3">
            {/* Recommended Group */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#0096D6] flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Recommended for your grades:
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendedCore.map((s) => {
                  const active = subjects.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle(subjects, s, setSubjects)}
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                        active
                          ? "border-[#0096D6] bg-[#0096D6] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Subjects */}
            {otherCore.length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Additional / Other Grade Subjects:
                </p>
                <div className="flex flex-wrap gap-2">
                  {otherCore.map((s) => {
                    const active = subjects.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(subjects, s, setSubjects)}
                        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                          active
                            ? "border-[#0096D6] bg-[#0096D6] text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Normal Unified List of Core Subjects */
          <div className="flex flex-wrap gap-2">
            {CORE_SUBJECTS.map((s) => {
              const active = subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(subjects, s, setSubjects)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                    active
                      ? "border-[#0096D6] bg-[#0096D6] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {active && <Check className="h-3 w-3" />}
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Subjects Chips & + Other Subject Button */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {customSubjects.map((cs) => (
            <span
              key={cs}
              className="flex items-center gap-1.5 rounded-full border border-blue-400 bg-blue-50 text-blue-900 px-3 py-1 text-xs font-bold shadow-2xs"
            >
              <span>{cs}</span>
              <button
                type="button"
                onClick={() => removeCustomSubject(cs)}
                className="hover:text-red-600 rounded-full"
                title="Remove custom subject"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {!showCustomSubject && (
            <button
              type="button"
              onClick={() => setShowCustomSubject(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-gray-300 bg-gray-50/80 px-3 py-1.5 text-xs font-bold text-gray-600 hover:border-[#0096D6] hover:bg-white hover:text-[#0096D6] transition"
            >
              <Plus className="h-3 w-3" />
              <span>Other Subject</span>
            </button>
          )}
        </div>

        {/* Inline input for custom subject */}
        {showCustomSubject && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              value={customSubjectInput}
              onChange={(e) => setCustomSubjectInput(e.target.value)}
              placeholder="e.g. Economics, Civics, Music, Art, SAT..."
              autoFocus
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-[#0096D6] focus:ring-1 focus:ring-[#0096D6] w-64"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomSubject();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomSubject}
              className="rounded-lg bg-[#0096D6] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#007FB8]"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomSubject(false);
                setCustomSubjectInput("");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              Cancel
            </button>
          </div>
        )}

        {errors.subjects && <p className="mt-1 text-xs text-red-500">{errors.subjects}</p>}
      </div>

      {/* ── Teaching Mode ── */}
      <div>
        <label className="mb-2 block text-sm font-bold text-[#2D2A32]">Teaching Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {(["In-person", "Online", "Both"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTeachingMode(m)}
              className={`rounded-xl border py-2.5 text-center text-xs font-bold transition ${
                teachingMode === m
                  ? "border-[#0096D6] bg-[#0096D6] text-white shadow-sm"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
              }`}
            >
              {m === "In-person" ? "🏠 In-person" : m === "Online" ? "💻 Online" : "✨ Both"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Location search ── */}
      <div>
        <label className="mb-1.5 block text-sm font-bold text-[#2D2A32]">
          Your Location
          <span className="ml-2 text-xs font-normal text-gray-400">
            — helps families find you nearby
          </span>
        </label>
        <PlaceSearch onSelect={handleLocationSelect} />
      </div>

      {/* ── Documents ── */}
      <div className="space-y-3">
        <FileUploadButton
          label="CV / Resume *"
          hint="Upload your CV — PDF, Word, or image · max 10 MB"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          value={cvFile}
          onChange={setCvFile}
          error={errors.cvFile}
        />
        <FileUploadButton
          label="Education Certificate / Degree *"
          hint="University degree or diploma — PDF or image · max 10 MB"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          value={educationFile}
          onChange={setEducationFile}
          error={errors.educationFile}
        />
      </div>

      {/* ── Bio ── */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
          <BookOpen className="h-4 w-4 text-[#0096D6]" />
          About you <span className="text-red-500">*</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          placeholder="Describe your experience, teaching style, and what makes you a great tutor for families…"
          className={`w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0096D6] focus:ring-2 focus:ring-[#0096D6]/20 ${
            errors.bio ? "border-red-400" : "border-gray-300"
          }`}
        />
        <p className="mt-1 text-xs text-gray-400">{bio.length} characters (min 20)</p>
        {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-[#0096D6] py-3.5 text-sm font-black text-white shadow-md shadow-[#0096D6]/20 transition hover:bg-[#007FB8] disabled:opacity-60"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </span>
          ) : (
            "Submit for Review →"
          )}
        </button>
      </div>
    </form>
  );
}