import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

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

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <button
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
          No notifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-xl p-4 bg-white transition-shadow ${
                notification.is_read
                  ? "border-gray-200"
                  : "border-blue-200 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md">
                      {notification.type}
                    </span>
                    {!notification.is_read && (
                      <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-md">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                {!notification.is_read && (
                  <button
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </button>
                )}
                {notification.type === "invitation" && (
                  <>
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                      onClick={() => handleAcceptInvitation(notification)}
                    >
                      <AiOutlineCheckCircle /> Accept
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">
                      <AiOutlineCloseCircle /> Ignore
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-6">
        <button
          className="btn btn-sm btn-outline"
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="self-center text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline"
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
