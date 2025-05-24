import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";

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
            className="border border-gray-300 rounded-lg shadow-md p-4 bg-white hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-800">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            {notification.type === "invitation" && (
              <div className="mt-3 flex gap-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors duration-300"
                  onClick={() => handleAcceptInvitation(notification.action)}
                >
                  <AiOutlineCheckCircle /> Accept
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-300">
                  <AiOutlineCloseCircle /> Decline
                </button>
              </div>
            )}
            <div className="mt-2">
              <span className="inline-block px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-full">
                {notification.type}
              </span>
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
