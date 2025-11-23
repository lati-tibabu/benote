import React, { useEffect, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";

const AiGeneratedRoadmap = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem("geminiApiKey");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const userData = useSelector((state) => state.auth.user) || {};
  const { workspaceId } = useParams();

  const [userPrompt, setUserPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [roadmapData, setRoadmapData] = useState({
    workspace_id: workspaceId,
    created_by: userData?.id,
    title: "",
    description: "",
  });

  const navigate = useNavigate();

  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        roadmapItems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              status: { type: "string" },
            },
            required: ["title", "description", "status"],
          },
        },
      },
      required: ["title", "description"],
    },
  };

  const requestAi = async (prompt) => {
    setLoading(true);
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: `
                You are a roadmap generating assistant. Your task is to analyze the user's input and generate a comprehensive, detailed roadmap in JSON format based on their goal or request.

                The roadmap must be:
                - Structured hierarchically with clear phases, milestones, and tasks.
                - Rich in content, with **many roadmap items** covering all relevant subtopics.
                - Each item must have a **long, detailed description** using **Markdown formatting** to improve readability and structure.
                - Use **bullet points** for listing steps, tools, tips, or sub-tasks.
                - Use **LaTeX notation (wrapped in $ symbols)** where mathematical or technical expressions are needed.

                Format all descriptions for clarity, depth, and practical actionability. Think like a mentor guiding the user through every stage with full context and resources. Be exhaustive, not minimal.

                `,
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(prompt);
      const parsedResponse = JSON.parse(result.response.text());

      if (
        parsedResponse &&
        parsedResponse.title &&
        parsedResponse.description
      ) {
        setAiResponse(parsedResponse);
      } else {
        throw new Error("Invalid AI response format.");
      }
    } catch (error) {
      setError(error);
      setAiResponse(null); // Ensure no stale data is displayed
    } finally {
      setLoading(false);
    }
  };

  const handleUserPrompt = (e) => {
    e.preventDefault();
    // console.log("Celibate");
    if (apiKey.length > 0) {
      setError(null);
      setAiResponse(null);
      userPrompt && requestAi(userPrompt);
    } else {
      toast.error("API Key is invalid!");
    }
  };

  useEffect(() => {
    setRoadmapData({
      ...roadmapData,
      title: aiResponse?.title,
      description: aiResponse?.description,
    });
    // console.log("Roadmap item");
  }, [aiResponse]);

  const handleAcceptAiResponse = async () => {
    try {
      const response = await fetch(`${apiURL}/api/roadmaps`, {
        method: "POST",
        body: JSON.stringify(roadmapData),
        headers: header,
      });

      if (!response.ok) {
        alert("Something went wrong");
        return;
      }

      const data = await response.json();

      aiResponse.roadmapItems = aiResponse.roadmapItems.map((item) => ({
        ...item,
        roadmap_id: data.id,
      }));

      const itemResponse = await fetch(`${apiURL}/api/roadmapItems`, {
        method: "POST",
        headers: header,
        body: JSON.stringify({ items: aiResponse.roadmapItems }),
      });

      if (!itemResponse.ok) {
        alert("Something went wrong");
        return;
      }

      setUserPrompt("");
      setAiResponse(null);

      navigate(`/app/workspace/open/${workspaceId}/roadmaps/${data.id}`);
    } catch (err) {
      console.error("Error creating roadmap: ", err);
    }
  };

  return (
    <div>
      <div className="text-2xl text-gray-800 mt-5">AI-Generated Roadmap</div>
      <form
        action=""
        className="border-2 p-3 mt-10 flex justify-between rounded-sm"
        onSubmit={handleUserPrompt}
      >
        <textarea
          name=""
          id=""
          className="w-full bg-transparent ring-0 outline-none border-none resize-none"
          placeholder="Describe your goal or project..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        ></textarea>
        <button className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 btn border-none shadow">
          <AiOutlineSend className="text-xl" />
        </button>
      </form>

      <div className="border-2 p-3 mt-10 rounded-sm">
        <div className="border-b-2 pb-2 px-4 flex justify-between">
          <p className="text-gray-800 font-bold">Generated Roadmap</p>

          {aiResponse && (
            <button
              className="btn btn-sm btn-soft"
              onClick={handleAcceptAiResponse}
            >
              Accept
            </button>
          )}
        </div>
        {error && <p className="text-red-500">{error.message}</p>}
        {loading ? (
          <div className="flex items-center justify-center mt-4">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : aiResponse ? (
          <div>
            <div className="text-xl font-semibold">
              {aiResponse.title || "Title of the roadmap"}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <MarkdownRenderer
                content={
                  aiResponse.description ||
                  "Description of the roadmap will appear here."
                }
              />
              {aiResponse.roadmapItems?.map((item, index) => (
                <div
                  key={index}
                  className="border-2 p-2 rounded-sm text-gray-600 flex gap-2 items-center"
                >
                  <span className="badge badge-outline text-xs">
                    {item.status?.toUpperCase() || "PENDING"}
                  </span>
                  <span>{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No AI response to preview.</p>
        )}
      </div>
    </div>
  );
};

export default AiGeneratedRoadmap;
