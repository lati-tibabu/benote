import React, { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { FaMap } from "react-icons/fa6";
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

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen p-4">
      <ToastContainer />
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-gray-200 pb-4 mb-6 bg-white/80 rounded-2xl shadow-sm px-4">
        <h1 className="font-extrabold text-2xl tracking-tight text-gray-900">
          Roadmaps
        </h1>
        <div className="flex items-center gap-3">
          {useGemini && (
            <div
              className="btn transition-all duration-300 shadow-md bg-gradient-to-tr from-pink-100 to-blue-100 hover:from-pink-200 hover:to-blue-200 text-gray-700 border-white btn-soft rounded-full flex items-center gap-2 px-4 py-2"
              onClick={() =>
                document.getElementById("ai-gen-roadmap-form").showModal()
              }
            >
              <GeminiIcon size={20} />
              <span className="font-semibold">Generate Roadmaps</span>
            </div>
          )}
          <button
            className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-4 py-2 shadow-md transition flex items-center gap-2"
            onClick={() =>
              document.getElementById("new-roadmap-form").showModal()
            }
          >
            <AiOutlinePlus /> Add New
          </button>
        </div>
      </div>
      {/* Roadmaps List */}
      <div className="mt-4">
        <ul className="flex flex-col gap-3">
          {roadmaps?.map((roadmap, index) => (
            <li
              className="p-4 flex items-center gap-4 cursor-pointer bg-white/90 shadow-md rounded-2xl hover:bg-blue-50 transition border border-gray-200 group"
              key={roadmap.id}
              onClick={() => handleOpenRoadmap(roadmap.id)}
            >
              <FaMap className="text-blue-500 text-xl" />
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition truncate max-w-[320px]">
                  {index + 1}. {roadmap.title}
                </span>
                <div>
                  <AiOutlineMore
                    size={22}
                    className="text-gray-400 group-hover:text-blue-600 transition"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* AI Roadmap Modal */}
      <dialog id="ai-gen-roadmap-form" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
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
      <dialog id="new-roadmap-form" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
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
