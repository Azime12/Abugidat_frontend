import React, { useState } from "react";

export default function TutorOnboardingScreen({
  step = 1,
  onNextStep,
  onComplete,
  tutorProfile,
  setTutorProfile,
}) {
  const [localSubjects, setLocalSubjects] = useState(
    tutorProfile.subjects || ["Math", "Physics"]
  );
  const [localDays, setLocalDays] = useState(
    tutorProfile.availableDays || ["Mon", "Tue", "Thu", "Sat"]
  );
  const [fullName, setFullName] = useState(tutorProfile.name || "Amara Bekele");
  const [bio, setBio] = useState(
    tutorProfile.bio || "I love helping students build confidence in math."
  );
  const [hourlyRate, setHourlyRate] = useState(tutorProfile.hourlyRate || 300);
  const [startTime, setStartTime] = useState(tutorProfile.startTime || "9:00 AM");
  const [endTime, setEndTime] = useState(tutorProfile.endTime || "6:00 PM");

  const availableSubjects = [
    { name: "Math", icon: "ti-math-symbols" },
    { name: "English", icon: "ti-book-2" },
    { name: "Physics", icon: "ti-atom" },
    { name: "Chemistry", icon: "ti-flask" },
    { name: "Coding", icon: "ti-code" },
    { name: "Music", icon: "ti-music" },
    { name: "Biology", icon: "ti-dna" },
    { name: "Economics", icon: "ti-chart-line" },
  ];

  const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleSubject = (sub) => {
    if (localSubjects.includes(sub)) {
      setLocalSubjects(localSubjects.filter((s) => s !== sub));
    } else {
      setLocalSubjects([...localSubjects, sub]);
    }
  };

  const toggleDay = (day) => {
    if (localDays.includes(day)) {
      setLocalDays(localDays.filter((d) => d !== day));
    } else {
      setLocalDays([...localDays, day]);
    }
  };

  const handleStep1Continue = () => {
    setTutorProfile((prev) => ({
      ...prev,
      name: fullName,
      bio: bio,
    }));
    onNextStep(2);
  };

  const handleStep2Continue = () => {
    setTutorProfile((prev) => ({
      ...prev,
      subjects: localSubjects.length > 0 ? localSubjects : ["Math"],
      hourlyRate: Number(hourlyRate) || 300,
    }));
    onNextStep(3);
  };

  const handleStep3Continue = () => {
    setTutorProfile((prev) => ({
      ...prev,
      availableDays: localDays,
      startTime,
      endTime,
    }));
    onNextStep(4);
  };

  const handleSubmit = () => {
    onComplete();
  };

  const getInitials = (name) => {
    if (!name) return "AB";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="tm-screen flex flex-col justify-between" id={`s-onb-${step}`}>
      <div>
        {/* Progress Bar */}
        <div className="tm-progress">
          <div className="done" />
          <div className={step >= 2 ? "done" : ""} />
          <div className={step >= 3 ? "done" : ""} />
          <div className={step >= 4 ? "done" : ""} />
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-tm-navy mb-1">Tell us about you</h1>
            <p className="text-[13px] text-tm-muted mb-4">
              This appears on your public tutor profile.
            </p>

            <div className="flex items-center gap-3 mb-4">
              <div className="tm-avatar !bg-tm-blue w-[52px] h-[52px] text-xl shadow-sm">
                <i className="ti ti-camera" />
              </div>
              <button
                type="button"
                className="tm-btn tm-btn-secondary !w-auto flex-1 text-xs py-2.5 font-medium flex items-center justify-center gap-2"
                onClick={() => alert("Photo upload dialog opened")}
              >
                <i className="ti ti-upload text-sm" />
                Add photo
              </button>
            </div>

            <div className="mb-3">
              <label className="text-xs text-tm-muted block mb-1 font-medium">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amara Bekele"
                className="w-full px-3 py-2.5 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue transition-colors"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-tm-muted block mb-1 font-medium">
                Short bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I love helping students build confidence in math."
                className="w-full px-3 py-2.5 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Subjects & Rate */}
        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-tm-navy mb-1">What do you teach?</h1>
            <p className="text-[13px] text-tm-muted mb-4">
              Pick all subjects that apply.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {availableSubjects.map((sub) => {
                const isSelected = localSubjects.includes(sub.name);
                return (
                  <div
                    key={sub.name}
                    onClick={() => toggleSubject(sub.name)}
                    className={`tm-toggle-pill ${isSelected ? "selected" : ""}`}
                  >
                    <i className={`ti ${sub.icon}`} />
                    <span>{sub.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="mb-4">
              <label className="text-xs text-tm-muted block mb-1 font-medium">
                Hourly rate (ETB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="300"
                  className="w-full px-3 py-2.5 bg-white border border-tm-border rounded-xl text-[13px] text-tm-navy focus:outline-none focus:border-tm-blue transition-colors pl-9"
                />
                <span className="absolute left-3 top-2.5 text-xs text-tm-muted font-medium">
                  Br
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Availability */}
        {step === 3 && (
          <div>
            <h1 className="text-xl font-bold text-tm-navy mb-1">Set your availability</h1>
            <p className="text-[13px] text-tm-muted mb-4">
              You can always change this later in schedule settings.
            </p>

            <label className="text-xs text-tm-muted block mb-2 font-medium">
              Available days
            </label>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {daysList.map((d) => {
                const isSelected = localDays.includes(d);
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

            <label className="text-xs text-tm-muted block mb-1 font-medium">
              Typical hours
            </label>
            <div className="flex gap-2 mb-4">
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
          </div>
        )}

        {/* STEP 4: Review Profile */}
        {step === 4 && (
          <div>
            <h1 className="text-xl font-bold text-tm-navy mb-1">Review your profile</h1>
            <p className="text-[13px] text-tm-muted mb-4">
              Check your information before submitting for verification.
            </p>

            <div className="tm-card shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="tm-avatar !bg-tm-coral w-12 h-12 text-sm shadow-sm">
                  {getInitials(fullName)}
                </div>
                <div>
                  <div className="font-semibold text-tm-navy text-[15px]">
                    {fullName || "Amara Bekele"}
                  </div>
                  <div className="text-xs text-tm-muted">
                    {hourlyRate || 300} ETB/hr
                  </div>
                </div>
              </div>

              <p className="text-xs text-tm-navy/80 mb-3 italic">
                "{bio || "I love helping students build confidence in math."}"
              </p>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {localSubjects.map((s) => (
                  <span key={s} className="tm-badge tm-badge-green">
                    {s}
                  </span>
                ))}
              </div>

              <div className="text-[11px] text-tm-muted pt-2 border-t border-tm-border flex items-center justify-between">
                <span>Available: {localDays.join(", ")}</span>
                <span>{startTime} - {endTime}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button footer */}
      <div className="pt-4">
        {step === 1 && (
          <button className="tm-btn tm-btn-primary shadow-sm" onClick={handleStep1Continue}>
            Continue
          </button>
        )}
        {step === 2 && (
          <button className="tm-btn tm-btn-primary shadow-sm" onClick={handleStep2Continue}>
            Continue
          </button>
        )}
        {step === 3 && (
          <button className="tm-btn tm-btn-primary shadow-sm" onClick={handleStep3Continue}>
            Continue
          </button>
        )}
        {step === 4 && (
          <button className="tm-btn tm-btn-green shadow-sm flex items-center justify-center gap-2" onClick={handleSubmit}>
            <i className="ti ti-check text-lg" />
            Submit for review
          </button>
        )}
      </div>
    </div>
  );
}
