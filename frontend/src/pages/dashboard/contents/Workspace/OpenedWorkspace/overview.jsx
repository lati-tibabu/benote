import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import MarkdownRenderer from "../../../../../components/markdown-renderer";
import { setWorkspace } from "../../../../../redux/slices/workspaceSlice";

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
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      <div className="flex-1 p-6 bg-white rounded-lg border-2 border-gray-100">
        {/* summary */}
        {/* <div className="border-1 border-black p-2 rounded-md"> */}
        <div>
          <h1 className="font-bold text-2xl text-gray-800 mb-4">
            Workspace Summary
          </h1>
          <div className="flex flex-col gap-3 text-gray-600 rounded-md">
            <div className="flex items-start gap-2">
              {/* <h3 className="text-sm font-medium text-gray-700">Name:</h3> */}
              <p className="font-bold">{workspace.name}</p>
            </div>
            {workspace.description && (
              <div className="flex items-start gap-2 text-sm bg-blue-100 rounded-l overflow-hidden">
                <p className="border-l-4 border-blue-300 pl-3 py-2">
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
              // className="p-2 rounded-md bg-black text-white outline-none border-none hover:bg-gray-800"
              className="p-3 bg-black text-white rounded-md shadow-md hover:bg-gray-800 transition"
              onClick={() => handleCreateNewTask(workspace.id)}
            >
              Create New Task
            </button>
            {/* <button className="p-2 rounded-md btn-secondary bg-gray-200 text-gray-800 outline-none border-none hover:bg-gray-300"> */}
            <button className="p-3 bg-gray-200 text-gray-800 rounded-md border-2 border-gray-300 hover:bg-gray-300 transition">
              Invite User
            </button>
          </div>
          {/* <button></button> */}
        </div>
        {/* notifications */}
        <div className="mt-8">
          <h1 className="font-semibold text-2xl text-gray-800 mb-4">
            Notifications
          </h1>
          <div className="space-y-2 text-gray-600">
            <li>Task D deadline approachin</li>
            <li>New comment on Task E</li>
            <li>Invitation to join Team Beta</li>
          </div>
        </div>
      </div>
      {/* left side */}
      <div className="flex-2 p-6 bg-white rounded-lg border-2 border-gray-100">
        {/* <div className="p-2 rounded-lg border-2 border-gray-100 bg-gray-600 text-white"> */}
        <div>
          <strong>Total Tasks </strong>
          {workspace?.tasks.length}
        </div>
        <div className="flex-2">
          {/* tasks and deadline statuses and informations */}
          <div className="flex flex-wrap gap-2 justify-between p-2">
            <div className="grow flex flex-col items-center justify-between p-5 bg-blue-100 rounded-md shadow-md w-full sm:w-1/4">
              <div className="flex flex-col items-center">
                🚀
                <h1 className="font-bold text-lg text-blue-600 text-center">
                  Active Tasks
                </h1>
              </div>
              <span className="text-3xl font-bold text-blue-800">
                {workspace?.tasks?.filter((task) => task.status === "doing")
                  ?.length || 0}
              </span>
            </div>

            <div className="grow flex flex-col items-center justify-between p-5 bg-red-100 rounded-md shadow-md w-full sm:w-1/4">
              <div className="flex flex-col items-center">
                ⏳
                <h1 className="font-bold text-lg text-red-600 text-center">
                  Overdue Tasks
                </h1>
              </div>
              <span className="text-3xl font-bold text-red-800">
                {
                  workspace?.tasks.filter(
                    (task) =>
                      task.status != "done" &&
                      new Date(task.due_date).getTime() - Date.now() < 0
                  ).length
                }
              </span>
            </div>

            <div className="grow flex flex-col items-center justify-between p-5 bg-green-100 rounded-md shadow-md w-full sm:w-1/4">
              <div className="flex flex-col items-center">
                ✅
                <h1 className="font-bold text-lg text-green-600 text-center">
                  Completed Tasks
                </h1>
              </div>
              <span className="text-3xl font-bold text-green-800">
                {workspace?.tasks?.filter((task) => task.status === "done")
                  ?.length || 0}
              </span>
            </div>
          </div>
          {/* Recent Activities */}
          <div className="mt-8 p-5 bg-gray-100 rounded-md shadow-md">
            <h1 className="font-semibold text-2xl text-gray-800 mb-4">
              Recent Activities
            </h1>
            <ul className="space-y-2 text-gray-600">
              <li>User John updated Task A</li>
              <li>User Jane completed Task B</li>
              <li>Team Alpha uploaded a file</li>
              <li>Reminder: Task C is due tomorrow</li>
            </ul>
          </div>

          {/* AI SUmmary */}
          <div className="max-w-96 mx-auto mt-8 p-5 bg-gray-100 rounded-md shadow-md">
            {loading ? (
              <div className="flex items-center justify-center mt-4">
                <span className="loading loading-dots loading-lg"></span>
              </div>
            ) : (
              aiSummary && (
                <div className="p-4 bg-gray-100 rounded-md shadow-md mt-4">
                  <h2 className="text-lg font-bold mb-2">Workspace Summary</h2>
                  <MarkdownRenderer content={aiSummary} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
