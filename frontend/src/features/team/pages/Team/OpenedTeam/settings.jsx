import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setTeam } from "../../../../../redux/slices/teamReducer";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaSearch, FaUserShield, FaUser } from "react-icons/fa";

const TeamSettings = () => {
  const { teamId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const team = useSelector((state) => state.team.team) || {};
  const currentUser = useSelector((state) => state.auth.user) || {};

  const [teamName, setTeamName] = useState("");
  const [query, setQuery] = useState("");
  const [loadingName, setLoadingName] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const getTeamDetails = async () => {
    try {
      const response = await fetch(`${apiURL}/api/teams/${teamId}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch team");
      }
      const data = await response.json();
      dispatch(setTeam(data));
      setTeamName(data.name || "");
    } catch (error) {
      console.error("Error fetching team details", error);
      toast.error("Error fetching team details");
    }
  };

  useEffect(() => {
    getTeamDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const myMembership = useMemo(() => {
    return team?.members?.find((member) => String(member.id) === String(currentUser?.id));
  }, [team?.members, currentUser?.id]);

  const isOwner = String(team?.created_by) === String(currentUser?.id);
  const isAdmin = myMembership?.role === "admin";

  const filteredMembers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return team?.members || [];

    return (team?.members || []).filter((member) => {
      return (
        member.name?.toLowerCase().includes(keyword) ||
        member.email?.toLowerCase().includes(keyword) ||
        member.role?.toLowerCase().includes(keyword)
      );
    });
  }, [team?.members, query]);

  const updateTeamName = async () => {
    if (!teamName.trim()) {
      toast.warn("Team name is required");
      return;
    }

    try {
      setLoadingName(true);
      const response = await fetch(`${apiURL}/api/teams/${teamId}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({ name: teamName.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update team name");
      }

      toast.success("Team renamed");
      await getTeamDetails();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to rename team");
    } finally {
      setLoadingName(false);
    }
  };

  const handleMemberAction = async (userId, action) => {
    try {
      setLoadingAction(true);
      const endpoint =
        action === "promote"
          ? "promote"
          : action === "demote"
          ? "demote"
          : `members/${userId}`;
      const method = action === "remove" ? "DELETE" : "PUT";

      const response = await fetch(`${apiURL}/api/teams/${teamId}/${endpoint}`, {
        method,
        headers: header,
        body: action !== "remove" ? JSON.stringify({ user_id: userId }) : null,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || `Failed to ${action} member`);
      }

      toast.success(
        action === "promote"
          ? "Member promoted"
          : action === "demote"
          ? "Admin demoted"
          : "Member removed"
      );
      await getTeamDetails();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Action failed");
    } finally {
      setLoadingAction(false);
    }
  };

  const deleteTeam = async () => {
    if (!window.confirm("Delete this team permanently?")) return;

    try {
      setLoadingDelete(true);
      const response = await fetch(`${apiURL}/api/teams/${teamId}`, {
        method: "DELETE",
        headers: header,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete team");
      }

      toast.success("Team deleted");
      navigate("/app/team");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete team");
    } finally {
      setLoadingDelete(false);
    }
  };

  const leaveTeam = async () => {
    if (!window.confirm("Leave this team?")) return;

    try {
      setLoadingLeave(true);
      const response = await fetch(`${apiURL}/api/teams/${teamId}/leave`, {
        method: "DELETE",
        headers: header,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to leave team");
      }

      toast.success("You left the team");
      navigate("/app/team");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to leave team");
    } finally {
      setLoadingLeave(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ToastContainer />

      <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Team Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage team identity, member roles, and access controls.
            </p>
          </div>
          <div className="rounded-sm bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
            {isOwner ? "Owner" : isAdmin ? "Admin" : "Member"}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            className="w-full rounded-sm border border-gray-300 bg-white px-4 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={!isAdmin}
          />
          <button
            className="rounded-sm bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            onClick={updateTeamName}
            disabled={!isAdmin || loadingName}
          >
            {loadingName ? "Saving..." : "Save Name"}
          </button>
        </div>
      </div>

      <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-gray-900">Role Management</h3>
          <label className="flex min-w-[260px] items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-2">
            <FaSearch className="text-xs text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member"
              className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="px-3 py-3">Member</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const isMemberOwner = String(member.id) === String(team?.created_by);
                const isSelf = String(member.id) === String(currentUser?.id);

                const canPromote = isOwner && member.role !== "admin" && !isSelf;
                const canDemote = isOwner && member.role === "admin" && !isMemberOwner;
                const canRemove =
                  isAdmin && !isSelf && !isMemberOwner && (isOwner || member.role !== "admin");

                return (
                  <tr key={member.id} className="border-b border-gray-100 text-sm text-gray-800">
                    <td className="px-3 py-3">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          member.role === "admin"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {member.role === "admin" ? <FaUserShield size={10} /> : <FaUser size={10} />}
                        {isMemberOwner ? "owner" : member.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {isSelf ? "You" : member.is_active ? "Active" : "Away"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-sm bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!canPromote || loadingAction}
                          onClick={() => handleMemberAction(member.id, "promote")}
                        >
                          Promote
                        </button>
                        <button
                          className="rounded-sm bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!canDemote || loadingAction}
                          onClick={() => handleMemberAction(member.id, "demote")}
                        >
                          Demote
                        </button>
                        <button
                          className="rounded-sm bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!canRemove || loadingAction}
                          onClick={() => handleMemberAction(member.id, "remove")}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-red-200 bg-red-50 p-5">
          <h4 className="text-base font-semibold text-red-700">Danger Zone</h4>
          <p className="mt-1 text-sm text-red-600">Deleting team is permanent and cannot be undone.</p>
          <button
            className="mt-4 rounded-sm bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={deleteTeam}
            disabled={!isOwner || loadingDelete}
          >
            {loadingDelete ? "Deleting..." : "Delete Team"}
          </button>
        </div>

        <div className="rounded-sm border border-gray-200 bg-gray-50 p-5">
          <h4 className="text-base font-semibold text-gray-800">Membership</h4>
          <p className="mt-1 text-sm text-gray-600">
            {isOwner
              ? "As owner, you cannot leave this team until ownership transfer is available."
              : "You can leave this team at any time."}
          </p>
          <button
            className="mt-4 rounded-sm bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={leaveTeam}
            disabled={isOwner || loadingLeave}
          >
            {loadingLeave ? "Leaving..." : "Leave Team"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamSettings;
