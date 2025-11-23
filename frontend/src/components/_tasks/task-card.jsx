import React from "react";
import { AiFillEdit, AiOutlineMore } from "react-icons/ai";
import { FaArchive, FaGripLines, FaTrash, FaUndo } from "react-icons/fa";
import MarkdownRenderer from "../markdown-renderer";

const statusColors = {
  todo: "bg-gray-100 text-gray-700 border-gray-300",
  doing: "bg-yellow-100 text-yellow-700 border-yellow-300",
  done: "bg-gray-100 text-gray-700 border-gray-300",
};

const TaskCard = (props) => {
  const handleStatusChange = (taskStatus) => {
    props.onStatusChange(props.taskId, taskStatus);
  };

  const handleEditButton = () => {
    props.onTaskEdit(props.taskId);
  };

  const handleArchiveButton = () => {
    props.onTaskArchive(props.taskId);
  };

  const handleUnarchiveButton = () => {
    props.onTaskUnarchive(props.taskId);
  };

  const handleDeleteButton = () => {
    props.onTaskDelete(props.taskId);
  };

  const isArchived = props.isArchived || false;

  return (
    <div
      className="flex flex-col border border-gray-200 rounded-sm p-4 min-w-72 shadow-sm bg-white transition-shadow hover:shadow-sm duration-200 group relative overflow-hidden"
      style={{ minHeight: 260 }}
    >
      {/* Drag Handle */}
      <div className="absolute left-3 top-3 opacity-60 group-hover:opacity-100 transition-opacity">
        <FaGripLines className="text-gray-300" />
      </div>
      {/* Dropdown Menu */}
      <div className="absolute right-3 top-3 z-10">
        <div className="dropdown">
          <AiOutlineMore
            size={22}
            role="button"
            tabIndex={0}
            className="cursor-pointer text-gray-400 hover:text-gray-700 transition"
          />
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-white border border-gray-200 rounded-sm w-44 p-2 shadow-sm text-left absolute right-0 mt-2"
          >
            {!isArchived && props.status === "todo" && (
              <li>
                <button
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-600 rounded-sm hover:bg-gray-50 transition"
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
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-600 rounded-sm hover:bg-gray-50 transition"
                  onClick={handleArchiveButton}
                >
                  <FaArchive />
                  Archive
                </button>
              ) : (
                <button
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-600 rounded-sm hover:bg-gray-50 transition"
                  onClick={handleUnarchiveButton}
                >
                  <FaUndo />
                  Unarchive
                </button>
              )}
            </li>
            <li>
              <button
                className="flex items-center gap-2 p-2 text-red-600 hover:text-red-700 rounded-sm hover:bg-red-50 transition"
                onClick={handleDeleteButton}
              >
                <FaTrash />
                Delete
              </button>
            </li>
          </ul>
        </div>
      </div>
      {/* Status Badge */}
      {/* <div
        className={` left-3 top-12 px-3 py-1 rounded-sm border text-xs font-semibold ${
          statusColors[props.status] ||
          "bg-gray-100 text-gray-500 border-gray-200"
        }`}
      >
        {isArchived
          ? "Archived"
          : props.status.charAt(0).toUpperCase() + props.status.slice(1)}
      </div> */}
      {/* Task Details */}
      <div className="flex flex-col gap-3 mt-8">
        <h3 className="font-semibold text-lg text-gray-900 truncate pr-8">
          {props.taskName}
        </h3>
        <div className="text-sm text-gray-600 max-h-20 overflow-y-auto pr-2">
          <MarkdownRenderer content={props.taskDescription} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
          <span className="bg-gray-100 px-2 py-1 rounded-sm">
            <strong>Assigned:</strong>{" "}
            <span className="hover:underline cursor-pointer hover:text-gray-700">
              {props.taskAssignedTo}
            </span>
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-sm">
            <strong>Due:</strong>{" "}
            <span className="text-red-500">{props.dueDate}</span>
          </span>
          <span className="bg-gray-100 px-2 py-1 rounded-sm">
            <strong>Created:</strong> <span>{props.createdAt}</span>
          </span>
        </div>
        {/* Days Elapsed */}
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-block px-3 py-1 rounded-sm bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium text-xs border border-gray-200">
            {props.daysLeft}
          </span>
        </div>
        {/* Action Buttons */}
        {!isArchived && (
          <div className="flex flex-col gap-1 mt-3">
            <span className="text-xs text-gray-400 font-semibold mb-1">
              Change Status
            </span>
            <div className="flex gap-2">
              {props.status !== "todo" && (
                <button
                  onClick={() => handleStatusChange("todo")}
                  className="px-4 py-2 text-xs font-medium text-white bg-gray-500 rounded-sm shadow hover:bg-gray-600 transition"
                >
                  To Do
                </button>
              )}
              {props.status !== "doing" && (
                <button
                  onClick={() => handleStatusChange("doing")}
                  className="px-4 py-2 text-xs font-medium text-white bg-yellow-500 rounded-sm shadow hover:bg-yellow-600 transition"
                >
                  In Progress
                </button>
              )}
              {props.status !== "done" && (
                <button
                  onClick={() => handleStatusChange("done")}
                  className="px-4 py-2 text-xs font-medium text-white bg-gray-500 rounded-sm shadow hover:bg-gray-600 transition"
                >
                  Completed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
