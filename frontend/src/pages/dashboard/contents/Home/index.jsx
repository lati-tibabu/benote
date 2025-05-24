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
  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans antialiased">
      {/* AI Summary Toggle
      {useGemini && (
        <div className="absolute right-0 top-10 flex">
          <div
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-l-lg shadow-sm cursor-pointer hover:bg-gray-100 z-10"
            // className="flex h-10 items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg
            //            hover:from-purple-700 hover:to-indigo-800 transition-all duration-300
            //            px-4 py-2 rounded-l-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
            onClick={() => setShowAiSummary(!showAiSummary)}
          >
            <GeminiIcon />
            <span className="font-medium text-gray-700">AI Summary</span>
          </div>
          {showAiSummary && <AiSummary />}
        </div>
      )} */}
      {/* Top Section */}
      <div
        className="p-8 my-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl text-gray-900 
                      flex flex-col justify-center items-center text-center animate-fade-in-down"
      >
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 leading-tight">
          Hello,{" "}
          <strong className="text-blue-600">{userData && userData.name}</strong>{" "}
          👋
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-4">
          How are you doing today?
        </p>
        <span className="text-xl sm:text-2xl font-mono text-blue-600 tracking-wide">
          {time}
        </span>
        <div className="mt-6 flex items-center space-x-3 text-gray-800">
          <FaClock className="h-7 w-7 text-blue-500" />
          <p className="font-bold text-2xl uppercase">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </p>
          <p className="text-lg opacity-90">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {/* Left Column - Workspaces and Today's Todos */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AiOutlineClockCircle className="text-blue-500 text-2xl" />
              Recent Workspaces
            </h2>
            {workspaceLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-lg p-4 h-28 flex flex-col justify-between"
                  >
                    <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.length ? (
                  workspaces.map((workspace) => (
                    <li key={workspace.workspace.id}>
                      <div
                        title={
                          workspace.workspace.description ||
                          workspace.workspace.name
                        }
                        className="flex flex-col p-4 rounded-lg shadow-sm border border-gray-200 
                                   hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 cursor-pointer h-full"
                        onClick={handleWorkspaceOpen(workspace.workspace.id)}
                      >
                        <div className="text-4xl mb-3">
                          {workspace.workspace.emoji}
                        </div>
                        <div className="font-medium text-lg text-gray-800 truncate mb-1">
                          {workspace.workspace.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-auto">
                          Accessed:{" "}
                          {(() => {
                            const accessedAt = new Date(
                              workspace.workspace.last_accessed_at
                            );
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

                            return accessedAt.toLocaleDateString(
                              "en-US",
                              options
                            );
                          })()}
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center col-span-full py-8">
                    No recent workspaces to display.
                  </p>
                )}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 overflow-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaClock className="text-green-500 text-2xl" />
              Latest Tasks
            </h2>
            {taskLoading ? (
              <div className="grid grid-cols-1 gap-4 animate-pulse">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 rounded-lg p-4 h-24 flex flex-col justify-between"
                  >
                    <div className="h-5 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4">
                {tasks.length ? (
                  tasks.map((task) => (
                    <li
                      key={task.id}
                      title={task.description}
                      className="flex items-center bg-white shadow-sm border border-gray-200 p-4 rounded-lg 
                                 hover:bg-gray-50 transition-all duration-200 w-fit"
                    >
                      {/* Task Status Icon */}
                      <div
                        className={`text-3xl mr-4 ${
                          task.status === "done"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {task.status === "done" ? (
                          <FaCheckCircle />
                        ) : (
                          <FaClock />
                        )}
                      </div>

                      {/* Main Content */}
                      <div className="flex-1">
                        {/* Task Title */}
                        <div className="text-lg font-semibold text-gray-800 mb-1 truncate">
                          {task.title}
                        </div>

                        {/* Task Metadata */}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          {/* Due Date */}
                          <span className="flex items-center gap-1">
                            📅 {new Date(task.due_date).toLocaleDateString()}
                          </span>

                          {/* Workspace Name */}
                          {task.workspace?.name && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
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
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {task.status === "done" ? "Completed" : "Pending"}
                        </span>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No recent tasks to display.
                  </p>
                )}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <PomodoroFocus />
            <TodayTodos />
            <AiSummary />
          </div>
        </div>

        {/* Right Column - Side Components */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <TaskStatus />
          <TaskActivityChart />
          <TaskRecommendation />
        </div>
      </div>
    </div>
  );
};

export default Home;
