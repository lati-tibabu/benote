import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "../../../../../components/markdown-renderer";

const TaskStatus = () => {
  const [tasks, setTasks] = useState([]);
  const [collapsed, setCollapsed] = useState({
    overdue: true,
    today: true,
    onTime: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const navigate = useNavigate();

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
          throw new Error(`Failed to fetch tasks: ${response.status}`);
        }

        const data = await response.json();
        setTasks(data[1]); // assuming format [count, tasks]
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [apiURL, token]);

  const toggleSection = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTaskClick = (workspaceId) => {
    if (workspaceId) {
      navigate(`/app/workspace/open/${workspaceId}/tasks`);
    }
  };

  const groupTasks = {
    overdue: tasks.filter((t) => t.taskStatus === "overdue"),
    today: tasks.filter((t) => t.timeLeft === 0),
    onTime: tasks.filter((t) => t.taskStatus === "on time" && t.timeLeft > 0),
  };

  const Section = ({ title, name, list }) => (
    <div className="mb-6 border rounded-lg shadow-sm">
      <button
        className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
        onClick={() => toggleSection(name)}
      >
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-gray-600">
          {collapsed[name] ? `${list.length} task(s)` : "Hide"}
        </span>
      </button>
      {!collapsed[name] && (
        <div className="p-4 space-y-4 bg-white">
          {list.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks found.</p>
          ) : (
            list.map((task, idx) => (
              <div
                key={task._id || idx}
                onClick={() => handleTaskClick(task.workspace_id)}
                className="border p-4 rounded hover:bg-gray-50 transition cursor-pointer"
              >
                <h4 className="text-lg font-bold">{task.title}</h4>
                <p className="text-sm text-gray-700">
                  <MarkdownRenderer content={task.description} />
                </p>
                <div className="text-xs text-gray-500 mt-1">
                  Due: {new Date(task.due_date).toLocaleString()} | Status:{" "}
                  {task.taskStatus}
                </div>
                <div className="text-xs italic text-gray-400">
                  Workspace: {task.workspace || "N/A"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-fit max-h-screen max-w-96 overflow-auto bg-white text-black p-6">
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-300 pb-2">
        Task Status Overview
      </h2>

      {loading && <p className="text-sm">Loading tasks...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <Section
            title="🔴 Overdue Tasks"
            name="overdue"
            list={groupTasks.overdue}
          />
          <Section
            title="🟠 Deadline Today"
            name="today"
            list={groupTasks.today}
          />
          <Section
            title="🟢 On Time Tasks"
            name="onTime"
            list={groupTasks.onTime}
          />
        </>
      )}
    </div>
  );
};

export default TaskStatus;
