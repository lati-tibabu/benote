import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import AddNewRoadmapItem from "./add-new-item";
import { FaMap, FaArrowLeft } from "react-icons/fa6";
import { AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";

const OpenedRoadmap = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const userData = useSelector((state) => state.auth.user) || {};
  const { roadmap_id } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState({});
  const [refreshList, setRefreshList] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});

  const roadmapItemsRef = useRef(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      const response = await fetch(`${apiURL}/api/roadmaps/${roadmap_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoadmap(data);
      } else {
        console.error("Failed to load roadmap.");
      }
    };

    fetchRoadmap();
  }, [roadmap_id, refreshList]);

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    roadmapItemsRef.current.style.scrollBehavior = "auto";
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const x = e.clientX - startX;
      roadmapItemsRef.current.scrollLeft -= x;
      setStartX(e.clientX);
    },
    [isDragging, startX]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    roadmapItemsRef.current.style.scrollBehavior = "smooth";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const toggleExpand = (itemId) =>
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));

  return (
    <section className="p-6 space-y-6 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 p-6 rounded-sm shadow-sm flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <button
            className="p-2 rounded-sm hover:bg-gray-100 transition text-gray-600"
            onClick={() => navigate(-1)}
            title="Back"
          >
            <FaArrowLeft size={18} />
          </button>
          <FaMap className="text-gray-500" size={22} />
          <h1 className="text-xl font-bold text-gray-800">
            {roadmap?.title || "Untitled Roadmap"}
          </h1>
        </div>
        <p className="text-gray-600 text-sm">
          {roadmap?.description || "No description provided."}
        </p>
      </div>

      {/* Items */}
      <div
        ref={roadmapItemsRef}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        className="flex gap-4 overflow-x-auto py-4 px-1 rounded-sm border bg-white shadow-inner"
      >
        {roadmap?.roadmap_items?.map((item, index) => {
          const expanded = !!expandedItems[item.id];
          return (
            <div
              key={item.id}
              className={`min-w-[280px] max-w-[280px] bg-white border border-gray-100 p-4 rounded-sm shadow-sm hover:shadow-sm transition flex flex-col justify-between ${
                expanded ? "" : "overflow-hidden"
              }`}
            >
              <div
                className="flex items-center gap-2 mb-1 cursor-pointer select-none"
                onClick={() => toggleExpand(item.id)}
              >
                {expanded ? (
                  <FaChevronDown className="text-gray-400" size={16} />
                ) : (
                  <FaChevronRight className="text-gray-300" size={16} />
                )}
                <h2 className="font-semibold text-lg text-gray-800 truncate max-w-[200px]">
                  {item.title}
                </h2>
              </div>
              {expanded && (
                <>
                  <MarkdownRenderer
                    content={item.description}
                    className="text-sm text-gray-600 mt-2"
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Add New */}
        <button
          onClick={() =>
            document.getElementById("new-roadmap-item-form").showModal()
          }
          className="min-w-[280px] max-w-[280px] max-h-[100px] flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-dashed border-gray-400 rounded-sm p-4 transition"
        >
          <AiOutlinePlus className="w-6 h-6" />
          <span className="font-medium">Add New Item</span>
        </button>
      </div>

      {/* Modal */}
      <dialog id="new-roadmap-item-form" className="modal">
        <div className="modal-box bg-white p-5 rounded-sm max-w-md">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setRefreshList((prev) => !prev)}
            >
              ✕
            </button>
          </form>
          <AddNewRoadmapItem />
        </div>
      </dialog>
    </section>
  );
};

export default OpenedRoadmap;
