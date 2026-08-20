import React from "react";

export default function RoleSelectionScreen({ role, onPickRole, onContinue }) {
  return (
    <div className="tm-screen flex flex-col justify-between" id="s-role">
      <div>
        <h1 className="text-xl font-bold text-tm-navy mb-1 tracking-tight">
          Welcome to TutorMatch
        </h1>
        <p className="text-[13px] text-tm-muted mb-6 leading-relaxed">
          Find the right tutor, or start teaching students today.
        </p>

        <div className="flex gap-3 mb-6">
          {/* Student Card */}
          <div
            className={`tm-role-card ${role === "student" ? "selected" : ""}`}
            onClick={() => onPickRole("student")}
          >
            <div className="tm-roleicon shadow-sm">
              <i className="ti ti-backpack text-2xl" />
            </div>
            <div className="font-semibold text-tm-navy text-[15px]">
              I'm a student
            </div>
            <div className="text-xs text-tm-muted mt-1">
              Find a tutor
            </div>
          </div>

          {/* Tutor Card */}
          <div
            className={`tm-role-card ${role === "tutor" ? "selected" : ""}`}
            onClick={() => onPickRole("tutor")}
          >
            <div className="tm-roleicon !bg-tm-coral shadow-sm">
              <i className="ti ti-school text-2xl" />
            </div>
            <div className="font-semibold text-tm-navy text-[15px]">
              I'm a tutor
            </div>
            <div className="text-xs text-tm-muted mt-1">
              Start teaching
            </div>
          </div>
        </div>

        <div className="tm-card p-3.5 bg-white/70 backdrop-blur-sm border border-tm-border text-xs text-tm-muted leading-relaxed">
          <div className="flex items-center gap-2 mb-1 font-medium text-tm-navy">
            <i className="ti ti-shield-check text-tm-green text-base" />
            <span>Verified & Safe Matching</span>
          </div>
          All tutors are verified with background checks. Sessions can be held online or in-person with escrow payment protection.
        </div>
      </div>

      <div className="pt-4">
        <button className="tm-btn tm-btn-primary shadow-sm" onClick={onContinue}>
          Continue as {role === "student" ? "Student" : "Tutor"}
        </button>
      </div>
    </div>
  );
}
