import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AiOutlineDelete, AiOutlineUndo } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const ArchivedTasks = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const navigate = useNavigate();

  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [archivedTasks, setArchivedTasks] = useState([]);

  let userData;
  try {
    userData = jwtDecode(token);
  } catch (error) {
    console.error(error);
  }

  // Fetch archived tasks
  const fetchArchivedTasks = async () => {
    try {
      const response = await fetch(`${apiURL}/api/tasks?archived=true`, {
        headers: header,
      });
      const data = await response.json();
      setArchivedTasks(data);
    } catch (error) {
      console.error("Error fetching archived tasks:", error);
    }
  };

  useEffect(() => {
    fetchArchivedTasks();
  }, []);

  // Restore task
  const restoreTask = async (taskId) => {
    try {
      const response = await fetch(`${apiURL}/api/tasks/${taskId}/restore`, {
        method: "PATCH",
        headers: header,
      });

      if (response.ok) {
        setArchivedTasks(archivedTasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error restoring task:", error);
    }
  };

  // Permanently delete task
  const deleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to permanently delete this task?"))
      return;

    try {
      const response = await fetch(`${apiURL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: header,
      });

      if (response.ok) {
        setArchivedTasks(archivedTasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-transparent p-4 rounded-md shadow-md lg:w-2/3 w-full mt-10">
        <div className="flex items-center gap-2 font-bold text-lg">
          <p className="text-2xl">📂</p>
          <h1>Archived Tasks</h1>
        </div>
        <hr className="h-1/2 bg-gray-500 my-2" />

        {archivedTasks.length === 0 ? (
          <p className="text-gray-500 text-center mt-4">
            No archived tasks found.
          </p>
        ) : (
          <ul className="mt-4">
            {archivedTasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center p-3 border border-gray-300 rounded-md mb-2"
              >
                <div>
                  <h2 className="font-bold">{task.name}</h2>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => restoreTask(task.id)}
                    className="text-green-600 hover:text-green-800 flex items-center"
                  >
                    <AiOutlineUndo className="mr-1" /> Restore
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                  >
                    <AiOutlineDelete className="mr-1" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ArchivedTasks;
