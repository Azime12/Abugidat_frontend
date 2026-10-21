import { Check } from "lucide-react";
import type { TutorDetail } from "@/types/tutor";

export function TutorVerification({ tutor }: { tutor: TutorDetail }) {
  const v = tutor.verification;
  if (!v) return null;

  const items = [
    { done: v.idVerified, label: "ID verified (matched via video call)" },
    {
      done: v.qualificationsChecked,
      label: "Qualifications checked",
    },
    { done: v.referencesCalled, label: "2 references called" },
    { done: v.interviewCompleted, label: "Short interview completed" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#2D2A32]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-4 w-4" />
        </span>
        Verification
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 text-sm">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                item.done
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Check className="h-3 w-3" />
            </span>
            <span
              className={
                item.done ? "text-gray-700" : "text-gray-400 line-through"
              }
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}