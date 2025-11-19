import React, { useEffect, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useSelector } from "react-redux";

const AiGeneratedTask = () => {
  const [userPrompt, setUserPrompt] = useState(null);
  const [aiResponse, setAiResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const { workspaceId } = useParams();
  const [generatedTasks, setGeneratedTasks] = useState([]);

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

  // storing the authenticated user data in the userData
  const userData = useSelector((state) => state.auth.user);

  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
        comment: {
          type: "string",
        },
        tasks: {
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
              due_date: {
                type: "string",
              },
            },
            required: ["title", "description", "status", "due_date"],
          },
        },
      },
      required: ["name", "tasks", "comment"],
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
                 - status include ('todo', 'doing' and 'done')\n
                 - you are now a helper of the user, you will analyze 
                 the prompt or the text user has provided to help them 
                 generating tasks with important information from list 
                 from their prompt. \n 
                 - You will never add tasks outside 
                 from the prompt \n
                 - be creative with breaking the prompt 
                 down to more manageable taks \n
                 - name property is the 
                 entire tasks collective name generated alongside with 
                 tasks be creative with it and if you wish use emoji with it\n
                 - due_date property is the date the task is due and is in format ISO 8601\n
                 - be smart with the due date from your understanding and time is now ${new Date().toISOString()}
                 - user will adjust time later but try to minimize effort for them
                 - description property is the task description\n
                 - status property is the task status\n
                 - comment is thought you wanna give to user like how the job can be completed or 
                 overall summary about the task and also your suggestion on how it should be done
                 and that the user will adjust to how ever they like.`,
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
    } else {
      toast.error("API Key is invalid!");
    }
  };

  useEffect(() => {
    if (!aiResponse || !aiResponse.tasks || aiResponse.tasks.length === 0) {
      return;
    }
    const modifiedTasks = aiResponse?.tasks.map((task) => ({
      ...task,
      created_by: userData?.id || "",
      assigned_to: userData?.id || "",
      workspace_id: workspaceId || "",
    }));
    setGeneratedTasks(modifiedTasks);
  }, [aiResponse, aiResponse?.tasks]);

  const handleAcceptAiResponse = async () => {
    // console.log(generatedTasks.length && generatedTasks);
    try {
      const response = await fetch(`${apiURL}/api/tasks`, {
        method: "POST",
        body: JSON.stringify(generatedTasks),
        headers: header,
      });
      if (!response.ok) {
        toast.error("Something went wrong");
        return;
      }
      toast.success("Tasks succesfully added to workspace");
      const data = await response.json();
      // console.log(data);
      setUserPrompt("");
      setAiResponse(null);
      setGeneratedTasks([]);

      console.log("Items created");
    } catch (err) {
      console.error("Error creating todo list: ", err);
    }
  };

  return (
    <div>
      <div className="text-2xl text-gray-800 mt-5">Ai Generated Tasks</div>
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

      <div className="border-2 p-3 mt-10 rounded-lg">
        <div className="border-b-2 pb-2 px-4 flex justify-between">
          <p className="text-gray-800 font-bold "></p>

          {generatedTasks.length > 0 && (
            <button
              className="btn btn-sm btn-soft"
              onClick={handleAcceptAiResponse}
            >
              Accept
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-500 bg-red-100 border-red-500 border p-1 rounded-md flex items-center gap-2">
            <FaTriangleExclamation size={30} />
            {error}
          </p>
        )}
        {loading ? (
          <div className="flex items-center justify-center mt-4">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : (
          <div>
            <div className="text-xl font-semibold">{aiResponse?.name}</div>
            <div className="text-sm">{aiResponse?.comment}</div>
            <div className="flex flex-col gap-2 mt-2">
              {generatedTasks?.length > 0 &&
                generatedTasks.map((task, index) => (
                  <div
                    key={index}
                    className="border-2 p-2 rounded-lg text-gray-600 flex flex-col gap-2"
                  >
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className="badge badge-outline text-xs">
                        {task.status.toUpperCase()}
                      </span>
                      <h3 className="font-semibold">{task.title}</h3>
                    </div>

                    {/* Task Description */}
                    <p className="text-sm text-gray-500">{task.description}</p>

                    {/* Task Meta Information */}
                    <div className="text-xs text-gray-400 flex flex-wrap gap-2">
                      <span>
                        🗓 Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                      {/* <span>📂 Workspace: {task.workspace_id}</span> */}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          // {error && <p>{error}</p>}
        )}
      </div>
    </div>
  );
};

export default AiGeneratedTask;
