export function sendBrowserNotification(message, type = "info") {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification.");
    return;
  }

  const titleMap = {
    info: "📢 Info",
    warning: "⚠️ Warning",
    success: "✅ Success",
    error: "❌ Error",
  };

  const title = titleMap[type] || "🔔 Notification";

  const notify = () => {
    const notification = new Notification(title, {
      body: message,
      icon: "/favicon.ico", // Or use any icon depending on type
    });

    // Optional: add click handler
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  // Ask for permission if needed
  if (Notification.permission === "granted") {
    notify();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        notify();
      }
    });
  }
}
