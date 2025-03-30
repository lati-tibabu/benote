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
    <div>
      {useGemini && (
        <div className="absolute right-0 flex">
          <div
            className="flex h-10 items-center gap-2 bg-gradient-to-tr from-pink-500 to-blue-600 transition-all duration-300 text-white cursor-pointer p-2 rounded-l-lg border-white border-l-2 border-y-2 shadow"
            onClick={() => {
              setShowAiSummary(!showAiSummary);
            }}
          >
            <FaBolt />
            Ai Summary
          </div>
          {showAiSummary && <AiSummary />}
        </div>
      )}
      {/* top */}
      <div className="p-6 mx-auto mb-5 h-[50vh] flex flex-col justify-center items-center text-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg text-white animate-fadeIn">
        <span className="text-2xl sm:text-4xl font-semibold">
          Hello, <strong>{userData && userData.name}</strong> 👋 How are you
          doing!
        </span>
        <span>{time}</span>
        <div className="mt-4">
          <p className="font-bold text-3xl uppercase flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7v4l4 2 4-2V7m4 5a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
          </p>
          <p className="text-lg tracking-wide opacity-90">
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* main */}
      <div className="flex gap-3 justify-between flex-col md:flex-row p-2">
        <div className="h-fit grow flex-1 flex gap-3 overflow-x-auto border-x-1 p-2">
          {/* Workspaces */}
          <div>
            {/* <div className="flex items-center text-sm gap-2">
              <AiOutlineClockCircle />
              Recent Workspaces
            </div> */}
            <div className="font-bold flex items-center gap-2">
              <AiOutlineClockCircle />
              Recent Workspaces
            </div>

            {workspaceLoading ? (
              <div className="flex flex-col w-64 justify-center items-center gap-2 p-2">
                <div className="border-2 w-full animate-pulse bg-gray-100 rounded-box flex flex-col p-3 gap-3">
                  <div className="w-full h-[20px] animate-pulse bg-gray-300 rounded"></div>
                  <div className="w-[150px] h-[20px] animate-pulse bg-gray-300 rounded"></div>
                </div>
                <div className="border-2 w-full animate-pulse bg-gray-100 rounded-box flex flex-col p-3 gap-3">
                  <div className="w-full h-[20px] animate-pulse bg-gray-300 rounded"></div>
                  <div className="w-[150px] h-[20px] animate-pulse bg-gray-300 rounded"></div>
                </div>
                <div className="border-2 w-full animate-pulse bg-gray-100 rounded-box flex flex-col p-3 gap-3">
                  <div className="w-full h-[20px] animate-pulse bg-gray-300 rounded"></div>
                  <div className="w-[150px] h-[20px] animate-pulse bg-gray-300 rounded"></div>
                </div>
              </div>
            ) : (
              <div>
                <ul className="flex flex-col gap-2 justify-stretch">
                  {workspaces.map((workspace) => (
                    <li key={workspace.workspace.id}>
                      <div
                        title={
                          workspace.workspace.description ||
                          workspace.workspace.name
                        }
                        className="flex gap-2 items-start cursor-default border-2 border-gray-200 p-3 rounded-box hover:bg-blue-50 hover:border-blue-500 hover:cursor-pointer"
                        onClick={handleWorkspaceOpen(workspace.workspace.id)}
                      >
                        {/* icon */}
                        <div className="text-3xl">
                          {workspace.workspace.emoji}
                        </div>
                        {/* main */}
                        <div className="border-l-1 pl-3">
                          {/* name */}
                          <div>{workspace.workspace.name}</div>
                          {/* creation date */}
                          <div className="text-sm text-gray-600">
                            Accessed on{" "}
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

                              // Same day → Show only time (e.g., 3:45 PM)
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

                              // Same week → Show "Weekday, time" (e.g., Tue, 3:45 PM)
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

                              // Older than a week → Full date (e.g., Mar 10, 2024, 3:45 PM)
                              return accessedAt.toLocaleDateString(
                                "en-US",
                                options
                              );
                            })()}
                          </div>

                          {/* private or team */}
                          {/* <div>
                          {workspace.workspace.type
                            .split("-")[0]
                            .toLowerCase()
                            .trim() === "team" ? (
                            <div className="flex items-center gap-1">
                              <div className="bg-blue-600 text-white px-1 w-fit text-xs">
                                {workspace.workspace.type.split("-")[0]}
                              </div>
                              <div className="text-xs hover:underline hover:text-blue-700">
                                {workspace.workspace.type.split("-")[1]}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-green-600 text-white px-1 w-fit text-xs">
                              {workspace.workspace.type}
                            </div>
                          )}
                        </div> */}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Today Tasks */}
          <div>
            <div className="font-bold">Latest Tasks</div>
            {taskLoading ? (
              <div className="flex flex-col w-64 justify-center items-center gap-2 p-2">
                <div className="border-2 w-full animate-pulse bg-gray-100 rounded-box flex flex-col p-3 gap-3">
                  <div className="w-full h-[20px] animate-pulse bg-gray-300 rounded"></div>
                  <div className="w-[150px] h-[20px] animate-pulse bg-gray-300 rounded"></div>
                </div>
                <div className="border-2 w-full animate-pulse bg-gray-100 rounded-box flex flex-col p-3 gap-3">
                  <div className="w-full h-[20px] animate-pulse bg-gray-300 rounded"></div>
                  <div className="w-[150px] h-[20px] animate-pulse bg-gray-300 rounded"></div>
                </div>
                <div className="border-2 w-full animate-pulse bg-gray-100 rounded-box flex flex-col p-3 gap-3">
                  <div className="w-full h-[20px] animate-pulse bg-gray-300 rounded"></div>
                  <div className="w-[150px] h-[20px] animate-pulse bg-gray-300 rounded"></div>
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    title={task.description}
                    className="flex gap-4 items-center bg-white shadow-md border p-4 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    {/* Task Status Icon */}
                    <div className="text-3xl text-green-500">
                      {task.status === "done" ? <FaCheckCircle /> : <FaClock />}
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col w-full">
                      {/* Task Title */}
                      <div className="text-lg font-semibold flex items-center gap-2">
                        {task.title}
                      </div>

                      {/* Task Metadata */}
                      <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                        {/* Due Date */}
                        <span className="flex items-center gap-1">
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </span>

                        {/* Workspace Name */}
                        <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                          {task.workspace?.name}
                        </span>
                      </div>

                      {/* Task Status */}
                      <div className="mt-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            task.status === "done"
                              ? "bg-green-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {task.status === "done" ? "Completed" : "Todo"}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <PomodoroFocus />
      </div>
    </div>
  );
};

export default Home;

// const workspaces = [
//   {
//     emoji: "🧑‍🎓",
//     name: "Academic Tasks",
//     creationDate: "December 31, 2024",
//     type: "Private",
//     description:
//       "A personal workspace for organizing homework, project deadlines, and study schedules.",
//   },
//   {
//     emoji: "💻",
//     name: "Code Studio",
//     creationDate: "December 15, 2024",
//     type: "Team - DevSquad",
//     description:
//       "Collaborative workspace for tracking coding projects, version control, and debugging tasks within the team.",
//   },
//   {
//     emoji: "📝",
//     name: "Research Notes",
//     creationDate: "December 10, 2024",
//     type: "Private",
//     description:
//       "Dedicated to managing and organizing notes, references, and drafts for ongoing research papers.",
//   },
//   {
//     emoji: "🎮",
//     name: "Game Night Plan",
//     creationDate: "December 20, 2024",
//     type: "Team - Weekend Warriors",
//     description:
//       "A shared workspace for planning team gaming events, including schedules, challenges, and score tracking.",
//   },
//   {
//     emoji: "🌍",
//     name: "Community Outreach",
//     creationDate: "December 5, 2024",
//     type: "Team - Helping Hands",
//     description:
//       "Used for managing volunteer schedules, tasks, and events for community service initiatives.",
//   },
// ];
// const tasks = [
//   {
//     emoji: "🛒",
//     title: "Buy Groceries",
//     dueDate: "December 31, 2024",
//     status: "done",
//     description: "Purchase vegetables, fruits, and other essential groceries.",
//   },
//   {
//     emoji: "📚",
//     title: "Do Homework",
//     dueDate: "January 1, 2025",
//     status: "not_done",
//     description: "Complete assignments for Compiler Design and NLP.",
//   },
//   {
//     emoji: "🧹",
//     title: "Clean the Room",
//     dueDate: "January 2, 2025",
//     status: "not_done",
//     description: "Organize books, dust shelves, and vacuum the floor.",
//   },
//   {
//     emoji: "📅",
//     title: "Prepare for the Meeting",
//     dueDate: "January 3, 2025",
//     status: "done",
//     description: "Finalize the presentation slides and review key points.",
//   },
//   {
//     emoji: "🚶",
//     title: "Go for a Walk",
//     dueDate: "January 4, 2025",
//     status: "not_done",
//     description: "Enjoy a 30-minute evening walk in the park.",
//   },
// ];
const teams = [
  {
    emoji: "👨‍💻",
    name: "DevSquad",
    creationDate: "December 15, 2024",
    members: 8,
    description:
      "A development team working on building innovative web and mobile applications.",
  },
  {
    emoji: "📖",
    name: "Study Circle",
    creationDate: "December 20, 2024",
    members: 5,
    description:
      "Group of students collaborating on exam preparation and sharing resources.",
  },
  {
    emoji: "🤝",
    name: "Helping Hands",
    creationDate: "December 10, 2024",
    members: 12,
    description:
      "Community volunteers focused on organizing outreach programs and charity events.",
  },
  {
    emoji: "🎮",
    name: "Weekend Warriors",
    creationDate: "December 5, 2024",
    members: 6,
    description: "Gaming team participating in weekend tournaments and events.",
  },
  {
    emoji: "🎨",
    name: "Creative Minds",
    creationDate: "December 18, 2024",
    members: 4,
    description:
      "A team of artists and designers collaborating on creative projects.",
  },
];
