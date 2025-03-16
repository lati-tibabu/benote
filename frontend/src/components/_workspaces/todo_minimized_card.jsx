import React from "react";
import { AiFillDelete, AiOutlineMore, AiOutlineNumber } from "react-icons/ai";
import { FaListOl } from "react-icons/fa";
import { FaListUl, FaMaximize, FaPlus } from "react-icons/fa6";

const TodoMinimizedCard = (props) => {
  return (
    <div
      className={`${props.className} p-3 border-2 flex flex-col rounded-box bg-gray-100 gap-2 h-fit`}
      onClick={() =>
        props.onOpenTodoList(props.id, props.title, props.createdAt)
      }
    >
      <div className="flex items-center justify-between">
        <FaListUl className="text-sm" />

        <div className="dropdown">
          <AiOutlineMore size={24} role="button" tabIndex={0} className="m-1" />
          <ul
            tabIndex={0}
            className="dropdown-content menu dark:bg-gray-100 bg-base-100 rounded-md w-fit p-2 shadow-lg text-left right-0"
          >
            {/* <li className="p-3 hover:text-blue-500">Edit</li> */}
            <li
              className="p-3 hover:text-red-500 flex"
              onClick={() => props.deleteTodoList(props.id)}
            >
              {/* <AiFillDelete /> */}
              Delete
            </li>
          </ul>
        </div>
      </div>
      {/* <div className="flex items-center gap-2"> */}
      <h1 className="text-sm ">{props.title}</h1>
      {/* </div> */}

      <h1 className="text-xs text-gray-500">
        {new Date(props.createdAt).toUTCString().slice(0, 16)}
      </h1>
      {/* <div className="flex items-center justify-start gap-2">
        <button
          className="p-3 rounded-box bg-gray-200 shadow-md flex items-center gap-2 w-fit"
          onClick={props.onClick}
        >
          <FaPlus />
        </button>
      </div> */}
    </div>
  );
};

export default TodoMinimizedCard;
