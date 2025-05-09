import React, { useEffect, useState } from "react";
import { AiOutlineMore } from "react-icons/ai";
import TaskCard from "../../../../../components/_tasks/task-card";
import AddNewTask from "./Tasks/add-new-task";
import EditTask from "./Tasks/edit-task";
import { useLocation, useParams } from "react-router-dom";
import { FaWindowMaximize, FaWindowMinimize } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { setWorkspace } from "../../../../../redux/slices/workspaceSlice";
import { FaBolt } from "react-icons/fa6";
import AiGeneratedTask from "./Tasks/ai-generated-task";
import GeminiIcon from "../../../../../components/geminiIcon";

const Tasks = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const useGemini = localStorage.getItem("useGemini") === "true" ? true : false;

  const location2 = useLocation();

  const workspace = useSelector((state) => state.workspace.workspace);

  const { workspaceId } = useParams();

  const addTask = location2.state?.addTask || false;

  const [statusUpdate, setStatusUpdate] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [editingTask, setEditingTask] = useState("");
  const [archivedWindow, setArchivedWindow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allMemberTasks, setAllMemberTasks] = useState(true);

  const dispatch = useDispatch();

  const userData = useSelector((state) => state.auth.user) || {};

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${apiURL}/api/tasks/workspace/${workspaceId}`,
        {
          method: "GET",
          headers: header,
        }
      );

      if (!response.ok) {
        // alert("error fetching tasks");
        toast.error("Error fetching tasks");
        console.log("Error while fetching the tasks");
        return;
      }

      // toast.success("Task succesfully loaded");

      setTasks(await response.json());
    } catch (error) {
      alert(
        "Error fetching tasks from database, check console error message for details"
      );
      console.error("Error fetching tasks from database :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedTasks = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/tasks/workspace/${workspaceId}/archived`,
        {
          method: "GET",
          headers: header,
        }
      );
      if (!response.ok) {
        // alert("error fetching tasks");
        toast.error("Error fetching archived tasks");
        console.log("Error while fetching archived tasks");
        return;
      }

      setArchivedTasks(await response.json());
    } catch (error) {
      alert(
        "Error fetching archived tasks from database, check console error message for details"
      );
      console.error("Error fetching archived tasks from database :", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchArchivedTasks();
  }, [workspaceId, statusUpdate, addTask]);

  // export the current tasks as pdf
  // const ref = useRef();
  // const pdfName = tasks[0]?.workspace?.name || "tasks";

  // const { toPDF, targetRef } = usePDF({
  //   filename: `${pdfName}.pdf`,
  // });

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(
        `${apiURL}/api/tasks/${taskId}?status=${newStatus}`, //statusChange=1&
        {
          method: "PUT",
          headers: header,
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );
      if (!response.ok) {
        toast.error("Error changing the status of the task");
        return;
      }

      setStatusUpdate((prev) => !prev);
      toast.success("Status changed successfully");
      // await getWorkspaceDetails(workspaceId);
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
      if (!response.ok) {
        toast.error("Error archiving the task");
        return;
      }

      toast.success("Task archived");
      setStatusUpdate((prev) => !prev);
      // await getWorkspaceDetails(workspaceId);
    } catch (error) {
      alert("Error occured while archiving check the console log");
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
      if (!response.ok) {
        toast.error("Error unarchive the task");
        return;
      }

      toast.success("Task unarchived");
      // await getWorkspaceDetails(workspaceId);
      setStatusUpdate((prev) => !prev);
    } catch (error) {
      alert("Error occured check the console log");
      console.error("error archiving the task: ", error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`${apiURL}/api/tasks/${taskId}`, {
          headers: header,
          method: "DELETE",
        });
        if (!response.ok) return toast.error("Error deleting task");

        toast.success("Task deleted successfully");
        // await getWorkspaceDetails(workspaceId);
        setStatusUpdate((prev) => !prev);
      } catch (error) {
        toast.error("An unexpected error occurred while deleting"); // add this
        console.error(error); // log the actual error
      }
    }
  };
  useEffect(() => {
    addTask && document.getElementById("add_task").showModal();
  }, [addTask]);

  // console.log("Tasks", tasks);

  useEffect(() => {
    allMemberTasks
      ? fetchTasks()
      : setTasks(tasks.filter((task) => task.assigned_to === userData.id));
  }, [allMemberTasks]);

  // function to get workspace detail and store updated information on redux for better UX
  const getWorkspaceDetails = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/workspaces/${id}`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) throw new Error("Failed to fetch workspace");

      const data = await response.json();
      dispatch(setWorkspace(data));
    } catch (error) {
      console.error("Error fetching workspace:", error);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <div className="flex gap-5">
          <h1 className="text-xl font-bold">Tasks</h1>
          {/* Check if the workspace is team based or private and show option to show all tasks or current user assigned tasks */}
          {workspace?.belongs_to_team && (
            <label className="fieldset-label text-sm flex items-center gap-1">
              <input
                type="checkbox"
                // {allMemberTasks && checked}
                checked={allMemberTasks ? true : false}
                className="checkbox"
                onChange={(e) =>
                  setAllMemberTasks(e.target.checked ? true : false)
                }
              />
              <div>Show tasks assigned to all member</div>
              {/* {allMemberTasks ? "All Member" : "Only You"} */}
            </label>
          )}
        </div>

        <div className="flex items-center gap-3">
          {useGemini && (
            <div
              // className="btn btn-sm bg-gradient-to-tr from-pink-500 transition-all duration-300 to-blue-600 text-white border-white hover:border-pink-500 btn-soft rounded-full"
              className="btn transition-all duration-300 shadow-md bg-gray-100 hover:bg-gray-100 text-gray-700 border-white btn-soft rounded-full"
              // onClick={() =>
              //   alert("hey developer, you wanna generate task list")
              // }
              onClick={() => document.getElementById("ai_gen_task").showModal()}
            >
              {/* <FaBolt /> */}
              <GeminiIcon size={20} />
              Generate Tasks
            </div>
          )}
          <button
            className="btn btn-sm"
            onClick={() => document.getElementById("add_task").showModal()}
          >
            + Add new task
          </button>
        </div>
      </div>
      {loading ? (
        <div className="p-3 h-screen/2 w-full flex gap-3 items-stretch">
          <div className="rounded h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
          <div className="rounded h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
          <div className="rounded h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
          <div className="rounded h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
        </div>
      ) : (
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
                <button>
                  <AiOutlineMore />
                </button>
              </div>
            </div>
            {/* tasks list */}
            {tasks?.map(
              (task) =>
                task?.status == "todo" && (
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
                    dueDate={new Date(task.due_date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                    createdAt={new Date(task.createdAt)
                      .toUTCString()
                      .slice(0, 16)}
                    daysLeft={(() => {
                      const timeDiff =
                        new Date(task.due_date).getTime() - Date.now();
                      const daysLeft = Math.floor(
                        timeDiff / (60 * 60 * 24 * 1000)
                      );
                      const hoursLeft = Math.floor(
                        (timeDiff % (60 * 60 * 24 * 1000)) / (60 * 60 * 1000)
                      );

                      if (timeDiff < 0) {
                        return "Overdue"; // If overdue
                      } else if (daysLeft > 0) {
                        return `${daysLeft} day(s) ${hoursLeft} hour(s) left`;
                      } else if (hoursLeft > 0) {
                        return `${hoursLeft} hour(s) left`;
                      } else {
                        return "Less than an hour left";
                      }
                    })()}
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
                    dueDate={new Date(task.due_date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                    createdAt={new Date(task.createdAt)
                      .toUTCString()
                      .slice(0, 16)}
                    daysLeft={(() => {
                      const timeDiff =
                        new Date(task.due_date).getTime() - Date.now();
                      const daysLeft = Math.floor(
                        timeDiff / (60 * 60 * 24 * 1000)
                      );
                      const hoursLeft = Math.floor(
                        (timeDiff % (60 * 60 * 24 * 1000)) / (60 * 60 * 1000)
                      );

                      if (timeDiff < 0) {
                        return "Overdue"; // If overdue
                      } else if (daysLeft > 0) {
                        return `${daysLeft} day(s) ${hoursLeft} hour(s) left`;
                      } else if (hoursLeft > 0) {
                        return `${hoursLeft} hour(s) left`;
                      } else {
                        return "Less than an hour left";
                      }
                    })()}
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
                    dueDate={new Date(task.due_date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                    createdAt={new Date(task.createdAt)
                      .toUTCString()
                      .slice(0, 16)}
                    daysLeft={(() => {
                      const timeDiff =
                        new Date(task.due_date).getTime() - Date.now();
                      const daysLeft = Math.floor(
                        timeDiff / (60 * 60 * 24 * 1000)
                      );
                      const hoursLeft = Math.floor(
                        (timeDiff % (60 * 60 * 24 * 1000)) / (60 * 60 * 1000)
                      );

                      if (timeDiff < 0) {
                        return "Overdue"; // If overdue
                      } else if (daysLeft > 0) {
                        return `${daysLeft} day(s) ${hoursLeft} hour(s) left`;
                      } else if (hoursLeft > 0) {
                        return `${hoursLeft} hour(s) left`;
                      } else {
                        return "Less than an hour left";
                      }
                    })()}
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
                    dueDate={new Date(task.due_date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                    createdAt={new Date(task.createdAt)
                      .toUTCString()
                      .slice(0, 16)}
                    daysLeft={(() => {
                      const timeDiff =
                        new Date(task.due_date).getTime() - Date.now();
                      const daysLeft = Math.floor(
                        timeDiff / (60 * 60 * 24 * 1000)
                      );
                      const hoursLeft = Math.floor(
                        (timeDiff % (60 * 60 * 24 * 1000)) / (60 * 60 * 1000)
                      );

                      if (timeDiff < 0) {
                        return "Overdue"; // If overdue
                      } else if (daysLeft > 0) {
                        return `${daysLeft} day(s) ${hoursLeft} hour(s) left`;
                      } else if (hoursLeft > 0) {
                        return `${hoursLeft} hour(s) left`;
                      } else {
                        return "Less than an hour left";
                      }
                    })()}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
      <dialog id="add_task" className="modal">
        <div className="modal-box bg-white p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10 overflow-auto scrollbar-hide">
          <form method="dialog">
            <button
              className="absolute btn btn-sm btn-circle btn-ghost right-2 top-2"
              onClick={() => {
                setStatusUpdate((prev) => !prev);
              }}
            >
              ✕
            </button>
          </form>
          <AddNewTask />
        </div>
      </dialog>

      {/* edit task */}
      <dialog id="my_modal_4" className="modal">
        {/* <div className="modal-box bg-white p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10"> */}
        <div className="modal-box bg-white p-4 rounded-md shadow-md w-fit lg:w-1/2 mx-auto mt-10 overflow-auto scrollbar-hide">
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
      <dialog id="ai_gen_task" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => {
                setStatusUpdate((prev) => !prev);
              }}
            >
              ✕
            </button>
          </form>
          <AiGeneratedTask />
        </div>
      </dialog>
    </div>
  );
};

export default Tasks;
