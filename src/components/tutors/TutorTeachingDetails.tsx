import type { TutorDetail } from "@/types/tutor";

export function TutorTeachingDetails({ tutor }: { tutor: TutorDetail }) {
  const rows: { label: string; value: string }[] = [
    { label: "Subjects", value: (tutor.subjects ?? []).join(", ") },
    {
      label: "Grades",
      value: (tutor.gradeLevels ?? []).map((g) => `Grade ${g}`).join(", "),
    },
  ];

  // P7-8 — surface curriculum + skill categories on the public profile.
  if (tutor.curriculums && tutor.curriculums.length > 0) {
    rows.push({ label: "Curriculum", value: tutor.curriculums.join(", ") });
  }
  if (tutor.skillCategories && tutor.skillCategories.length > 0) {
    rows.push({ label: "Skills", value: tutor.skillCategories.join(", ") });
  }

  rows.push(
    {
      label: "Languages",
      value: (tutor.languages ?? ["Amharic", "English"]).join(", "),
    },
    {
      label: "Teaching mode",
      value: (tutor.modes ?? ["In-person"]).join(", "),
    }
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
      <h2 className="mb-5 text-lg font-bold text-[#2D2A32]">
        Teaching Details
      </h2>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <dt className="text-sm font-semibold text-gray-500">
              {row.label}
            </dt>
            <dd className="text-sm font-bold text-[#2D2A32]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
