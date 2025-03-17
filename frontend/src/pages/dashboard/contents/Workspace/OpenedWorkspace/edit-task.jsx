import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditTask = (props) => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const workspace = useSelector((state) => state.workspace.workspace);
  const { workspaceId } = useParams();

  let userData;
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
    status: "todo",
    due_date: "",
    assigned_to: "",
    workspace_id: workspaceId,
  });

  useEffect(() => {
    if (workspace?.belongs_to_team) {
      const fetchUsers = async (id) => {
        try {
          const response = await fetch(`${apiURL}/api/teams/${id}`, {
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

      fetchUsers(workspace.belongs_to_team);
    }
  }, [workspace?.belongs_to_team]);

  const fetchTask = async () => {
    try {
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
            due_date: data.due_date
              ? new Date(data.due_date).toISOString().slice(0, 16)
              : "",
          }));
        } else {
          alert("Error fetching the task details.");
        }
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      alert("An error occurred while fetching task details.");
    }
  };

  useEffect(() => {
    fetchTask();
  }, [props.taskId]);

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = {
        ...taskData,
        due_date: taskData.due_date
          ? new Date(taskData.due_date).toISOString()
          : null,
      };

      const response = await fetch(`${apiURL}/api/tasks/${props.taskId}`, {
        method: "PUT",
        body: JSON.stringify(updatedTask),
        headers: header,
      });

      if (response.ok) {
        toast.success("Task updated successfully");
      } else {
        toast.error("Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error("An error occurred while updating the task.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg">
      {/* <ToastContainer /> */}
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        📝 Edit Task
      </h1>
      <p className="text-gray-600 mb-4">Update the task details below.</p>
      <form className="space-y-4" onSubmit={updateTask}>
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
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-800 bg-white"
          />
        </div>
        {workspace?.belongs_to_team && (
          <div>
            <label className="block text-gray-700">Assigned To</label>
            <select
              value={taskData.assigned_to}
              onChange={(e) =>
                setTaskData({ ...taskData, assigned_to: e.target.value })
              }
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 text-gray-800 bg-white"
            >
              <option disabled value="">
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
          className="btn btn-md border-none w-full text-white py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
        >
          Update Task
        </button>
      </form>
    </div>
  );
};

export default EditTask;
