import React, { useEffect, useState } from "react";
import { AiOutlineInfoCircle, AiOutlineFolder } from "react-icons/ai";
import { FaGears } from "react-icons/fa6";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MarkdownRenderer from "../../../../../components/markdown-renderer";
import { useDispatch, useSelector } from "react-redux";
import { setUserSummary } from "../../../../../redux/slices/aiResponseSlice";

const AiSummary = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const apiKey = localStorage.getItem("geminiApiKey");

  const [userActivityData, setUserActivityData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const useGemini = localStorage.getItem("useGemini") === "true" ? true : false;

  const [genAI, setGenAI] = useState(null);

  const aiResponse = useSelector((state) => state.aiResponse.userSummary) || {};
  const dispatch = useDispatch();

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
                text: `You are provided with a JSON list of user workspaces, each containing properties like name, emoji, task summaries, todo list summaries, and status. Your task is to:
            
            - Analyze and summarize the **overall activity** across all workspaces, including any patterns, bottlenecks, productivity signals, and anomalies.
            - For each individual workspace, generate a rich, contextual \`about\` description in **natural language** that reflects:
              - Its focus or theme,
              - Its productivity level based on the data,
              - Possible goals or suggestions based on status and summaries,
              - Any notable traits or areas of concern.
            
            **Format your entire response strictly according to the provided JSON schema**, but the values inside the strings (especially \`overallStatus\` and each \`about\`) should be formatted in **Markdown**. Use headings, bullet points, and emphasize important insights for clarity.
            
            If no workspace data is provided, set \`workspacePresent\` to \`false\` and leave all fields empty. Do not hallucinate data.
            
            Be verbose, professional, and generate insightful, helpful text the user can read directly.`,
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(JSON.stringify(prompt));
      const textResponse = await result.response.text();
      dispatch(setUserSummary(JSON.parse(textResponse)));
      // setAiResponse(JSON.parse(textResponse));
      // setUserSummary(JSON.parse(textResponse));
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
    <div className="bg-gradient-to-br from-blue-50 to-green-50 shadow-xl p-0 mb-0 w-full max-w-3xl mx-auto rounded-2xl border border-gray-200 overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-8 py-6 border-b bg-white/80 backdrop-blur-md">
        <div className="text-2xl font-bold flex items-center gap-2 text-blue-700">
          <AiOutlineInfoCircle className="text-blue-500 text-2xl" />
          <span>Workspace Summary</span>
        </div>
        {useGemini && (
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-blue-400 text-white font-semibold shadow hover:from-blue-500 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
            onClick={handleLoadUserActivityData}
          >
            <FaGears className="text-lg" />
            <span className="hidden sm:inline">Generate Summary</span>
          </button>
        )}
      </div>

      <div className="p-8 pt-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        {processing && (
          <div className="flex justify-center items-center py-8">
            <span className="loading loading-dots loading-lg text-blue-500 scale-150"></span>
          </div>
        )}

        {aiResponse && aiResponse?.workspacePresent ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-base text-blue-900 flex items-start gap-3 shadow-sm">
              <AiOutlineInfoCircle className="mt-1 text-blue-400 text-xl" />
              <div>
                <div className="font-semibold mb-1">Overall Status</div>
                <div className="prose prose-blue max-w-none">
                  <MarkdownRenderer content={aiResponse.overallStatus} />
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-base text-green-900 flex items-center gap-3 shadow-sm">
              <AiOutlineFolder className="text-green-400 text-xl" />
              <span className="font-medium">
                {aiResponse.totalWorkspaces} workspaces, {aiResponse.totalTasks}{" "}
                tasks, {aiResponse.totalTodoLists} todo lists.
              </span>
            </div>

            <div className="space-y-6">
              {aiResponse.workspaces.map((ws) => (
                <div
                  key={ws?.id}
                  className="border border-gray-100 rounded-xl p-6 bg-white/90 shadow hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2 text-gray-800">
                    <span className="text-2xl">{ws?.emoji}</span>
                    {ws?.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-2">
                    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-1 text-xs text-gray-600">
                      Status: <span className="font-medium">{ws?.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded p-3 text-sm">
                      <div className="font-semibold mb-1 text-blue-700">
                        Tasks
                      </div>
                      <div className="prose prose-blue max-w-none">
                        <MarkdownRenderer content={ws?.taskSummary} />
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded p-3 text-sm">
                      <div className="font-semibold mb-1 text-green-700">
                        Todo Lists
                      </div>
                      <div className="prose prose-green max-w-none">
                        <MarkdownRenderer content={ws?.todoListSummary} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 border border-gray-100 rounded p-4 text-sm prose max-w-none">
                    <MarkdownRenderer content={ws?.about} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-lg">
            <span className="mb-2">
              No workspace found! Or No summary generated yet.
            </span>
            <span className="text-4xl">🤖</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSummary;
