import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddNewTask = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const workspace = useSelector((state) => state.workspace.workspace);
  const userData = useSelector((state) => state.auth.user) || {};

  const belongsToTeam = workspace?.belongs_to_team;

  const [users, setUsers] = useState([]);
  const [taskData, setTaskData] = useState({
    created_by: userData?.id || "",
    title: "",
    description: "",
    status: "todo",
    due_date: "",
    assigned_to: userData?.id || "",
    workspace_id: workspace?.id || "",
  });

  useEffect(() => {
    if (belongsToTeam) {
      const fetchUsers = async () => {
        try {
          const response = await fetch(`${apiURL}/api/teams/${belongsToTeam}`, {
            method: "GET",
            headers: header,
          });
          if (!response.ok) throw new Error("Failed to fetch team");
          const data = await response.json();
          setUsers(data.members);
        } catch (error) {
          console.error("Error fetching the team data", error);
        }
      };

      fetchUsers();
    }
  }, [belongsToTeam]);

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiURL}/api/tasks`, {
        method: "POST",
        body: JSON.stringify(taskData),
        headers: header,
      });

      if (response.ok) {
        toast.success("Task created successfully");
        setTaskData((prev) => ({
          ...prev,
          title: "",
          description: "",
          due_date: "",
        }));
      } else {
        toast.error("Failed to create task");
      }
    } catch (err) {
      console.error("Error creating task: ", err);
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      {/* <ToastContainer /> */}
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        📝 Add New Task
      </h1>
      <p className="text-gray-600 mb-4">
        Fill in the form below to create a new task.
      </p>
      <form className="space-y-4" onSubmit={createTask}>
        <div>
          <label className="block text-gray-700">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) =>
              setTaskData({ ...taskData, title: e.target.value })
            }
            placeholder="e.g. Complete the report"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-800 bg-white"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            value={taskData.description}
            onChange={(e) =>
              setTaskData({ ...taskData, description: e.target.value })
            }
            placeholder="e.g. Complete the task by the due date"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-800 bg-white"
          ></textarea>
        </div>
        <div>
          <label className="block text-gray-700">Status</label>
          <select
            value={taskData.status}
            onChange={(e) =>
              setTaskData({ ...taskData, status: e.target.value })
            }
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-800 bg-white"
          >
            <option value="todo">To Do</option>
            <option value="doing">In Progress</option>
            <option value="done">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Due Date</label>
          <input
            type="datetime-local"
            value={taskData.due_date}
            onChange={(e) =>
              setTaskData({ ...taskData, due_date: e.target.value })
            }
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-white bg-gray-600"
          />
        </div>
        {belongsToTeam && (
          <div>
            <label className="block text-gray-700">Assigned To</label>
            <select
              value={taskData.assigned_to}
              onChange={(e) =>
                setTaskData({ ...taskData, assigned_to: e.target.value })
              }
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-800 bg-white"
            >
              <option disabled selected>
                Pick a user
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.id === userData?.id && "(Me)"}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          type="submit"
          className="btn btn-md border-none w-full text-white py-2 rounded-lg"
        >
          + Create Task
        </button>
      </form>
    </div>
  );
};

export default AddNewTask;
