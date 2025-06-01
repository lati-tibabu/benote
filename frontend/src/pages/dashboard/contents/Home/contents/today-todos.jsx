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
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg p-5 sm:p-7">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 pb-2 border-b border-blue-200 text-blue-800 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-blue-400 rounded-full mr-2"></span>
        Today’s Todo Lists
      </h2>
      <div className="w-full overflow-x-auto flex gap-4 py-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
        {todos.length === 0 ? (
          <div className="text-blue-400 text-center w-full py-8">
            No todos for today.
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="min-w-[18rem] max-w-xs bg-white/80 border border-blue-100 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col group"
              onClick={() => handleClick(todo.workspace.id)}
            >
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700 truncate">
                  {todo.title}
                </h3>
                <p className="text-xs text-blue-500 group-hover:text-blue-700 font-medium truncate">
                  {todo.workspace.name}
                </p>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  {todo.todo_items.slice(0, 3).map((item, index) => (
                    <li
                      key={index}
                      className="text-xs text-blue-800 group-hover:text-blue-600 truncate"
                    >
                      {item.title}
                    </li>
                  ))}
                  {todo.todo_items.length > 3 && (
                    <li className="text-xs text-blue-400 italic">...more</li>
                  )}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodayTodos;
