import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiURL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("jwt");
const header = {
  authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

const WorkspaceToTeam = ({ workspaceId }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${apiURL}/api/teams`, {
          method: "GET",
          headers: header,
        });
        if (!response.ok) throw new Error("Failed to fetch teams");
        const data = await response.json();
        setTeams(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    if (!selectedTeam) {
      setError("Please select a team.");
      toast.error("Please select a team.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${apiURL}/api/teams/${selectedTeam}/workspace/add`,
        {
          method: "PUT",
          headers: header,
          body: JSON.stringify({ workspace_id: workspaceId }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        toast.error(err.message || "Failed to add workspace to team");
        setError(err.message || "Failed to add workspace to team");
        setLoading(false);
        return;
      }
      setSuccess("Workspace added to team successfully!");
      toast.success("Workspace added to team successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white/90 shadow-xl rounded-2xl p-8 mt-8 border border-gray-200">
      <ToastContainer />
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center tracking-tight">
        Move Workspace to Team
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="team-select"
            className="block text-base font-semibold text-gray-700 mb-2"
          >
            Select Team
          </label>
          <select
            id="team-select"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 text-base transition"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            required
          >
            <option value="">-- Select a team --</option>
            {teams.map((t) => (
              <option key={t.team.id} value={t.team.id}>
                {t.team.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-lg shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Moving...
            </span>
          ) : (
            "Move Workspace"
          )}
        </button>
        {success && (
          <div className="text-green-600 text-center font-medium">
            {success}
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center font-medium">{error}</div>
        )}
      </form>
    </div>
  );
};

export default WorkspaceToTeam;
