import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TodayTodos = () => {
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const headers = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetch(`${apiURL}/api/todos?date=today`, {
          headers,
        });
        if (!res.ok) throw new Error("Failed to fetch todos");
        const data = await res.json();
        setTodos(data);
      } catch (error) {
        console.error("Error fetching todos:", error);
      }
    };

    fetchTodos();
  }, []);

  const handleClick = (workspaceId) => {
    navigate(`/app/workspace/open/${workspaceId}/todo-lists`);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Today’s Todo Lists</h2>
      <div className="w-full max-w-[30rem] overflow-x-auto mx-auto carousel carousel-center space-x-4 p-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="carousel-item"
            onClick={() => handleClick(todo.workspace.id)}
          >
            <div className="card w-80 bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all">
              <div className="card-body">
                <h2 className="card-title text-lg font-semibold">
                  {todo.title}
                </h2>
                <p className="text-sm text-gray-500">{todo.workspace.name}</p>
                <ul className="list-disc ml-4 mt-2">
                  {todo.todo_items.slice(0, 3).map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.title}
                    </li>
                  ))}
                  {todo.todo_items.length > 3 && (
                    <li className="text-sm text-gray-400 italic">...more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayTodos;
