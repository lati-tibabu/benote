import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
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
  const [barChartData, setBarChartData] = useState([]);

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
    const barData = [];

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
    setBarChartData(
      formatted.map(({ name, value }) => ({ status: name, count: value }))
    );
  };

  return (
    <div className="w-full max-w-md h-fit p-5 sm:p-7 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-lg mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 pb-2 border-b border-blue-200 text-blue-800 flex items-center gap-2">
        <span className="inline-block w-2 h-6 bg-blue-400 rounded-full mr-2"></span>
        Task Activity Overview
      </h2>
      <p className="text-blue-700 mb-4 text-sm">
        ✅ You have <span className="font-bold text-blue-900">{doneCount}</span>{" "}
        task
        {doneCount !== 1 ? "s" : ""} marked as{" "}
        <span className="text-green-600">done</span>.
      </p>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        {/* Pie Chart */}
        <div className="w-full sm:w-1/2 flex flex-col items-center">
          <span className="text-xs text-blue-400 mb-1">
            Status Distribution
          </span>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  stroke="#e0e7ff"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[entry.name] || "#cccccc"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#f0f6ff",
                    borderRadius: 8,
                    color: "#1e293b",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "0.85rem",
                    color: "#334155",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Bar Chart */}
        <div className="w-full sm:w-1/2 flex flex-col items-center">
          <span className="text-xs text-blue-400 mb-1">Status Count</span>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <Tooltip
                  contentStyle={{
                    background: "#f0f6ff",
                    borderRadius: 8,
                    color: "#1e293b",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "0.85rem",
                    color: "#334155",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#3b82f6">
                  {barChartData.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={statusColors[entry.status] || "#3b82f6"}
                    />
                  ))}
                </Bar>
                {/* XAxis and YAxis are optional for minimal look */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskActivityChart;
