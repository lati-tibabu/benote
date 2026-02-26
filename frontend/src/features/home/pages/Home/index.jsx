import React, { useEffect, useState } from "react";
import PomodoroFocus from "./contents/pomodoro-focus";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaGem } from "react-icons/fa";
import { FaBolt, FaCheck, FaClock, FaDiamond } from "react-icons/fa6";
import AiSummary from "./contents/ai-summary";
import { useDispatch, useSelector } from "react-redux";
import { setWorkspaceRecent } from "@redux/slices/workspaceSlice";
import { setTasksRecent } from "@redux/slices/tasksSlice";
import TaskRecommendation from "./contents/task-recommendation";
import TaskStatus from "./contents/task-status";
import TaskActivityChart from "./contents/task-activity-chart";
import TodayTodos from "./contents/today-todos";
import AssignmentList from "./contents/assignment-list";

const WorkspaceSection = ({
  workspaces,
  workspaceLoading,
  handleWorkspaceOpen,
}) => (
  <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
    <h2 className="text-xl font-semibold mb-5 pb-2 border-b border-gray-200 text-gray-900 flex items-center gap-2">
      <AiOutlineClockCircle className="text-gray-500 text-xl" />
      Recent Workspaces
    </h2>
    {workspaceLoading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-xl p-4 h-28 flex flex-col justify-between"
          >
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    ) : (
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.length ? (
          workspaces.map((workspace) => (
            <li key={workspace.workspace.id}>
              <div
                title={workspace.workspace.description || workspace.workspace.name}
                className="flex flex-col p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer h-full group"
                onClick={handleWorkspaceOpen(workspace.workspace.id)}
              >
                <div className="text-4xl mb-3 select-none">
                  {workspace.workspace.emoji}
                </div>
                <div className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 truncate mb-1">
                  {workspace.workspace.name}
                </div>
                <div className="text-xs text-gray-500 mt-auto">
                  Accessed: {(() => {
                    const accessedAt = new Date(workspace.workspace.last_accessed_at);
                    const now = new Date();
                    const options = {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    };
                    if (
                      accessedAt.getDate() === now.getDate() &&
                      accessedAt.getMonth() === now.getMonth() &&
                      accessedAt.getFullYear() === now.getFullYear()
                    ) {
                      return accessedAt.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      });
                    }
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    if (accessedAt > oneWeekAgo) {
                      return accessedAt.toLocaleDateString("en-US", {
                        weekday: "short",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                      });
                    }
                    return accessedAt.toLocaleDateString("en-US", options);
                  })()}
                </div>
              </div>
            </li>
          ))
        ) : (
          <div className="text-gray-400 text-center col-span-full py-8">
            No recent workspaces to display.
          </div>
        )}
      </ul>
    )}
  </div>
);

const LatestTasks = ({ tasks, taskLoading }) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
      <h2 className="text-xl font-semibold mb-5 pb-2 border-b border-gray-200 text-gray-900 flex items-center gap-2">
        <FaClock className="text-gray-500 text-xl" />
        Latest Tasks
      </h2>
      {taskLoading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-xl h-16 w-full" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {tasks.length ? (
            tasks.map((task) => (
              <li
                key={task.id}
                title={task.description}
                className="flex items-center bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
              >
                <div
                  className={`text-2xl sm:text-3xl mr-4 ${
                    task.status === "done" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {task.status === "done" ? <FaCheckCircle /> : <FaClock />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-gray-700 mb-1 truncate">
                    {task.title}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center text-xs sm:text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>

                    {task.workspace?.name && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-sm text-xs font-medium">
                        {task.workspace.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  <span className="text-xs px-3 py-1 rounded-md font-semibold uppercase tracking-wide bg-gray-100 text-gray-700 border border-gray-200">
                    {task.status === "done" ? "Completed" : "Pending"}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <div className="text-gray-400 text-center w-full py-8">
              No recent tasks to display.
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

const Home = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [viewMode, setViewMode] = useState("default");
  const [activeTab, setActiveTab] = useState("workspaces");

  const userData = useSelector((state) => state.auth.user) || {};
  const dispatch = useDispatch();

  const workspaces =
    useSelector((state) => state.workspace.workspaceRecent) || [];
  const tasks = useSelector((state) => state.tasks.taskRecent) || [];

  const fetchWorkspaces = async () => {
    !workspaces.length && setWorkspaceLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/workspaces/?home=true`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      dispatch(setWorkspaceRecent(data));
    } catch (error) {
      alert("Error fetching recent workspaces");
      console.log(error);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const fetchTasks = async () => {
    !tasks.length && setTaskLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/tasks/?home=true`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      dispatch(setTasksRecent(data));
    } catch (error) {
      console.log(error);
    } finally {
      setTaskLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    fetchTasks();
  }, []);

  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  const handleWorkspaceOpen = (workspaceId) => () => {
    navigate(`/app/workspace/open/${workspaceId}`);
  };

  const tabConfig = [
    {
      key: "workspaces",
      label: "Workspaces",
      icon: <AiOutlineClockCircle className="text-lg" />,
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: <FaCheck className="text-lg" />,
    },
    {
      key: "pomodoro",
      label: "Pomodoro",
      icon: <FaBolt className="text-lg" />,
    },
    {
      key: "todos",
      label: "Today's Todos",
      icon: <FaCheckCircle className="text-lg" />,
    },
    {
      key: "ai",
      label: "AI Summary",
      icon: <FaGem className="text-lg" />,
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: <FaDiamond className="text-lg" />,
    },
    {
      key: "status",
      label: "Task Status",
      icon: <FaCheck className="text-lg" />,
    },
    {
      key: "activity",
      label: "Task Activity",
      icon: <FaClock className="text-lg" />,
    },
    {
      key: "recommendation",
      label: "Task Recommendation",
      icon: <FaBolt className="text-lg" />,
    },
  ];

  useEffect(() => {
    const storedViewMode = localStorage.getItem("dashboardViewMode");
    if (storedViewMode === "default" || storedViewMode === "tabbed") {
      setViewMode(storedViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboardViewMode", viewMode);
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 font-sans antialiased">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              Hello, <span className="text-gray-700">{userData?.name || "there"}</span>
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-500 font-medium">
              Plan clearly. Execute deeply.
            </p>
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
              Local Time
            </span>
            <span className="text-2xl font-mono tracking-wider text-gray-900">
              {time}
            </span>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-6 flex justify-end">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          <button
            className={`px-4 sm:px-5 py-2 rounded-lg font-medium transition-all duration-150 text-sm ${
              viewMode === "default"
                ? "bg-gray-100 text-gray-900"
                : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setViewMode("default")}
            aria-label="Default View"
          >
            Default View
          </button>
          <button
            className={`px-4 sm:px-5 py-2 rounded-lg font-medium transition-all duration-150 text-sm ${
              viewMode === "tabbed"
                ? "bg-gray-100 text-gray-900"
                : "bg-transparent text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setViewMode("tabbed")}
            aria-label="Tabbed View"
          >
            Tabbed View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {viewMode === "default" ? (
          <>
            <div className="md:col-span-2 flex flex-col gap-6">
              <WorkspaceSection
                workspaces={workspaces}
                workspaceLoading={workspaceLoading}
                handleWorkspaceOpen={handleWorkspaceOpen}
              />
              <LatestTasks tasks={tasks} taskLoading={taskLoading} />
            </div>

            <div className="md:col-span-1 flex flex-col gap-6">
              <TaskStatus />
              <TaskRecommendation />
            </div>
          </>
        ) : (
          <div className="md:col-span-3 border border-gray-200 bg-white rounded-2xl overflow-hidden">
            <div className="sticky top-0 z-10 flex gap-1 border-b border-gray-200 bg-white overflow-x-auto whitespace-nowrap scrollbar-hide p-2">
              {tabConfig.map((tab) => (
                <button
                  key={tab.key}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-150 text-sm ${
                    activeTab === tab.key
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                  aria-label={tab.label}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="p-4 sm:p-6">
              {activeTab === "workspaces" && (
                <WorkspaceSection
                  workspaces={workspaces}
                  workspaceLoading={workspaceLoading}
                  handleWorkspaceOpen={handleWorkspaceOpen}
                />
              )}
              {activeTab === "tasks" && (
                <LatestTasks tasks={tasks} taskLoading={taskLoading} />
              )}
              {activeTab === "pomodoro" && <PomodoroFocus />}
              {activeTab === "todos" && <TodayTodos />}
              {activeTab === "ai" && <AiSummary />}
              {activeTab === "assignments" && <AssignmentList />}
              {activeTab === "status" && <TaskStatus />}
              {activeTab === "activity" && <TaskActivityChart />}
              {activeTab === "recommendation" && <TaskRecommendation />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
