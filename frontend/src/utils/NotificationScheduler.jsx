import { useEffect } from "react";

const NotificationScheduler = ({ children }) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const checkUpcomingDeadlines = async () => {
      // Only send notification requests if notifications are enabled in localStorage
      const notificationEnabled = localStorage.getItem("notificationEnabled");
      if (notificationEnabled === "false") return;
      try {
        const response = await fetch(`${apiURL}/api/tasks/check/deadlines`, {
          method: "POST",
          headers: header,
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("⛔ Server error:", errorData.message);
        }
      } catch (err) {
        console.error("⛔ Fetch failed:", err.message);
      }
    };

    const interval = setInterval(() => {
      checkUpcomingDeadlines();
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [apiURL, token]);

  return children;
};

export default NotificationScheduler;
