import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { AiOutlineDelete } from "react-icons/ai";
import { useLocation, useNavigate } from "react-router-dom";

const AddNew = (props) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const teamId = props.teamId;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiText, setEmojiText] = useState("");
  const [worskapceLoading, setWorkspaceLoading] = useState(false);

  var userData;
  try {
    userData = jwtDecode(token);
  } catch (error) {
    console.error(error);
  }

  // testing whether user data is loaded
  // if (userData) {
  //   console.log("This is user id: ", userData.id);
  // }

  console.log("from adding workspace:", teamId);

  const [teams, setTeams] = useState();
  const [workspaceData, setWorkspaceData] = useState({
    owned_by: userData.id,
    name: "",
    description: "",
    belongs_to_team: teamId ? teamId : null,
  });

  const navigate = useNavigate();

  const fetchTeams = async () => {
    const response = await fetch(`${apiURL}/api/teams`, {
      headers: header,
    });
    const data = await response.json();
    setTeams(data);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // useEffect(() => {
  //   console.log(workspaceData);
  // }, [workspaceData]);

  const createWorkspace = async (e) => {
    e.preventDefault();
    setWorkspaceLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/workspaces`, {
        method: "POST",
        body: JSON.stringify(workspaceData),
        headers: header,
      });
      const data = await response.json();
      console.log(data);

      if (response.ok) {
        setWorkspaceLoading(false);
        // console.log(response.body);
        // want to load the response body

        navigate(`/app/workspace/open/${data.id}`);
        // window.location.href = "/app/workspace";
      } else {
        alert("Error creating workspace");
        setWorkspaceLoading(false);
      }
    } catch (err) {
      console.error("Error creating workspace: ", err);
      setWorkspaceLoading(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setEmojiText(emoji.native);
    setWorkspaceData({
      ...workspaceData,
      emoji: emoji.native,
    });
    setShowEmojiPicker(false);
  };

  // useEffect(() => {
  //   console.log(workspaceData);
  // });
  return (
    <div className="w-full flex">
      <div className="bg-transparent p-4 rounded-md shadow-md lg:w-1/2 w-full mt-10 grow">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">🗂️</p>
          <h1>add new workspace</h1>
        </div>
        <hr className="h-1/2 bg-gray-500" />
        <p>Fill in the form below to create a new workspace</p>
        <form
          className="flex flex-col gap-2 mt-3"
          onSubmit={(event) => createWorkspace(event)}
        >
          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="workspaceName"> workspace's name</label>
            <input
              type="text"
              id="workspaceName"
              name="workspaceName"
              value={workspaceData.name}
              onChange={(e) => {
                setWorkspaceData({ ...workspaceData, name: e.target.value });
              }}
              placeholder="eg. My workspace"
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              required
            />
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="description">description</label>
            <textarea
              id="description"
              name="description"
              value={workspaceData.description}
              onChange={(e) => {
                setWorkspaceData({
                  ...workspaceData,
                  description: e.target.value,
                });
              }}
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              placeholder="eg. This workspace is for my personal projects"
            ></textarea>
          </fieldset>

          <fieldset>
            <legend className="fieldset-legend">emoji</legend>
            <div className="flex items-center gap-2 justify-between mb-3 flex-col sm:flex-row">
              <input
                type="text"
                disabled
                className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950 text-xl"
                value={workspaceData.emoji}
                onChange={(e) => {
                  setWorkspaceData({
                    ...workspaceData,
                    emoji: e.target.value,
                  });
                }}
              />
              <span>
                <AiOutlineDelete
                  className="hover:text-red-600 cursor-pointer text-xl"
                  onClick={() => {
                    setWorkspaceData({
                      ...workspaceData,
                      emoji: "",
                    });
                  }}
                />
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {showEmojiPicker ? "hide emoji picker" : "show emoji picker"}
              </button>
            </div>
            {showEmojiPicker && (
              <Picker data={data} onEmojiSelect={handleEmojiSelect} />
            )}
          </fieldset>

          {!teamId && (
            <fieldset className="fieldset flex flex-col gap-1">
              <legend className="fieldset-legend">Teams</legend>
              <select
                className="select bg-white dark:bg-black dark:text-white"
                onChange={(e) =>
                  setWorkspaceData({
                    ...workspaceData,
                    belongs_to_team: e.target.value,
                  })
                }
              >
                <option disabled selected>
                  Pick a team
                </option>
                {teams &&
                  teams.map((team) => (
                    <option key={team.team.id} value={team.team.id}>
                      {team.team.name}
                    </option>
                  ))}
              </select>
              <span className="fieldset-label">Optional</span>
            </fieldset>
          )}

          {worskapceLoading ? (
            <div>
              <span className="loading loading-spinner"></span>
              Creating workspace
            </div>
          ) : (
            <button
              type="submit"
              className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none"
            >
              Create Workspace
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddNew;

// I was trying to create a worskapace with this details, and eventually failed, I wrote the details or the description of the workspace in detail and the length of the description that was to be stored on the database was not that much so I keep the workspace detail here in the folloewing commented lines so when youre testing it try it out, theres my name in the name of the workspace you can change to whatever you want.
// name: "Lati's Engineering Workspace"
// description: "I mean Engineering when I say it is all related to software.   This workspace contains tasks, to-dos, notes and other stuffs related to my Engineering journeys. I will use this one to plan projects, to take notes on different topics related to engineering. It will stay private till I decide to publish it public or certain team. So if you are seeing and accessing this workshop it means that at least I have some proved work which can be accessed through this workspace, happy discovering. ✌️"
