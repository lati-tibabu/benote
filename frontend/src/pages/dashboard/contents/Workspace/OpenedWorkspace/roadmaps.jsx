import React, { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { FaMap } from "react-icons/fa6";
import { FaRegCalendarAlt, FaUser } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import GeminiIcon from "../../../../../components/geminiIcon";
import { ToastContainer } from "react-toastify";
// import AIGeneratedRoadmap from "./roadmaps/ai-generated-roadmap";
import AIGeneratedRoadmap from "./roadmaps/ai-generated-roadmap";
import AddNewRoadmap from "./roadmaps/add-new";
import { useSelector } from "react-redux";

const Roadmaps = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const userData = useSelector((state) => state.auth.user) || {};

  const { workspaceId } = useParams();

  const [roadmaps, setRoadmaps] = useState([]);
  const [refreshList, setRefreshList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const useGemini = localStorage.getItem("useGemini") === "true" ? true : false;

  const navigate = useNavigate();

  const fetchRoadmaps = async () => {
    const response = await fetch(
      `${apiURL}/api/roadmaps/?workspaceId=${workspaceId}`,
      {
        method: "GET",
        headers: header,
      }
    );

    if (!response.ok) {
      console.log("Error loading roadmaps");
      return;
    }

    const data = await response.json();
    setRoadmaps(data);
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [navigate, workspaceId, refreshList]);

  const handleOpenRoadmap = (id) => {
    navigate(`${id}`);
  };

  // Filter roadmaps by search term
  const filteredRoadmaps = roadmaps.filter((roadmap) =>
    roadmap.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-4">
      <ToastContainer />
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 mb-6 bg-white rounded-sm shadow-sm px-2">
        <h1 className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
          <FaMap className="text-gray-500" size={22} />
          Roadmaps
        </h1>
        <div className="flex items-center gap-2">
          {useGemini && (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-gradient-to-tr from-gray-50 to-gray-50 hover:from-gray-100 hover:to-gray-100 text-gray-700 border border-gray-100 shadow-sm transition"
              onClick={() =>
                document.getElementById("ai-gen-roadmap-form").showModal()
              }
            >
              <GeminiIcon size={18} />
              <span className="font-medium text-sm">AI Roadmap</span>
            </button>
          )}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm shadow-sm transition"
            onClick={() =>
              document.getElementById("new-roadmap-form").showModal()
            }
          >
            <AiOutlinePlus size={18} /> New
          </button>
        </div>
      </div>
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <input
          type="text"
          placeholder="Search roadmaps..."
          className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-gray-100 text-sm bg-gray-50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-1 items-center justify-end mt-2 sm:mt-0">
          <button
            className={`p-2 rounded-sm ${
              viewMode === "list"
                ? "bg-gray-100 text-gray-600"
                : "bg-gray-100 text-gray-400"
            }`}
            title="List view"
            onClick={() => setViewMode("list")}
          >
            <AiOutlineMenu size={18} />
          </button>
          <button
            className={`p-2 rounded-sm ${
              viewMode === "grid"
                ? "bg-gray-100 text-gray-600"
                : "bg-gray-100 text-gray-400"
            }`}
            title="Grid view"
            onClick={() => setViewMode("grid")}
          >
            <AiOutlineMore size={18} />
          </button>
        </div>
      </div>
      {/* Roadmaps Table or Grid */}
      <div className="flex flex-col p-1 gap-2">
        {viewMode === "list" ? (
          <div className="flex flex-col overflow-auto scrollbar-hide">
            {filteredRoadmaps.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No roadmaps found.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-sm shadow bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-600 bg-gray-50 border-b border-gray-100">
                      <th className="w-8"></th>
                      <th className="text-left font-medium">Title</th>
                      <th className="text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoadmaps.map((roadmap, index) => (
                      <tr
                        key={roadmap.id}
                        className="hover:bg-gray-50/60 transition group border-b border-gray-50 cursor-pointer"
                        onClick={() => handleOpenRoadmap(roadmap.id)}
                      >
                        <td className="text-gray-300 text-xs pl-2">
                          {index + 1}
                        </td>
                        <td className="flex items-center gap-2 text-gray-700 font-medium hover:underline">
                          <FaMap size={18} className="text-gray-400" />
                          <span className="truncate max-w-[180px]">
                            {roadmap.title}
                          </span>
                        </td>
                        <td className="pr-2 flex gap-2">
                          <button
                            className="p-1 rounded hover:bg-gray-100 transition text-gray-500"
                            title="More"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AiOutlineMore size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRoadmaps.length === 0 ? (
              <p className="text-gray-400 text-center py-8 col-span-full">
                No roadmaps found.
              </p>
            ) : (
              filteredRoadmaps.map((roadmap, index) => (
                <div
                  key={roadmap.id}
                  className="bg-white border border-gray-100 rounded-sm shadow-sm p-4 flex flex-col gap-2 hover:shadow-sm transition cursor-pointer group"
                  onClick={() => handleOpenRoadmap(roadmap.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FaMap size={20} className="text-gray-400" />
                    <span className="font-semibold text-gray-700 truncate max-w-[120px]">
                      {roadmap.title}
                    </span>
                  </div>
                  {/* Add more roadmap info here if available */}
                  <button
                    className="self-end p-1 rounded hover:bg-gray-100 transition text-gray-500 mt-2"
                    title="More"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <AiOutlineMore size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {/* AI Roadmap Modal */}
      <dialog id="ai-gen-roadmap-form" className="modal">
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-full max-w-lg mx-auto mt-10">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setRefreshList(!refreshList)}
            >
              ✕
            </button>
          </form>
          <AIGeneratedRoadmap />
        </div>
      </dialog>
      {/* Add New Roadmap Modal */}
      <dialog id="new-roadmap-form" className="modal">
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-full max-w-lg mx-auto mt-10">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setRefreshList(!refreshList)}
            >
              ✕
            </button>
          </form>
          <AddNewRoadmap />
        </div>
      </dialog>
    </div>
  );
};

export default Roadmaps;

const roadmaps = [
  { id: 1, title: "My school roadmap" },
  { id: 2, title: "Front end development" },
  { id: 3, title: "Dev Ops roadmap" },
  { id: 4, title: "Life after graduation" },
  { id: 5, title: "Rediscovering myself" },
  { id: 6, title: "Final research project guidline and roadmap" },
];
