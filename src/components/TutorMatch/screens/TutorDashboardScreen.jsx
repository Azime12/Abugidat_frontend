import React, { useState } from "react";
import { toast } from "react-toastify";

export default function TutorDashboardScreen({
  tutorProfile,
  onManageSchedule,
  onEditProfile,
}) {
  const [requests, setRequests] = useState([
    {
      id: 1,
      studentName: "Bethel K.",
      details: "Math · Thu 4:00 PM",
      status: "pending",
    },
    {
      id: 2,
      studentName: "Yohannes G.",
      details: "Physics · Fri 6:00 PM",
      status: "pending",
    },
  ]);

  const [upcomingSessions, setUpcomingSessions] = useState([
    {
      id: 101,
      studentName: "Selam T.",
      details: "Wed 2:00 PM · Math",
      status: "Confirmed",
    },
  ]);

  const [stats, setStats] = useState({
    requestsCount: 2,
    thisWeekCount: 5,
    earnings: 4200,
  });

  const handleAcceptRequest = (req) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    setUpcomingSessions((prev) => [
      ...prev,
      {
        id: req.id,
        studentName: req.studentName,
        details: req.details,
        status: "Confirmed",
      },
    ]);
    setStats((prev) => ({
      ...prev,
      requestsCount: Math.max(0, prev.requestsCount - 1),
      thisWeekCount: prev.thisWeekCount + 1,
      earnings: prev.earnings + (Number(tutorProfile?.hourly_rate || tutorProfile?.hourlyRate) || 300),
    }));
    toast.success(`Accepted session with ${req.studentName}`);
  };

  const handleDeclineRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => ({
      ...prev,
      requestsCount: Math.max(0, prev.requestsCount - 1),
    }));
    toast.info("Session request declined");
  };

  const copyReferralCode = () => {
    const code = tutorProfile?.referral_code || "ABUGIDA-TUTOR";
    navigator.clipboard?.writeText(code);
    toast.success(`Referral code ${code} copied to clipboard!`);
  };

  const tutorDisplayName =
    tutorProfile?.name ||
    [tutorProfile?.first_name, tutorProfile?.last_name].filter(Boolean).join(" ") ||
    "Amara Bekele";

  return (
    <div className="tm-screen pb-6 animate-fadeIn" id="s-dash">
      {/* Header with Avatar & Edit button */}
      <div className="flex items-center justify-between mb-4 bg-white p-3.5 rounded-2xl border border-tm-border shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="tm-avatar !bg-tm-coral w-11 h-11 text-sm font-bold text-white shadow-xs">
            {tutorDisplayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-tm-navy truncate">
              {tutorDisplayName}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-tm-muted mt-0.5">
              <span className="tm-badge tm-badge-green text-[10px] py-0.5">
                <i className="ti ti-circle-check text-[10px]" /> Registered Tutor
              </span>
              <span>•</span>
              <span className="font-semibold text-tm-coral">
                {tutorProfile?.hourly_rate || tutorProfile?.hourlyRate || 300} ETB/hr
              </span>
            </div>
          </div>
        </div>

        {onEditProfile && (
          <button
            onClick={onEditProfile}
            className="p-2 rounded-xl text-tm-muted hover:text-tm-blue hover:bg-gray-50 border border-tm-border transition-colors text-xs font-medium flex items-center gap-1"
            title="Edit tutor registration"
          >
            <i className="ti ti-edit text-base" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {/* Referral & Invite Card */}
      <div className="tm-card shadow-2xs mb-3 bg-linear-to-r from-blue-50/70 to-indigo-50/70 border-blue-100 p-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <i className="ti ti-gift text-tm-blue text-lg" />
            <span className="text-xs font-bold text-tm-navy">Your Referral Code</span>
          </div>
          <span className="text-[11px] font-semibold text-tm-blue bg-white px-2 py-0.5 rounded-full border border-blue-200">
            {tutorProfile?.accumulated_invites_balance || 0} Invites
          </span>
        </div>
        <p className="text-[11px] text-tm-muted mb-2">
          Share your code with friends and groups to earn priority booking credits.
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white px-3 py-1.5 rounded-xl border border-blue-200 text-xs font-mono font-bold text-tm-navy truncate">
            {tutorProfile?.referral_code || "ABUGIDA7"}
          </div>
          <button
            onClick={copyReferralCode}
            className="px-3 py-1.5 bg-tm-blue text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <i className="ti ti-copy" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="tm-stat shadow-2xs">
          <div className="num text-tm-coral">{stats.requestsCount}</div>
          <div className="lbl">Requests</div>
        </div>
        <div className="tm-stat shadow-2xs">
          <div className="num text-tm-blue">{stats.thisWeekCount}</div>
          <div className="lbl">This week</div>
        </div>
        <div className="tm-stat shadow-2xs">
          <div className="num text-tm-green">{stats.earnings.toLocaleString()}</div>
          <div className="lbl">ETB earned</div>
        </div>
      </div>

      {/* New Requests Card */}
      <div className="tm-card shadow-2xs mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-tm-navy">New requests</h2>
          {requests.length > 0 && (
            <span className="tm-badge tm-badge-coral text-[10px]">
              {requests.length} Pending
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <p className="text-xs text-tm-muted py-3 italic text-center">
            No pending requests at the moment.
          </p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="tm-req-row">
              <div>
                <div className="text-[13px] font-semibold text-tm-navy">
                  {req.studentName}
                </div>
                <div className="text-xs text-tm-muted">{req.details}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  className="tm-btn tm-btn-secondary !w-auto !py-1 !px-2.5 !text-xs text-tm-muted hover:text-tm-danger"
                  onClick={() => handleDeclineRequest(req.id)}
                  title="Decline"
                >
                  Decline
                </button>
                <button
                  className="tm-btn tm-btn-primary !w-auto !py-1 !px-3.5 !text-xs shadow-xs"
                  onClick={() => handleAcceptRequest(req)}
                >
                  Accept
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upcoming Sessions Card */}
      <div className="tm-card shadow-2xs mb-4">
        <h2 className="text-sm font-semibold text-tm-navy mb-2">
          Upcoming sessions
        </h2>
        {upcomingSessions.map((session) => (
          <div key={session.id} className="tm-req-row">
            <div>
              <div className="text-[13px] font-semibold text-tm-navy">
                {session.studentName}
              </div>
              <div className="text-xs text-tm-muted">{session.details}</div>
            </div>
            <span className="tm-badge tm-badge-green font-semibold">
              {session.status}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-2">
        <button
          className="tm-btn tm-btn-outline-blue shadow-2xs flex items-center justify-center gap-1.5 text-xs py-2.5"
          onClick={onManageSchedule}
        >
          <i className="ti ti-calendar-cog text-base" />
          <span>Schedule</span>
        </button>

        {onEditProfile && (
          <button
            className="tm-btn tm-btn-secondary shadow-2xs flex items-center justify-center gap-1.5 text-xs py-2.5 text-tm-navy"
            onClick={onEditProfile}
          >
            <i className="ti ti-user-check text-base" />
            <span>Profile Data</span>
          </button>
        )}
      </div>
    </div>
  );
}
