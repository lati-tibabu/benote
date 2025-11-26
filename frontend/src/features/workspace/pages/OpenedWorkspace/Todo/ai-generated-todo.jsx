import React, { useEffect, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import GeminiIcon from "@features/ai/components/geminiIcon";

const AiGeneratedTodo = () => {
  const [userPrompt, setUserPrompt] = useState(null);
  const [aiResponse, setAiResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const { workspaceId } = useParams();

  const userData = useSelector((state) => state.auth.user) || {};

  const userSummary =
    useSelector((state) => state.aiResponse.userSummary) || {};

  const [todoData, setTodoData] = useState({
    user_id: userData?.id,
    title: "",
    workspace_id: workspaceId,
  });

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

  const navigate = useNavigate();
  const [addedTodo, setAddedTodo] = useState(false);
  const [userActivityData, setUserActivityData] = useState(null);

  const handleLoadUserActivityData = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/workspaces/data?workspaceId=${workspaceId}`,
        // `${apiURL}/api/workspaces/data`,
        {
          headers: header,
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setUserActivityData(data);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
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
        name: {
          type: "string",
        },
        tasks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              status: {
                type: "string",
              },
              title: {
                type: "string",
              },
            },
            required: ["status", "title"],
          },
        },
      },
      required: ["name", "tasks"],
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
                // text: "status include ('done' and 'not_done')\n you are now a helper of the user, you will analyze the prompt to help them generating todo list from their prompt. \n - You will never add tasks outside from the prompt \n - be creative with breaking the prompt down to more manageable taks \n - name property is the entire tasks collective name generated alongside with tasks be creative with it and if you wish use emoji with it",
                text: `Context: Today is ${new Date().toLocaleDateString()}.

                You are an intelligent assistant helping the user generate a focused to-do list based on their input prompt.
                
                Instructions:
                - You will analyze the user's prompt and generate a structured to-do list from it.
                - If the input contains a \`userSummary\` in JSON format, use it to extract tasks and time blocks(most probably contain study plan) relevant for today, and include the current date as context.
                - Do not invent or assume tasks not mentioned in the prompt or summary.
                - Be creative in breaking down complex goals into actionable subtasks.
                - Don't forget to include study plan in the time block if the user summary contains it.
                
                - Each to-do list must include:
                  - A \`name\` property: a creative and concise collective title for the task list (you may include emojis for clarity or motivation).
                  - A \`tasks\` array: a list of specific, actionable items derived from the prompt.
                  - Each task should have a \`status\` property with one of two values: "done" or "not_done" (default to "not_done").
                - Always remain within the boundaries of the input content, but optimize for clarity, actionability, and usefulness.
                
                Goal:
                Turn the user’s intention into a realistic and motivating to-do list for today.`,
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
    if (userActivityData) {
      console.log("userSummary:", JSON.stringify(userActivityData[0]));

      if (apiKey.length > 0) {
        setError(null);
        setAiResponse(null);
        userActivityData.length != 0 &&
          requestAi(JSON.stringify(userActivityData[0]));
      } else {
        toast.error("API Key is invalid!");
      }
    }
  }, [userActivityData]);

  const handleUserSummaryPrompt = async () => {
    await handleLoadUserActivityData();
  };

  useEffect(() => {
    setTodoData({
      ...todoData,
      user_id: userData?.id,
      workspace_id: workspaceId,
      title: aiResponse?.name,
    });
  }, [aiResponse]);

  const handleAcceptAiResponse = async () => {
    console.log(aiResponse);
    try {
      const response = await fetch(`${apiURL}/api/todos`, {
        method: "POST",
        body: JSON.stringify(todoData),
        headers: header,
      });

      if (!response.ok) {
        alert("Something went wrong");
        return;
      }

      const data = await response.json();

      aiResponse.tasks = aiResponse.tasks.map((todo, index) => {
        return {
          ...todo,
          todo_id: data.id,
        };
      });

      const itemResponse = await fetch(`${apiURL}/api/todoItems`, {
        method: "POST",
        headers: header,
        body: JSON.stringify({ tasks: aiResponse.tasks }),
      });

      if (!itemResponse.ok) {
        alert("Something went wrong");
        return;
      }

      setUserPrompt("");
      setAiResponse(null);

      setAddedTodo(!addedTodo);
      setTodoData((prev) => ({
        ...prev,
        title: "",
      }));

      navigate(`/app/workspace/open/${workspaceId}/todo-lists`, {
        state: { addedTodo: addedTodo },
      });

      console.log("Item created");
    } catch (err) {
      console.error("Error creating todo list: ", err);
    }
  };

  return (
    <div>
      <div className="text-2xl text-gray-800 mt-5">Ai Generated Todo List</div>

      <div>
        <button
          className="btn btn-ghost mt-5 flex items-center gap-2"
          onClick={handleUserSummaryPrompt}
        >
          <GeminiIcon className="text-2xl text-gray-800 mt-5" />
          Generate for user activity
        </button>
      </div>
      <form
        action=""
        className="border-2 p-3 mt-10 flex justify-between rounded-sm"
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

      <div className="border-2 p-3 mt-10 rounded-sm">
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
            <div className="text-xl font-semibold">{aiResponse?.name}</div>
            <div className="flex flex-col gap-2 mt-2">
              {aiResponse &&
                aiResponse.tasks?.length > 0 &&
                aiResponse.tasks?.map((task, index) => (
                  <div
                    className={`border-2 p-1 rounded-sm text-gray-600 flex gap-2 items-center`}
                  >
                    <span className="badge badge-outline text-xs">
                      {task.status.toUpperCase()}
                    </span>
                    <span className="" key={index}>
                      {task.title}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiGeneratedTodo;
