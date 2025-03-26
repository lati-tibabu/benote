import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AddNewTodoList = (props) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const location2 = useLocation();
  // const [workspace, setWorkspace] = useState(location2.state?.workspace || {});
  const workspace = useSelector((state) => state.workspace.workspace);
  const [addedTodo, setAddedTodo] = useState(false);

  var userData;
  try {
    userData = jwtDecode(token);
  } catch (error) {
    console.error(error);
  }

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [todoData, setTodoData] = useState({
    user_id: userData.id,
    title: "",
    workspace_id: workspace.id,
  });

  const createTodo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiURL}/api/todos`, {
        method: "POST",
        body: JSON.stringify(todoData),
        headers: {
          ...header,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAddedTodo(!addedTodo);
        setTodoData((prev) => ({
          ...prev,
          title: "",
        }));
        // alert("Todo list is created successfully");
        navigate(`/app/workspace/open/${workspace.id}/todo-lists`, {
          state: { addedTodo: addedTodo },
        });
        // window.location.href = `/app/workspace/open/${workspace.id}/todo-lists`;
      }
    } catch (err) {
      console.error("Error creating todo list: ", err);
    }
  };

  return (
    <div className="w-full flex">
      <div className="bg-transparent p-4 rounded-md shadow-md lg:w-1/2 w-full mt-10 grow">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">📝</p>
          <h1>Add New Todo List</h1>
        </div>
        <hr className="h-1/2 bg-gray-500" />
        <p>Fill in the form below to create a new todo list</p>
        <form className="flex flex-col gap-2 mt-3" onSubmit={createTodo}>
          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="todoTitle">Todo Title</label>
            <input
              type="text"
              id="todoTitle"
              name="todoTitle"
              value={todoData.title}
              onChange={(e) => {
                setTodoData({ ...todoData, title: e.target.value });
              }}
              placeholder="e.g. Complete the report"
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              required
            />
          </fieldset>

          {/* <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={todoData.description}
              onChange={(e) => {
                setTodoData({
                  ...todoData,
                  description: e.target.value,
                });
              }}
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              placeholder="e.g. Complete the task by the due date"
            ></textarea>
            <span className="text-right text-sm w-full">
              <span
                className={`${
                  todoData.description.length > 255 && "text-red-500"
                }`}
              >
                {todoData.description.length}
              </span>
              /255
            </span>
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={todoData.status}
              onChange={(e) => {
                setTodoData({ ...todoData, status: e.target.value });
              }}
              className="select bg-white dark:bg-black dark:text-white"
            >
              <option value="todo">To Do</option>
              <option value="doing">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={todoData.due_date}
              onChange={(e) => {
                setTodoData({
                  ...todoData,
                  due_date: e.target.value,
                });
              }}
              className="p-2 border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </fieldset> */}

          <button
            type="submit"
            className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none"
          >
            Create Todo List
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddNewTodoList;
