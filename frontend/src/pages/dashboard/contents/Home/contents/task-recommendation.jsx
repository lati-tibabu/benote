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
    <div className="h-fit max-w-96 bg-white text-black p-6">
      <h2 className="text-2xl font-semibold mb-6 border-b border-black pb-2">
        Recommended Tasks
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading tasks...</p>
      ) : error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : recommendedTasks.length === 0 ? (
        <p className="text-gray-600">No recommendations available.</p>
      ) : (
        <div className="space-y-4">
          {recommendedTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.workspace_id)}
              className="cursor-pointer border border-black p-4 rounded-lg hover:bg-black hover:text-white transition duration-300"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xl font-medium">{task.title}</h3>
                <span
                  className={`text-sm px-2 py-1 rounded border ${getPriorityStyle(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="text-sm italic text-gray-600 mb-1">
                Workspace:{" "}
                <span className="font-semibold">{task.workspace}</span>
              </p>
              <p className="text-sm text-gray-700">{task.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskRecommendation;
