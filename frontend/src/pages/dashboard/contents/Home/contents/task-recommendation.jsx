import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const getRecommendedTasks = (tasks) => {
  return tasks
    .filter((task) => task.status.toLowerCase() !== "done")
    .map((task, index) => {
      let priority = "Low";
      if (task.taskStatus === "overdue" || task.timeLeft < 1) {
        priority = "High";
      } else if (task.timeLeft < 3) {
        priority = "Medium";
      }
      return {
        id: index + 1,
        title: task.title,
        description: task.description || "No description provided",
        priority,
        workspace_id: task.workspace_id,
        workspace: task.workspace || "Unnamed Workspace",
      };
    })
    .slice(0, 5); // Limit to top 5
};

const getPriorityStyle = (priority) => {
  switch (priority) {
    case "High":
      return "text-red-600 border-red-600";
    case "Medium":
      return "text-yellow-600 border-yellow-600";
    case "Low":
      return "text-green-600 border-green-600";
    default:
      return "text-black border-black";
  }
};

const TaskRecommendation = () => {
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const headers = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${apiURL}/api/tasks/notdone`, {
          method: "GET",
          headers,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json(); // [count, tasks]
        setTaskData(data[1] || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [apiURL, token]);

  const recommendedTasks = useMemo(
    () => getRecommendedTasks(taskData),
    [taskData]
  );

  const handleTaskClick = (workspaceId) => {
    navigate(`/app/workspace/open/${workspaceId}/tasks`);
  };

  return (
    <div className="h-fit w-full max-w-md bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-sm shadow-sm p-5 sm:p-7 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-gray-400 rounded-sm mr-2"></span>
        Recommended Tasks
      </h2>

      {loading ? (
        <div className="flex flex-col gap-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-600 text-center">Error: {error}</p>
      ) : recommendedTasks.length === 0 ? (
        <p className="text-gray-500 text-center">
          No recommendations available.
        </p>
      ) : (
        <ul className="space-y-4">
          {recommendedTasks.map((task) => (
            <li
              key={task.id}
              onClick={() => handleTaskClick(task.workspace_id)}
              className="cursor-pointer group border border-gray-200 bg-white/80 hover:bg-gray-600 hover:text-white transition-all duration-200 p-4 rounded-sm shadow-sm flex flex-col gap-1"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-base sm:text-lg font-semibold truncate group-hover:text-white text-gray-900">
                  {task.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-sm border font-bold uppercase tracking-wide bg-white/60 group-hover:bg-gray-500 group-hover:text-white ${getPriorityStyle(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-gray-100">
                <span className="font-medium">Workspace:</span>
                <span className="truncate">{task.workspace}</span>
              </div>
              <p className="text-xs text-gray-700 group-hover:text-gray-100 opacity-80 truncate">
                {task.description}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskRecommendation;
