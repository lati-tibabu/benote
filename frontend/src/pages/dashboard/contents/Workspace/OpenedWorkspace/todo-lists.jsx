import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import ToDoCard from "../../../../../components/_workspaces/todo_card";
import TodoMinimizedCard from "../../../../../components/_workspaces/todo_minimized_card";
import AddNewTodoList from "./add-todo-list";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
// import React from "react";

const TodoLists = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [userData, setUserData] = useState();

  // storing the logged in user data in the userData
  useEffect(() => {
    try {
      const data = jwtDecode(token);
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const location = useLocation();
  const addedNewTodo = location.state?.addedTodo;

  const location2 = useLocation();
  // const workspace = location2.state?.workspace || {};
  const [workspace, setWorkspace] = useState(location2.state?.workspace || {});

  console.table(workspace);

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
      const response = await fetch(`${apiURL}/api/todos/${workspace.id}`, {
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
          todo_id: todoList.id, // Use the updated todoList.id
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

          {Object.keys(openedTodoList).length > 0 && (
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
          )}
          <ToDoCard
            todo_title={openedTodoList.title}
            createdAt={openedTodoList.createdAt}
            todo={todo}
            onChange={(id) => toggleStatus(id)} // lati check this shit out I mean there is a trick in way it works
            addNewTodo={handleAddTodoItem}
            onHandleContentChange={onHandleContentChange}
            todoContent={todoContent}
          />
        </div>
        {/* selecting area */}
        <div className="flex-1 flex flex-wrap w-96 h-fit">
          {todoList.length > 0 ? (
            todoList.map((item, index) => (
              <TodoMinimizedCard
                className="grow m-1 hover:bg-gray-200 hover:cursor-pointer w-fit"
                // onClick={() => alert(`card number ${index} clicked`)}
                title={item.title}
                createdAt={item.createdAt}
                deleteTodoList={() => handleTodoListDelete(item.id)}
                onOpenTodoList={() =>
                  handleOpenTodoList(item.id, item.title, item.createdAt)
                }
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
