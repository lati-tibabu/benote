import React, { useEffect, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useSelector } from "react-redux";

const OpenedAIStudyGenerators = ({ plan, onSuccess }) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedBlocks, setGeneratedBlocks] = useState([]);
  const userData = useSelector((state) => state.auth.user);

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem("geminiApiKey");
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI
    ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    : null;

  // Only generate time blocks for the current plan
  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        timeBlocks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              start_time: { type: "string", format: "date-time" },
              end_time: { type: "string", format: "date-time" },
              job: { type: "string" },
              description: { type: "string" },
            },
            required: ["start_time", "end_time", "job", "description"],
          },
        },
      },
      required: ["timeBlocks"],
    },
  };

  console.log("Existing Plan:", plan);
  const requestAi = async (prompt) => {
    setLoading(true);
    setError(null);
    try {
      if (!apiKey || !genAI || !model) {
        const errorMessage =
          "API Key is missing or invalid. Please provide a valid API Key.";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert study plan assistant. Generate a set of 1-hour time blocks for the following study plan, based on the user's prompt.\n\nStudy Plan Title: ${
                  plan?.title
                }\nDescription: ${plan?.description}\nPlan Start: ${
                  plan?.start_date
                }\nPlan End: ${
                  plan?.end_date
                }\n\nInstructions:\n1. Only generate time blocks (do NOT return a full plan object).\n2. Each time block must be exactly 1 hour, with start_time and end_time as ISO 8601 strings, both exactly on the hour (e.g., 10:00, 11:00, not 10:15).\n3. All time blocks must be within the plan's start_date and end_date.\n4. Do NOT overlap with any existing time blocks in this plan. Here are the existing time blocks: ${JSON.stringify(
                  plan?.timeBlocks || []
                )}\n5. If the user's prompt requests more hours than available, fill as many as possible and explain in the description.\n6. Only use information from the user's prompt.\n7. Strictly follow the responseSchema: { timeBlocks: [ ... ] }\n\nUser prompt: ${prompt}`,
              },
            ],
          },
        ],
      });
      const result = await chatSession.sendMessage("");
      let response = result.response.text();
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (e) {
        setError(
          "AI response could not be parsed. Please try again. Raw response: " +
            response
        );
        toast.error("AI response could not be parsed. Please try again.");
        setAiResponse(null);
        setLoading(false);
        return;
      }
      setAiResponse(parsed);
    } catch (error) {
      console.error("Error in requestAi:", error);
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!aiResponse || !aiResponse.timeBlocks) {
      setGeneratedBlocks([]);
      return;
    }
    setGeneratedBlocks(aiResponse.timeBlocks);
  }, [aiResponse]);

  const handleUserPrompt = (e) => {
    e.preventDefault();
    if (!apiKey || apiKey.length === 0) {
      toast.error("API Key is invalid or missing!");
      setError("API Key is invalid or missing!");
      return;
    }
    if (!userPrompt.trim()) {
      toast.error("Please enter a prompt to generate time blocks.");
      setError("Please enter a prompt to generate time blocks.");
      return;
    }
    setError(null);
    setAiResponse(null);
    requestAi(userPrompt);
  };

  // Save generated time blocks to backend
  const handleAcceptAiResponse = async () => {
    if (!generatedBlocks.length) return;
    setLoading(true);
    setError(null);
    try {
      for (const block of generatedBlocks) {
        const res = await fetch(`${apiURL}/api/timeBlocks`, {
          method: "POST",
          headers: header,
          body: JSON.stringify({
            ...block,
            user_id: userData?.id,
            workspace_id: plan?.workspace_id,
            study_plan_id: plan?.id,
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to save a time block.");
        }
      }
      toast.success("Time blocks added to plan!");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to save time blocks.");
      toast.error("Failed to save time blocks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-xl font-bold text-purple-700 mb-2">
        AI Time Block Generator for:{" "}
        <span className="text-gray-800">{plan?.title}</span>
      </div>
      <form
        className="border-2 p-3 mt-4 flex flex-col gap-4 rounded-lg"
        onSubmit={handleUserPrompt}
      >
        <textarea
          className="w-full bg-white border border-purple-200 rounded-md p-2 min-h-[60px]"
          placeholder="Describe what you want to study in this plan, e.g. 'Add 2 hours of math revision each morning'"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        ></textarea>
        <button
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow hover:from-purple-600 hover:to-purple-800 transition"
          type="submit"
          disabled={loading}
        >
          Generate Time Blocks (AI)
        </button>
      </form>
      <div className="border-2 p-3 mt-6 rounded-lg">
        <div className="border-b-2 pb-2 px-4 flex justify-between">
          <span className="font-bold text-gray-800">Generated Time Blocks</span>
          {generatedBlocks.length > 0 && (
            <button
              className="btn btn-sm btn-success"
              onClick={handleAcceptAiResponse}
              disabled={loading}
            >
              Save to Plan
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-500 bg-red-100 border-red-500 border p-1 rounded-md mt-2">
            {error}
          </p>
        )}
        {loading ? (
          <div className="flex items-center justify-center mt-4">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : (
          <div className="mt-2 max-h-[200px] overflow-y-auto">
            {generatedBlocks.length > 0 ? (
              generatedBlocks.map((block, idx) => (
                <div key={idx} className="border p-2 rounded bg-white mb-2">
                  <div className="font-semibold">{block.job}</div>
                  <div className="text-sm text-gray-600">
                    {block.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    🕒 {new Date(block.start_time).toLocaleString()} -{" "}
                    {new Date(block.end_time).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No time blocks generated yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpenedAIStudyGenerators;
