import React from "react";

export default function ConfirmationScreen({
  bookingDetails,
  onMessageTutor,
  onBackToBrowse,
}) {
  const tutorName = bookingDetails?.tutorName || "Amara Bekele";
  const day = bookingDetails?.day || "Wed 13";
  const slot = bookingDetails?.slot || "2:00 PM";
  const total = bookingDetails?.total || 315;

  return (
    <div className="tm-screen pb-4" id="s-confirm">
      <div className="text-center pt-8 pb-4">
        <div className="tm-roleicon !bg-tm-green w-16 h-16 text-3xl mx-auto shadow-md animate-bounce-ball">
          <i className="ti ti-check" />
        </div>
        <h1 className="text-xl font-bold text-tm-navy mt-4 mb-1">
          Booking confirmed!
        </h1>
        <p className="text-[13px] text-tm-muted">
          You're all set for {day} at {slot} with {tutorName}.
        </p>
      </div>

      {/* Receipt Card */}
      <div className="tm-card shadow-sm my-4">
        <div className="tm-req-row">
          <span className="text-[13px] text-tm-muted">Tutor</span>
          <span className="text-[13px] text-tm-navy font-semibold">
            {tutorName}
          </span>
        </div>
        <div className="tm-req-row">
          <span className="text-[13px] text-tm-muted">Scheduled time</span>
          <span className="text-[13px] text-tm-navy font-medium">
            {day} · {slot}
          </span>
        </div>
        <div className="tm-req-row">
          <span className="text-[13px] text-tm-muted">Payment status</span>
          <span className="tm-badge tm-badge-green font-semibold">
            Paid ({total} ETB)
          </span>
        </div>
      </div>

      <div className="space-y-2.5 pt-2">
        <button
          className="tm-btn tm-btn-outline-blue shadow-sm flex items-center justify-center gap-2 font-medium"
          onClick={onMessageTutor}
        >
          <i className="ti ti-message-circle text-base" />
          <span>Message your tutor</span>
        </button>
        <button
          className="tm-btn tm-btn-secondary shadow-sm"
          onClick={onBackToBrowse}
        >
          Back to browse
        </button>
      </div>
    </div>
  );
}
