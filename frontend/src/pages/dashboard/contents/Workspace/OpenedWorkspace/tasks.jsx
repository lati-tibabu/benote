import React, { useEffect, useState } from "react";
import { AiOutlineMore, AiOutlinePlus } from "react-icons/ai";
import TaskCard from "../../../../../components/_tasks/task-card";
import AddNewTask from "./add-new-task";
import EditTask from "./edit-task";
import { useLocation } from "react-router-dom";
import { Fa500Px, FaWindowMaximize, FaWindowMinimize } from "react-icons/fa";
// /import { useReactToPdf } from "react-to-pdf";
// import { usePDF } from "react-to-pdf";

const Tasks = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const location2 = useLocation();
  const workspace = location2.state?.workspace || {};
  const addTask = location2.state?.addTask || false;

  const [statusUpdate, setStatusUpdate] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [editingTask, setEditingTask] = useState("");
  const [archivedWindow, setArchivedWindow] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/tasks/workspace/${workspace.id}`,
        {
          method: "GET",
          headers: header,
        }
      );
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        alert("error fetching tasks");
        console.log("Error while fetching the tasks");
      }
    } catch (error) {
      alert(
        "Error fetching tasks from database, check console error message for details"
      );
      console.error("Error fetching tasks from database :", error);
    }
  };

  const fetchArchivedTasks = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/tasks/workspace/${workspace.id}/archived`,
        {
          method: "GET",
          headers: header,
        }
      );
      if (response.ok) {
        const data = await response.json();
        setArchivedTasks(data);
      } else {
        alert("error fetching tasks");
        console.log("Error while fetching the tasks");
      }
    } catch (error) {
      alert(
        "Error fetching tasks from database, check console error message for details"
      );
      console.error("Error fetching tasks from database :", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchArchivedTasks();
  }, [statusUpdate, addTask]);

  // export the current tasks as pdf
  // const ref = useRef();
  // const pdfName = tasks[0]?.workspace?.name || "tasks";

  // const { toPDF, targetRef } = usePDF({
  //   filename: `${pdfName}.pdf`,
  // });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${apiURL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      if (response.ok) {
        setStatusUpdate((prev) => !prev);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTaskEdit = (taskId) => {
    setEditingTask(taskId);
    // console.log("Editing task: ", taskId);
    document.getElementById("my_modal_4").showModal();
  };

  const handleTaskArchive = async (taskId) => {
    // alert("Archiving task");
    try {
      const response = await fetch(`${apiURL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({
          is_archived: true,
        }),
      });
      if (response.ok) {
        alert("Archived");
        setStatusUpdate((prev) => !prev);
      }
    } catch (error) {
      alert("Error occured check the console log");
      console.error("error archiving the task: ", error);
    }
  };

  const handleTaskUnarchive = async (taskId) => {
    try {
      const response = await fetch(`${apiURL}/api/tasks/${taskId}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({
          is_archived: false,
        }),
      });
      if (response.ok) {
        alert("Archived");
        setStatusUpdate((prev) => !prev);
      }
    } catch (error) {
      alert("Error occured check the console log");
      console.error("error archiving the task: ", error);
    }
  };

  const handleTaskDelete = (taskId) => {
    alert("Deleting task");
  };
  useEffect(() => {
    addTask && document.getElementById("my_modal_3").showModal();
  }, [addTask]);

  return (
    <div>
      <div>
        <h1 className="text-lg font-bold">Tasks</h1>
      </div>
      <div className="flex gap-2 justify-between overflow-x-scroll scrollbar-hide">
        {/* to do */}
        <div className="flex-1 flex flex-col gap-2 p-4 border-2 rounded-md grow">
          {/* title */}
          <div className="flex justify-between border-b-1 pb-2">
            <div className="flex gap-1 items-center">
              <h1 className="font-bold">To-do</h1>
              <span className="p-2 bg-blue-200 text-blue-700 w-4 h-4 text-sm rounded-full flex justify-center items-center">
                {tasks.filter((task) => task.status === "todo").length}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() =>
                  document.getElementById("my_modal_3").showModal()
                }
              >
                <AiOutlinePlus className="text-lg" />
              </button>
              <button>
                <AiOutlineMore />
              </button>
            </div>
          </div>
          {/* tasks list */}
          {tasks.map(
            (task) =>
              task.status == "todo" && (
                <TaskCard
                  onStatusChange={handleStatusChange}
                  onTaskEdit={handleTaskEdit}
                  onTaskArchive={handleTaskArchive}
                  onTaskDelete={handleTaskDelete}
                  taskId={task.id}
                  status={task.status}
                  taskName={task.title}
                  taskDescription={task.description}
                  taskAssignedTo={task.user.name}
                  dueDate={new Date(task.due_date).toUTCString().slice(0, 16)}
                  daysElapsed={
                    // task.daysElapsed
                    Math.floor(
                      (Date.now() - new Date(task.createdAt).getTime()) /
                        (60 * 60 * 24 * 1000)
                    ) == 0
                      ? "<1"
                      : Math.floor(
                          (Date.now() - new Date(task.createdAt).getTime()) /
                            (60 * 60 * 24 * 1000)
                        )
                  }
                />
              )
          )}
          {/* single task card */}
        </div>
        {/* doing */}
        <div className="flex-1 flex flex-col gap-2 p-4 border-2 rounded-md grow">
          {/* title */}
          <div className="flex justify-between border-b-1 pb-2">
            <div className="flex gap-1 items-center">
              <h1 className="font-bold">In progress</h1>
              <span className="p-2 bg-blue-200 text-blue-700 w-4 h-4 text-sm rounded-full flex justify-center items-center">
                {tasks.filter((task) => task.status === "doing").length}
              </span>
            </div>
            <AiOutlineMore />
          </div>
          {/* task list */}
          {tasks.map(
            (task) =>
              task.status == "doing" && (
                <TaskCard
                  onStatusChange={handleStatusChange}
                  onTaskEdit={handleTaskEdit}
                  onTaskArchive={handleTaskArchive}
                  onTaskDelete={handleTaskDelete}
                  taskId={task.id}
                  status={task.status}
                  taskName={task.title}
                  taskDescription={task.description}
                  taskAssignedTo={task.user.name}
                  dueDate={new Date(task.due_date).toUTCString().slice(0, 16)}
                  daysElapsed={
                    // task.daysElapsed
                    Math.floor(
                      (Date.now() - new Date(task.createdAt).getTime()) /
                        (60 * 60 * 24 * 1000)
                    ) == 0
                      ? "<1"
                      : Math.floor(
                          (Date.now() - new Date(task.createdAt).getTime()) /
                            (60 * 60 * 24 * 1000)
                        )
                  }
                />
              )
          )}
        </div>
        {/* done */}
        <div className="flex-1 flex flex-col gap-2 p-4 border-2 rounded-md grow">
          {/* title */}
          <div className="flex justify-between border-b-1 pb-2">
            <div className="flex gap-1 items-center">
              <h1 className="font-bold">Done</h1>
              <span className="p-2 bg-blue-200 text-blue-700 w-4 h-4 text-sm rounded-full flex justify-center items-center">
                {tasks.filter((task) => task.status === "done").length}
              </span>
            </div>
            <AiOutlineMore />
          </div>
          {/* task list */}
          {tasks.map(
            (task) =>
              task.status == "done" && (
                <TaskCard
                  onStatusChange={handleStatusChange}
                  onTaskEdit={handleTaskEdit}
                  onTaskArchive={handleTaskArchive}
                  onTaskDelete={handleTaskDelete}
                  taskId={task.id}
                  status={task.status}
                  taskName={task.title}
                  taskDescription={task.description}
                  taskAssignedTo={task.user.name}
                  dueDate={new Date(task.due_date).toUTCString().slice(0, 16)}
                  daysElapsed={
                    // task.daysElapsed
                    Math.floor(
                      (Date.now() - new Date(task.createdAt).getTime()) /
                        (60 * 60 * 24 * 1000)
                    ) == 0
                      ? "<1"
                      : Math.floor(
                          (Date.now() - new Date(task.createdAt).getTime()) /
                            (60 * 60 * 24 * 1000)
                        )
                  }
                />
              )
          )}
        </div>
        {/* archived */}
        <div>
          <div className="flex-1 flex flex-col gap-2 p-4 border-2 rounded-md grow">
            {/* title */}
            <div className="flex justify-between items-center border-b-1 pb-2 gap-4">
              <div className="flex gap-1 items-center">
                <h1 className="font-bold">Archived</h1>
                <span className="p-2 bg-blue-200 text-blue-700 w-4 h-4 text-sm rounded-full flex justify-center items-center">
                  {archivedTasks.length}
                </span>
              </div>
              {/* <AiOutlineMore /> */}
              <div>
                {!archivedWindow ? (
                  <FaWindowMaximize
                    // className="cursor-pointer p-5"
                    onClick={() => {
                      setArchivedWindow(true);
                    }}
                  />
                ) : (
                  <FaWindowMinimize
                    onClick={() => {
                      setArchivedWindow(false);
                    }}
                  />
                )}
              </div>
            </div>

            {/* task list */}
            {archivedWindow &&
              archivedTasks.map((task) => (
                <TaskCard
                  isArchived={true}
                  onStatusChange={handleStatusChange}
                  onTaskEdit={handleTaskEdit}
                  onTaskUnarchive={handleTaskUnarchive}
                  onTaskDelete={handleTaskDelete}
                  taskId={task.id}
                  status={task.status}
                  taskName={task.title}
                  taskDescription={task.description}
                  taskAssignedTo={task.user.name}
                  dueDate={new Date(task.due_date).toUTCString().slice(0, 16)}
                  daysElapsed={
                    // task.daysElapsed
                    Math.floor(
                      (Date.now() - new Date(task.createdAt).getTime()) /
                        (60 * 60 * 24 * 1000)
                    ) == 0
                      ? "<1"
                      : Math.floor(
                          (Date.now() - new Date(task.createdAt).getTime()) /
                            (60 * 60 * 24 * 1000)
                        )
                  }
                />
              ))}
          </div>
        </div>
      </div>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box bg-white p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddNewTask />
        </div>
      </dialog>

      {/* edit task */}
      <dialog id="my_modal_4" className="modal">
        <div className="modal-box bg-white p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                // alert("editin");
                setStatusUpdate((prev) => !prev);
              }}
            >
              ✕
            </button>
          </form>
          <EditTask taskId={editingTask} />
        </div>
      </dialog>
    </div>
  );
};

export default Tasks;
