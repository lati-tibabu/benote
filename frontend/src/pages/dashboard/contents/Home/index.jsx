import React, { useEffect, useState } from "react";
import PomodoroFocus from "./contents/pomodoro-focus";
import { AiOutlineClockCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaGem } from "react-icons/fa";
import { FaBolt, FaCheck, FaClock, FaDiamond } from "react-icons/fa6";
import AiSummary from "./contents/ai-summary";
import { useDispatch, useSelector } from "react-redux";
import { setWorkspaceRecent } from "../../../../redux/slices/workspaceSlice";
import { setTasksRecent } from "../../../../redux/slices/tasksSlice";
import GeminiIcon from "../../../../components/geminiIcon";
import TaskRecommendation from "./contents/task-recommendation";
import TaskStatus from "./contents/task-status";
import TaskActivityChart from "./contents/task-activity-chart";
import TodayTodos from "./contents/today-todos";
import AssignmentList from "./contents/assignment-list";

// WorkspaceSection component
const WorkspaceSection = ({
  workspaces,
  workspaceLoading,
  handleWorkspaceOpen,
}) => (
  <div className="w-full max-w-3xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg p-5 sm:p-7 mx-auto">
    <h2 className="text-xl sm:text-2xl font-bold mb-5 pb-2 border-b border-blue-200 text-blue-800 flex items-center gap-2">
      <AiOutlineClockCircle className="text-blue-500 text-2xl" />
      Recent Workspaces
    </h2>
    {workspaceLoading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-blue-100 rounded-xl p-4 h-28 flex flex-col justify-between"
          >
            <div className="h-5 bg-blue-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
            <div className="h-4 bg-blue-200 rounded w-full"></div>
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
                className="flex flex-col p-4 rounded-xl shadow-sm border border-blue-100 bg-white/80 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 cursor-pointer h-full group"
                onClick={handleWorkspaceOpen(workspace.workspace.id)}
              >
                <div className="text-4xl mb-3 select-none">
                  {workspace.workspace.emoji}
                </div>
                <div className="font-semibold text-lg text-blue-900 group-hover:text-blue-700 truncate mb-1">
                  {workspace.workspace.name}
                </div>
                <div className="text-xs text-blue-500 mt-auto">
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
          <div className="text-blue-400 text-center col-span-full py-8">
            No recent workspaces to display.
          </div>
        )}
      </ul>
    )}
  </div>
);

// LatestTasks component
const LatestTasks = ({ tasks, taskLoading }) => {
  return (
    <div className="w-full max-w-md bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg p-5 sm:p-7 mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 pb-2 border-b border-blue-200 text-blue-800 flex items-center gap-2">
        <FaClock className="text-blue-500 text-2xl" />
        Latest Tasks
      </h2>
      {taskLoading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-blue-100 rounded-xl h-16 w-full" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {tasks.length ? (
            tasks.map((task) => (
              <li
                key={task.id}
                title={task.description}
                className="flex items-center bg-white/80 border border-blue-100 p-4 rounded-xl shadow-sm hover:bg-blue-50 transition-all duration-200 group"
              >
                {/* Task Status Icon */}
                <div
                  className={`text-2xl sm:text-3xl mr-4 ${
                    task.status === "done" ? "text-green-500" : "text-blue-400"
                  }`}
                >
                  {task.status === "done" ? <FaCheckCircle /> : <FaClock />}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Task Title */}
                  <div className="text-base sm:text-lg font-semibold text-blue-900 group-hover:text-blue-700 mb-1 truncate">
                    {task.title}
                  </div>

                  {/* Task Metadata */}
                  <div className="flex flex-wrap gap-2 items-center text-xs sm:text-sm text-blue-500">
                    {/* Due Date */}
                    <span className="flex items-center gap-1">
                      📅 {new Date(task.due_date).toLocaleDateString()}
                    </span>

                    {/* Workspace Name */}
                    {task.workspace?.name && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {task.workspace.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Task Status */}
                <div className="ml-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${
                      task.status === "done"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {task.status === "done" ? "Completed" : "Pending"}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <div className="text-blue-400 text-center w-full py-8">
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

  const [showAiSummary, setShowAiSummary] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [viewMode, setViewMode] = useState("default"); // "default" or "tabbed"
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
      // setWorkspaces(data);
      dispatch(setWorkspaceRecent(data));
    } catch (error) {
      alert("Error fetching recent workspaces");
      console.log(error);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  // console.log("workspaces", workspaces);

  const fetchTasks = async () => {
    !tasks.length && setTaskLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/tasks/?home=true`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      // console.log(data);
      // setTasks(data);
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
  const useGemini = localStorage.getItem("useGemini") === "true" ? true : false;
  const tabConfig = [
    {
      key: "workspaces",
      label: "Workspaces",
      icon: <AiOutlineClockCircle className="text-blue-500 text-lg" />,
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: <FaCheck className="text-green-500 text-lg" />,
    },
    {
      key: "pomodoro",
      label: "Pomodoro",
      icon: <FaBolt className="text-yellow-500 text-lg" />,
    },
    {
      key: "todos",
      label: "Today's Todos",
      icon: <FaCheckCircle className="text-indigo-500 text-lg" />,
    },
    {
      key: "ai",
      label: "AI Summary",
      icon: <FaGem className="text-purple-500 text-lg" />,
    },
    {
      key: "assignments",
      label: "Assignments",
      icon: <FaDiamond className="text-pink-500 text-lg" />,
    },
    {
      key: "status",
      label: "Task Status",
      icon: <FaCheck className="text-cyan-500 text-lg" />,
    },
    {
      key: "activity",
      label: "Task Activity",
      icon: <FaClock className="text-orange-500 text-lg" />,
    },
    {
      key: "recommendation",
      label: "Task Recommendation",
      icon: <FaBolt className="text-amber-500 text-lg" />,
    },
  ];

  // On mount, load viewMode from localStorage if present
  useEffect(() => {
    const storedViewMode = localStorage.getItem("dashboardViewMode");
    if (storedViewMode === "default" || storedViewMode === "tabbed") {
      setViewMode(storedViewMode);
    }
  }, []);

  // When viewMode changes, store it in localStorage
  useEffect(() => {
    localStorage.setItem("dashboardViewMode", viewMode);
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6 font-sans antialiased">
      {/* Top Section */}
      <div className="p-10 my-8 bg-white/80 backdrop-blur rounded-3xl shadow-2xl text-gray-900 flex flex-col justify-center items-center text-center border border-blue-100 animate-fade-in-down">
        <h1 className="text-4xl sm:text-6xl font-black mb-3 leading-tight tracking-tight text-blue-700">
          Hello,{" "}
          <span className="text-indigo-600">{userData && userData.name}</span>{" "}
          👋
        </h1>
        <p className="text-lg sm:text-2xl text-gray-600 mb-3 font-medium">
          How are you doing today?
        </p>
        <span className="text-2xl sm:text-3xl font-mono text-blue-600 tracking-widest bg-blue-50 px-4 py-1 rounded-xl shadow-inner">
          {time}
        </span>
        <div className="mt-7 flex items-center space-x-4 text-gray-800">
          <FaClock className="h-8 w-8 text-blue-400" />
          <p className="font-bold text-2xl uppercase tracking-wider">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </p>
          <p className="text-lg opacity-80">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6 gap-3">
        <button
          className={`px-5 py-2 rounded-xl font-semibold border transition-all duration-150 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-base \
            ${
              viewMode === "default"
                ? "bg-blue-700 text-white border-blue-700 shadow-lg"
                : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
            }`}
          onClick={() => setViewMode("default")}
          aria-label="Default View"
        >
          Default View
        </button>
        <button
          className={`px-5 py-2 rounded-xl font-semibold border transition-all duration-150 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 text-base \
            ${
              viewMode === "tabbed"
                ? "bg-blue-700 text-white border-blue-700 shadow-lg"
                : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
            }`}
          onClick={() => setViewMode("tabbed")}
          aria-label="Tabbed View"
        >
          Tabbed View
        </button>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-2">
        {viewMode === "default" ? (
          <>
            {/* Left Column - Main Components */}
            <div className="md:col-span-2 flex flex-col gap-8">
              <WorkspaceSection
                workspaces={workspaces}
                workspaceLoading={workspaceLoading}
                handleWorkspaceOpen={handleWorkspaceOpen}
              />
              <LatestTasks tasks={tasks} taskLoading={taskLoading} />
              <PomodoroFocus />
              <TodayTodos />
              <AiSummary />
              <AssignmentList />
            </div>

            {/* Right Column - Side Components */}
            <div className="md:col-span-1 flex flex-col gap-8">
              <TaskStatus />
              <TaskActivityChart />
              <TaskRecommendation />
            </div>
          </>
        ) : (
          // Tabbed view should take full width
          <div className="md:col-span-3 bg-white/90 rounded-2xl shadow-xl border border-blue-100">
            <div className="flex border-b border-blue-100 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 scrollbar-hide">
              {tabConfig.map((tab) => (
                <button
                  key={tab.key}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 text-center font-semibold transition-all duration-150 text-base \
                  ${
                    activeTab === tab.key
                      ? "border-b-4 border-blue-600 text-blue-700 bg-blue-50 shadow-inner"
                      : "text-gray-600 hover:bg-blue-50 border-b-4 border-transparent"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                  aria-label={tab.label}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="p-8">
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
