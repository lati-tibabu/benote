import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import ToDoCard from "../../../../../components/_workspaces/todo_card";
import TodoMinimizedCard from "../../../../../components/_workspaces/todo_minimized_card";
import AddNewTodoList from "./add-todo-list";
import { useLocation } from "react-router-dom";

const TodoLists = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const location = useLocation();
  const addedNewTodo = location.state?.addedTodo;

  const [todoList, setTodoList] = useState([]);
  const [todoListDeleted, setTodoListDeleted] = useState(false);
  const [todoContent, setTodoContent] = useState("");
  const [openedTodoList, setOpenedTodoList] = useState({});
  const [itemUpdated, setItemUpdated] = useState(false);

  useEffect(() => {
    if (todoList.length > 0) {
      setOpenedTodoList({
        id: todoList[0].id,
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
        console.table(data);
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
      const response = await fetch(`${apiURL}/api/todos`, {
        headers: header,
      });
      if (response.ok) {
        const data = await response.json();
        setTodoList(data);
        // console.table(todoList);
      }
    } catch (error) {
      alert("Error happened check log");
      console.error(error);
    }
  };

  // fetching the todo list from the database and also refresh and fetch again once new todo list is added from database
  useEffect(() => {
    fetchTodoList();
  }, [addedNewTodo, todoListDeleted]);

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

  const handleOpenTodoList = (id, title) => {
    // alert(`opening todo list with id ${id} and title ${title}`);
    setOpenedTodoList({
      id: id,
      title: title,
    });
  };

  const onHandleContentChange = (e) => {
    setTodoContent(e.target.value);
  };

  const handleAddTodoItem = async () => {
    // alert(todoContent);
    if (todoContent.length === 0) {
      alert("no content to be added");
      return;
    }
    try {
      const response = await fetch(`${apiURL}/api/todoItems`, {
        method: "POST",
        headers: header,
        body: JSON.stringify({
          title: todoContent,
          todo_id: openedTodoList.id,
          status: "not_done",
        }),
      });
      if (response.ok) {
        // alert("Added to the todo list");
        setItemUpdated(!itemUpdated);
        setTodoContent("");
      } else {
        alert("error occured while adding content check your data");
      }
    } catch (error) {
      alert("Error occured check console");
      console.error(error);
    }
  };

  // todo completion progress bar data
  const totalTodos = todo.length;
  const completedTodos = todo.filter((t) => t.status === "done").length;
  const progress =
    totalTodos > 0 ? Math.ceil((completedTodos / totalTodos) * 100) : 0;

  return (
    <div>
      {/* top-section : for quick managements like adding to do list*/}
      <div className="flex gap-4 justify-between  items-center p-2 border-b-2">
        <h1 className="font-bold text-lg">TO-DO List</h1>
        <div
          className="flex items-center btn"
          // onClick={() => alert("hey developer, you wanna add a todo list")}
          onClick={() => document.getElementById("my_modal_3").showModal()}
        >
          <FaPlus />
          <span>Add New To Do</span>
        </div>
      </div>
      {/* bottom-section where viewing and real businesses takes place*/}
      <div className="flex p-1 gap-3 w-full overflow-x-scroll">
        {/* viewing area */}
        <div className="flex-1">
          {/* todo progress */}
          <div className="flex items-center gap-3">
            <progress
              className="progress progress-success transition"
              value={progress}
              max="100"
            ></progress>
            <div className="flex items-center w-fit font-bold">
              <span className="flex">
                <p>{progress}</p> %
              </span>
              <p className="ml-1">completed</p>
            </div>
          </div>
          <ToDoCard
            todo_title={openedTodoList.title}
            todo={todo}
            onChange={(id) => toggleStatus(id)} // lati check this shit out I mean there is a trick in way it works
            addNewTodo={handleAddTodoItem}
            onHandleContentChange={onHandleContentChange}
            todoContent={todoContent}
          />
        </div>
        {/* selecting area */}
        <div className="flex-1 flex flex-wrap w-96">
          {todoList.length > 0 ? (
            todoList.map((item, index) => (
              <TodoMinimizedCard
                className="grow m-1 hover:bg-gray-200 hover:cursor-pointer"
                // onClick={() => alert(`card number ${index} clicked`)}
                title={item.title}
                deleteTodoList={() => handleTodoListDelete(item.id)}
                onOpenTodoList={() => handleOpenTodoList(item.id, item.title)}
              />
            ))
          ) : (
            <span>No todo list</span>
          )}
        </div>
      </div>

      {/* modal for adding new todo list */}
      <dialog id="my_modal_3" className="modal overflow-x-scroll">
        <div className="modal-box bg-white p-4 rounded-md shadow-md sm:w-fit lg:w-1/2 mx-auto mt-10">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddNewTodoList />
        </div>
      </dialog>
    </div>
  );
};

export default TodoLists;
