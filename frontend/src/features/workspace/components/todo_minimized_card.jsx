import React from "react";
import { AiOutlineMore } from "react-icons/ai";
import { FaListUl } from "react-icons/fa6";

const TodoMinimizedCard = (props) => {
  return (
    <div
      className={`${props.className} p-3 border flex flex-col rounded-xl gap-2 h-fit`}
      onClick={() =>
        props.onOpenTodoList(props.id, props.title, props.createdAt)
      }
    >
      <div className="flex items-center justify-between">
        <FaListUl className="text-sm" />

        <div className="dropdown">
          <AiOutlineMore
            size={22}
            role="button"
            tabIndex={0}
            className="m-1 text-slate-500 hover:text-slate-700"
          />
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-white rounded-xl w-fit p-2 shadow-sm text-left right-0 border border-slate-200"
          >
            <li
              className="p-2 hover:text-red-500 flex rounded-lg hover:bg-red-50"
              onClick={() => props.deleteTodoList(props.id)}
            >
              Delete
            </li>
          </ul>
        </div>
      </div>
      <h1 className="text-sm text-slate-800 font-semibold">{props.title}</h1>

      <h1 className="text-xs text-slate-500">
        {new Date(props.createdAt).toUTCString().slice(0, 16)}
      </h1>
    </div>
  );
};

export default TodoMinimizedCard;
