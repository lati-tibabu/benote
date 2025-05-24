import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const StudyPlanOpened = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const workspace = useSelector((state) => state.workspace.workspace);

  const { plan_id } = useParams();
  const [plan, setPlan] = useState();
  const [cellSelected, setCellSelected] = useState(false);
  const [targetCell, setTargetCell] = useState(null);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [timeBlockData, setTimeBlockData] = useState({
    start_time: "",
    end_time: "",
    user_id: "",
    workspace_id: workspace.id,
    job: "",
    description: "This is study plan",
    study_plan_id: plan_id,
  });
  const [openPlanDetails, setOpenPlanDetails] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const userData = useSelector((state) => state.auth.user) || {};
  const tableRef = useRef(null);

  const fetchStudyPlan = async (id) => {
    try {
      const response = await fetch(`${apiURL}/api/studyPlans/${id}`, {
        headers: header,
      });
      if (!response.ok) {
        console.log("Error fetching the plans");
        return;
      }
      const data = await response.json();
      setPlan(data);
      setTimeBlocks(data.timeBlocks);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  useEffect(() => {
    fetchStudyPlan(plan_id);
  }, [plan_id]);

  useEffect(() => {
    if (tableRef.current) {
      const rowToScroll = tableRef.current.querySelector("tr:nth-child(7)");
      if (rowToScroll) {
        rowToScroll.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [plan]);

  const start = new Date(plan?.start_date).getTime();
  const end = new Date(plan?.end_date).getTime();

  const duration = end - start;
  const days = duration / 86400000;

  const formatTime = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:00 ${period}`;
  };

  const handlePlanAdd = async (e) => {
    e.preventDefault();
    setTimeBlockData({
      ...timeBlockData,
      start_time: new Date(targetCell).toISOString(),
      end_time: new Date(targetCell).toISOString(),
      user_id: userData.id,
    });

    try {
      const response = await fetch(`${apiURL}/api/timeBlocks`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(timeBlockData),
      });
      if (!response.ok) {
        console.log("Error fetching the plans", await response.json());
        return;
      }
      fetchStudyPlan(plan_id);
    } catch (error) {
      console.error(error);
    }
  };

  const [jobEdit, setJobEdit] = useState("");

  const handleOpenPlanDetail = (id, job) => {
    setSelectedPlanId(id);
    setOpenPlanDetails(true);
    setJobEdit(job);
  };

  const handlePlanEdit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${apiURL}/api/timeBlocks/${selectedPlanId}`,
        {
          method: "PATCH",
          headers: header,
          body: JSON.stringify({ job: jobEdit }),
        }
      );

      if (!response.ok) {
        return alert("error patching the plan");
      }
      fetchStudyPlan(plan_id);
      setOpenPlanDetails(false);
      alert("Plan updated successfully");
    } catch (error) {
      console.error("error patching the plan", error);
    }
  };

  return (
    plan && (
      <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen p-4">
        {/* Header */}
        <div className="mb-6">
          <button
            className="text-purple-700 hover:text-purple-900 font-medium mb-2 px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 transition"
            onClick={() => window.history.back()}
          >
            ← Back
          </button>
          <h1 className="font-extrabold text-2xl tracking-tight text-gray-900 mb-2">
            Study Plan
          </h1>
          <div className="flex flex-wrap items-center gap-4 bg-purple-100/80 p-4 rounded-2xl shadow-md border border-purple-200">
            <h1 className="text-lg font-semibold text-purple-700 truncate max-w-xs">
              {plan?.title}
            </h1>
            <p className="text-sm text-purple-600">
              <span className="font-semibold">Start:</span>{" "}
              {new Date(plan?.start_date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-sm text-purple-600">
              <span className="font-semibold">End:</span>{" "}
              {new Date(plan?.end_date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        {/* Calendar Table */}
        <div className="overflow-x-auto max-h-[600px] scrollbar-hide bg-white/90 rounded-2xl shadow-md border border-gray-200 p-2">
          <table className="table border-0 min-w-max">
            <thead className="sticky top-0 z-10 bg-purple-50">
              <tr className="text-gray-700 text-base">
                <th className="bg-white/0"></th>
                {[...Array(days)].map((_, index) => (
                  <th
                    key={index}
                    className="bg-purple-50 px-4 py-2 min-w-[160px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-base text-purple-700">
                        {new Date(
                          start + index * 86400000
                        ).toLocaleDateString("en-US", { weekday: "long" })}
                      </span>
                      <span className="font-light text-xs text-gray-500">
                        {new Date(
                          start + index * 86400000
                        ).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(24)].map((_, i) => (
                <tr key={i} className="border-0">
                  <td className="p-2 text-center font-medium bg-gray-100 sticky left-0 z-5 text-gray-700 text-sm">
                    {formatTime(i)}
                  </td>
                  {[...Array(days)].map((_, index) => {
                    const targetTimestamp = new Date(
                      start + index * 86400000 + i * 3600000
                    ).getTime();

                    const timeBlockTimestamps = timeBlocks.map((timeBlock) =>
                      new Date(timeBlock.start_time).getTime()
                    );

                    const foundIndex =
                      timeBlockTimestamps.indexOf(targetTimestamp);

                    const job =
                      foundIndex !== -1 ? timeBlocks[foundIndex].job : null;

                    const description =
                      foundIndex !== -1
                        ? timeBlocks[foundIndex].description
                        : null;

                    const id =
                      foundIndex !== -1 ? timeBlocks[foundIndex].id : null;

                    return (
                      <td
                        key={index}
                        className="border border-gray-100 hover:bg-purple-50 transition min-w-[140px] h-12 align-top cursor-pointer relative"
                        title={targetTimestamp}
                        onClick={() => {
                          setCellSelected(true);
                          setTargetCell(targetTimestamp);
                        }}
                      >
                        {job ? (
                          openPlanDetails && selectedPlanId === id ? (
                            <div className="relative w-full">
                              <form
                                onSubmit={handlePlanEdit}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="text"
                                  name="job"
                                  value={jobEdit}
                                  onChange={(e) => setJobEdit(e.target.value)}
                                  className="input bg-gray-50 outline-1 ring-1 ring-purple-500 px-2 py-1 rounded-md text-sm w-24"
                                />
                                <button
                                  type="submit"
                                  className="bg-purple-500 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-600 transition"
                                >
                                  Save
                                </button>
                              </form>
                              <div className="mt-2 flex justify-between">
                                <button className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition">
                                  Delete
                                </button>
                                <button
                                  className="text-gray-400 hover:text-gray-700 text-lg px-2"
                                  onClick={() => setOpenPlanDetails(false)}
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow hover:scale-105 transition-transform cursor-pointer h-full"
                              title={description}
                              onClick={() => handleOpenPlanDetail(id, job)}
                            >
                              {job}
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {cellSelected && targetCell === targetTimestamp && (
                              <form
                                onSubmit={handlePlanAdd}
                                className="w-full flex items-center"
                              >
                                <input
                                  type="text"
                                  name="job"
                                  onChange={(e) =>
                                    setTimeBlockData({
                                      ...timeBlockData,
                                      job: e.target.value,
                                    })
                                  }
                                  className="input bg-gray-50 outline-1 ring-1 ring-purple-500 rounded-md px-2 py-1 text-sm w-24"
                                  autoFocus
                                />
                              </form>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  );
};

export default StudyPlanOpened;
