"use client";

import { Checkbox } from "@/components/ui/checkbox";
import type { GradeLevel, TutorSearchFilters } from "@/types/tutor";
import { useCurriculum } from "@/hooks/useCurriculum";

const DISTANCES = ["under 1 km", "1-3 km", "3-5 km", "5+ km"];

interface Props {
  filters: TutorSearchFilters;
  onChange: (next: TutorSearchFilters) => void;
  onReset: () => void;
}

export function TutorFilters({ filters, onChange, onReset }: Props) {
  const { data: curriculumConfig } = useCurriculum();
  const ethiopian = curriculumConfig?.curriculums?.find((c) => c.id === "et-national");
  const liveGrades = ethiopian?.grades?.map((g) => g.label).filter((g) => g !== "All Levels") ?? [];

  const toggleGrade = (grade: GradeLevel) => {
    const current = filters.gradeLevels ?? [];
    const next = current.includes(grade)
      ? current.filter((g) => g !== grade)
      : [...current, grade];
    onChange({ ...filters, gradeLevels: next });
  };

  const toggleDistance = (band: string) => {
    const current = filters.distanceBands ?? [];
    const next = current.includes(band)
      ? current.filter((b) => b !== band)
      : [...current, band];
    onChange({ ...filters, distanceBands: next });
  };

  return (
    <aside className="w-full space-y-6 rounded-2xl border border-gray-200 bg-white p-6 lg:w-full lg:shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2D2A32]">Filters</h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-[#0096D6] hover:underline"
          type="button"
        >
          Reset all
        </button>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Grade level
        </h4>
        <div className="space-y-2">
          {liveGrades.map((grade) => (
            <label key={grade} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={(filters.gradeLevels ?? []).includes(grade)}
                onCheckedChange={() => toggleGrade(grade)}
              />
              <span>{grade}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Price per lesson
        </h4>
        <input
          type="range"
          min={100}
          max={1000}
          step={50}
          value={filters.maxPrice ?? 1000}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: Number(e.target.value) })
          }
          className="w-full accent-[#0096D6]"
        />
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>{filters.minPrice ?? 100} ብር</span>
          <span>Up to {filters.maxPrice ?? 1000} ብር</span>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Rating
        </h4>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5].map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={filters.minRating === r}
                onCheckedChange={(checked) =>
                  onChange({ ...filters, minRating: checked ? r : undefined })
                }
              />
              <span>{r}+ ⭐</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
          Distance
        </h4>
        <div className="space-y-2">
          {DISTANCES.map((band) => (
            <label key={band} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={(filters.distanceBands ?? []).includes(band)}
                onCheckedChange={() => toggleDistance(band)}
              />
              <span className="capitalize">{band}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            checked={filters.onlineOnly ?? false}
            onCheckedChange={(checked) =>
              onChange({ ...filters, onlineOnly: !!checked })
            }
          />
          <span>Online lessons only</span>
        </label>
      </div>
    </aside>
  );
}