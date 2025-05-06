import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };
  const userData = useSelector((state) => state.auth.user) || {};

  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5); // You can make this adjustable if needed
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/notifications?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: header,
        }
      );
      const data = await response.json();
      setNotifications(data.notifications);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleAcceptInvitation = async (action) => {
    navigate(action.route);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="collapse collapse-arrow border-1"
          >
            <input type="radio" name="my-accordion-2" />
            <div className="collapse-title font-medium">
              <div className="flex justify-between">
                <p>{notification.message}</p>
                <p className="text-xs text-gray-600">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {notification.type === "invitation" && (
              <div className="collapse-content">
                <div className="flex gap-4">
                  <button
                    className="btn btn-outline btn-sm btn-success"
                    onClick={() => handleAcceptInvitation(notification.action)}
                  >
                    Accept
                  </button>
                  <button className="btn btn-outline btn-sm btn-error">
                    Decline
                  </button>
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="badge badge-accent badge-outline">
                {notification.type}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          className="btn btn-sm btn-outline"
          onClick={handlePrev}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="self-center">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline"
          onClick={handleNext}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Notifications;
