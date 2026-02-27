import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AddNewRoadmapItem from "./add-new-item";
import { FaMap, FaArrowLeft } from "react-icons/fa6";
import { AiOutlinePlus } from "react-icons/ai";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";
import "./roadmap-board.css";

const CARD_WIDTH = 290;
const CARD_HEIGHT = 190;
const COLS = 3;
const START_X = 72;
const START_Y = 56;
const X_STEP = 350;
const Y_STEP = 248;

const getBoardPosition = (index) => {
  const row = Math.floor(index / COLS);
  const offset = index % COLS;
  const column = row % 2 === 0 ? offset : COLS - 1 - offset;
  const wobbleY = [0, 14, -8][column] || 0;
  const rotate = [-2, 2, -1][column] || 0;

  return {
    x: START_X + column * X_STEP,
    y: START_Y + row * Y_STEP + wobbleY,
    rotate,
  };
};

const getConnectorPath = (from, to) => {
  const toRight = to.x >= from.x;
  const startX = toRight ? from.x + CARD_WIDTH : from.x;
  const startY = from.y + CARD_HEIGHT / 2;
  const endX = toRight ? to.x : to.x + CARD_WIDTH;
  const endY = to.y + CARD_HEIGHT / 2;
  const curveX = (startX + endX) / 2;

  return `M ${startX} ${startY} C ${curveX} ${startY}, ${curveX} ${endY}, ${endX} ${endY}`;
};

const normalizeRoadmapDescription = (content) => {
  if (typeof content !== "string") return "";

  return content
    .replace(/\\\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "  ")
    .replace(/\\"/g, '"');
};

const OpenedRoadmap = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const { roadmap_id } = useParams();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState({});
  const [refreshList, setRefreshList] = useState(false);
  const [boardTheme, setBoardTheme] = useState("chalk");
  const [selectedItemId, setSelectedItemId] = useState(null);

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

  const roadmapItems = roadmap?.roadmap_items || [];

  useEffect(() => {
    if (!roadmapItems.length) {
      setSelectedItemId(null);
      return;
    }

    const stillExists = roadmapItems.some((item) => item.id === selectedItemId);
    if (!stillExists) {
      setSelectedItemId(roadmapItems[0].id);
    }
  }, [roadmapItems, selectedItemId]);

  const cardPositions = useMemo(
    () => roadmapItems.map((_, index) => getBoardPosition(index)),
    [roadmapItems]
  );

  const addCardPosition = useMemo(
    () => getBoardPosition(roadmapItems.length),
    [roadmapItems.length]
  );

  const connectorPaths = useMemo(() => {
    if (cardPositions.length < 2) return [];
    return cardPositions.slice(0, -1).map((position, index) =>
      getConnectorPath(position, cardPositions[index + 1])
    );
  }, [cardPositions]);

  const rows = Math.max(1, Math.ceil((roadmapItems.length + 1) / COLS));
  const boardHeight = START_Y * 2 + CARD_HEIGHT + (rows - 1) * Y_STEP;
  const boardWidth = START_X * 2 + CARD_WIDTH + (COLS - 1) * X_STEP;
  const selectedItem = roadmapItems.find((item) => item.id === selectedItemId);
  const selectedItemDescription = normalizeRoadmapDescription(
    selectedItem?.description || ""
  );
  const isWhiteTheme = boardTheme === "white";
  const boardClass = isWhiteTheme ? "roadmap-whiteboard-white" : "roadmap-whiteboard";
  const themeScopeClass = isWhiteTheme ? "is-whiteboard" : "is-chalkboard";

  return (
    <section className="p-6 space-y-6 min-h-screen bg-white">
      {/* Header */}
      <div className={`${boardClass} ${themeScopeClass} p-6 rounded-sm shadow-sm flex flex-col gap-2`}>
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-sm transition ${
                isWhiteTheme
                  ? "hover:bg-black/5 text-slate-700"
                  : "hover:bg-white/10 text-teal-50"
              }`}
              onClick={() => navigate(-1)}
              title="Back"
            >
              <FaArrowLeft size={18} />
            </button>
            <FaMap className={isWhiteTheme ? "text-slate-600" : "text-teal-100"} size={22} />
            <h1
              className={`text-xl font-bold chalk-text ${
                isWhiteTheme ? "text-slate-800" : "text-teal-50"
              }`}
            >
              {roadmap?.title || "Untitled Roadmap"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition ${
                boardTheme === "chalk"
                  ? "bg-teal-900/60 border-teal-100/50 text-teal-50"
                  : "bg-white/70 border-slate-300 text-slate-700"
              }`}
              onClick={() => setBoardTheme("chalk")}
            >
              Chalkboard
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium border transition ${
                boardTheme === "white"
                  ? "bg-white border-slate-400 text-slate-800"
                  : "bg-white/70 border-slate-300 text-slate-600"
              }`}
              onClick={() => setBoardTheme("white")}
            >
              Whiteboard
            </button>
          </div>
        </div>
        <p className={`text-sm chalk-text ${isWhiteTheme ? "text-slate-700" : "text-teal-100"}`}>
          {roadmap?.description || "No description provided."}
        </p>
      </div>

      {/* Items */}
      <div className={`${boardClass} ${themeScopeClass} opened-roadmap-shell`}>
        <div className="opened-roadmap-board">
          <div
            className="roadmap-whiteboard-canvas opened-roadmap-canvas"
            style={{ minHeight: `${boardHeight}px`, minWidth: `${boardWidth}px` }}
          >
            <svg
              className="chalk-connectors"
              width={boardWidth}
              height={boardHeight}
              viewBox={`0 0 ${boardWidth} ${boardHeight}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="chalk-arrowhead"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path className="chalk-arrow-fill" d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
              </defs>
              {connectorPaths.map((path, index) => (
                <path
                  key={`connector-${index}`}
                  d={path}
                  className="chalk-line"
                  markerEnd="url(#chalk-arrowhead)"
                />
              ))}
            </svg>

            {roadmapItems.map((item, index) => {
              const isSelected = item.id === selectedItemId;
              return (
                <article
                  key={item.id}
                  className={`chalk-card chalk-card-lg roadmap-node ${isSelected ? "is-selected" : ""}`}
                  style={{
                    left: `${cardPositions[index].x}px`,
                    top: `${cardPositions[index].y}px`,
                    transform: `rotate(${cardPositions[index].rotate}deg)`,
                  }}
                  onClick={() => setSelectedItemId(item.id)}
                >
                  <h2 className="font-semibold text-lg truncate chalk-text">
                    {item.title}
                  </h2>
                  <p className="text-xs mt-2 chalk-text">Click to view details</p>
                </article>
              );
            })}

            <button
              onClick={() =>
                document.getElementById("new-roadmap-item-form").showModal()
              }
              className="chalk-card chalk-add-card"
              style={{
                left: `${addCardPosition.x}px`,
                top: `${addCardPosition.y}px`,
                transform: `rotate(${addCardPosition.rotate}deg)`,
              }}
            >
              <AiOutlinePlus className="w-6 h-6" />
              <span className="font-medium chalk-text">Add New Item</span>
            </button>
          </div>
        </div>

        <aside className="roadmap-detail-panel">
          {selectedItem ? (
            <>
              <h3 className="roadmap-detail-title chalk-text">{selectedItem.title}</h3>
              <div className="roadmap-detail-body">
                <MarkdownRenderer
                  content={selectedItemDescription}
                  className="roadmap-detail-markdown"
                />
              </div>
            </>
          ) : (
            <p className="roadmap-detail-empty chalk-text">
              Select a roadmap card to view details.
            </p>
          )}
        </aside>
      </div>

      {/* Modal */}
      <dialog id="new-roadmap-item-form" className="modal">
        <div
          className={`modal-box max-w-md roadmap-themed-modal ${themeScopeClass} ${
            isWhiteTheme ? "roadmap-themed-modal-white" : "roadmap-themed-modal-chalk"
          }`}
        >
          <form method="dialog">
            <button
              className={`btn btn-sm btn-circle absolute right-2 top-2 border-0 ${
                isWhiteTheme
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  : "bg-teal-950/60 hover:bg-teal-900 text-teal-50"
              }`}
              onClick={() => setRefreshList((prev) => !prev)}
            >
              âœ•
            </button>
          </form>
          <AddNewRoadmapItem theme={boardTheme} />
        </div>
      </dialog>
    </section>
  );
};

export default OpenedRoadmap;
