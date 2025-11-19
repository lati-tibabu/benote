import React, { useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AIGeneratedRoadmap = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem("geminiApiKey");
  const selectedModel = localStorage.getItem("selectedGeminiModel") || import.meta.env.VITE_DEFAULT_GEMINI_MODEL || "gemini-flash-latest";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: selectedModel,
  });

  const userData = useSelector((state) => state.auth.user) || {};
  const { workspaceId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);

  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        description: {
          type: "string",
        },
        roadmapItems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
              },
              description: {
                type: "string",
              },
              status: {
                type: "string",
              },
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
                You are a roadmap generating assistant.

                Your task is to analyze the user's text input and generate a \n
                structured roadmap in JSON format based on the user's goal,\n 
                need, or request. You must follow a specific schema and help \n
                the user by breaking down their request into actionable roadmapItems.

                Schema:

                {
                  "title": string,
                  "description": string,
                  "roadmapItems": [
                    {
                      "title": string,
                      "description": string,
                      "status": "todo" | "doing" | "done"
                    }
                  ]
                }

                Instructions:

                Based on the user’s input, be creative and use your 
                knowledge base to generate roadmaps for what the user 
                is asking.

                A roadmap is a step-by-step plan for achieving something —
                for example, learning web development, mastering a topic, 
                completing a project, or preparing for an exam.

                Recommend and design helpful, realistic, and effective 
                roadmap items for the user’s goal.

                Use your expertise to fill in knowledge gaps if the user 
                input is high-level or abstract. You may infer logical 
                steps based on your understanding of the domain.

                Only generate roadmapItems based on the user's prompt 
                or their intent — do not introduce unrelated steps.

                For each roadmapItem:

                title: a concise name for the step or milestone

                description: what needs to be done or understood

                status: assign either "todo", "doing", or "done" 
                based on your interpretation

                The roadmap as a whole must include:

                title: a collective, creative name for the roadmap 
                (you may include emojis)

                description: a short overview of what this roadmap is about

                Be helpful, creative, and precise in your breakdown. 
                Be a smart assistant and minimize effort for the 
                user by creating a clear and useful plan.

                The current time is ${new Date().toISOString()}. 
                Use it to infer appropriate timelines if necessary.

                Respond only in valid JSON format that matches the schema above.
                `,
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(prompt);
      setAiResponse(JSON.parse(result.response.text()));
    } catch (error) {
      console.error("Error in requestAi:", error);
      // More specific error handling
      if (error instanceof TypeError) {
        // type errors
        console.error("TypeError: ", error.message);
      } else if (error.response) {
        //  API error (if any)
        console.error("API error: ", error.response.data);
      }

      // network error
      if (!navigator.onLine) {
        setError(
          "It looks like you're offline. Please check your internet connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleUserPrompt = (e) => {
    e.preventDefault();
    if (apiKey.length > 0) {
      setError(null);
      setAiResponse(null);
      userPrompt && requestAi(userPrompt);
      // aiResponse && console.log(aiResponse);
      console.log(aiResponse);
    } else {
      toast.error("API Key is invalid!");
    }
  };
  return (
    <div className="p-4">
      AIGeneratedRoadmap
      <form
        action=""
        className="border-2 p-3 mt-10 flex justify-between rounded-lg"
        onSubmit={handleUserPrompt}
      >
        <textarea
          name=""
          id=""
          className="w-full bg-transparent ring-0 outline-none border-none resize-none"
          placeholder="Add your document that needs to be broken down to tasks"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        ></textarea>
        <button className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 btn border-none shadow">
          <AiOutlineSend className="text-xl" />
        </button>
      </form>
    </div>
  );
};

export default AIGeneratedRoadmap;
