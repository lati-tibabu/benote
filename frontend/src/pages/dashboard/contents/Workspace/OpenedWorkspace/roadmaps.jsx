import React, { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { FaMap } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import GeminiIcon from "../../../../../components/geminiIcon";
import { ToastContainer } from "react-toastify";
import AIGeneratedRoadmap from "./roadmaps/ai-generated-roadmap-form";
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
    <div>
      <ToastContainer />

      <div className="flex flex-row items-center justify-between border-b-1 pb-2">
        <h1 className="font-bold text-2xl">Roadmaps</h1>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {useGemini && (
              <div
                className="btn transition-all duration-300 shadow-md bg-gray-100 hover:bg-gray-100 text-gray-700 border-white btn-soft rounded-full"
                onClick={() =>
                  document.getElementById("ai-gen-roadmap-form").showModal()
                }
              >
                <GeminiIcon size={20} />
                Generate Roadmaps
              </div>
            )}
          </div>
          <button
            className="btn btn-soft rounded-full"
            onClick={() =>
              document.getElementById("new-roadmap-form").showModal()
            }
          >
            <AiOutlinePlus /> Add New
          </button>
        </div>
      </div>

      <div>
        <ul className="flex flex-col gap-2">
          {roadmaps?.map((roadmap, index) => (
            <li
              className="p-3 flex items-center gap-3 cursor-pointer shadow rounded-md hover:bg-blue-50"
              key={roadmap.id}
              onClick={() => handleOpenRoadmap(roadmap.id)}
            >
              <FaMap />
              <div className="flex items-center justify-between w-full">
                <p>{index + 1 + " " + roadmap.title}</p>
                <div>
                  <AiOutlineMore size={25} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <dialog id="ai-gen-roadmap-form" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
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
      <dialog id="new-roadmap-form" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
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
