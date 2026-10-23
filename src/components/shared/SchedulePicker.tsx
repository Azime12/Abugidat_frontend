"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKENDS = ["Sat", "Sun"];
const ALL_DAYS = [...WEEKDAYS, ...WEEKENDS];

const TIME_SLOTS = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "Evening", label: "Evening" },
  { value: "Flexible", label: "Flexible" },
];

const SLOT_HINT: Record<string, string> = {
  Morning: "before 12 PM",
  Afternoon: "12–4 PM",
  Evening: "after 4 PM",
  Flexible: "any time",
};

function chipClass(active: boolean) {
  return `rounded-full border px-3 py-1.5 text-xs font-bold transition ${
    active
      ? "border-[#0096D6] bg-[#0096D6] text-white"
      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
  }`;
}

export function SchedulePicker({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    if (!value) return [...WEEKDAYS];
    const found = ALL_DAYS.filter((d) => value.toLowerCase().includes(d.toLowerCase()));
    return found.length ? found : [...WEEKDAYS];
  });

  const [timeSlot, setTimeSlot] = useState<string>(() => {
    if (!value) return "Evening";
    if (value.includes("Morning")) return "Morning";
    if (value.includes("Afternoon")) return "Afternoon";
    if (value.includes("Evening")) return "Evening";
    return "Flexible";
  });

  const emit = (days: string[], slot: string) => {
    const isWeekdays = WEEKDAYS.every((d) => days.includes(d)) && days.length === 5;
    const isWeekends = WEEKENDS.every((d) => days.includes(d)) && days.length === 2;
    const dayLabel = isWeekdays ? "Weekdays" : isWeekends ? "Weekends" : days.join(", ");
    onChange(`${dayLabel} · ${slot} (${SLOT_HINT[slot]})`);
  };

  const toggleDay = (d: string) => {
    const next = selectedDays.includes(d)
      ? selectedDays.filter((x) => x !== d)
      : [...selectedDays, d];
    setSelectedDays(next);
    emit(next, timeSlot);
  };

  const setShortcut = (days: string[]) => {
    setSelectedDays(days);
    emit(days, timeSlot);
  };

  const setSlot = (slot: string) => {
    setTimeSlot(slot);
    emit(selectedDays, slot);
  };

  const isWeekdays = WEEKDAYS.every((d) => selectedDays.includes(d)) && selectedDays.length === 5;
  const isWeekends = WEEKENDS.every((d) => selectedDays.includes(d)) && selectedDays.length === 2;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => setShortcut([...WEEKDAYS])} className={chipClass(isWeekdays)}>
          Weekdays
        </button>
        <button type="button" onClick={() => setShortcut([...WEEKENDS])} className={chipClass(isWeekends)}>
          Weekends
        </button>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        {ALL_DAYS.map((d) => (
          <button key={d} type="button" onClick={() => toggleDay(d)} className={chipClass(selectedDays.includes(d))}>
            {d}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TIME_SLOTS.map((t) => (
          <button key={t.value} type="button" onClick={() => setSlot(t.value)} className={chipClass(timeSlot === t.value)}>
            {t.label} <span className="opacity-60">· {SLOT_HINT[t.value]}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ScheduleFieldLabel() {
  return (
    <span className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[#2D2A32]">
      <Clock className="h-4 w-4 text-[#0096D6]" />
      Preferred schedule
    </span>
  );
}
