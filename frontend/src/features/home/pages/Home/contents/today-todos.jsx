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
    <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-sm shadow-sm p-5 sm:p-7">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 pb-2 border-b border-gray-200 text-gray-800 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-gray-400 rounded-sm mr-2"></span>
        Today’s Todo Lists
      </h2>
      <div className="w-full overflow-x-auto flex gap-4 py-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50">
        {todos.length === 0 ? (
          <div className="text-gray-400 text-center w-full py-8">
            No todos for today.
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="min-w-[18rem] max-w-xs bg-white/80 border border-gray-100 rounded-sm shadow-sm hover:shadow-sm cursor-pointer transition-all flex flex-col group"
              onClick={() => handleClick(todo.workspace.id)}
            >
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 truncate">
                  {todo.title}
                </h3>
                <p className="text-xs text-gray-500 group-hover:text-gray-700 font-medium truncate">
                  {todo.workspace.name}
                </p>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  {todo.todo_items.slice(0, 3).map((item, index) => (
                    <li
                      key={index}
                      className="text-xs text-gray-800 group-hover:text-gray-600 truncate"
                    >
                      {item.title}
                    </li>
                  ))}
                  {todo.todo_items.length > 3 && (
                    <li className="text-xs text-gray-400 italic">...more</li>
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
