// hooks/useRequestNotificationPermission.js
import { useEffect } from "react";

export function useRequestNotificationPermission() {
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);
}


// Optional button for manual request
export function AskNotificationPermissionButton() {
  const requestPermission = () => {
    if (!("Notification" in window)) {
      alert("Your browser does not support notifications.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Notifications enabled!", { body: "You'll now receive alerts." });
      }
    });
  };

  return (
    <button onClick={requestPermission}>
      Enable Notifications
    </button>
  );
}
