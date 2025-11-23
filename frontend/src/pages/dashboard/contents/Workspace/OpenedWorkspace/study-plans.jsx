import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AiGeneratedTask from "./StudyPlan/ai-generated-studyPlan";
import {
  PiBookOpenTextBold,
  PiCalendarCheckBold,
  PiCalendarXBold,
  PiTrashBold,
  PiPlusBold,
  PiMagicWandBold,
} from "react-icons/pi";

const StudyPlans = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const [studyPlans, setStudyPlans] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    workspace_id: "",
  });

  const [errorMsg, setErrorMsg] = useState(null);

  const userData = useSelector((state) => state.auth.user) || {};

  const workspace = useSelector((state) => state.workspace.workspace);

  useEffect(() => {
    if (workspace?.id) {
      setFormData((prev) => ({ ...prev, workspace_id: workspace.id }));
    }
  }, [workspace]);

  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({ ...prev, user_id: userData.id }));
    }
  }, [userData]);

  useEffect(() => {
    const fetchStudyPlans = async () => {
      try {
        const response = await fetch(`${apiURL}/api/studyPlans`, {
          headers: header,
        });
        const data = await response.json();
        setStudyPlans(data);
      } catch (error) {
        console.error("Error fetching study plans:", error);
      }
    };

    fetchStudyPlans();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const response = await fetch(`${apiURL}/api/studyPlans`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMsg(errorData.message || "Failed to create study plan");
        return;
      }

      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        workspace_id: workspace?.id || "",
      });

      const updatedPlans = await fetch(`${apiURL}/api/studyPlans`, {
        headers: header,
      });
      const data = await updatedPlans.json();
      setStudyPlans(data);
    } catch (error) {
      console.error("Error creating study plan:", error);
      setErrorMsg("An error occurred while creating the study plan.");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this study plan?")) {
      try {
        const response = await fetch(`${apiURL}/api/studyPlans/${planId}`, {
          method: "DELETE",
          headers: header,
        });

        if (!response.ok) {
          throw new Error("Failed to delete study plan");
        }

        const updatedPlans = await fetch(`${apiURL}/api/studyPlans`, {
          headers: header,
        });
        const data = await updatedPlans.json();
        setStudyPlans(data);
      } catch (error) {
        console.error("Error deleting study plan:", error);
      }
    }
  };

  const navigate = useNavigate();

  const handleOpenPlan = (planId) => {
    navigate(`plan/${planId}`);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen p-6">
      <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-gray-900 mb-8">
        <PiBookOpenTextBold className="text-gray-700 text-4xl" />
        Study Plans
      </h2>
      <div className="flex gap-3 mb-8">
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-sm px-6 py-2 shadow-sm transition text-base"
          onClick={() => setIsOpen(true)}
        >
          <PiPlusBold className="text-lg" /> New Study Plan
        </button>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold rounded-sm px-6 py-2 shadow-sm transition text-base"
          onClick={() => setShowAiModal(true)}
        >
          <PiMagicWandBold className="text-lg" /> Generate Study Plan
        </button>
      </div>
      <div className="overflow-x-auto rounded-sm shadow-sm bg-white/95 border border-gray-200">
        {studyPlans.length > 0 ? (
          <table className="table w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-white text-gray-700 text-base">
              <tr>
                <th className="py-4 px-4 text-left font-bold">Title</th>
                <th className="py-4 px-4 text-left font-bold">Description</th>
                <th className="py-4 px-4 text-left font-bold">
                  <PiCalendarCheckBold className="inline mr-1 text-green-600" />{" "}
                  Start Date
                </th>
                <th className="py-4 px-4 text-left font-bold">
                  <PiCalendarXBold className="inline mr-1 text-red-600" /> End
                  Date
                </th>
                <th className="py-4 px-4 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studyPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50/60 transition">
                  <td
                    onClick={() => handleOpenPlan(plan.id)}
                    className="hover:underline cursor-pointer font-semibold text-gray-700 text-base px-4 py-3 rounded-l-xl"
                  >
                    {plan.title}
                  </td>
                  <td className="text-gray-600 px-4 py-3">
                    {plan.description}
                  </td>
                  <td className="text-xs text-gray-500 px-4 py-3">
                    {new Date(plan.start_date).toLocaleDateString()}
                  </td>
                  <td className="text-xs text-gray-500 px-4 py-3">
                    {new Date(plan.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white rounded-sm px-4 py-2 shadow transition text-sm"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <PiTrashBold className="text-base" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <PiBookOpenTextBold className="text-6xl text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No study plans found.</p>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-white text-gray-800 rounded-sm shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-4">Create Study Plan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input input-bordered w-full bg-gray-100 rounded-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full bg-gray-100 rounded-sm"
                  required
                ></textarea>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Date
                  </label>
                  <input
                    id="start_date"
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-gray-100 rounded-sm"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="end_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Date
                  </label>
                  <input
                    id="end_date"
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-gray-100 rounded-sm"
                    required
                  />
                </div>
              </div>
              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
              <div className="modal-action flex gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost text-gray-700 rounded-sm px-4 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-sm px-6 py-2 shadow-sm transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAiModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-white text-gray-800 rounded-sm shadow-sm border border-gray-200 max-w-3xl w-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold">AI Generated Study Plan</h3>
              <button
                className="btn btn-ghost text-gray-700 rounded-sm px-4 py-2"
                onClick={() => setShowAiModal(false)}
              >
                Close
              </button>
            </div>
            <AiGeneratedTask />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlans;
