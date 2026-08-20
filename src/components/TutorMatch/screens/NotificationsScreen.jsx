import React from "react";

export default function NotificationsScreen({ onBack, onNavigateScreen }) {
  const notifications = [
    {
      id: 1,
      icon: "ti-calendar-check",
      iconBg: "var(--green-light)",
      iconColor: "var(--green)",
      title: "Booking confirmed",
      text: "Your session with Amara is set for Wed, 2:00 PM",
      time: "10m ago",
      targetScreen: "s-chat",
    },
    {
      id: 2,
      icon: "ti-message-circle",
      iconBg: "var(--blue-light)",
      iconColor: "var(--blue)",
      title: "New message",
      text: "Amara sent you a message: 'Just bring your last physics test...'",
      time: "25m ago",
      targetScreen: "s-chat",
    },
    {
      id: 3,
      icon: "ti-star",
      iconBg: "var(--coral-light)",
      iconColor: "var(--coral)",
      title: "Leave a review",
      text: "How was your session with Daniel? Help other students by leaving feedback.",
      time: "2h ago",
      targetScreen: "s-profile",
    },
    {
      id: 4,
      icon: "ti-clock",
      iconBg: "var(--amber-light)",
      iconColor: "var(--amber)",
      title: "Session reminder",
      text: "Session with Amara starts in 1 hour. Get ready with your questions!",
      time: "5h ago",
      targetScreen: "s-chat",
    },
  ];

  return (
    <div className="tm-screen pb-4" id="s-notif">
      <div className="tm-backbar">
        <i className="ti ti-arrow-left" onClick={onBack} title="Back" />
        <span>Notifications</span>
      </div>

      <div className="tm-card shadow-sm divide-y divide-tm-border/60">
        {notifications.map((item) => (
          <div
            key={item.id}
            onClick={() => item.targetScreen && onNavigateScreen(item.targetScreen)}
            className="flex gap-3 py-3 cursor-pointer hover:bg-tm-cream/40 transition-colors -mx-3.5 px-3.5 first:pt-0 last:pb-0"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base shadow-2xs"
              style={{ backgroundColor: item.iconBg, color: item.iconColor }}
            >
              <i className={`ti ${item.icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-semibold text-tm-navy truncate">
                  {item.title}
                </div>
                <span className="text-[10px] text-tm-muted font-normal ml-2 flex-shrink-0">
                  {item.time}
                </span>
              </div>
              <div className="text-xs text-tm-muted mt-0.5 leading-snug">
                {item.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
