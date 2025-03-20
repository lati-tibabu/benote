import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useFetchTasks = (apiURL, header, workspaceId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiURL}/api/tasks/workspace/${workspaceId}`,
        {
          method: "GET",
          headers: header,
        }
      );
      if (!response.ok) {
        toast.error("Error fetching tasks");
        console.error("Error while fetching the tasks");
        return;
      }
      setTasks(await response.json());
    } catch (err) {
      setError(err);
      toast.error(
        "Error fetching tasks from database, check console error message for details"
      );
      console.error("Error fetching tasks from database :", err);
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error, fetchTasks };
};

export default useFetchTasks;
