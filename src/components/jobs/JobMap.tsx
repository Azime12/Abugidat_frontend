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
import { Briefcase, MapPin, Clock, Banknote, Navigation } from "lucide-react";
import { getMapLocationUrl, getDirectionsUrl } from "@/lib/map-utils";
import { isValidLatLng } from "@/components/tutors/TutorMap";

function JobMapController({
  points,
  userLocation,
  selectedPoint,
}: {
  points: any[];
  userLocation?: [number, number];
  selectedPoint?: any | null;
}) {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (isValidLatLng(userLocation)) {
      map.flyTo(userLocation, 14, { duration: 1.2 });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (
      selectedPoint &&
      isValidLatLng([Number(selectedPoint.latitude), Number(selectedPoint.longitude)])
    ) {
      map.flyTo(
        [Number(selectedPoint.latitude), Number(selectedPoint.longitude)],
        Math.max(map.getZoom(), 14),
        { duration: 0.8 }
      );
    }
  }, [selectedPoint, map]);

  useEffect(() => {
    if (hasInitialized.current || points.length === 0) return;
    if (isValidLatLng(userLocation)) return;

    const valid = points.filter((p) =>
      p && isValidLatLng([Number(p.latitude), Number(p.longitude)])
    );
    if (valid.length === 0) return;

    if (valid.length === 1) {
      map.setView([Number(valid[0].latitude), Number(valid[0].longitude)], 13);
    } else {
      const bounds = L.latLngBounds(valid.map((p) => [Number(p.latitude), Number(p.longitude)]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
    hasInitialized.current = true;
  }, [points, userLocation, map]);

  return null;
}

const createJobPinIcon = (job: any, isSelected: boolean) => {
  const shortLocation = (job.location || "Addis").split(",")[0].trim();
  const rateText = job.hourly_salary ? `${Math.round(Number(job.hourly_salary))} ETB` : "Job";

  return L.divIcon({
    className: "tutor-marker-container",
    html: `
      <div class="job-icon-pin ${isSelected ? "selected" : ""}">
        <div class="job-pin-head">
          <span>💼</span>
        </div>
        <div class="job-pin-tail"></div>
        <span class="job-pin-chip">${shortLocation} · ${rateText}</span>
      </div>
    `,
    iconSize: [88, 54],
    iconAnchor: [44, 38],
    popupAnchor: [0, -38],
  });
};

export interface JobMapProps {
  jobs: any[];
  userLocation?: [number, number];
  selectedJobId?: number | null;
  onApply?: (job: any) => void;
  className?: string;
  heightClass?: string;
}

export function JobMap({
  jobs = [],
  userLocation,
  selectedJobId,
  onApply,
  className = "",
  heightClass = "h-[560px]",
}: JobMapProps) {
  const validJobs = useMemo(() => {
    return jobs.filter((j) =>
      j && isValidLatLng([Number(j.latitude), Number(j.longitude)])
    );
  }, [jobs]);

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return validJobs.find((j) => Number(j.id) === Number(selectedJobId)) || null;
  }, [selectedJobId, validJobs]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm ${heightClass} ${className}`}>
      <MapContainer
        center={isValidLatLng(userLocation) ? userLocation : [9.02, 38.76]}
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

        <JobMapController
          points={validJobs}
          userLocation={userLocation}
          selectedPoint={selectedJob}
        />

        {validJobs.map((job) => {
          const isSelected = selectedJobId && Number(job.id) === Number(selectedJobId);
          const icon = createJobPinIcon(job, !!isSelected);
          const mapUrl = getMapLocationUrl({
            lat: job.latitude,
            lng: job.longitude,
            locationName: job.location,
          });

          return (
            <Marker
              key={job.id}
              position={[Number(job.latitude), Number(job.longitude)]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[240px] p-1 text-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {job.student_level || "Student"}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {job.hourly_salary ? `${Math.round(Number(job.hourly_salary))} ብር/hr` : "Negotiable"}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    <h4 className="font-bold text-[#2D2A32] text-sm">
                      {job.subjects}
                    </h4>

                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {job.location}
                      </span>
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#0096D6] hover:underline"
                        title="View road on Google Maps"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Road ↗</span>
                      </a>
                    </div>

                    {job.schedule && (
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {job.schedule}
                      </p>
                    )}
                  </div>

                  {onApply && (
                    <button
                      type="button"
                      onClick={() => onApply(job)}
                      className="mt-3 w-full rounded-xl bg-emerald-600 py-2 text-center text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      Apply for this job
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
