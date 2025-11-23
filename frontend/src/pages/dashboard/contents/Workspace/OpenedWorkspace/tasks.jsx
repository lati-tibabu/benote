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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// StrictModeDroppable workaround for React 18
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
};

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
      // toast.success("Status changed successfully");
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

      // toast.success("Task archived");
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

      // toast.success("Task unarchived");
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

        // toast.success("Task deleted successfully");
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

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    // Optimistic update
    const newTasks = tasks.map((t) => {
      if (t.id === draggableId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(newTasks);

    // Call API
    handleStatusChange(draggableId, newStatus);
  };

  const columns = [
    { id: "todo", title: "To-do", color: "text-gray-700", bg: "bg-gray-100" },
    { id: "doing", title: "In progress", color: "text-yellow-700", bg: "bg-yellow-100" },
    { id: "done", title: "Done", color: "text-green-700", bg: "bg-green-100" },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen p-4">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div className="flex gap-5">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            Tasks
          </h1>
          {workspace?.belongs_to_team && (
            <label className="fieldset-label text-sm flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-sm border border-gray-200">
              <input
                type="checkbox"
                checked={allMemberTasks ? true : false}
                className="checkbox accent-gray-500"
                onChange={(e) =>
                  setAllMemberTasks(e.target.checked ? true : false)
                }
              />
              <div>Show tasks assigned to all member</div>
            </label>
          )}
        </div>
        <div className="flex items-center gap-3">
          {useGemini && (
            <div
              className="btn transition-all duration-300 shadow-sm bg-gradient-to-tr from-gray-100 to-gray-100 hover:from-gray-200 hover:to-gray-200 text-gray-700 border-white btn-soft rounded-sm flex items-center gap-2 px-4 py-2"
              onClick={() => document.getElementById("ai_gen_task").showModal()}
            >
              <GeminiIcon size={20} />
              <span className="font-semibold">Generate Tasks</span>
            </div>
          )}
          <button
            className="btn btn-sm bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-sm px-4 py-2 shadow-sm transition"
            onClick={() => document.getElementById("add_task").showModal()}
          >
            + Add new task
          </button>
        </div>
      </div>
      {loading ? (
        <div className="p-3 h-screen/2 w-full flex gap-3 items-stretch">
          <div className="rounded-sm h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
          <div className="rounded-sm h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
          <div className="rounded-sm h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
          <div className="rounded-sm h-full p-3 flex-1 grow bg-gray-200 animate-pulse duration-200"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 justify-between overflow-x-auto scrollbar-hide pb-4 h-full items-start">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex-1 flex flex-col gap-3 p-4 bg-white/80 border border-gray-200 rounded-sm shadow-sm min-w-[320px] transition hover:shadow-sm"
              >
                <div className="flex justify-between items-center border-b pb-2 mb-2">
                  <div className="flex gap-2 items-center">
                    <h1 className={`font-bold text-lg ${column.color}`}>
                      {column.title}
                    </h1>
                    <span
                      className={`px-2 py-1 ${column.bg} ${column.color} text-xs rounded-sm font-semibold`}
                    >
                      {tasks.filter((task) => task.status === column.id).length}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500 transition">
                    <AiOutlineMore />
                  </button>
                </div>
                <StrictModeDroppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-3 min-h-[200px]"
                    >
                      {tasks
                        .filter((task) => task.status === column.id)
                        .map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
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
                                  rawDueDate={task.due_date}
                                  dueDate={new Date(task.due_date).toLocaleString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    }
                                  )}
                                  createdAt={new Date(task.createdAt)
                                    .toUTCString()
                                    .slice(0, 16)}
                                  daysLeft={(() => {
                                    const timeDiff =
                                      new Date(task.due_date).getTime() -
                                      Date.now();
                                    const daysLeft = Math.floor(
                                      timeDiff / (60 * 60 * 24 * 1000)
                                    );
                                    const hoursLeft = Math.floor(
                                      (timeDiff % (60 * 60 * 24 * 1000)) /
                                        (60 * 60 * 1000)
                                    );

                                    if (timeDiff < 0) {
                                      return "Overdue";
                                    } else if (daysLeft > 0) {
                                      return `${daysLeft} day(s) ${hoursLeft} hour(s) left`;
                                    } else if (hoursLeft > 0) {
                                      return `${hoursLeft} hour(s) left`;
                                    } else {
                                      return "Less than an hour left";
                                    }
                                  })()}
                                  isOverdue={new Date(task.due_date).getTime() < Date.now() && task.status !== 'done'}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </div>
            ))}

            {/* archived */}
            <div className="flex-1 min-w-[320px]">
              <div className="flex flex-col gap-3 p-4 bg-gray-50 border border-gray-200 rounded-sm shadow-sm h-full transition hover:shadow-sm">
                <div className="flex justify-between items-center border-b pb-2 mb-2 gap-4">
                  <div className="flex gap-2 items-center">
                    <h1 className="font-bold text-lg text-gray-700">Archived</h1>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-sm font-semibold">
                      {archivedTasks.length}
                    </span>
                  </div>
                  <div>
                    {!archivedWindow ? (
                      <FaWindowMaximize
                        className="text-gray-400 hover:text-gray-700 cursor-pointer transition"
                        onClick={() => {
                          setArchivedWindow(true);
                        }}
                      />
                    ) : (
                      <FaWindowMinimize
                        className="text-gray-400 hover:text-gray-700 cursor-pointer transition"
                        onClick={() => {
                          setArchivedWindow(false);
                        }}
                      />
                    )}
                  </div>
                </div>
                {archivedWindow &&
                  archivedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
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
                      rawDueDate={task.due_date}
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
                          return "Overdue";
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
        </DragDropContext>
      )}
      <dialog id="add_task" className="modal">
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-fit lg:w-1/2 mx-auto mt-10 overflow-auto scrollbar-hide">
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
        {/* <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-fit lg:w-1/2 mx-auto mt-10"> */}
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-fit lg:w-1/2 mx-auto mt-10 overflow-auto scrollbar-hide">
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
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm sm:w-fit lg:w-1/2 mx-auto mt-10">
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

