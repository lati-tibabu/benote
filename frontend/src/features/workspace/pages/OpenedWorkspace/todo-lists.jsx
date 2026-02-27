import React, { useEffect, useState } from "react";
import { FaRegListAlt, FaPlus, FaMagic } from "react-icons/fa";
import ToDoCard from "@features/workspace/components/todo_card";
import TodoMinimizedCard from "@features/workspace/components/todo_minimized_card";
import AddNewTodoList from "./Todo/add-todo-list";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AiGeneratedTodo from "./Todo/ai-generated-todo";
import { ToastContainer } from "react-toastify";

const TodoLists = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const userData = useSelector((state) => state.auth.user) || {};
  const location = useLocation();
  const addedNewTodo = location.state?.addedTodo;
  const workspace = useSelector((state) => state.workspace.workspace);
  const { workspaceId } = useParams();
  const useGemini = localStorage.getItem("useGemini") === "true" ? true : false;

  const [todoList, setTodoList] = useState([]);
  const [todoListDeleted, setTodoListDeleted] = useState(false);
  const [todoContent, setTodoContent] = useState("");
  const [openedTodoList, setOpenedTodoList] = useState({});
  const [itemUpdated, setItemUpdated] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [loadingLists, setLoadingLists] = useState(false);

  useEffect(() => {
    if (todoList.length > 0 && Object.keys(openedTodoList).length === 0) {
      setOpenedTodoList({
        id: todoList[0].id,
        createdAt: todoList[0].createdAt,
        title: todoList[0].title,
      });
    }
  }, [todoList]);

  const [todo, setTodo] = useState([]);

  const fetchTodo = async (todo_id) => {
    if (!todo_id) {
      return;
    }

    try {
      const response = await fetch(`${apiURL}/api/todoItems/${todo_id}`);
      if (response.ok) {
        const data = await response.json();
        setTodo(data);
      } else {
        throw new Error("Failed to fetch todo items");
      }
    } catch (error) {
      alert(
        "error fetching todo items for selected todo list, check console log"
      );
      console.error("Error fetching todo item", error);
    }
  };

  useEffect(() => {
    if (openedTodoList?.id) {
      fetchTodo(openedTodoList.id);
    }
  }, [openedTodoList, itemUpdated]);

  const fetchTodoList = async () => {
    try {
      setLoadingLists(true);
      const response = await fetch(`${apiURL}/api/todos/${workspaceId}`, {
        headers: header,
      });
      if (response.ok) {
        const data = await response.json();
        setTodoList(data);
      } else {
        throw new Error("Error fetching todo list");
      }
    } catch (error) {
      alert("Error happened check log");
      console.error(error);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    fetchTodoList();
  }, [addedNewTodo, todoListDeleted, openedTodoList]);

  useEffect(() => {
    document.getElementById("my_modal_3").close();
  }, [addedNewTodo]);

  const toggleStatus = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/todoItems/${id}`, {
        method: "PATCH",
        headers: header,
      });
      if (response.ok) {
        setTodo((prevTodo) =>
          prevTodo.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.status === "done" ? "not_done" : "done",
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error checking status", error);
    }
  };

  const handleTodoListDelete = async (id) => {
    if (window.confirm("Are sure to delete this todo list")) {
      try {
        const response = await fetch(`${apiURL}/api/todos/${id}`, {
          method: "DELETE",
          headers: header,
        });
        if (response.ok) {
          setTodoListDeleted(!todoListDeleted);
        }
      } catch (error) {
        alert("error deleting, check console messages");
        console.error(error);
      }
    }
  };

  const handleOpenTodoList = (id, title, createdAt) => {
    setOpenedTodoList({
      id: id,
      title: title,
      createdAt: createdAt,
    });
  };

  const onHandleContentChange = (e) => {
    setTodoContent(e.target.value);
  };

  const handleAddTodoItem = async () => {
    if (todoContent.length === 0) {
      alert("No content to be added");
      return;
    }

    try {
      let todoListToUse = openedTodoList;

      if (Object.keys(openedTodoList).length === 0) {
        const response = await fetch(`${apiURL}/api/todos`, {
          method: "POST",
          headers: {
            ...header,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData.id,
            title: "Untitled todo list",
            workspace_id: workspace.id,
          }),
        });

        if (!response.ok) throw new Error("Failed to create a new todo list");

        const data = await response.json();
        todoListToUse = {
          id: data.id,
          createdAt: data.createdAt,
          title: data.title,
        };

        setOpenedTodoList(todoListToUse);
      }

      const itemResponse = await fetch(`${apiURL}/api/todoItems`, {
        method: "POST",
        headers: {
          ...header,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: todoContent,
          todo_id: todoListToUse.id,
          status: "not_done",
        }),
      });

      if (itemResponse.ok) {
        setItemUpdated((prev) => !prev);
        setTodoContent("");
      } else {
        alert("Error occurred while adding content. Check your data.");
      }
    } catch (error) {
      alert("An error occurred. Check the console.");
      console.error(error);
    }
  };

  const totalTodos = todo.length;
  const completedTodos = todo.filter((t) => t.status === "done").length;
  const progress = totalTodos > 0 ? Math.ceil((completedTodos / totalTodos) * 100) : 0;

  const filteredLists = todoList.filter((item) =>
    item.title.toLowerCase().includes(listSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-zinc-100 p-4 rounded-2xl border border-slate-200/70">
      <ToastContainer />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 border border-slate-200 mb-6 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <FaRegListAlt className="text-slate-500" size={22} />
          <div>
            <h1 className="font-black text-xl tracking-tight text-slate-900">
              To-Do Lists
            </h1>
            <p className="text-xs text-slate-500">
              {todoList.length} list(s) in this workspace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {useGemini && (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm transition"
              onClick={() => document.getElementById("ai_gen_todo").showModal()}
            >
              <FaMagic size={16} />
              <span className="font-medium text-sm">AI Todo</span>
            </button>
          )}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm shadow-sm transition"
            onClick={() => document.getElementById("my_modal_3").showModal()}
          >
            <FaPlus size={16} /> New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 max-h-[80vh] overflow-y-auto">
          <input
            type="text"
            placeholder="Search lists..."
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            className="w-full px-3 py-2 mb-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
          />

          <div className="flex flex-col gap-2">
            {loadingLists && (
              <div className="space-y-2">
                <div className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
                <div className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
              </div>
            )}

            {!loadingLists && filteredLists.length > 0 ? (
              filteredLists.map((item) => (
                <TodoMinimizedCard
                  key={item.id}
                  className={`hover:cursor-pointer rounded-xl border transition ${
                    openedTodoList.id === item.id
                      ? "border-slate-500 bg-slate-100"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                  title={item.title}
                  createdAt={item.createdAt}
                  deleteTodoList={() => handleTodoListDelete(item.id)}
                  onOpenTodoList={() =>
                    handleOpenTodoList(item.id, item.title, item.createdAt)
                  }
                />
              ))
            ) : (
              !loadingLists && (
                <span className="text-slate-400 text-center py-8">No todo lists found</span>
              )
            )}
          </div>
        </aside>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          {Object.keys(openedTodoList).length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="w-56 h-3 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm font-semibold text-slate-700">
                {progress}% completed
              </div>
              <div className="text-xs text-slate-500">
                {completedTodos}/{totalTodos} done
              </div>
            </div>
          )}

          <ToDoCard
            todo_title={openedTodoList.title}
            createdAt={openedTodoList.createdAt}
            todo={todo}
            onChange={(id) => toggleStatus(id)}
            addNewTodo={handleAddTodoItem}
            onHandleContentChange={onHandleContentChange}
            todoContent={todoContent}
          />
        </section>
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-full max-w-lg mx-auto mt-10">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              âœ•
            </button>
          </form>
          <AddNewTodoList />
        </div>
      </dialog>

      <dialog id="ai_gen_todo" className="modal">
        <div className="modal-box bg-white p-4 rounded-sm shadow-sm w-full max-w-lg mx-auto mt-10">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              âœ•
            </button>
          </form>
          <AiGeneratedTodo />
        </div>
      </dialog>
    </div>
  );
};

export default TodoLists;
