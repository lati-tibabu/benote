import React, { useEffect, useState } from "react";
import {
  AiOutlineFileAdd,
  AiOutlineFolder,
  AiOutlineFolderAdd,
} from "react-icons/ai";
import AddNew from "./add_new";

function Workspace() {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const header = {
    authorization: `Bearer ${token}`,
  };

  const [workspaces, setWorkspaces] = useState([]);

  const getWorkspace = async () => {
    const response = await fetch(`${apiURL}/api/workspaces`, {
      method: "GET",
      headers: header,
    });
    const data = await response.json();
    setWorkspaces(data);
    // console.log(data);
  };

  useEffect(() => {
    getWorkspace();
  }, []);

  console.log(workspaces);

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
  //   {
  //     emoji: "📚",
  //     name: "Reading Circle",
  //     creationDate: "January 2, 2025",
  //     type: "Team - Bookworms",
  //     description:
  //       "Workspace for discussing books, sharing reviews, and setting reading goals.",
  //   },
  //   {
  //     emoji: "🍴",
  //     name: "Meal Prep Ideas",
  //     creationDate: "January 1, 2025",
  //     type: "Private",
  //     description:
  //       "Personal workspace for organizing recipes, grocery lists, and weekly meal plans.",
  //   },
  //   // {
  //   //   emoji: "🛠️",
  //   //   name: "DIY Projects",
  //   //   creationDate: "December 22, 2024",
  //   //   type: "Private",
  //   //   description:
  //   //     "Workspace for tracking progress on home improvement, crafting, and personal DIY projects.",
  //   // },
  //   // {
  //   //   emoji: "📊",
  //   //   name: "Work Performance",
  //   //   creationDate: "January 3, 2025",
  //   //   type: "Private",
  //   //   description:
  //   //     "Workspace for organizing career goals, tracking performance metrics, and planning professional development.",
  //   // },
  //   // {
  //   //   emoji: "🌱",
  //   //   name: "Garden Planner",
  //   //   creationDate: "January 5, 2025",
  //   //   type: "Private",
  //   //   description:
  //   //     "Workspace for managing planting schedules, seed purchases, and garden layouts.",
  //   // },
  //   // {
  //   //   emoji: "🎥",
  //   //   name: "Content Creation Hub",
  //   //   creationDate: "December 25, 2024",
  //   //   type: "Team - Creators United",
  //   //   description:
  //   //     "Shared workspace for brainstorming ideas, scripting, and editing social media or video content.",
  //   // },
  //   // {
  //   //   emoji: "💡",
  //   //   name: "Startup Incubator",
  //   //   creationDate: "December 30, 2024",
  //   //   type: "Team - Entrepreneurs",
  //   //   description:
  //   //     "Collaborative space for brainstorming business ideas, setting milestones, and pitching plans.",
  //   // },
  //   // {
  //   //   emoji: "🏋️",
  //   //   name: "Fitness Goals",
  //   //   creationDate: "January 4, 2025",
  //   //   type: "Private",
  //   //   description:
  //   //     "Workspace for tracking workouts, setting fitness targets, and monitoring progress.",
  //   // },
  //   // {
  //   //   emoji: "🎨",
  //   //   name: "Art Portfolio",
  //   //   creationDate: "December 27, 2024",
  //   //   type: "Private",
  //   //   description:
  //   //     "Workspace for organizing art projects, sketch ideas, and exhibition plans.",
  //   // },
  //   // {
  //   //   emoji: "🚀",
  //   //   name: "Launch Plan",
  //   //   creationDate: "January 7, 2025",
  //   //   type: "Team - Mission Control",
  //   //   description:
  //   //     "Collaborative workspace for planning and managing product launches or marketing campaigns.",
  //   // },
  //   // {
  //   //   emoji: "🛍️",
  //   //   name: "E-commerce Strategy",
  //   //   creationDate: "December 29, 2024",
  //   //   type: "Private",
  //   //   description:
  //   //     "Workspace for tracking product ideas, sales trends, and advertising plans for online stores.",
  //   // },
  //   // {
  //   //   emoji: "🎤",
  //   //   name: "Podcast Planner",
  //   //   creationDate: "January 6, 2025",
  //   //   type: "Team - Podcasters",
  //   //   description:
  //   //     "Workspace for scripting, scheduling, and organizing podcast episodes and guest interviews.",
  //   // },
  //   // {
  //   //   emoji: "🎯",
  //   //   name: "Personal Goals",
  //   //   creationDate: "December 26, 2024",
  //   //   type: "Private",
  //   //   description:
  //   //     "A personal workspace for goal-setting, tracking achievements, and staying motivated.",
  //   // },
  //   // {
  //   //   emoji: "🗺️",
  //   //   name: "Travel Itineraries",
  //   //   creationDate: "December 24, 2024",
  //   //   type: "Private",
  //   //   description:
  //   //     "Workspace for planning trips, organizing itineraries, and tracking travel expenses.",
  //   // },
  //   // {
  //   //   emoji: "🎭",
  //   //   name: "Event Planning",
  //   //   creationDate: "January 8, 2025",
  //   //   type: "Team - Event Pros",
  //   //   description:
  //   //     "Collaborative workspace for organizing social gatherings, workshops, or conferences.",
  //   // },
  //   // {
  //   //   emoji: "🏡",
  //   //   name: "Household Chores",
  //   //   creationDate: "January 9, 2025",
  //   //   type: "Team - Roommates",
  //   //   description:
  //   //     "Shared workspace for assigning and tracking household chores among roommates or family.",
  //   // },
  // ];

  return (
    <div>
      {/* card */}
      {/* <div>this is a card</div> */}
      <button
        className="p-1 font-bold hover:underline hover:text-blue-700 flex items-center gap-1"
        onClick={() => document.getElementById("my_modal_3").showModal()}
      >
        {/* <AiOutlineFileAdd className="inline-block" /> */}
        <AiOutlineFolderAdd className="inline-block" />
        Add New Workspace
      </button>
      <ul className="flex flex-row flex-wrap gap-4">
        {workspaces.map((workspace) => (
          <li className="grow" key={workspace.name}>
            <div
              title={workspace.description}
              className="relative flex flex-col gap-2 items-center cursor-default border-1 border-black p-3 rounded-box hover:bg-gray-50 hover:border-r-4 hover:border-b-4 hover:cursor-pointer overflow-hidden"
              style={{
                transition: "all 0.09s",
              }}
            >
              {/* Blurred Emoji Background */}
              <div
                className="absolute inset-0 filter blur-lg bg-cover bg-no-repeat bg-center opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Ctext x='0' y='40' font-size='50'%3E${encodeURIComponent(
                    workspace.emoji
                  )}%3C/text%3E%3C/svg%3E")`,
                }}
              ></div>

              {/* Foreground Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="text-3xl text-center m-5">
                  {workspace.emoji}
                </div>

                {/* Main Content */}
                <div className="border-t-1 border-black pl-3">
                  {/* Name */}
                  <div>{workspace.name}</div>

                  {/* Creation Date */}
                  <div className="font-bold text-sm">
                    {new Date(workspace.createdAt).toUTCString()}
                  </div>

                  {/* Private or Team */}
                  <div>
                    {/* {workspace.type.split("-")[0].toLowerCase().trim() === */}
                    {workspace.belongs_to_team ? (
                      <div className="flex items-center gap-1">
                        <div className="bg-blue-600 text-white px-1 w-fit text-xs">
                          {/* {workspace.type.split("-")[0]} */}
                          {/* {workspace.team.name} */}
                          Team
                        </div>
                        <div className="text-xs hover:underline hover:text-blue-700">
                          {/* {workspace.type.split("-")[1]} */}
                          {workspace.team.name}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-600 text-white px-1 w-fit text-xs">
                        {/* {workspace.type} */}
                        Private
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box bg-white p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddNew />
        </div>
      </dialog>
    </div>
  );
}

export default Workspace;
