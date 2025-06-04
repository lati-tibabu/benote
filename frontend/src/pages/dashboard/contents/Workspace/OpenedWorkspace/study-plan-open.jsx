import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
// import OpenedAIStudyGenerators from "./opened_ai_generator";
import OpenedAIStudyGenerators from "./StudyPlan/opened_ai_generator";
import StudyPlanViewer from "./StudyPlan/study_plan_viewer"; // Assuming this is the correct import path

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
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [viewMode, setViewMode] = useState("calendar"); // "calendar" or "viewer"
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

  console.log("Study Plan Data:", plan);

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
          <button
            className="ml-4 text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 font-semibold px-4 py-2 rounded-lg shadow transition"
            onClick={() => setShowAIGenerator(true)}
          >
            Generate Plan (AI)
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
            {/* View Mode Switcher */}
            <div className="ml-auto flex gap-2">
              <button
                className={`px-3 py-1 rounded-lg font-medium transition border ${
                  viewMode === "calendar"
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                }`}
                onClick={() => setViewMode("calendar")}
              >
                Calendar View
              </button>
              <button
                className={`px-3 py-1 rounded-lg font-medium transition border ${
                  viewMode === "viewer"
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50"
                }`}
                onClick={() => setViewMode("viewer")}
              >
                Simple Viewer
              </button>
            </div>
          </div>
        </div>
        {/* Main Content: Calendar or Viewer */}
        {viewMode === "calendar" ? (
          <div className="overflow-x-auto max-h-[600px] scrollbar-hide bg-white/90 rounded-2xl shadow-lg border border-gray-100 p-0 mt-6">
            {/* Calendar Table */}
            <table
              ref={tableRef}
              className="table border-0 min-w-max w-full text-sm"
            >
              <thead className="sticky top-0 z-10 bg-gradient-to-r from-purple-50 to-white/80">
                <tr className="text-gray-700 text-base">
                  <th className="bg-white/0 w-20"></th>
                  {[...Array(days)]?.map((_, index) => (
                    <th
                      key={index}
                      className="bg-white/0 px-4 py-3 min-w-[120px] border-b border-gray-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-base text-purple-700 tracking-tight">
                          {new Date(
                            start + index * 86400000
                          ).toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="font-light text-xs text-gray-400">
                          {new Date(
                            start + index * 86400000
                          ).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
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
                    <td className="p-2 text-center font-semibold bg-gradient-to-r from-gray-50 to-white sticky left-0 z-5 text-gray-600 text-xs border-r border-gray-100">
                      {formatTime(i)}
                    </td>
                    {[...Array(days)].map((_, index) => {
                      const targetTimestamp = new Date(
                        start + index * 86400000 + i * 3600000
                      ).getTime();

                      const timeBlockTimestamps = timeBlocks?.map((timeBlock) =>
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
                          className={`border border-gray-100 min-w-[110px] h-12 align-top cursor-pointer relative transition group ${
                            job
                              ? "bg-gradient-to-r from-purple-100/60 to-white/80"
                              : "hover:bg-purple-50"
                          }`}
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
                                    className="input bg-gray-50 outline-1 ring-1 ring-purple-400 px-2 py-1 rounded-md text-xs w-20 focus:ring-2 focus:ring-purple-500"
                                  />
                                  <button
                                    type="submit"
                                    className="bg-purple-500 text-white px-2 py-1 rounded-md text-xs hover:bg-purple-600 transition"
                                  >
                                    Save
                                  </button>
                                </form>
                                <div className="mt-1 flex justify-between">
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
                                className="bg-gradient-to-r from-purple-400/90 to-purple-600/80 text-white px-2 py-1 rounded-md text-xs font-semibold shadow hover:scale-105 transition-transform cursor-pointer h-full group-hover:ring-2 group-hover:ring-purple-300"
                                title={description}
                                onClick={() => handleOpenPlanDetail(id, job)}
                              >
                                {job}
                              </div>
                            )
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              {cellSelected &&
                                targetCell === targetTimestamp && (
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
                                      className="input bg-gray-50 outline-1 ring-1 ring-purple-400 rounded-md px-2 py-1 text-xs w-20 focus:ring-2 focus:ring-purple-500"
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
        ) : (
          <div className="mt-6">
            <StudyPlanViewer plan={plan} />
          </div>
        )}
        {/* Modal for AI Generator */}
        {showAIGenerator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative animate-fade-in">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setShowAIGenerator(false)}
                aria-label="Close"
              >
                ×
              </button>
              <OpenedAIStudyGenerators
                plan={plan}
                onSuccess={() => {
                  setShowAIGenerator(false);
                  fetchStudyPlan(plan_id);
                }}
              />
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default StudyPlanOpened;
