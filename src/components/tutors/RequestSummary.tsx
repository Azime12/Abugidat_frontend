import { Star, MapPin, Shield } from "lucide-react";
import type { TutorDetail } from "@/types/tutor";

export function RequestSummary({
  tutor,
  gradeLevel,
}: {
  tutor: TutorDetail;
  gradeLevel: string;
}) {
  return (
    <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
        Summary
      </h3>

      {/* Tutor row */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#E8F4F8]">
          {tutor.photoUrl ? (
            <img
              src={tutor.photoUrl}
              alt={tutor.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bold text-[#0096D6]">
              {tutor.fullName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#2D2A32]">
            {tutor.fullName}
          </p>
          <p className="truncate text-xs text-gray-500">
            {tutor.subjects.join(" · ")}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 py-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Grade</span>
          <span className="font-bold text-[#2D2A32]">{gradeLevel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Location</span>
          <span className="font-bold text-[#2D2A32]">
            {tutor.areaName}
            {tutor.distanceBand && ` · ${tutor.distanceBand}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Price</span>
          <span className="font-bold text-[#2D2A32]">{tutor.price} ብር</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Fee</span>
          <span className="font-bold text-green-600">Free</span>
        </div>
      </div>

      {/* Privacy note */}
      <div className="rounded-lg bg-[#F0F9FF] p-3">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#0096D6]" />
          <p className="text-xs leading-relaxed text-gray-600">
            <span className="font-bold text-[#2D2A32]">Your privacy.</span> Exact
            location and phone are never shared publicly. Only {tutor.fullName.split(" ")[0]} sees them after accepting.
          </p>
        </div>
      </div>
    </div>
  );
}