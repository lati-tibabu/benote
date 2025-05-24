import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const StudyPlans = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const [studyPlans, setStudyPlans] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
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
      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-6">
        Study Plans
      </h2>
      <button
        className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-2 shadow-md transition mb-6"
        onClick={() => setIsOpen(true)}
      >
        + New Study Plan
      </button>
      <div className="overflow-x-auto rounded-2xl shadow-md bg-white/90 border border-gray-200">
        {studyPlans.length > 0 ? (
          <table className="table w-full">
            <thead className="bg-gray-50 text-gray-700 text-base">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studyPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-blue-50 transition">
                  <td
                    onClick={() => handleOpenPlan(plan.id)}
                    className="hover:underline cursor-pointer font-semibold text-blue-700"
                  >
                    {plan.title}
                  </td>
                  <td className="text-gray-600">{plan.description}</td>
                  <td className="text-xs text-gray-500">
                    {new Date(plan.start_date).toLocaleDateString()}
                  </td>
                  <td className="text-xs text-gray-500">
                    {new Date(plan.end_date).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm bg-red-500 hover:bg-red-600 text-white rounded-full flex flex-row items-center gap-2 px-3 py-1 shadow transition"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No study plans found.
          </p>
        )}
      </div>
      {isOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-white text-gray-800 rounded-2xl shadow-lg border border-gray-200">
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
                  className="input input-bordered w-full bg-gray-100 rounded-md"
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
                  className="textarea textarea-bordered w-full bg-gray-100 rounded-md"
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
                    className="input input-bordered w-full bg-gray-100 rounded-md"
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
                    className="input input-bordered w-full bg-gray-100 rounded-md"
                    required
                  />
                </div>
              </div>
              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
              <div className="modal-action flex gap-2 justify-end">
                <button
                  type="button"
                  className="btn btn-ghost text-gray-700 rounded-full px-4 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-2 shadow-md transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlans;
