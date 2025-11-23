import React from "react";
import { FaPlus } from "react-icons/fa6";

const ToDoCard = (props) => {
  return (
    <div className="rounded-sm bg-white p-4 shadow-sm">
      {/* todo title */}
      <h1 className="font-bold text-lg">{props.todo_title}</h1>
      <h1 className="text-sm text-gray-500">
        {props.createdAt
          ? new Date(props.createdAt).toUTCString().slice(0, 16)
          : "No date"}
      </h1>
      {/* Todo items */}
      <div className="p-2">
        <ul className="mb-2 flex flex-col gap-2">
          {props.todo.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 p-2 rounded-sm border-2 border-gray-100 bg-gray-100 hover:border-gray-200 cursor-pointer"
            >
              <div className="w-5 h-5 border-2 border-gray-600 rounded-sm flex items-center justify-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded-sm checkbox border-black border-2"
                  checked={item.status === "done"}
                  // onChange={() => toggleStatus(item.id)}
                  onChange={() => props.onChange(item.id)}
                />
              </div>
              <span
                className={`${item.status === "done" ? "line-through" : ""}`}
              >
                {item.title}
              </span>
            </li>
          ))}
        </ul>
        <hr className="p-2" />
        <form
          className="p-2 flex flex-col gap-1 border-2 rounded-sm"
          onSubmit={(e) => {
            e.preventDefault();
            props.addNewTodo();
          }}
        >
          <div className="flex">
            <input
              type="text"
              className="grow bg-transparent ring-gray-200 outline-none border-none text-lg"
              placeholder="Add new todo"
              onChange={(e) => props.onHandleContentChange(e)}
              value={props.todoContent}
            />

            <button
              type="submit"
              className="p-3 rounded-sm bg-gray-200 shadow-sm"
            >
              <FaPlus />
            </button>
          </div>
          <div
            className={`text-sm text-gray-500 px-3 ${
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
