import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";

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

  const Section = ({ title, name, list, colorClass }) => (
    <div className="mb-5 border border-gray-200 rounded-sm shadow-sm bg-white/80">
      <button
        className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center rounded-t-xl transition-all"
        onClick={() => toggleSection(name)}
      >
        <span
          className={`font-semibold text-gray-800 flex items-center gap-2 ${colorClass}`}
        >
          {title}
        </span>
        <span className="text-xs sm:text-sm text-gray-400 font-mono">
          {collapsed[name] ? `${list.length} task(s)` : "Hide"}
        </span>
      </button>
      {!collapsed[name] && (
        <div className="p-4 space-y-3 bg-white rounded-b-xl">
          {list.length === 0 ? (
            <p className="text-xs text-gray-400">No tasks found.</p>
          ) : (
            list.map((task, idx) => (
              <div
                key={task._id || idx}
                onClick={() => handleTaskClick(task.workspace_id)}
                className="border border-gray-100 p-3 rounded-sm hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer group shadow-sm"
              >
                <h4 className="text-base font-bold text-gray-900 group-hover:text-gray-700 truncate">
                  {task.title}
                </h4>
                <div className="text-xs text-gray-500 mt-1 mb-1">
                  <MarkdownRenderer content={task.description} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-400 mt-1 items-center">
                  <span>Due: {new Date(task.due_date).toLocaleString()}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-sm font-semibold uppercase tracking-wide text-gray-700 border border-gray-200">
                    {task.taskStatus}
                  </span>
                  <span className="italic">
                    Workspace: {task.workspace || "N/A"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-fit max-h-[90vh] w-full max-w-md overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-sm shadow-sm p-5 sm:p-7 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-gray-400 rounded-sm mr-2"></span>
        Task Status Overview
      </h2>

      {loading && <p className="text-sm text-gray-400">Loading tasks...</p>}
      {error && <p className="text-sm text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          <Section
            title="🔴 Overdue Tasks"
            name="overdue"
            list={groupTasks.overdue}
            colorClass="text-red-500"
          />
          <Section
            title="🟠 Deadline Today"
            name="today"
            list={groupTasks.today}
            colorClass="text-yellow-500"
          />
          <Section
            title="🟢 On Time Tasks"
            name="onTime"
            list={groupTasks.onTime}
            colorClass="text-gray-500"
          />
        </>
      )}
    </div>
  );
};

export default TaskStatus;
