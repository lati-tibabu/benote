import React, { useEffect, useMemo, useState } from "react";
import { AiOutlineMore } from "react-icons/ai";
import TaskCard from "@features/tasks/components/task-card";
import AddNewTask from "./Tasks/add-new-task";
import EditTask from "./Tasks/edit-task";
import { useLocation, useParams } from "react-router-dom";
import { FaWindowMaximize, FaWindowMinimize } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import AiGeneratedTask from "./Tasks/ai-generated-task";
import GeminiIcon from "@features/ai/components/geminiIcon";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [dueFilter, setDueFilter] = useState("all");

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
        toast.error("Error fetching tasks");
        return;
      }

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
        toast.error("Error fetching archived tasks");
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

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${apiURL}/api/tasks/${taskId}?status=${newStatus}`, {
        method: "PUT",
        headers: header,
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      if (!response.ok) {
        toast.error("Error changing the status of the task");
        return;
      }

      setStatusUpdate((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTaskEdit = (taskId) => {
    setEditingTask(taskId);
    document.getElementById("my_modal_4").showModal();
  };

  const handleTaskArchive = async (taskId) => {
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

      setStatusUpdate((prev) => !prev);
    } catch (error) {
      alert("Error occurred while archiving, check the console log");
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

      setStatusUpdate((prev) => !prev);
    } catch (error) {
      alert("Error occurred check the console log");
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

        setStatusUpdate((prev) => !prev);
      } catch (error) {
        toast.error("An unexpected error occurred while deleting");
        console.error(error);
      }
    }
  };

  useEffect(() => {
    addTask && document.getElementById("add_task").showModal();
  }, [addTask]);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter((task) => {
      const isMine = task.assigned_to === userData.id;
      const withinMemberScope = allMemberTasks || isMine;
      if (!withinMemberScope) return false;

      const title = (task.title || "").toLowerCase();
      const description = (task.description || "").toLowerCase();
      const assigneeName = (task?.user?.name || "").toLowerCase();
      const keyword = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        description.includes(keyword) ||
        assigneeName.includes(keyword);

      if (!matchesSearch) return false;
      if (!task.due_date || dueFilter === "all") return true;

      const dueDate = new Date(task.due_date);
      if (dueFilter === "overdue") return dueDate < now && task.status !== "done";
      if (dueFilter === "today") return dueDate >= now && dueDate <= endOfToday;
      if (dueFilter === "week") return dueDate >= now && dueDate <= weekFromNow;
      return true;
    });
  }, [tasks, userData.id, allMemberTasks, searchQuery, dueFilter]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    const newTasks = tasks.map((t) => {
      if (t.id === draggableId) {
        return { ...t, status: newStatus };
      }
      return t;
    });
    setTasks(newTasks);
    handleStatusChange(draggableId, newStatus);
  };

  const columns = [
    {
      id: "todo",
      title: "To-do",
      color: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-200",
    },
    {
      id: "doing",
      title: "In Progress",
      color: "text-amber-700",
      bg: "bg-amber-100",
      border: "border-amber-200",
    },
    {
      id: "done",
      title: "Done",
      color: "text-emerald-700",
      bg: "bg-emerald-100",
      border: "border-emerald-200",
    },
  ];

  const todoCount = filteredTasks.filter((task) => task.status === "todo").length;
  const doingCount = filteredTasks.filter((task) => task.status === "doing").length;
  const doneCount = filteredTasks.filter((task) => task.status === "done").length;

  return (
    <div className="bg-gradient-to-br from-slate-100 via-white to-zinc-100 min-h-screen p-4 rounded-2xl border border-slate-200/70">
      <ToastContainer />
      <div className="flex flex-col gap-4 mb-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Workspace Tasks
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {filteredTasks.length} active
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
              {archivedTasks.length} archived
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, assignee"
              className="w-full sm:w-80 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <select
              value={dueFilter}
              onChange={(e) => setDueFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All due dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due today</option>
              <option value="week">Due in 7 days</option>
            </select>
            {useGemini && (
              <div
                className="btn transition-all duration-300 shadow-sm bg-gradient-to-tr from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 border-slate-200 rounded-xl flex items-center gap-2 px-4 py-2"
                onClick={() => document.getElementById("ai_gen_task").showModal()}
              >
                <GeminiIcon size={20} />
                <span className="font-semibold">Generate Tasks</span>
              </div>
            )}
            <button
              className="btn btn-sm bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl px-4 py-2 shadow-sm transition"
              onClick={() => document.getElementById("add_task").showModal()}
            >
              + Add Task
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">To-do</p>
              <p className="text-sm font-bold text-slate-700">{todoCount}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-600">In Progress</p>
              <p className="text-sm font-bold text-amber-700">{doingCount}</p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-600">Done</p>
              <p className="text-sm font-bold text-emerald-700">{doneCount}</p>
            </div>
          </div>

          {workspace?.belongs_to_team && (
            <label className="text-sm flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={allMemberTasks ? true : false}
                className="checkbox checkbox-sm accent-slate-600"
                onChange={(e) => setAllMemberTasks(e.target.checked ? true : false)}
              />
              <div className="text-slate-700">Show tasks from all members</div>
            </label>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-3 w-full flex gap-3 items-stretch">
          <div className="rounded-xl h-64 p-3 flex-1 grow bg-slate-200 animate-pulse duration-200"></div>
          <div className="rounded-xl h-64 p-3 flex-1 grow bg-slate-200 animate-pulse duration-200"></div>
          <div className="rounded-xl h-64 p-3 flex-1 grow bg-slate-200 animate-pulse duration-200"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 justify-between overflow-x-auto scrollbar-hide pb-4 h-full items-start">
            {columns.map((column) => (
              <div
                key={column.id}
                className={`flex-1 flex flex-col gap-3 p-3 bg-white border ${column.border} rounded-2xl shadow-sm min-w-[320px]`}
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                  <div className="flex gap-2 items-center">
                    <h1 className={`font-bold text-lg ${column.color}`}>{column.title}</h1>
                    <span
                      className={`px-2 py-1 ${column.bg} ${column.color} text-xs rounded-full font-semibold`}
                    >
                      {filteredTasks.filter((task) => task.status === column.id).length}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 transition">
                    <AiOutlineMore />
                  </button>
                </div>
                <StrictModeDroppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-col gap-3 min-h-[240px] rounded-xl bg-slate-50/40 p-2"
                    >
                      {filteredTasks
                        .filter((task) => task.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
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
                                  taskAssignedTo={task?.user?.name || "Unassigned"}
                                  rawDueDate={task.due_date}
                                  dueDate={new Date(task.due_date).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    hour12: true,
                                  })}
                                  createdAt={new Date(task.createdAt).toUTCString().slice(0, 16)}
                                  daysLeft={(() => {
                                    const timeDiff = new Date(task.due_date).getTime() - Date.now();
                                    const daysLeft = Math.floor(
                                      timeDiff / (60 * 60 * 24 * 1000)
                                    );
                                    const hoursLeft = Math.floor(
                                      (timeDiff % (60 * 60 * 24 * 1000)) / (60 * 60 * 1000)
                                    );
                                    if (timeDiff < 0) return "Overdue";
                                    if (daysLeft > 0) return `${daysLeft} day(s) ${hoursLeft} hour(s) left`;
                                    if (hoursLeft > 0) return `${hoursLeft} hour(s) left`;
                                    return "Less than an hour left";
                                  })()}
                                  isOverdue={
                                    new Date(task.due_date).getTime() < Date.now() &&
                                    task.status !== "done"
                                  }
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

            <div className="flex-1 min-w-[320px]">
              <div className="flex flex-col gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm h-full">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1 gap-4">
                  <div className="flex gap-2 items-center">
                    <h1 className="font-bold text-lg text-slate-700">Archived</h1>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-semibold">
                      {archivedTasks.length}
                    </span>
                  </div>
                  {!archivedWindow ? (
                    <FaWindowMaximize
                      className="text-slate-400 hover:text-slate-700 cursor-pointer transition"
                      onClick={() => setArchivedWindow(true)}
                    />
                  ) : (
                    <FaWindowMinimize
                      className="text-slate-400 hover:text-slate-700 cursor-pointer transition"
                      onClick={() => setArchivedWindow(false)}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-3 min-h-[240px] rounded-xl bg-slate-50/40 p-2">
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
                        taskAssignedTo={task?.user?.name || "Unassigned"}
                        rawDueDate={task.due_date}
                        dueDate={new Date(task.due_date).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })}
                        createdAt={new Date(task.createdAt).toUTCString().slice(0, 16)}
                        daysLeft={(() => {
                          const timeDiff = new Date(task.due_date).getTime() - Date.now();
                          const daysLeft = Math.floor(timeDiff / (60 * 60 * 24 * 1000));
                          const hoursLeft = Math.floor(
                            (timeDiff % (60 * 60 * 24 * 1000)) / (60 * 60 * 1000)
                          );
                          if (timeDiff < 0) return "Overdue";
                          if (daysLeft > 0) return `${daysLeft} day(s) ${hoursLeft} hour(s) left`;
                          if (hoursLeft > 0) return `${hoursLeft} hour(s) left`;
                          return "Less than an hour left";
                        })()}
                      />
                    ))}
                  {!archivedWindow && (
                    <p className="text-sm text-slate-500 p-2">
                      Expand to view archived tasks.
                    </p>
                  )}
                </div>
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
              onClick={() => setStatusUpdate((prev) => !prev)}
            >
              âœ•
            </button>
          </form>
          <AddNewTask />
        </div>
      </dialog>

      <dialog id="my_modal_4" className="modal">
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-fit lg:w-1/2 mx-auto mt-10 overflow-auto scrollbar-hide">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setStatusUpdate((prev) => !prev)}
            >
              âœ•
            </button>
          </form>
          <EditTask taskId={editingTask} />
        </div>
      </dialog>
      <dialog id="ai_gen_task" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setStatusUpdate((prev) => !prev)}
            >
              âœ•
            </button>
          </form>
          <AiGeneratedTask />
        </div>
      </dialog>
    </div>
  );
};

export default Tasks;
