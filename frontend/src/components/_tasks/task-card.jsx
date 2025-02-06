import React from "react";
import {
  AiFillEdit,
  AiFillUnlock,
  AiOutlineEdit,
  AiOutlineMore,
} from "react-icons/ai";
import { FaArchive, FaRemoveFormat, FaTrash, FaUndo } from "react-icons/fa";

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
    <div className="flex flex-col gap-3 p-3 border-2 rounded-box shadow-md hover:">
      <div className="dropdown">
        <div className="flex w-full justify-end">
          <AiOutlineMore size={20} role="button" tabIndex={0} className="m-1" />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu dark:bg-gray-100 bg-base-100 rounded-md w-fit p-2 shadow-lg text-left right-0"
        >
          {/* <li className="p-3 hover:text-blue-500">Edit</li> */}
          <li>
            {props.status === "todo" && !isArchived && (
              <button
                className="p-3 hover:text-blue-500"
                onClick={() => handleEditButton()}
              >
                <AiFillEdit />
                Edit
              </button>
            )}
          </li>

          <li>
            {!isArchived ? (
              <button
                className="p-3 hover:text-blue-500"
                onClick={() => handleArchiveButton()}
              >
                <FaArchive />
                Archive
              </button>
            ) : (
              <button
                className="p-3 hover:text-blue-500"
                onClick={() => handleUnarchiveButton()}
              >
                <FaUndo />
                Unarchive
              </button>
            )}
          </li>

          <li>
            <button
              className="p-3 hover:text-blue-500"
              onClick={() => handleDeleteButton()}
            >
              <FaTrash />
              Delete
            </button>
          </li>
        </ul>
      </div>
      {/* <AiOutlineMore />
      </div> */}
      {/* Task details */}
      <div className="flex flex-col gap-1 border-b-1">
        {/* task title */}
        <span className="font-bold">{props.taskName}</span>
        {/* task description */}
        <span className="text-sm">{props.taskDescription}</span>
        {/* assigned */}
        <span className="text-sm">
          <strong>Assigned to </strong>
          <span className="hover:underline cursor-pointer hover:text-blue-700">
            {props.taskAssignedTo}
          </span>
        </span>
        {/* due date */}
        <span className="text-sm">
          <strong>Due by </strong>
          {props.dueDate}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        {/* {props.status === "todo" ? (
          <button
            className="btn btn-sm bg-gray-500 text-white"
            onClick={() => handleEditButton()}
          >
            Edit
          </button>
        ) : (
          <span>Launched</span>
        )} */}
        <div className="w-4 h-4 bg-gray-300 text-sm p-3 flex justify-center items-center rounded-full">
          {props.daysElapsed}
        </div>
      </div>
      {!isArchived && (
        <div className="text-sm">
          <strong>Actions</strong>
          <div className="flex gap-2">
            {props.status != "todo" && (
              <button
                onClick={() => handleStatusChange("todo")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                To Do
              </button>
            )}
            {props.status != "doing" && (
              <button
                onClick={() => handleStatusChange("doing")}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              >
                In Progress
              </button>
            )}
            {props.status != "done" && (
              <button
                onClick={() => handleStatusChange("done")}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                Completed
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
