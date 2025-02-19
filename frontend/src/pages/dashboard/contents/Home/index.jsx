import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const Home = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);

  //fetching currently logged in user id from the jwt token
  useEffect(() => {
    try {
      if (token) {
        const data = jwtDecode(token);
        setUserId(data.id);
      } else {
        console.log("token not found");
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  // loading the user data from database

  const loadUserData = async () => {
    if (!userId) {
      return;
    }

    try {
      const response = await fetch(`${apiURL}/api/users/${userId}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  // console.log(userData);

  const [todo, setTodo] = useState([
    { id: "123", title: "Buy Groceries", status: "done" },
    { id: "124", title: "Do Homework", status: "not_done" },
    { id: "125", title: "Clean the room", status: "not_done" },
    { id: "126", title: "Prepare for the meeting", status: "done" },
    { id: "127", title: "Go for a walk", status: "not_done" },
  ]);

  const toggleStatus = (id) => {
    setTodo((prevTodo) =>
      prevTodo.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "done" ? "not_done" : "done" }
          : item
      )
    );
  };

  return (
    <div>
      {/* top */}
      <div>
        {/* greeting message */}
        {/* <div className="p-5 border-l-1 border-t-1 border-b-5 border-r-5 border-black rounded-box w-fit mx-auto"> */}
        <div className="p-5 w-fit mx-auto mb-5">
          <span className="text-3xl">
            Hello, <strong>{userData && userData.name}</strong> good afternoon!
          </span>
        </div>
      </div>
      {/* main */}
      <div className="flex gap-3 justify-between flex-col md:flex-row">
        {/* Workspaces */}

        <div>
          <div className="font-bold">Workspaces</div>
          <div>
            <ul className="flex flex-col gap-2 justify-stretch">
              {workspaces.map((workspace) => (
                <li>
                  <div
                    title={workspace.description}
                    className="flex gap-2 items-center cursor-default border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 hover:cursor-pointer"
                  >
                    {/* icon */}
                    <div className="text-3xl">{workspace.emoji}</div>
                    {/* main */}
                    <div className="border-l-1 pl-3">
                      {/* name */}
                      <div>{workspace.name}</div>
                      {/* creation date */}
                      <div className="font-bold text-sm">
                        {workspace.creationDate}
                      </div>
                      {/* private or team */}
                      <div>
                        {workspace.type.split("-")[0].toLowerCase().trim() ===
                        "team" ? (
                          <div className="flex items-center gap-1">
                            <div className="bg-blue-600 text-white px-1 w-fit text-xs">
                              {workspace.type.split("-")[0]}
                            </div>
                            <div className="text-xs hover:underline hover:text-blue-700">
                              {workspace.type.split("-")[1]}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-green-600 text-white px-1 w-fit text-xs">
                            {workspace.type}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Today Tasks */}
        <div>
          <div className="font-bold">Tasks</div>
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.title}
                title={task.description}
                className="flex gap-2 items-center border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 hover:cursor-pointer"
              >
                {/* Emoji */}
                <div className="text-3xl">{task.emoji}</div>
                {/* Main Content */}
                <div className="border-l-1 pl-3">
                  {/* Task Title */}
                  <div>{task.title}</div>
                  {/* Due Date */}
                  <div className="font-bold text-sm">{task.dueDate}</div>
                  {/* Status */}
                  <div
                    className={`text-xs px-1 w-fit ${
                      task.status === "done"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {task.status === "done" ? "Completed" : "Pending"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Daily to do */}
        <div className="h-fit ">
          <div className="font-bold">Daily To Do</div>
          <div className="cursor-default border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 hover:cursor-pointer">
            <div className="text-3xl relative bottom-8 text-center">📌</div>
            <ul>
              {todo.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded-3xl checkbox border-black border-2"
                      checked={item.status === "done"}
                      onChange={() => toggleStatus(item.id)}
                    />
                  </div>
                  <span
                    className={`${
                      item.status === "done" ? "line-through" : ""
                    }`}
                  >
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>

            {/* <ul>
              <li className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center peer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-3xl checkbox border-black border-2 "
                    size={10}
                    name=""
                    id=""
                    onChange={() => {
                      setChecked(!checked);
                    }}
                  />
                </div>
                <span className={`${checked ? "line-through" : ""}`}>
                  Buy Groceries
                </span>
              </li>

              <li className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center peer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-3xl checkbox border-black border-2 "
                    size={10}
                    name=""
                    id=""
                    onChange={() => {
                      setChecked(!checked);
                    }}
                  />
                </div>
                <span className={`${checked ? "line-through" : ""}`}>
                  Finish Homework
                </span>
              </li>

              <li className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center peer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-3xl checkbox border-black border-2 "
                    size={10}
                    name=""
                    id=""
                    onChange={() => {
                      setChecked(!checked);
                    }}
                  />
                </div>
                <span className={`${checked ? "line-through" : ""}`}>
                  Clean the Room
                </span>
              </li>

              <li className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center peer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-3xl checkbox border-black border-2 "
                    size={10}
                    name=""
                    id=""
                    onChange={() => {
                      setChecked(!checked);
                    }}
                  />
                </div>
                <span className={`${checked ? "line-through" : ""}`}>
                  Prepare for Meeting
                </span>
              </li>

              <li className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center peer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-3xl checkbox border-black border-2 "
                    size={10}
                    name=""
                    id=""
                    onChange={() => {
                      setChecked(!checked);
                    }}
                  />
                </div>
                <span className={`${checked ? "line-through" : ""}`}>
                  Go for a Walk
                </span>
              </li>
            </ul> */}
          </div>
        </div>

        {/* Teams */}
        <div>
          <div className="font-bold">Teams</div>
          <ul className="flex flex-col gap-2">
            {teams.map((team) => (
              <li
                key={team.name}
                title={team.description}
                className="flex gap-2 items-center border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 hover:cursor-pointer"
              >
                {/* Emoji */}
                <div className="text-3xl">{team.emoji}</div>
                {/* Main Content */}
                <div className="border-l-1 pl-3">
                  {/* Team Name */}
                  <div>{team.name}</div>
                  {/* Creation Date */}
                  <div className="font-bold text-sm">{team.creationDate}</div>
                  {/* Members */}
                  <div className="text-xs bg-blue-600 text-white px-1 w-fit">
                    {team.members} Members
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;

const workspaces = [
  {
    emoji: "🧑‍🎓",
    name: "Academic Tasks",
    creationDate: "December 31, 2024",
    type: "Private",
    description:
      "A personal workspace for organizing homework, project deadlines, and study schedules.",
  },
  {
    emoji: "💻",
    name: "Code Studio",
    creationDate: "December 15, 2024",
    type: "Team - DevSquad",
    description:
      "Collaborative workspace for tracking coding projects, version control, and debugging tasks within the team.",
  },
  {
    emoji: "📝",
    name: "Research Notes",
    creationDate: "December 10, 2024",
    type: "Private",
    description:
      "Dedicated to managing and organizing notes, references, and drafts for ongoing research papers.",
  },
  {
    emoji: "🎮",
    name: "Game Night Plan",
    creationDate: "December 20, 2024",
    type: "Team - Weekend Warriors",
    description:
      "A shared workspace for planning team gaming events, including schedules, challenges, and score tracking.",
  },
  {
    emoji: "🌍",
    name: "Community Outreach",
    creationDate: "December 5, 2024",
    type: "Team - Helping Hands",
    description:
      "Used for managing volunteer schedules, tasks, and events for community service initiatives.",
  },
];

const tasks = [
  {
    emoji: "🛒",
    title: "Buy Groceries",
    dueDate: "December 31, 2024",
    status: "done",
    description: "Purchase vegetables, fruits, and other essential groceries.",
  },
  {
    emoji: "📚",
    title: "Do Homework",
    dueDate: "January 1, 2025",
    status: "not_done",
    description: "Complete assignments for Compiler Design and NLP.",
  },
  {
    emoji: "🧹",
    title: "Clean the Room",
    dueDate: "January 2, 2025",
    status: "not_done",
    description: "Organize books, dust shelves, and vacuum the floor.",
  },
  {
    emoji: "📅",
    title: "Prepare for the Meeting",
    dueDate: "January 3, 2025",
    status: "done",
    description: "Finalize the presentation slides and review key points.",
  },
  {
    emoji: "🚶",
    title: "Go for a Walk",
    dueDate: "January 4, 2025",
    status: "not_done",
    description: "Enjoy a 30-minute evening walk in the park.",
  },
];
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
