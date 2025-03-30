import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const AddNew = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const userData = useSelector((state) => state.auth.user) || {};

  const [teamData, setTeamData] = useState({
    name: "",
    description: "",
    owned_by: userData?.id || null,
  });

  const navigate = useNavigate();

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiURL}/api/teams`, {
        method: "POST",
        body: JSON.stringify(teamData),
        headers: header,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Team succesfully created!");
        navigate(`/app/team/open/${data.id}`);
      } else {
        console.error("Failed to create team:", data);
      }
    } catch (err) {
      console.error("Error creating team:", err);
    }
  };

  return (
    <div className="w-full flex">
      <div className="bg-transparent p-4 rounded-md shadow-md lg:w-1/2 w-full mt-10 grow">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">👥</p>
          <h1>Create a New Team</h1>
        </div>
        <hr className="h-1/2 bg-gray-500" />
        <p>Fill in the form below to create a new team</p>

        <form className="flex flex-col gap-2 mt-3" onSubmit={createTeam}>
          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="teamName">Team Name</label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={teamData.name}
              onChange={(e) =>
                setTeamData({ ...teamData, name: e.target.value })
              }
              placeholder="e.g. Development Team"
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              required
            />
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none"
          >
            Create Team
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNew;
