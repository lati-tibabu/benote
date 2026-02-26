import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";
import { setWorkspace } from "@redux/slices/workspaceSlice";
import {
  FaTasks,
  FaRocket,
  FaHourglassHalf,
  FaCheckCircle,
  FaHistory,
  FaBell,
} from "react-icons/fa";

const Overview = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [userActivityData, setUserActivityData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workspaceNotifications, setWorkspaceNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const apiKey = localStorage.getItem("geminiApiKey");
  const selectedModel = localStorage.getItem("geminiModel") || import.meta.env.VITE_DEFAULT_GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: selectedModel });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workspaceId } = useParams();

  const handleCreateNewTask = (id) => {
    navigate(`/app/workspace/open/${id}/tasks`, {
      state: { addTask: true, workspace: workspace },
    });
  };

  const workspace = useSelector((state) => state.workspace.workspace);

  const getWorkspaceDetails = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to fetch workspace");

      const data = await response.json();
      dispatch(setWorkspace(data));
    } catch (error) {
      console.error("Error fetching workspace:", error);
    }
  };

  const handleLoadUserActivityData = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/workspaces/data?workspaceId=${workspaceId}`,
        {
          headers: header,
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setUserActivityData(data);
      console.log("Workspace data: ", data);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const fetchWorkspaceNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await fetch(
        `${apiURL}/api/notifications/workspace/${workspaceId}?page=1&limit=12`,
        {
          headers: header,
        }
      );
      if (!response.ok) throw new Error("Failed to fetch workspace notifications");
      const data = await response.json();
      setWorkspaceNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error loading workspace notifications:", error);
      setWorkspaceNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const generateWorkspaceSummary = async (activityData) => {
    setLoading(true);
    try {
      const chatSession = model.startChat({
        generationConfig: {
          temperature: 0.3,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
        },
        history: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify(activityData),
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(
        "Generate a workspace summary. Make it short and concise. And it is just summary of the workspace activities. Do not include any other information. like id s and number"
      );
      setAiSummary(result.response.text());
    } catch (error) {
      console.error("Error generating AI summary:", error);
      toast.error("Failed to generate workspace summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) getWorkspaceDetails(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) {
      handleLoadUserActivityData();
      fetchWorkspaceNotifications();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (userActivityData) {
      generateWorkspaceSummary(userActivityData);
    }
  }, [userActivityData]);

  return Object.keys(workspace).length === 0 ? (
    <div className="flex flex-col gap-4 p-6 min-h-full">
      <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-6 w-3/4 bg-gray-300 rounded animate-pulse"></div>
    </div>
  ) : (
    <div className="sm:flex gap-2">
      {/* right side */}
      <div className="flex-1 p-6 bg-white rounded-sm border-2 border-gray-100">
        {/* summary */}
        {/* <div className="border-1 border-black p-2 rounded-sm"> */}
        <div>
          <h1 className="font-bold text-2xl text-gray-800 mb-4">
            Workspace Summary
          </h1>
          <div className="flex flex-col gap-3 text-gray-600 rounded-sm">
            <div className="flex items-start gap-2">
              {/* <h3 className="text-sm font-medium text-gray-700">Name:</h3> */}
              <p className="font-bold">{workspace.name}</p>
            </div>
            {workspace.description && (
              <div className="flex items-start gap-2 text-sm bg-gray-100 rounded-l overflow-hidden">
                <p className="border-l-4 border-gray-300 pl-3 py-2">
                  {workspace.description}
                </p>
              </div>
            )}
            <div className="flex items-start gap-2">
              {/* <h3 className="text-sm font-medium text-gray-700">Created At:</h3> */}
              <p className="font-bold">
                {new Date(workspace.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
        {/* quick actions */}
        <div className="mt-8">
          <h1 className="font-semibold text-2xl text-gray-800 mb-4">
            Quick Actions
          </h1>
          {/* buttons */}
          <div className="flex flex-col gap-2">
            <button
              className="p-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white rounded-sm shadow-sm hover:from-gray-700 hover:to-gray-700 transition font-semibold text-lg flex items-center justify-center gap-2"
              onClick={() => handleCreateNewTask(workspace.id)}
            >
              <FaTasks className="text-xl" /> <span>Create New Task</span>
            </button>
          </div>
        </div>
        {/* notifications */}
        <div className="mt-8">
          <h1 className="font-semibold text-2xl text-gray-800 mb-4 flex items-center gap-2">
            <FaBell className="text-yellow-500" /> Workspace Notifications
          </h1>
          {notificationsLoading ? (
            <div className="text-sm text-gray-500">Loading notifications...</div>
          ) : workspaceNotifications.length ? (
            <div className="space-y-2">
              {workspaceNotifications.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-sm border p-3 ${
                    item.is_read
                      ? "border-gray-200 bg-white"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <p className="text-sm text-gray-800">{item.message}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    {!item.is_read && (
                      <button
                        className="text-xs px-2 py-1 rounded-sm bg-white border border-gray-200 hover:bg-gray-50"
                        onClick={async () => {
                          try {
                            await fetch(`${apiURL}/api/notifications/${item.id}/read`, {
                              method: "PUT",
                              headers: header,
                            });
                            setWorkspaceNotifications((prev) =>
                              prev.map((n) =>
                                n.id === item.id ? { ...n, is_read: true } : n
                              )
                            );
                          } catch (err) {
                            console.error("Failed to mark notification as read:", err);
                          }
                        }}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                className="w-full p-2 text-sm rounded-sm border border-gray-200 bg-white hover:bg-gray-50"
                onClick={() => navigate("/app/notifications")}
              >
                View all notifications
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-gray-400 italic">
              <FaBell className="text-4xl mb-2 text-yellow-400" />
              <span>No notifications for this workspace yet.</span>
            </div>
          )}
        </div>
      </div>
      {/* left side */}
      <div className="flex-2 p-6 bg-white rounded-sm border-2 border-gray-100">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <FaTasks className="text-gray-500" />
            <strong className="text-lg text-gray-700">Total Tasks</strong>
            <span className="ml-2 text-2xl font-bold text-gray-700">
              {workspace?.tasks.length}
            </span>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
            <div className="flex flex-col items-center justify-between p-6 bg-gray-50 rounded-sm shadow hover:shadow-sm transition w-full">
              <div className="flex flex-col items-center">
                <FaRocket className="text-3xl text-gray-400 mb-1" />{" "}
                {/* <span className="text-2xl">🚀</span> */}
                <h1 className="font-bold text-lg text-gray-700 text-center">
                  Active Tasks
                </h1>
              </div>
              <span className="text-3xl font-bold text-gray-800 mt-2">
                {workspace?.tasks?.filter((task) => task.status === "doing")
                  ?.length || 0}
              </span>
            </div>
            <div className="flex flex-col items-center justify-between p-6 bg-red-50 rounded-sm shadow hover:shadow-sm transition w-full">
              <div className="flex flex-col items-center">
                <FaHourglassHalf className="text-3xl text-red-400 mb-1" />{" "}
                {/* <span className="text-2xl">⏳</span> */}
                <h1 className="font-bold text-lg text-red-700 text-center">
                  Overdue Tasks
                </h1>
              </div>
              <span className="text-3xl font-bold text-red-800 mt-2">
                {
                  workspace?.tasks.filter(
                    (task) =>
                      task.status != "done" &&
                      new Date(task.due_date).getTime() - Date.now() < 0
                  ).length
                }
              </span>
            </div>
            <div className="flex flex-col items-center justify-between p-6 bg-gray-50 rounded-sm shadow hover:shadow-sm transition w-full">
              <div className="flex flex-col items-center">
                <FaCheckCircle className="text-3xl text-gray-400 mb-1" />{" "}
                {/* <span className="text-2xl">✅</span> */}
                <h1 className="font-bold text-lg text-gray-700 text-center">
                  Completed Tasks
                </h1>
              </div>
              <span className="text-3xl font-bold text-gray-800 mt-2">
                {workspace?.tasks?.filter((task) => task.status === "done")
                  ?.length || 0}
              </span>
            </div>
          </div>
          {/* Recent Activities */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-100 to-gray-50 rounded-sm shadow-sm min-h-32">
            <h1 className="font-semibold text-2xl text-gray-800 mb-4 flex items-center gap-2">
              <FaHistory className="text-gray-400" /> Recent Activities
            </h1>
            {notificationsLoading ? (
              <div className="text-sm text-gray-500">Loading activity feed...</div>
            ) : workspaceNotifications.length ? (
              <div className="space-y-2">
                {workspaceNotifications.slice(0, 8).map((item) => {
                  const createdAt = new Date(item.createdAt);
                  const diffMs = Date.now() - createdAt.getTime();
                  const diffMinutes = Math.floor(diffMs / (1000 * 60));
                  const relativeTime =
                    diffMinutes < 1
                      ? "just now"
                      : diffMinutes < 60
                      ? `${diffMinutes}m ago`
                      : diffMinutes < 1440
                      ? `${Math.floor(diffMinutes / 60)}h ago`
                      : `${Math.floor(diffMinutes / 1440)}d ago`;

                  return (
                    <div
                      key={`activity-${item.id}`}
                      className="rounded-sm border border-gray-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-gray-800">{item.message}</p>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {relativeTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400 italic">
                <FaHistory className="text-4xl mb-2 text-gray-300" />
                <span>No recent activities yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
