import React, { useEffect, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { jwtDecode } from "jwt-decode";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";

const AiGeneratedNote = () => {
  const [userPrompt, setUserPrompt] = useState(null);
  const [aiResponse, setAiResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [userData, setUserData] = useState(null);
  const { workspaceId } = useParams();

  const [noteData, setNoteData] = useState({
    workspace_id: workspaceId,
    owned_by: "",
    title: "",
    content: "",
  });

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem("geminiApiKey");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const navigate = useNavigate();
  const [addedTodo, setAddedTodo] = useState(false);

  // storing the logged in user data in the userData
  useEffect(() => {
    try {
      const data = jwtDecode(token);
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

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
        content: {
          type: "string",
        },
      },
      required: ["title", "content"],
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
                text: noteGenerationPrompt,
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(prompt);
      setAiResponse(JSON.parse(result.response.text()));
    } catch (error) {
      setError(error);
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
    } else {
      toast.error("API Key is invalid!");
    }
  };

  useEffect(() => {
    setNoteData({
      owned_by: userData?.id,
      workspace_id: workspaceId,
      title: aiResponse?.title,
      content: aiResponse?.content,
    });
  }, [aiResponse]);

  const handleAcceptAiResponse = async () => {
    // console.log(noteData);
    try {
      const response = await fetch(`${apiURL}/api/notes`, {
        method: "POST",
        body: JSON.stringify(noteData),
        headers: header,
      });

      if (!response.ok) {
        alert("Something went wrong");
        return;
      }

      const data = await response.json();
      const noteId = data.id;

      toast.success("Note is added to db");
      setUserPrompt("");
      setAiResponse(null);

      setNoteData({
        workspace_id: workspaceId,
        owned_by: "",
        title: "",
        content: "",
      });

      navigate(`/app/workspace/open/${workspaceId}/notes/${noteId}`);

      console.log("Item created");
    } catch (err) {
      console.error("Error creating note: ", err);
    }
    // console.log(aiResponse);
  };

  return (
    <div>
      <div className="text-2xl text-gray-800 mt-5">Ai Note</div>
      <form
        action=""
        className="border-2 p-3 mt-10 flex justify-between rounded-lg"
        onSubmit={handleUserPrompt}
      >
        <textarea
          name=""
          id=""
          className="w-full bg-transparent ring-0 outline-none border-none resize-none"
          placeholder="What needs to be done?"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        ></textarea>
        <button className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 btn border-none shadow">
          <AiOutlineSend className="text-xl" />
        </button>
      </form>

      <div className="border-2 p-3 mt-10 rounded-lg">
        <div className="border-b-2 pb-2 px-4 flex justify-between">
          <p className="text-gray-800 font-bold "></p>

          {aiResponse && (
            <button
              className="btn btn-sm btn-soft"
              onClick={handleAcceptAiResponse}
            >
              Accept
            </button>
          )}
        </div>
        {error && <p>{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center mt-4">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : (
          <div>
            <div className="text-xl font-semibold">
              {aiResponse?.title || "No title generated"}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <MarkdownRenderer
                content={aiResponse.content || "No content generated"}
              />
            </div>
          </div>
          // {error && <p>{error}</p>}
        )}
      </div>
    </div>
  );
};

export default AiGeneratedNote;

const noteGenerationPrompt = `
You are now an intelligent note assistant. Your task is to assist the user by either restructuring large text inputs into well-organized Markdown format or generating structured notes from scratch based on a topic.

## Instructions:

### **1. If the user provides a large text:**  
   - Extract key concepts and main ideas.  
   - Organize the information into clear sections with appropriate Markdown headers (\`#\`, \`##\`, \`###\`).  
   - Retain important details while improving clarity and readability.  
   - Preserve bullet points, numbered lists, and code blocks if present.  
   - Maintain logical flow and concise phrasing without losing meaning.  

### **2. If the user provides a topic or unstructured points:**  
   - Expand the topic into a structured note.  
   - Use Markdown formatting elements like headers, bullet points, bold text, and inline code where necessary.  
   - Ensure the note is clear, concise, and easy to review later.  

### **3. If the user asks for a new topic:**  
   - Suggest **one or more relevant topics** related to the user’s interest.  
   - Format them as a list, including a brief description of each topic.  
   - Keep the suggestions useful and educational, ensuring relevance to the user's context.  

## General Guidelines:  
   - **Never** add extra information beyond what is relevant to the user’s request.  
   - Always format notes in **Markdown** for readability and usability.  
   - Use **tables, code blocks, or quotes** if needed for better organization.  
   - Ensure a professional yet simple tone that is user-friendly.  
   - Keep responses **well-structured, logical, and useful**.
   - Use **clear headings** and **subheadings** to organize content effectively.
   - search internet if you could 
   - add emojis to make it more fun and if user dont like make it without emojis
   - add emijis to title
`;
