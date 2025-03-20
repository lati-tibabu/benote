import React, { useEffect, useState } from "react";
import { AiOutlineInfoCircle, AiOutlineFolder } from "react-icons/ai";
import { FaGears } from "react-icons/fa6";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AiSummary = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const apiKey = localStorage.getItem("geminiApiKey");

  const [userActivityData, setUserActivityData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [genAI, setGenAI] = useState(null);

  useEffect(() => {
    if (apiKey) {
      setGenAI(new GoogleGenerativeAI(apiKey));
    }
  }, [apiKey]);

  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        workspacePresent: { type: "boolean" },
        overallStatus: { type: "string" },
        totalWorkspaces: { type: "integer" },
        totalTasks: { type: "integer" },
        totalTodoLists: { type: "integer" },
        workspaces: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              emoji: { type: "string" },
              name: { type: "string" },
              status: { type: "string" },
              taskSummary: { type: "string" },
              todoListSummary: { type: "string" },
              about: { type: "string" },
            },
            required: [
              "id",
              "name",
              "status",
              "taskSummary",
              "todoListSummary",
            ],
          },
        },
      },
      required: [
        "workspacePresent",
        "overallStatus",
        "totalWorkspaces",
        "totalTasks",
        "totalTodoLists",
        "workspaces",
      ],
    },
  };

  const requestAi = async (prompt) => {
    if (!genAI) return;

    setProcessing(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: "Analyze and summarize workspace activity. add about the workspace information it is a comprehensive summary about that workspace, you generate by yourself if you got empty prompt return every thing as empty string. if workspace is not present make workspacePresent as false else make it true.",
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(JSON.stringify(prompt));
      const textResponse = await result.response.text();
      setAiResponse(JSON.parse(textResponse));
    } catch (error) {
      console.error("AI request failed:", error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (userActivityData) {
      requestAi(userActivityData);
    }
  }, [userActivityData]);

  const handleLoadUserActivityData = async () => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces/data`, {
        headers: header,
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setUserActivityData(data);
      //   if (userActivityData) {
      //   requestAi(userActivityData);
      //   }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  return (
    <div className="bg-white shadow-sm p-6 mb-4 h-screen max-w-96 overflow-auto z-20">
      <div className="flex items-center justify-between mb-5">
        <div className="text-xl font-semibold flex items-center">
          <AiOutlineInfoCircle className="mr-2 text-blue-500" />
          <p>AI Summary</p>
        </div>
        <button className="btn btn-sm" onClick={handleLoadUserActivityData}>
          <FaGears />
          Generate Summary
        </button>
      </div>

      {processing && <span className="loading loading-dots loading-lg"></span>}

      {aiResponse && aiResponse?.workspacePresent ? (
        <>
          <div className="bg-gray-100 border border-dashed border-gray-400 rounded-md p-3 mb-2 text-sm text-gray-600 flex items-center">
            <AiOutlineInfoCircle className="mr-2" />
            <span>
              <strong>Overall Status:</strong> {aiResponse.overallStatus}
            </span>
          </div>
          <div className="bg-gray-100 border border-dashed border-gray-400 rounded-md p-3 mb-4 text-sm text-gray-600 flex items-center">
            <AiOutlineFolder className="mr-2" />
            <span>
              {aiResponse.totalWorkspaces} workspaces, {aiResponse.totalTasks}{" "}
              tasks, {aiResponse.totalTodoLists} todo lists.
            </span>
          </div>

          {aiResponse.workspaces.map((ws) => (
            <div
              key={ws?.id}
              className="border border-gray-200 rounded-md p-4 mb-3"
            >
              <h3 className="text-lg font-medium mb-2 flex items-center">
                {/* <AiOutlineFolder className="mr-2 text-gray-500" /> */}
                {ws?.emoji}
                {ws?.name}
              </h3>
              <div className="text-sm text-gray-500">Status: {ws?.status}</div>
              <div className="text-sm text-gray-500">
                Tasks: {ws?.taskSummary}
              </div>
              <div className="text-sm text-gray-500">
                Todo Lists: {ws?.todoListSummary}
              </div>
              <div className="text-sm text-gray-500">{ws?.about}</div>
            </div>
          ))}
        </>
      ) : (
        <div>Gemini could not find any workspace!</div>
      )}
    </div>
  );
};

export default AiSummary;
