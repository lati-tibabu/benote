import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const TaskActivityChart = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const headers = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const [taskData, setTaskData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [doneCount, setDoneCount] = useState(0);

  const statusColors = {
    todo: "#8884d8",
    "in progress": "#82ca9d",
    doing: "#ffc658",
    done: "#00C49F",
    overdue: "#FF8042",
  };

  useEffect(() => {
    fetch(`${apiURL}/api/tasks/user`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tasks");
        return res.json();
      })
      .then((data) => {
        setTaskData(data);
        processChartData(data);
      })
      .catch((error) => {
        console.error("Error loading tasks:", error);
      });
  }, []);

  const processChartData = (data) => {
    const statusCount = {};
    let doneTasks = 0;

    data.forEach((task) => {
      const status = (task.status || "unknown").toLowerCase();
      statusCount[status] = (statusCount[status] || 0) + 1;

      if (status === "done") {
        doneTasks += 1;
      }
    });

    const formatted = Object.entries(statusCount).map(([status, count]) => ({
      name: status,
      value: count,
    }));

    setChartData(formatted);
    setDoneCount(doneTasks);
  };

  return (
    <div className="max-w-96 h-[28rem] p-4 bg-white shadow-md rounded-xl overflow-auto">
      <h2 className="text-xl font-semibold mb-2">Task Activity Overview</h2>

      <p className="text-gray-600 mb-4">
        ✅ You have <span className="font-bold">{doneCount}</span> task
        {doneCount !== 1 ? "s" : ""} marked as{" "}
        <span className="text-green-600">done</span>.
      </p>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={statusColors[entry.name] || "#cccccc"}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskActivityChart;
