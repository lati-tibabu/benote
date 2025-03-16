import React from "react";
import { AiFillEdit, AiOutlineMore } from "react-icons/ai";
import {
  FaArchive,
  FaGripHorizontal,
  FaGripLines,
  FaTrash,
  FaUndo,
} from "react-icons/fa";
import { FaHandDots } from "react-icons/fa6";

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
    <div className="flex flex-col border-2 rounded-lg p-2 min-w-64">
      <div className="bg-gray-50 p-1 hover:cursor-grab active:cursor-grabbing">
        <FaGripLines className="text-gray-400" />
      </div>
      <div className="flex flex-col gap-4 p-1 bg-white transition-transform transform">
        {/* Dropdown Menu */}
        <div className="relative flex justify-end">
          <div className="dropdown">
            <AiOutlineMore
              size={22}
              role="button"
              tabIndex={0}
              className="cursor-pointer"
            />
            <ul
              tabIndex={0}
              className="dropdown-content menu dark:bg-gray-100 bg-base-100 rounded-md w-40 p-2 shadow-lg text-left absolute right-0 mt-2"
            >
              {!isArchived && props.status === "todo" && (
                <li>
                  <button
                    className="flex items-center gap-2 p-2 text-gray-700 hover:text-blue-500"
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
                    className="flex items-center gap-2 p-2 text-gray-700 hover:text-blue-500"
                    onClick={handleArchiveButton}
                  >
                    <FaArchive />
                    Archive
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 p-2 text-gray-700 hover:text-blue-500"
                    onClick={handleUnarchiveButton}
                  >
                    <FaUndo />
                    Unarchive
                  </button>
                )}
              </li>
              <li>
                <button
                  className="flex items-center gap-2 p-2 text-red-600 hover:text-red-700"
                  onClick={handleDeleteButton}
                >
                  <FaTrash />
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Task Details */}
        <div className="border-b pb-2">
          <h3 className="font-semibold text-lg text-gray-900">
            {props.taskName}
          </h3>
          <p className="text-sm text-gray-600">{props.taskDescription}</p>
          <p className="text-sm">
            <strong>Assigned to: </strong>
            <span className="hover:underline cursor-pointer hover:text-blue-700">
              {props.taskAssignedTo}
            </span>
          </p>
          <p className="text-sm">
            <strong>Due by: </strong>
            <span className="text-red-500">{props.dueDate}</span>
          </p>
          <p className="text-sm">
            <strong>Created: </strong>
            <span className="">{props.createdAt}</span>
          </p>
        </div>

        {/* Days Elapsed */}
        <div className="flex justify-between items-center text-sm">
          {/* <div className="w-8 h-8 bg-gray-300 text-sm flex justify-center items-center rounded-full text-gray-800 font-bold"> */}
          <div>{props.daysLeft}</div>
        </div>

        {/* Action Buttons */}
        {!isArchived && (
          <div className="text-sm">
            <strong>Actions</strong>
            <div className="flex gap-2 mt-2">
              {props.status !== "todo" && (
                <button
                  onClick={() => handleStatusChange("todo")}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 transition"
                >
                  To Do
                </button>
              )}
              {props.status !== "doing" && (
                <button
                  onClick={() => handleStatusChange("doing")}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md shadow hover:bg-yellow-600 transition"
                >
                  In Progress
                </button>
              )}
              {props.status !== "done" && (
                <button
                  onClick={() => handleStatusChange("done")}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md shadow hover:bg-green-600 transition"
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
