import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const useFetchArchivedTasks = (apiURL, header, workspaceId) => {
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArchivedTasks = async () => {
    setLoading(true);
    setError(null);
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
        console.error("Error while fetching archived tasks");
        return;
      }
      setArchivedTasks(await response.json());
    } catch (err) {
      setError(err);
      toast.error(
        "Error fetching archived tasks from database, check console error message for details"
      );
      console.error("Error fetching archived tasks from database :", err);
    } finally {
      setLoading(false);
    }
  };

  return { archivedTasks, loading, error, fetchArchivedTasks };
};

export default useFetchArchivedTasks;
