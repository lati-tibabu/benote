export function sendBrowserNotification(message, type = "info") {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification.");
    return;
  }

  const titleMap = {
    info: "Info",
    warning: "Warning",
    success: "Success",
    error: "Error",
  };

  const title = titleMap[type] || "Notification";

  // Avoid prompting for permission automatically; only show when explicitly allowed.
  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    body: message,
    icon: "/favicon.ico",
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}
