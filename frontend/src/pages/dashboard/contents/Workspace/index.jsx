import React, { useEffect, useState } from "react";
import AddNew from "./add_new";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaPlus, FaTh, FaList, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setWorkspaceList } from "../../../../redux/slices/workspaceSlice";

function Workspace() {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };

  const workspaces =
    useSelector((state) => state.workspace.workspaceList) || [];

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState(""); // separate filter state

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const updateWorkspace = location?.state?.workspaceUpdate || false;

  useEffect(() => {
    const getWorkspace = async () => {
      if (!workspaces.length) setLoading(true);
      try {
        const response = await fetch(`${apiURL}/api/workspaces`, {
          method: "GET",
          headers: header,
        });
        const data = await response.json();
        dispatch(setWorkspaceList(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getWorkspace();
  }, [updateWorkspace, location]);

  const handleWorkspaceOpen = (id) => () => {
    navigate(`/app/workspace/open/${id}`);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "grid" ? "list" : "grid"));
  };

  const filteredWorkspaces = workspaces.filter((workspace) => {
    const nameMatch = workspace.workspace.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const typeMatch =
      !filterType ||
      (filterType === "team" && workspace.workspace.belongs_to_team) ||
      (filterType === "private" && !workspace.workspace.belongs_to_team);
    return nameMatch && typeMatch;
  });

  return (
    <div className="h-full flex flex-col px-6 py-8 bg-gray-50">
      {location.pathname === "/app/workspace" ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-sm shadow-sm hover:bg-gray-700 transition-all"
              onClick={() => document.getElementById("my_modal_3").showModal()}
            >
              <FaPlus /> Create New
            </button>

            <div className="flex items-center gap-6 flex-wrap w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
              >
                <option value="">All</option>
                <option value="team">Team</option>
                <option value="private">Private</option>
              </select>

              <button
                className="flex items-center gap-2 px-6 py-3 border rounded-sm shadow-sm hover:bg-gray-100 transition-all"
                onClick={toggleViewMode}
              >
                {viewMode === "grid" ? <FaList /> : <FaTh />}
                {viewMode === "grid" ? "List View" : "Grid View"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-32 bg-gray-200 rounded-sm"></div>
              ))}
            </div>
          ) : filteredWorkspaces.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkspaces.map((workspace) => (
                  <div
                    key={workspace.workspace.id}
                    className="p-6 bg-white shadow-sm rounded-sm cursor-pointer hover:shadow-sm transition-all"
                    onClick={handleWorkspaceOpen(workspace.workspace.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{workspace.workspace.emoji}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {workspace.workspace.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {workspace.workspace.belongs_to_team
                            ? "Team"
                            : "Private"} Workspace
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Role: {workspace.role}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created:{" "}
                      {new Date(
                        workspace.workspace.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="table-auto w-full border border-gray-300 rounded-sm shadow-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-6 py-3 border">Workspace</th>
                    <th className="px-6 py-3 border">Role</th>
                    <th className="px-6 py-3 border">Type</th>
                    <th className="px-6 py-3 border">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkspaces.map((workspace) => (
                    <tr
                      key={workspace.workspace.id}
                      onClick={handleWorkspaceOpen(workspace.workspace.id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-3 border flex items-center gap-3">
                        <span className="text-2xl">{workspace.workspace.emoji}</span>
                        {workspace.workspace.name}
                      </td>
                      <td className="px-6 py-3 border">{workspace.role}</td>
                      <td className="px-6 py-3 border">
                        {workspace.workspace.belongs_to_team ? "Team" : "Private"}
                      </td>
                      <td className="px-6 py-3 border">
                        {new Date(workspace.workspace.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <div className="text-center text-gray-500 py-10">
              No workspaces match your criteria.
            </div>
          )}

          <dialog id="my_modal_3" className="modal">
            <div className="modal-box bg-white p-6 rounded-sm shadow-sm w-full max-w-2xl overflow-y-auto max-h-[90vh]">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <AddNew />
            </div>
          </dialog>
        </>
      ) : (
        <div className="h-full">
          <Outlet />
        </div>
      )}
    </div>
  );
}

export default Workspace;
