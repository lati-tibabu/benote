import React from "react";

function NotificationBanner({
  latestNotification,
  notificationPopping,
  setNotificationPopping,
  setLatestNotification,
}) {
  if (!notificationPopping || !latestNotification) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50 bg-gray-700 text-white px-6 py-4 rounded-sm shadow-sm flex items-center gap-4 animate-fade-in">
      <div className="flex-1">
        <strong>New Notification:</strong>{" "}
        {latestNotification.message ||
          latestNotification.title ||
          "You have a new notification."}
      </div>
      <button
        className="ml-2 px-2 py-1 rounded bg-gray-900 hover:bg-gray-800 text-xs"
        onClick={() => {
          setNotificationPopping(false);
          setLatestNotification(null);
        }}
        aria-label="Dismiss notification"
      >
        Dismiss
      </button>
    </div>
  );
}

export default NotificationBanner;
