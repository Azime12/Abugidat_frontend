"use client";

export type Role = "parent" | "tutor";

export function RoleToggle({
  role,
  onChange,
}: {
  role: Role;
  onChange: (r: Role) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
      <button
        onClick={() => onChange("parent")}
        type="button"
        className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
          role === "parent"
            ? "bg-[#0096D6] text-white"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        👨‍👩‍👧 For Parents
      </button>
      <button
        onClick={() => onChange("tutor")}
        type="button"
        className={`flex-1 rounded-xl py-3 text-sm font-bold transition ${
          role === "tutor"
            ? "bg-[#0096D6] text-white"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        🧑‍🏫 For Tutors
      </button>
    </div>
  );
}