import React, { useState } from "react";

export default function ScheduleSettingsScreen({
  onBack,
  onSave,
  tutorProfile,
  setTutorProfile,
}) {
  const [selectedDays, setSelectedDays] = useState(
    tutorProfile?.availableDays || ["Mon", "Tue", "Thu", "Sat"]
  );
  const [startTime, setStartTime] = useState(
    tutorProfile?.startTime || "9:00 AM"
  );
  const [endTime, setEndTime] = useState(
    tutorProfile?.endTime || "6:00 PM"
  );
  const [sessionLength, setSessionLength] = useState("1 hour");
  const [isBlockedOff, setIsBlockedOff] = useState(false);

  const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSave = () => {
    if (setTutorProfile) {
      setTutorProfile((prev) => ({
        ...prev,
        availableDays: selectedDays,
        startTime,
        endTime,
      }));
    }
    onSave();
  };

  return (
    <div className="tm-screen flex flex-col justify-between" id="s-schedule">
      <div>
        <div className="tm-backbar">
          <i className="ti ti-arrow-left" onClick={onBack} title="Back to dashboard" />
          <span>Availability</span>
        </div>

        <p className="text-[13px] text-tm-muted mb-4">
          Students can only book sessions during your active available hours.
        </p>

        {/* Days selector */}
        <label className="text-xs text-tm-muted block mb-2 font-medium">
          Available days
        </label>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {daysList.map((d) => {
            const isSelected = selectedDays.includes(d);
            return (
              <div
                key={d}
                onClick={() => toggleDay(d)}
                className={`tm-toggle-pill !py-2 !px-0 flex-1 min-w-[42px] ${
                  isSelected ? "selected" : ""
                }`}
              >
                {d}
              </div>
            );
          })}
        </div>

        {/* Hours */}
        <div className="mb-4">
          <label className="text-xs text-tm-muted block mb-1 font-medium">
            Start time
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue"
          >
            <option>8:00 AM</option>
            <option>9:00 AM</option>
            <option>10:00 AM</option>
            <option>1:00 PM</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="text-xs text-tm-muted block mb-1 font-medium">
            End time
          </label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue"
          >
            <option>5:00 PM</option>
            <option>6:00 PM</option>
            <option>8:00 PM</option>
            <option>9:00 PM</option>
          </select>
        </div>

        {/* Extra schedule options */}
        <div className="tm-card shadow-sm mb-4">
          <div
            className="tm-req-row cursor-pointer"
            onClick={() => setIsBlockedOff(!isBlockedOff)}
          >
            <span className="text-[13px] text-tm-navy font-medium">
              Block time off (Vacation/Exams)
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-tm-muted">
                {isBlockedOff ? "Blocked" : "Active"}
              </span>
              <i className="ti ti-chevron-right text-tm-muted text-sm" />
            </div>
          </div>

          <div className="tm-req-row">
            <span className="text-[13px] text-tm-navy font-medium">
              Session length default
            </span>
            <span className="text-[13px] text-tm-muted">{sessionLength}</span>
          </div>
        </div>
      </div>

      <div className="pt-3">
        <button
          className="tm-btn tm-btn-primary shadow-sm"
          onClick={handleSave}
        >
          Save availability
        </button>
      </div>
    </div>
  );
}
