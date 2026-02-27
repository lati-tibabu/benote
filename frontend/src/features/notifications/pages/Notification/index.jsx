import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineBell,
  AiOutlineCheck,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineCloseCircle,
  AiOutlineFilter,
} from "react-icons/ai";

const Notifications = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((item) => !item.is_read);
    }
    if (activeFilter === "invitation") {
      return notifications.filter((item) => item.type === "invitation");
    }
    return notifications;
  }, [notifications, activeFilter]);

  const formatRelativeTime = (input) => {
    if (!input) return "Unknown time";
    const value = new Date(input).getTime();
    if (Number.isNaN(value)) return "Unknown time";
    const diffMinutes = Math.floor((Date.now() - value) / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(input).toLocaleDateString();
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiURL}/api/notifications?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: header,
        }
      );
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data.notifications || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${apiURL}/api/notifications/read-all`, {
        method: "PUT",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to mark all as read");

      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleAcceptInvitation = async (notification) => {
    const action = notification.action;
    try {
      const response = await fetch(
        `${apiURL}/api/teams/${action.team_id}/membership/invitation`,
        {
          method: "PUT",
          headers: header,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to accept invitation");
      }

      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
      navigate(action.route);
    } catch (error) {
      console.error("Error accepting invitation:", error.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <header className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <AiOutlineCheck />
            Mark all as read
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-2 py-1">
            <AiOutlineFilter className="text-gray-500" />
            <button
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                activeFilter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                activeFilter === "unread"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveFilter("unread")}
            >
              Unread
            </button>
            <button
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                activeFilter === "invitation"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveFilter("invitation")}
            >
              Invitations
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <AiOutlineBell size={24} />
          </div>
          <h2 className="mt-3 text-base font-semibold text-gray-900">
            No notifications to show
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Try switching your filter or check back later.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
                notification.is_read
                  ? "border-gray-200"
                  : "border-gray-300 ring-1 ring-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {notification.type || "general"}
                    </span>
                    {!notification.is_read && (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <AiOutlineClockCircle />
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {!notification.is_read && (
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <AiOutlineCheckCircle />
                    Mark as read
                  </button>
                )}
                {notification.type === "invitation" && (
                  <>
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      onClick={() => handleAcceptInvitation(notification)}
                    >
                      <AiOutlineCheckCircle /> Accept
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">
                      <AiOutlineCloseCircle /> Ignore
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
        <button
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page <span className="font-semibold text-gray-900">{page}</span> of{" "}
          <span className="font-semibold text-gray-900">{totalPages}</span>
        </span>
        <button
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Notifications;
