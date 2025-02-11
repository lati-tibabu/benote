import React from "react";
import { FaPlus } from "react-icons/fa6";

const ToDoCard = (props) => {
  return (
    <div className="rounded-box bg-white p-4 shadow-lg">
      {/* todo title */}
      <h1 className="font-bold text-lg">{props.todo_title}</h1>
      <h1 className="text-sm text-gray-500">
        {props.createdAt
          ? new Date(props.createdAt).toUTCString().slice(0, 16)
          : "No date"}
      </h1>
      {/* Todo items */}
      <div className="p-2">
        <ul className="mb-2">
          {props.todo.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded-3xl checkbox border-black border-2"
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
          className="p-2 flex items-center border-2 rounded-box"
          onSubmit={(e) => {
            e.preventDefault();
            props.addNewTodo();
          }}
        >
          <input
            type="text"
            className="grow bg-transparent ring-blue-200 outline-none border-none text-lg"
            placeholder="Add new todo"
            onChange={(e) => props.onHandleContentChange(e)}
            value={props.todoContent}
          />
          <button
            type="submit"
            className="p-3 rounded-box bg-gray-200 shadow-md"
          >
            <FaPlus />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ToDoCard;
