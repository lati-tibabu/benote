import React, { useEffect, useState } from "react";
import { FaRegListAlt, FaPlus, FaMagic } from "react-icons/fa";
import ToDoCard from "../../../../../components/_workspaces/todo_card";
import TodoMinimizedCard from "../../../../../components/_workspaces/todo_minimized_card";
import AddNewTodoList from "./Todo/add-todo-list";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AiGeneratedTodo from "./Todo/ai-generated-todo";
import { ToastContainer } from "react-toastify";
import GeminiIcon from "../../../../../components/geminiIcon";

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
      alert("no todo list is selected");
      return;
    }

    try {
      const response = await fetch(`${apiURL}/api/todoItems/${todo_id}`);
      if (response.ok) {
        const data = await response.json();
        setTodo(data);
        // console.table(data);
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
      const response = await fetch(`${apiURL}/api/todos/${workspaceId}`, {
        headers: header,
      });
      if (response.ok) {
        const data = await response.json();
        setTodoList(data);
        // console.table(todoList);
      } else {
        throw new Error("Error fetching todo list");
      }
    } catch (error) {
      alert("Error happened check log");
      console.error(error);
    }
  };

  // fetching the todo list from the database and also refresh and fetch again once new todo list is added from database
  useEffect(() => {
    fetchTodoList();
  }, [addedNewTodo, todoListDeleted, openedTodoList]);

  // for closing the todo list adding modal automatically after it is added succesfully
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
        // pass;
      }
    } catch (error) {
      console.error("Error checking status", error);
    }
  };

  const handleTodoListDelete = async (id) => {
    // alert(`Deleting this todo list ${id}`);
    if (window.confirm("Are sure to delete this todo list")) {
      try {
        const response = await fetch(`${apiURL}/api/todos/${id}`, {
          method: "DELETE",
          headers: header,
        });
        if (response.ok) {
          // alert("deleted");
          setTodoListDeleted(!todoListDeleted);
        }
      } catch (error) {
        alert("error deleting, check console messages");
        console.error(error);
      }
    }
  };

  const handleOpenTodoList = (id, title, createdAt) => {
    // alert(`opening todo list with id ${id} and title ${title}`);
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
      let todoList = openedTodoList;

      if (Object.keys(openedTodoList).length === 0) {
        // Create a new untitled todo list
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
        todoList = {
          id: data.id,
          createdAt: data.createdAt,
          title: data.title,
        };

        setOpenedTodoList(todoList);
      }

      // Add the new todo item
      const itemResponse = await fetch(`${apiURL}/api/todoItems`, {
        method: "POST",
        headers: {
          ...header,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: todoContent,
          todo_id: todoList.id,
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

  // todo completion progress bar data
  const totalTodos = todo.length;
  const completedTodos = todo.filter((t) => t.status === "done").length;
  const progress =
    totalTodos > 0 ? Math.ceil((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="min-h-screen bg-white p-4">
      <ToastContainer />
      {/* Header */}
      <div className="flex gap-4 justify-between items-center p-4 border-b border-gray-100 mb-6 bg-white rounded-xl shadow-sm">
        <h1 className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
          <FaRegListAlt className="text-blue-500" size={22} />
          To-Do Lists
        </h1>
        <div className="flex items-center gap-2">
          {useGemini && (
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-tr from-blue-50 to-pink-50 hover:from-blue-100 hover:to-pink-100 text-gray-700 border border-gray-100 shadow-sm transition"
              onClick={() => document.getElementById("ai_gen_todo").showModal()}
            >
              <FaMagic size={16} />
              <span className="font-medium text-sm">AI Todo</span>
            </button>
          )}
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition"
            onClick={() => document.getElementById("my_modal_3").showModal()}
          >
            <FaPlus size={16} /> New
          </button>
        </div>
      </div>
      {/* Main Section */}
      <div className="overflow-x-auto scrollbar-hide pt-4">
        <div className="flex gap-6 w-fit sm:w-full">
          {/* Sidebar */}
          <div className="flex flex-col gap-2 p-3 bg-white border border-gray-100 rounded-xl shadow-md min-w-[280px] max-h-[80vh] overflow-y-auto">
            {todoList.length > 0 ? (
              todoList.map((item, index) => (
                <TodoMinimizedCard
                  key={item.id}
                  className={`hover:bg-blue-50 hover:cursor-pointer w-64 rounded-xl border transition shadow-sm ${
                    openedTodoList.id === item.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 bg-white"
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
              <span className="text-gray-400 text-center py-8">
                No todo list
              </span>
            )}
          </div>
          {/* Main Content */}
          <div className="flex-1 min-w-[320px] max-w-2xl">
            {/* Progress Bar */}
            {Object.keys(openedTodoList).length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <progress
                  className="progress progress-success transition w-48 h-3 rounded-full"
                  value={progress}
                  max="100"
                ></progress>
                <div className="flex items-center w-fit font-bold text-gray-700">
                  <span className="flex">
                    <p>{progress}</p> %
                  </span>
                  <p className="ml-1 text-sm font-medium">completed</p>
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
          </div>
        </div>
      </div>
      {/* Add New Todo List Modal */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box bg-white p-4 rounded-md shadow-md w-full max-w-lg mx-auto mt-10">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddNewTodoList />
        </div>
      </dialog>
      {/* AI Todo Modal */}
      <dialog id="ai_gen_todo" className="modal">
        <div className="modal-box bg-white p-4 rounded-md shadow-md w-full max-w-lg mx-auto mt-10">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AiGeneratedTodo />
        </div>
      </dialog>
    </div>
  );
};

export default TodoLists;
