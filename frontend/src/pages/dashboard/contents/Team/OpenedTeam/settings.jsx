import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTeam } from "../../../../../redux/slices/teamReducer";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";

const TeamSettings = () => {
  const { teamId } = useParams();
  const id = teamId;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const team = useSelector((state) => state.team.team);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    getTeamDetails();
  }, []);

  const getTeamDetails = async () => {
    try {
      const response = await fetch(`${apiURL}/api/teams/${id}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) {
        toast.error("Error fetching details");
        throw new Error("Failed to fetch team");
      }
      // toast.success("Details loaded");
      const data = await response.json();
      dispatch(setTeam(data));
      setTeamName(data.name);
    } catch (error) {
      console.error("Error fetching the team data", error);
    }
  };

  const updateTeamName = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiURL}/api/teams/${id}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({ name: teamName }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("You are not authorized to rename the team");
        } else {
          toast.error("Error renaming the team");
        }
        throw new Error("Failed to update team name");
      }
      toast.success("Team renamed");
      getTeamDetails();
    } catch (error) {
      console.error("Error updating team name", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAction = async (userId, action) => {
    try {
      const endpoint =
        action === "promote"
          ? "promote"
          : action === "demote"
          ? "demote"
          : `members/${userId}`;
      const method = action === "remove" ? "DELETE" : "PUT";

      const response = await fetch(`${apiURL}/api/teams/${id}/${endpoint}`, {
        method,
        headers: header,
        body: action !== "remove" ? JSON.stringify({ user_id: userId }) : null,
      });
      if (!response.ok) {
        if (response.status === 401 && action != "remove") {
          toast.error("401, Unauthorized to do promotion");
        }
        if (response.status === 401 && action === "remove") {
          toast.error("401, Admin can only remove user");
        }
        if (response.status === 400 && action === "remove") {
          toast.error("400, Failed to remove the user");
        }
        throw new Error(`Failed to ${action} member`);
      }

      getTeamDetails();
    } catch (error) {
      console.error(`Error trying to ${action} member`, error);
    }
  };

  const deleteTeam = async () => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      const response = await fetch(`${apiURL}/api/teams/${id}`, {
        method: "DELETE",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to delete team");
      navigate("/app/team");
    } catch (error) {
      console.error("Error deleting team", error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-md">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4">Team Settings</h2>

      <div className="mb-4">
        <label className="block text-lg font-medium">Team Name:</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200 mt-2 bg-transparent text-black"
          placeholder="Team name..."
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
        <button
          className={`mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={updateTeamName}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-3">Team Members</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {team?.members?.map((member) => (
              <tr key={member.id} className="border">
                <td className="border p-2">{member.name}</td>
                <td className="border p-2">{member.email}</td>
                <td className="border p-2 capitalize">{member.role}</td>
                <td className="border p-2 space-x-2">
                  {member.role === "admin" ? (
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                      onClick={() => handleMemberAction(member.id, "demote")}
                    >
                      Demote
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      onClick={() => handleMemberAction(member.id, "promote")}
                    >
                      Promote
                    </button>
                  )}
                  <button
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => handleMemberAction(member.id, "remove")}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800"
          onClick={deleteTeam}
        >
          Delete Team
        </button>
      </div>
    </div>
  );
};

export default TeamSettings;
