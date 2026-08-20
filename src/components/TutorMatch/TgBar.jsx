import React from "react";
import TelegramInitDataInspector from "../shared/TelegramInitDataInspector";

export default function TgBar({ title = "TutorMatch", onBack, onShowNotif, unreadCount = 1, canGoBack = true }) {
  return (
    <div className="tg-bar select-none flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {canGoBack ? (
          <i
            className="ti ti-arrow-left text-xl cursor-pointer hover:opacity-80 transition-opacity p-1 -ml-1 flex-shrink-0"
            onClick={onBack}
            title="Go back"
          />
        ) : (
          <i className="ti ti-school text-xl flex-shrink-0" />
        )}
        <span className="font-semibold text-[15px] truncate">{title}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <TelegramInitDataInspector />
        <span
          className="bell relative cursor-pointer p-1 hover:opacity-80 transition-opacity"
          onClick={onShowNotif}
          title="Notifications"
        >
          <i className="ti ti-bell text-xl" />
          {unreadCount > 0 && <span className="dot animate-pulse" />}
        </span>
      </div>
    </div>
  );
}
