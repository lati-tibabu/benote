import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AddNew = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const header = {
    authorization: `Bearer ${token}`,
  };

  var userData;
  try {
    userData = jwtDecode(token);
  } catch (error) {
    console.error(error);
  }

  if (userData) {
    console.log("This is user id: ", userData.id);
  }

  const [teams, setTeams] = useState();
  const [workspaceData, setWorkspaceData] = useState({
    created_by: userData.id,
    name: "",
    description: "",
    belongs_to_team: "",
  });

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

  useEffect(() => {
    console.log(workspaceData);
  }, [workspaceData]);
  //   console.log(teams);

  const createWorkspace = async (e) => {
    e.preventDefault();
    // setWorkspaceData({ ...workspaceData, created_by: userData.id });
    try {
      const response = await fetch(`${apiURL}/api/workspaces`, {
        method: "POST",
        body: JSON.stringify(workspaceData),
        headers: {
          ...header,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log(data);
    } catch (err) {
      console.error("Error creating workspace: ", err);
    }
  };
  return (
    <div className="w-full flex">
      {/* <div className="w-full h-1/4 bg-gray-400 rounded-sm"></div> */}
      <div className="bg-transparent p-4 rounded-md shadow-md lg:w-1/2 w-full mt-10 grow">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">🗂️</p>
          <h1>add new workspace</h1>
        </div>
        <p>Fill in the form below to create a new workspace</p>
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => createWorkspace(event)}
        >
          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="workspaceName">workspace's name</label>
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

          <fieldset className="fieldset flex flex-col gap-1">
            <legend className="fieldset-legend">Teams</legend>
            <select
              defaultValue="Select a team"
              className="select bg-white dark:bg-black dark:text-white"
              onChange={(e) =>
                setWorkspaceData({
                  ...workspaceData,
                  belongs_to_team: e.target.value,
                })
              }
            >
              <option disabled={true}>Pick a Team </option>
              {teams &&
                teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
            </select>
            <span className="fieldset-label">Optional</span>
          </fieldset>

          {/* Add more fields as needed */}
          <button className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none">
            Create Workspace
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNew;
