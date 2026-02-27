import React from "react";
import { FaPlus } from "react-icons/fa6";

const ToDoCard = (props) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-none border border-slate-200">
      {/* todo title */}
      <h1 className="font-black tracking-tight text-lg text-slate-900">
        {props.todo_title || "Untitled todo list"}
      </h1>
      <h1 className="text-xs text-slate-500">
        {props.createdAt
          ? new Date(props.createdAt).toUTCString().slice(0, 16)
          : "No date"}
      </h1>
      {/* Todo items */}
      <div className="pt-3">
        <ul className="mb-2 flex flex-col gap-2">
          {props.todo.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-slate-300 cursor-pointer transition"
            >
              <input
                type="checkbox"
                className="h-5 w-5 rounded-md checkbox border-slate-400 border-2"
                checked={item.status === "done"}
                onChange={() => props.onChange(item.id)}
              />
              <span
                className={`text-sm text-slate-800 ${
                  item.status === "done" ? "line-through text-slate-400" : ""
                }`}
              >
                {item.title}
              </span>
            </li>
          ))}
        </ul>
        <hr className="my-3 border-slate-200" />
        <form
          className="p-3 flex flex-col gap-1 border border-slate-200 rounded-xl bg-slate-50"
          onSubmit={(e) => {
            e.preventDefault();
            props.addNewTodo();
          }}
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="grow bg-transparent ring-slate-200 outline-none border-none text-sm"
              placeholder="Add new todo"
              onChange={(e) => props.onHandleContentChange(e)}
              value={props.todoContent}
            />

            <button
              type="submit"
              className="p-2 rounded-lg bg-slate-800 text-white shadow-sm hover:bg-slate-900 transition"
            >
              <FaPlus />
            </button>
          </div>
          <div
            className={`text-xs text-slate-500 px-1 ${
              props.todoContent.length > 255 && "text-red-500 font-bold"
            }`}
          >
            {props.todoContent.length}/255
          </div>
        </form>
      </div>
    </div>
  );
};

export default ToDoCard;
