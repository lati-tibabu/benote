import React, { useState } from "react";
import { AiFillEdit, AiOutlineMore } from "react-icons/ai";
import {
  FaArchive,
  FaGripLines,
  FaTrash,
  FaUndo,
  FaUser,
  FaCalendarAlt,
  FaRegClock,
  FaTimes,
} from "react-icons/fa";
import MarkdownRenderer from "../markdown-renderer";

const statusColors = {
  todo: "bg-gray-100 text-gray-700 border-gray-200",
  doing: "bg-yellow-50 text-yellow-700 border-yellow-200",
  done: "bg-green-50 text-green-700 border-green-200",
};

const TaskCard = (props) => {
  const [showDetail, setShowDetail] = useState(false);

  const handleStatusChange = (taskStatus) => {
    props.onStatusChange(props.taskId, taskStatus);
    setShowDetail(false);
  };

  const handleEditButton = () => {
    props.onTaskEdit(props.taskId);
    setShowDetail(false);
  };

  const handleArchiveButton = () => {
    props.onTaskArchive(props.taskId);
    setShowDetail(false);
  };

  const handleUnarchiveButton = () => {
    props.onTaskUnarchive(props.taskId);
    setShowDetail(false);
  };

  const handleDeleteButton = () => {
    props.onTaskDelete(props.taskId);
    setShowDetail(false);
  };

  const isArchived = props.isArchived || false;
  const isOverdue = props.isOverdue || false;

  const getBorderColor = () => {
    if (isArchived) return "border-l-gray-300";
    if (props.status === "done") return "border-l-green-500";
    if (isOverdue) return "border-l-red-500";
    if (props.status === "doing") return "border-l-yellow-500";
    return "border-l-gray-300";
  };

  return (
    <>
      <div
        onClick={(e) => {
          if (e.target.closest(".dropdown") || e.target.closest("button"))
            return;
          setShowDetail(true);
        }}
        className={`flex flex-col border border-gray-200 border-l-4 ${getBorderColor()} rounded-lg p-3 min-w-72 shadow-sm bg-white transition-all hover:shadow-md duration-200 group relative overflow-hidden cursor-pointer hover:bg-gray-50`}
      >
        {/* Drag Handle */}
        <div className="absolute left-3 top-3 opacity-60 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <FaGripLines className="text-gray-300" />
        </div>
        {/* Dropdown Menu */}
        <div className="absolute right-3 top-3 z-10">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="p-1 hover:bg-gray-100 rounded-md transition"
            >
              <AiOutlineMore size={20} className="text-gray-400" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-white border border-gray-200 rounded-md w-44 p-1 shadow-lg z-[1]"
            >
              {!isArchived && props.status === "todo" && (
                <li>
                  <button
                    className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-sm text-sm"
                    onClick={handleEditButton}
                  >
                    <AiFillEdit />
                    Edit
                  </button>
                </li>
              )}
              <li>
                {!isArchived ? (
                  <button
                    className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-sm text-sm"
                    onClick={handleArchiveButton}
                  >
                    <FaArchive />
                    Archive
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-50 rounded-sm text-sm"
                    onClick={handleUnarchiveButton}
                  >
                    <FaUndo />
                    Unarchive
                  </button>
                )}
              </li>
              <li>
                <button
                  className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-sm text-sm"
                  onClick={handleDeleteButton}
                >
                  <FaTrash />
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Card Content */}
        <div className="mt-7 mb-2">
          <h3 className="font-semibold text-gray-800 leading-snug mb-2 line-clamp-2 text-sm">
            {props.taskName}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                isOverdue
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {props.daysLeft}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
              <FaUser size={10} />
            </div>
            <span className="truncate max-w-[80px] font-medium">
              {props.taskAssignedTo}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt
              size={10}
              className={isOverdue ? "text-red-400" : "text-gray-400"}
            />
            <span className={isOverdue ? "text-red-500 font-medium" : ""}>
              {new Date(props.rawDueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <dialog className="modal modal-open bg-black/20 backdrop-blur-sm z-50">
          <div className="modal-box w-11/12 max-w-3xl bg-white p-0 rounded-xl shadow-2xl overflow-hidden scrollbar-hide">
            {/* Header */}
            <div
              className={`p-5 border-b flex justify-between items-start ${
                isOverdue ? "bg-red-50/50" : "bg-gray-50/50"
              }`}
            >
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-gray-800 leading-tight">
                  {props.taskName}
                </h2>
                <div className="flex gap-2 mt-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
                      statusColors[props.status]
                    }`}
                  >
                    {props.status === "todo"
                      ? "TO DO"
                      : props.status === "doing"
                      ? "IN PROGRESS"
                      : "COMPLETED"}
                  </span>
                  {isOverdue && (
                    <span className="text-xs px-2.5 py-1 rounded-md font-semibold bg-red-100 text-red-700 border border-red-200">
                      OVERDUE
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetail(false);
                }}
                className="btn btn-sm btn-circle btn-ghost hover:bg-gray-200/50"
              >
                <FaTimes size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      Description
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                      <MarkdownRenderer content={props.taskDescription} />
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-100 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Assigned to
                      </span>
                      <div className="flex items-center gap-2.5 font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                          <FaUser />
                        </div>
                        <span className="text-sm">{props.taskAssignedTo}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Due Date
                      </span>
                      <div className="flex items-center gap-2.5 font-medium text-gray-700 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
                          <FaCalendarAlt />
                        </div>
                        <span className="text-sm">{props.dueDate}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Created
                      </span>
                      <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">
                          <FaRegClock />
                        </div>
                        <span className="text-sm">{props.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions in Modal */}
                  {!isArchived && (
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Move to
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {props.status !== "todo" && (
                          <button
                            onClick={() => handleStatusChange("todo")}
                            className="btn btn-sm bg-white hover:bg-gray-50 border-gray-200 text-gray-700 w-full justify-start font-normal shadow-sm"
                          >
                            To Do
                          </button>
                        )}
                        {props.status !== "doing" && (
                          <button
                            onClick={() => handleStatusChange("doing")}
                            className="btn btn-sm bg-white hover:bg-yellow-50 border-gray-200 text-gray-700 hover:text-yellow-700 hover:border-yellow-200 w-full justify-start font-normal shadow-sm"
                          >
                            In Progress
                          </button>
                        )}
                        {props.status !== "done" && (
                          <button
                            onClick={() => handleStatusChange("done")}
                            className="btn btn-sm bg-white hover:bg-green-50 border-gray-200 text-gray-700 hover:text-green-700 hover:border-green-200 w-full justify-start font-normal shadow-sm"
                          >
                            Completed
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-col gap-2">
                      {!isArchived && props.status === "todo" && (
                        <button
                          onClick={handleEditButton}
                          className="btn btn-sm bg-gray-100 hover:bg-gray-200 border-none text-gray-700 w-full justify-start gap-2"
                        >
                          <AiFillEdit /> Edit Task
                        </button>
                      )}
                      {!isArchived ? (
                        <button
                          onClick={handleArchiveButton}
                          className="btn btn-sm bg-gray-100 hover:bg-gray-200 border-none text-gray-700 w-full justify-start gap-2"
                        >
                          <FaArchive /> Archive
                        </button>
                      ) : (
                        <button
                          onClick={handleUnarchiveButton}
                          className="btn btn-sm bg-gray-100 hover:bg-gray-200 border-none text-gray-700 w-full justify-start gap-2"
                        >
                          <FaUndo /> Unarchive
                        </button>
                      )}
                      <button
                        onClick={handleDeleteButton}
                        className="btn btn-sm bg-red-50 hover:bg-red-100 border-none text-red-600 w-full justify-start gap-2"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowDetail(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
};

export default TaskCard;

