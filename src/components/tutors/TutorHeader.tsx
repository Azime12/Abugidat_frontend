import { Link } from "@/i18n/routing";
import { Star, MapPin, BadgeCheck, Globe, MessageCircle } from "lucide-react";
import type { TutorDetail } from "@/types/tutor";

export function TutorHeader({ tutor }: { tutor: TutorDetail }) {
  const initials = tutor.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Photo */}
        <div className="mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#E8F4F8] md:mx-0 md:h-40 md:w-40">
          {tutor.photoUrl ? (
            <img
              src={tutor.photoUrl}
              alt={tutor.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-black text-[#0096D6]">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-[#2D2A32] md:text-3xl">
              {tutor.fullName}
            </h1>
            {tutor.verified && (
              <span className="flex items-center gap-1 rounded-full bg-[#E8F4F8] px-2.5 py-1 text-xs font-bold text-[#006A9B]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {tutor.subjects.join(" · ")}
          </p>

          {/* Rating row */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {tutor.ratingAvg !== undefined && (
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-[#2D2A32]">
                  {tutor.ratingAvg.toFixed(1)}
                </span>
                {tutor.ratingCount && (
                  <span className="text-gray-400">
                    ({tutor.ratingCount} reviews)
                  </span>
                )}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin className="h-4 w-4" />
              {tutor.areaName}
              {tutor.distanceBand && ` · ${tutor.distanceBand}`}
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0096D6]">
              {tutor.price}
            </span>
            <span className="text-sm font-semibold text-gray-500">
              ብር / lesson
            </span>
          </div>

          {/* Mode chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {tutor.modes?.map((mode) => (
              <span
                key={mode}
                className="flex items-center gap-1 rounded-full bg-[#E8F4F8] px-3 py-1 text-xs font-bold text-[#006A9B]"
              >
                {mode === "Online" && <Globe className="h-3 w-3" />}
                {mode}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/tutors/${tutor.id}/request`}
              className="rounded-lg bg-[#0096D6] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#007FB8]"
            >
              Request this tutor →
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              <MessageCircle className="h-4 w-4" />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}