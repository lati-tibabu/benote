import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { PiUsersThreeBold } from "react-icons/pi";
import { ToastContainer, toast } from "react-toastify";
import SendInvitation from "../invite_user";
import { setTeam } from "../../../../../redux/slices/teamReducer";

const getPresence = (value) => {
  const input = String(value || "");
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) % 3 === 0 ? "online" : "offline";
};

const normalizeMember = (member, fallbackIndex) => {
  const user = member?.user || member;
  return {
    id: member?.user_id || user?.id || member?.id || `member-${fallbackIndex}`,
    name: user?.name || member?.name || "Unknown member",
    email: user?.email || member?.email || "",
    role: (member?.role || user?.role || "member").toLowerCase(),
    joinedAt: member?.createdAt || member?.joinedAt || user?.createdAt || null,
  };
};

const TeamMembers = () => {
  const { teamId } = useParams();
  const dispatch = useDispatch();
  const team = useSelector((state) => state.team.team) || {};
  const currentUser = useSelector((state) => state.auth.user) || {};
  const [query, setQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const headers = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(`${apiURL}/api/teams/${teamId}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      dispatch(setTeam(data));
    } catch (error) {
      console.error(error);
      toast.error("Unable to load team members.");
    }
  };

  useEffect(() => {
    fetchTeamDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  const members = useMemo(
    () => (team?.members || []).map((member, idx) => normalizeMember(member, idx)),
    [team?.members]
  );

  const filteredMembers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return members;

    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword) ||
        member.role.toLowerCase().includes(keyword)
      );
    });
  }, [members, query]);

  useEffect(() => {
    if (!filteredMembers.length) {
      setSelectedMemberId(null);
      return;
    }

    if (!selectedMemberId || !filteredMembers.some((m) => String(m.id) === String(selectedMemberId))) {
      setSelectedMemberId(filteredMembers[0].id);
    }
  }, [filteredMembers, selectedMemberId]);

  const selectedMember = filteredMembers.find((member) => String(member.id) === String(selectedMemberId));

  const myMemberRecord = members.find((member) => String(member.id) === String(currentUser?.id));
  const canManageMembers = myMemberRecord?.role === "admin" || team?.created_by === currentUser?.id;

  const manageMember = async (memberId, action) => {
    const endpoint =
      action === "promote"
        ? "promote"
        : action === "demote"
        ? "demote"
        : `members/${memberId}`;
    const method = action === "remove" ? "DELETE" : "PUT";

    try {
      setActionLoading(true);
      const response = await fetch(`${apiURL}/api/teams/${teamId}/${endpoint}`, {
        method,
        headers,
        body: action === "remove" ? null : JSON.stringify({ user_id: memberId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} member`);
      }

      toast.success(`Member ${action}d successfully.`);
      await fetchTeamDetails();
    } catch (error) {
      console.error(error);
      toast.error(`Unable to ${action} member.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-full min-h-0 overflow-hidden rounded-sm border border-gray-200 bg-white">
      <ToastContainer />
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[320px_1fr]">
        <aside className="flex min-h-0 flex-col border-r border-gray-200 bg-gray-50">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-800">
              <PiUsersThreeBold />
              <h2 className="text-base font-semibold">Members</h2>
              <span className="ml-auto rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
                {members.length}
              </span>
            </div>

            <label className="mt-3 flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-3 py-2">
              <FaSearch className="text-sm text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members"
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="min-h-0 grow overflow-y-auto p-2">
            {filteredMembers.length ? (
              <ul className="space-y-1">
                {filteredMembers.map((member) => {
                  const isSelected = String(member.id) === String(selectedMemberId);
                  const presence = getPresence(member.id);
                  return (
                    <li key={member.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberId(member.id)}
                        className={`w-full rounded-sm border px-3 py-2 text-left transition ${
                          isSelected
                            ? "border-gray-700 bg-white"
                            : "border-transparent bg-transparent hover:border-gray-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                            {member.name?.charAt(0)?.toUpperCase() || <FaUserCircle />}
                            <span
                              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                                presence === "online" ? "bg-green-500" : "bg-gray-300"
                              }`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">{member.name}</p>
                            <p className="truncate text-xs text-gray-500">
                              {presence === "online" ? "online now" : "last seen recently"}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-3 text-sm text-gray-500">No members match your search.</div>
            )}
          </div>
        </aside>

        <section className="min-h-0 overflow-y-auto p-6">
          {selectedMember ? (
            <div className="mx-auto w-full max-w-2xl">
              <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold text-gray-700">
                    {selectedMember.name?.charAt(0)?.toUpperCase() || <FaUserCircle />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-semibold text-gray-900">{selectedMember.name}</h3>
                    <p className="truncate text-sm text-gray-500">{selectedMember.email || "No email available"}</p>
                    <div className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {selectedMember.role}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-sm border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {getPresence(selectedMember.id) === "online" ? "Online now" : "Away"}
                    </p>
                  </div>
                  <div className="rounded-sm border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Joined</p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {selectedMember.joinedAt
                        ? new Date(selectedMember.joinedAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                {canManageMembers && String(selectedMember.id) !== String(currentUser?.id) ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {selectedMember.role === "admin" ? (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => manageMember(selectedMember.id, "demote")}
                        className="rounded-sm bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Demote to member
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => manageMember(selectedMember.id, "promote")}
                        className="rounded-sm bg-gray-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Promote to admin
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => manageMember(selectedMember.id, "remove")}
                      className="rounded-sm bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove member
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 rounded-sm border border-gray-200 bg-gray-50 p-4">
                <button
                  className="rounded-sm bg-gray-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                  onClick={() => document.getElementById("team_members_invite_modal").showModal()}
                >
                  Invite new member
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Select a member from the list.
            </div>
          )}
        </section>
      </div>

      <dialog id="team_members_invite_modal" className="modal">
        <div className="modal-box mx-auto w-fit rounded-sm bg-white p-6 shadow-sm lg:w-1/2">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">x</button>
          </form>
          <SendInvitation teamName={team?.name} teamId={team?.id || teamId} />
        </div>
      </dialog>
    </div>
  );
};

export default TeamMembers;
