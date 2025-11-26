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
            <FaBell className="text-yellow-500" /> Notifications
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-sm font-semibold">
              Coming Soon
            </span>
          </h1>
          <div className="flex flex-col items-center justify-center h-24 text-gray-400 italic">
            <FaBell className="text-4xl mb-2 text-yellow-400" />
            <span>🔔 Notifications will appear here soon.</span>
          </div>
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
          <div className="mt-8 p-8 bg-gradient-to-r from-gray-100 to-gray-50 rounded-sm shadow-sm flex flex-col items-center justify-center min-h-32">
            <h1 className="font-semibold text-2xl text-gray-800 mb-4 flex items-center gap-2">
              <FaHistory className="text-gray-400" /> Recent Activities
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-sm font-semibold">
                Coming Soon
              </span>
            </h1>
            <div className="flex flex-col items-center text-gray-400 italic">
              <FaHistory className="text-4xl mb-2 text-gray-300" />
              <span>🕒 Activity feed will be available soon.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
