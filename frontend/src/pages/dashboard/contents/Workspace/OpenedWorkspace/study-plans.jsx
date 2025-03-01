import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

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
  const [userData, setUserData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    try {
      const data = jwtDecode(token);
      setUserData(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

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
    // alert(planId);
    navigate(`plan/${planId}`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Study Plans</h2>
      <button className="btn btn-primary mb-4" onClick={() => setIsOpen(true)}>
        + New Study Plan
      </button>
      <div className="overflow-x-auto">
        {studyPlans.length > 0 ? (
          <table className="table w-full">
            <thead>
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
                <tr key={plan.id}>
                  <td
                    onClick={() => handleOpenPlan(plan.id)}
                    className="hover:underline cursor-pointer"
                  >
                    {plan.title}
                  </td>
                  <td>{plan.description}</td>
                  <td>{new Date(plan.start_date).toLocaleDateString()}</td>
                  <td>{new Date(plan.end_date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-error text-sm flex flex-row items-center text-white"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <FaTrash />
                      <p>Delete</p>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No study plans found.</p>
        )}
      </div>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create Study Plan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="input input-bordered w-full bg-white"
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="input input-bordered w-full bg-white"
                required
              />
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="input input-bordered w-full bg-white"
                required
              />
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="input input-bordered w-full bg-white"
                required
              />
              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
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
