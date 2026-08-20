import React from "react";

export default function TutorProfileScreen({
  tutor,
  onBack,
  onStartChat,
  onStartBooking,
}) {
  if (!tutor) return null;

  return (
    <div className="tm-screen pb-4" id="s-profile">
      <div className="tm-backbar">
        <i className="ti ti-arrow-left" onClick={onBack} title="Back to browse" />
        <span>Tutor profile</span>
      </div>

      {/* Header Info */}
      <div className="text-center mb-4">
        <div
          className="tm-avatar w-[72px] h-[72px] text-2xl mx-auto mb-2.5 shadow-md"
          style={{ backgroundColor: tutor.avatarBg || "var(--coral)" }}
        >
          {tutor.initials || "AB"}
        </div>
        <div className="font-bold text-lg text-tm-navy">{tutor.name}</div>
        <div className="text-[13px] text-tm-muted mt-0.5">
          {tutor.headline || `${tutor.subjects} tutor · 5 years experience`}
        </div>
        <div className="tm-stars justify-center mt-1.5">
          <i className="ti ti-star-filled text-xs text-tm-coral" />
          <span className="text-xs font-semibold text-tm-navy">{tutor.rating}</span>
          <span className="text-xs text-tm-muted">· {tutor.reviewsCount} reviews</span>
        </div>
      </div>

      {/* About Section */}
      <div className="tm-card shadow-sm">
        <h2 className="text-sm font-semibold text-tm-navy mb-1.5">About</h2>
        <p className="text-[13px] text-tm-navy leading-relaxed">
          {tutor.bio ||
            "I love helping students build confidence in math. I focus on making concepts click through real-world examples rather than memorization."}
        </p>
      </div>

      {/* Subjects Badges */}
      <div className="tm-card shadow-sm">
        <h2 className="text-sm font-semibold text-tm-navy mb-2">Subjects</h2>
        <div className="flex flex-wrap gap-1.5">
          {tutor.subjectList ? (
            tutor.subjectList.map((s) => (
              <span key={s} className="tm-badge tm-badge-green">
                {s}
              </span>
            ))
          ) : (
            tutor.subjects.split(",").map((s) => (
              <span key={s.trim()} className="tm-badge tm-badge-green">
                {s.trim()}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2.5 mb-4">
        <div className="tm-stat flex-1 shadow-sm">
          <div className="num text-tm-blue">{tutor.rate} ETB</div>
          <div className="lbl">Per hour</div>
        </div>
        <div className="tm-stat flex-1 shadow-sm">
          <div className="num text-tm-coral">{tutor.sessionsCount || "120+"}</div>
          <div className="lbl">Sessions taught</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <button
          className="tm-btn tm-btn-secondary flex-1 flex items-center justify-center gap-2 text-sm shadow-sm"
          onClick={onStartChat}
        >
          <i className="ti ti-message-circle text-base text-tm-blue" />
          <span>Message</span>
        </button>
        <button
          className="tm-btn tm-btn-primary flex-1 text-sm shadow-sm"
          onClick={onStartBooking}
        >
          Book session
        </button>
      </div>
    </div>
  );
}
