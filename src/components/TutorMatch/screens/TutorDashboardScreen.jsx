import React, { useState } from "react";

export default function TutorDashboardScreen({
  tutorProfile,
  onManageSchedule,
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
      earnings: prev.earnings + (tutorProfile?.hourlyRate || 300),
    }));
  };

  const handleDeclineRequest = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setStats((prev) => ({
      ...prev,
      requestsCount: Math.max(0, prev.requestsCount - 1),
    }));
  };

  return (
    <div className="tm-screen pb-4" id="s-dash">
      <h1 className="text-xl font-bold text-tm-navy mb-1">
        Welcome back, {tutorProfile?.name?.split(" ")[0] || "Amara"}
      </h1>
      <p className="text-[13px] text-tm-muted mb-4">
        Here's what's happening with your students today.
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="tm-stat shadow-sm">
          <div className="num text-tm-coral">{stats.requestsCount}</div>
          <div className="lbl">Requests</div>
        </div>
        <div className="tm-stat shadow-sm">
          <div className="num text-tm-blue">{stats.thisWeekCount}</div>
          <div className="lbl">This week</div>
        </div>
        <div className="tm-stat shadow-sm">
          <div className="num text-tm-green">{stats.earnings.toLocaleString()}</div>
          <div className="lbl">ETB earned</div>
        </div>
      </div>

      {/* New Requests Card */}
      <div className="tm-card shadow-sm mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-tm-navy">New requests</h2>
          {requests.length > 0 && (
            <span className="tm-badge tm-badge-coral text-[10px]">
              {requests.length} Pending
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <p className="text-xs text-tm-muted py-2 italic text-center">
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
      <div className="tm-card shadow-sm mb-4">
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

      {/* Schedule Manager Trigger */}
      <button
        className="tm-btn tm-btn-outline-blue shadow-sm flex items-center justify-center gap-2"
        onClick={onManageSchedule}
      >
        <i className="ti ti-calendar-cog text-base" />
        <span>Manage schedule & availability</span>
      </button>
    </div>
  );
}
