import React from "react";

export default function BottomNav({ activeScreen, onNavigate, role = "student" }) {
  const isHome = activeScreen === "s-browse" || activeScreen === "s-dash";
  const isChat = activeScreen === "s-chat";
  const isAlerts = activeScreen === "s-notif";
  const isProfile = activeScreen === "s-role";

  return (
    <div className="tm-bottomnav select-none shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div
        className={`tm-navitem ${isHome ? "active" : ""}`}
        onClick={() => onNavigate(role === "student" ? "s-browse" : "s-dash")}
      >
        <i className="ti ti-home" />
        <span>Home</span>
      </div>

      <div
        className={`tm-navitem ${isChat ? "active" : ""}`}
        onClick={() => onNavigate("s-chat")}
      >
        <i className="ti ti-message-circle" />
        <span>Chat</span>
      </div>

      <div
        className={`tm-navitem ${isAlerts ? "active" : ""}`}
        onClick={() => onNavigate("s-notif")}
      >
        <i className="ti ti-bell" />
        <span>Alerts</span>
      </div>

      <div
        className={`tm-navitem ${isProfile ? "active" : ""}`}
        onClick={() => onNavigate("s-role")}
      >
        <i className="ti ti-user" />
        <span>Profile</span>
      </div>
    </div>
  );
}
