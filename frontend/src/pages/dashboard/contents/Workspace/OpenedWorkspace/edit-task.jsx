import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const EditTask = (props) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // const { taskId } = useParams();
  // const taskId = props.taskId;

  const location2 = useLocation();
  // const workspace = location2.state?.workspace || {};
  const workspace = useSelector((state) => state.workspace.workspace);

  var userData;
  try {
    userData = jwtDecode(token);
  } catch (error) {
    console.error(error);
  }

  const [users, setUsers] = useState([]);
  const [taskData, setTaskData] = useState({
    created_by: "",
    title: "",
    description: "",
    status: "",
    due_date: "",
    assigned_to: "",
    workspace_id: "",
  });

  const fetchTask = async () => {
    try {
      // console.log("from editing: ", props.taskId);

      if (props.taskId) {
        const response = await fetch(`${apiURL}/api/tasks/${props.taskId}`, {
          method: "GET",
          headers: header,
        });
        if (response.ok) {
          const data = await response.json();
          setTaskData((prev) => ({
            ...prev,
            ...data,
          }));
          console.log("Tasks", data);
        } else alert("Error fetching the task detail response is not ok");
      }
    } catch (error) {
      alert("Error occured check console log");
      console.log("Catched error", error);
    }
  };

  // console.log(taskData);

  const fetchUsers = async () => {
    const response = await fetch(`${apiURL}/api/users`, {
      headers: header,
    });
    const data = await response.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchTask();
    fetchUsers();
  }, [props.taskId]);

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiURL}/api/tasks/${props.taskId}`, {
        method: "PUT",
        body: JSON.stringify(taskData),
        headers: {
          ...header,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert("Task is updated succesfully");

        // window.location.href = `/app/workspace/open/${workspace.id}/tasks`;
      }
    } catch (err) {
      console.error("Error creating task: ", err);
    }
  };

  return (
    <div className="w-full flex">
      <div className="bg-transparent p-4 rounded-md shadow-md lg:w-1/2 w-full mt-10 grow">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">📝</p>
          <h1>Edit Task</h1>
        </div>
        <hr className="h-1/2 bg-gray-500" />
        {/* <p>Fill in the form below to create a new task</p> */}
        <form className="flex flex-col gap-2 mt-3" onSubmit={updateTask}>
          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="taskTitle">Task Title</label>
            <input
              type="text"
              id="taskTitle"
              name="taskTitle"
              value={taskData.title}
              onChange={(e) => {
                setTaskData({ ...taskData, title: e.target.value });
              }}
              placeholder="e.g. Complete the report"
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              required
            />
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="description">Description</label>
            <textarea
              //   maxLength={255}
              id="description"
              name="description"
              value={taskData.description}
              onChange={(e) => {
                setTaskData({
                  ...taskData,
                  description: e.target.value,
                });
              }}
              className="p-2 border border-gray-300 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-950"
              placeholder="e.g. Complete the task by the due date"
            ></textarea>
            <span className="text-right text-sm w-full">
              <span
                className={`${
                  taskData?.description?.length > 255 && "text-red-500"
                }`}
              >
                {taskData?.description?.length}
              </span>
              /255
            </span>
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={taskData.status}
              onChange={(e) => {
                setTaskData({ ...taskData, status: e.target.value });
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
              value={taskData.due_date}
              onChange={(e) => {
                setTaskData({
                  ...taskData,
                  due_date: e.target.value,
                });
              }}
              className="p-2 border text-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </fieldset>

          <fieldset className="fieldset flex flex-col gap-1">
            <label htmlFor="assignedTo">Assigned To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={taskData.assigned_to}
              onChange={(e) => {
                setTaskData({
                  ...taskData,
                  assigned_to: e.target.value,
                });
              }}
              className="select bg-white dark:bg-black dark:text-white"
            >
              <option disabled selected>
                Pick a user
              </option>
              {users &&
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                    <span className="font-bold">
                      {user.id === userData.id && " (Me)"}
                    </span>
                  </option>
                ))}
            </select>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary bg-black hover:bg-gray-800 text-white border-none"
          >
            Update Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTask;
