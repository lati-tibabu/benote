import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { setWorkspace } from "@redux/slices/workspaceSlice";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";

const WorkspaceOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const dispatch = useDispatch();
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const workspace = useSelector((state) => state.workspace.workspace);

  const [userActivityData, setUserActivityData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiKey = localStorage.getItem("geminiApiKey");
  const selectedModel = localStorage.getItem("geminiModel") || import.meta.env.VITE_DEFAULT_GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: selectedModel });

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

  // const generateWorkspaceSummary = async (activityData) => {
  //   setLoading(true);
  //   try {
  //     const chatSession = model.startChat({
  //       generationConfig: {
  //         temperature: 0.3,
  //         topP: 0.95,
  //         topK: 40,
  //         maxOutputTokens: 8192,
  //       },
  //       history: [
  //         {
  //           role: "user",
  //           parts: [
  //             {
  //               text: JSON.stringify(activityData),
  //             },
  //           ],
  //         },
  //       ],
  //     });

  //     const result = await chatSession.sendMessage(
  //       "Generate a workspace summary."
  //     );
  //     setAiSummary(result.response.text());
  //   } catch (error) {
  //     console.error("Error generating AI summary:", error);
  //     toast.error("Failed to generate workspace summary.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (workspaceId) getWorkspaceDetails(workspaceId);
  }, [workspaceId]);

  useEffect(() => {
    if (workspace?.id) {
      navigate("overview");
    }
  }, [workspace]);

  // useEffect(() => {
  //   if (workspaceId) {
  //     handleLoadUserActivityData();
  //   }
  // }, [workspaceId]);

  // useEffect(() => {
  //   if (userActivityData) {
  //     generateWorkspaceSummary(userActivityData);
  //   }
  // }, [userActivityData]);

  return (
    <div className="h-full flex flex-col justify-between rounded-sm shadow-sm">
      <div className="grow flex flex-col">
        <div className="grow w-full">
          <Outlet />
        </div>
        {/* {loading ? (
          <div className="flex items-center justify-center mt-4">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : (
          aiSummary && (
            <div className="p-4 bg-gray-100 rounded-sm shadow-sm mt-4">
              <h2 className="text-lg font-bold mb-2">Workspace Summary</h2>
              <MarkdownRenderer content={aiSummary} />
            </div>
          )
        )} */}
      </div>
    </div>
  );
};

export default WorkspaceOpened;
