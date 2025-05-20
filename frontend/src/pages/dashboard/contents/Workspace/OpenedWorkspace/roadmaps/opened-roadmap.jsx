import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AddNewRoadmapItem from "./add-new-item";
import { AiOutlinePlus } from "react-icons/ai";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";
// import { Plus } from "lucide-react";

const OpenedRoadmap = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const userData = useSelector((state) => state.auth.user) || {};
  const { roadmap_id } = useParams();

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
    <section className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-blue-800">
          {roadmap?.title || "Untitled Roadmap"}
        </h1>
        <p className="text-gray-600 mt-2">
          {roadmap?.description || "No description provided."}
        </p>
      </div>

      {/* Items */}
      <div
        ref={roadmapItemsRef}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        className="flex gap-4 overflow-x-auto py-4 px-1 rounded-lg border bg-white shadow-inner"
      >
        {roadmap?.roadmap_items?.map((item, index) => (
          <div
            key={item.id}
            className="min-w-[280px] max-w-[280px] bg-white border border-gray-200 p-4 rounded-xl shadow hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg text-gray-800">
              {item.title}
            </h2>
            <MarkdownRenderer
              content={item.description}
              className={`text-sm text-gray-600 mt-2 ${
                expandedItems[item.id] ? "" : "line-clamp-3"
              }`}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: expandedItems[item.id] ? "block" : "-webkit-box",
                WebkitLineClamp: expandedItems[item.id] ? "none" : 3,
                WebkitBoxOrient: "vertical",
              }}
            />
            {item.description?.length > 100 && (
              <button
                className="text-blue-500 text-xs mt-2 underline"
                onClick={() => toggleExpand(item.id)}
              >
                {expandedItems[item.id] ? "Show Less" : "Show More"}
              </button>
            )}
          </div>
        ))}

        {/* Add New */}
        <button
          onClick={() =>
            document.getElementById("new-roadmap-item-form").showModal()
          }
          className="min-w-[280px] max-w-[280px] max-h-[100px] flex flex-col items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 border border-dashed border-blue-400 rounded-xl p-4 transition"
        >
          {/* <Plus className="w-6 h-6" /> */}
          <AiOutlinePlus className="w-6 h-6" />
          <span className="font-medium">Add New Item</span>
        </button>
      </div>

      {/* Modal */}
      <dialog id="new-roadmap-item-form" className="modal">
        <div className="modal-box bg-white p-5 rounded-lg max-w-md">
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
