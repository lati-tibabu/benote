import React, { useEffect, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const AiGeneratedTodo = () => {
  const [userPrompt, setUserPrompt] = useState(null);
  const [aiResponse, setAiResponse] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const { workspaceId } = useParams();

  const userData = useSelector((state) => state.auth.user) || {};

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
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const navigate = useNavigate();
  const [addedTodo, setAddedTodo] = useState(false);

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
                text: "status include ('done' and 'not_done')\n you are now a helper of the user, you will analyze the prompt to help them generating todo list from their prompt. \n - You will never add tasks outside from the prompt \n - be creative with breaking the prompt down to more manageable taks \n - name property is the entire tasks collective name generated alongside with tasks be creative with it and if you wish use emoji with it",
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
            <div className="text-xl font-semibold">{aiResponse?.name}</div>
            <div className="flex flex-col gap-2 mt-2">
              {aiResponse &&
                aiResponse.tasks?.length > 0 &&
                aiResponse.tasks?.map((task, index) => (
                  <div
                    className={`border-2 p-1 rounded-lg text-gray-600 flex gap-2 items-center`}
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
