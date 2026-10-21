import { Link } from "@/i18n/routing";
import { Star, MapPin, BadgeCheck, Globe, Navigation } from "lucide-react";
import type { Tutor } from "@/types/tutor";
import { getMapLocationUrl } from "@/lib/map-utils";

export function TutorCard({
  tutor,
  isSelected,
  onMouseEnter,
}: {
  tutor: Tutor;
  isSelected?: boolean;
  onMouseEnter?: () => void;
}) {
  const initials = tutor.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div
      id={`tutor-card-${tutor.id}`}
      onMouseEnter={onMouseEnter}
      className={`group rounded-2xl border bg-white p-5 transition duration-200 ${
        isSelected
          ? "border-[#0096D6] ring-2 ring-[#0096D6]/30 shadow-lg"
          : "border-gray-200 hover:border-[#0096D6] hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#E8F4F8]">
          {tutor.photoUrl ? (
            <img src={tutor.photoUrl} alt={tutor.fullName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#0096D6]">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate text-base font-bold text-[#2D2A32]">
                  {tutor.fullName}
                </h3>
                {tutor.verified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-[#0096D6]" />
                )}
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                {tutor.subjects.join(" · ")}
              </p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            {tutor.ratingAvg !== undefined && (
              <span className="flex items-center gap-1 text-gray-700">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{tutor.ratingAvg.toFixed(1)}</span>
                {tutor.ratingCount && (
                  <span className="text-gray-400">({tutor.ratingCount})</span>
                )}
              </span>
            )}
            <span className="font-bold text-[#0096D6]">{tutor.price} ብር</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {tutor.areaName}
              {tutor.distanceBand && ` · ${tutor.distanceBand}`}
            </span>
            <a
              href={getMapLocationUrl({ lat: tutor.lat, lng: tutor.lng, locationName: tutor.areaName })}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-[#E8F4F8] px-1.5 py-0.5 text-[11px] font-bold text-[#006A9B] hover:bg-[#d0eaf5] transition"
              title="View road and exact location coordinates"
              onClick={(e) => e.stopPropagation()}
            >
              <Navigation className="h-2.5 w-2.5 text-[#0096D6]" />
              <span>Road ↗</span>
            </a>
            {tutor.onlineOk && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-bold text-green-700">
                <Globe className="h-3 w-3" />
                Online
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tutor.gradeLevels.map((grade) => (
          <span
            key={grade}
            className="rounded-full bg-[#E8F4F8] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#006A9B]"
          >
            Grade {grade}
          </span>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href={`/tutors/${tutor.id}`}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-xs font-bold text-gray-700 transition hover:bg-gray-50"
        >
          View profile
        </Link>
        <Link
          href={`/tutors/${tutor.id}/request`}
          className="flex-1 rounded-lg bg-[#0096D6] px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-[#007FB8]"
        >
          Request tutor
        </Link>
      </div>
    </div>
  );
}