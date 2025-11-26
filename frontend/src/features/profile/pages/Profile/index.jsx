import React, { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import {
  FaChevronDown,
  FaChevronRight,
  FaChevronUp,
  FaGripLines,
  FaHandFist,
  FaUser,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { updateAuthenticatedUser } from "@redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const userData = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMismatched, setPasswordMismatched] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    const stored = localStorage.getItem("notificationEnabled");
    return stored === null ? true : stored === "true";
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      passwordData.newPassword !== passwordData.confirmPassword &&
      passwordData.newPassword !== "" &&
      passwordData.confirmPassword !== ""
    ) {
      setPasswordMismatched(true);
    } else {
      setPasswordMismatched(false);
    }
  }, [passwordData.confirmPassword, passwordData.newPassword]);

  useEffect(() => {
    if (!profile.userId) {
      setFormData((prev) => ({
        ...prev,
        userId: userData.id,
      }));
    }
  }, [userData.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiURL}/api/profile?type=me`, {
        method: "GET",
        headers: header,
      });
      if (!response.ok) {
        setProfile({});
        console.log("Error fetching profile");
        return;
      }
      const data = await response.json();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setErrorInfo("");
    console.log(passwordData);

    const response = await fetch(`${apiURL}/api/users?updatePassword=1`, {
      method: "PUT",
      headers: header,
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      console.error("Error changing password");
      const errorData = await response.json();
      console.error("Error message:", errorData.message);
      setErrorInfo(errorData.message);
      return;
    }
    console.log("Password changed successfully");
    toast.success("Password changed successfully", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangeUserInfo = async () => {
    console.log(profile.user);
    const response = await fetch(`${apiURL}/api/users`, {
      method: "PUT",
      headers: header,
      body: JSON.stringify(profile.user),
    });

    if (!response.ok) {
      console.error("Error changing user info");
      return;
    }

    const data = await response.json();
    dispatch(updateAuthenticatedUser({ name: data.name, email: data.email }));

    console.log("User info changed successfully:", data);

    console.log("User info changed successfully");
    toast.success("User info changed successfully", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      if (profile.id) {
        const response = await fetch(`${apiURL}/api/profile/${profile.id}`, {
          method: "PUT",
          headers: header,
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          console.error("Error saving profile");
          return;
        }

        const updated = await response.json();
        setProfile(updated);
        setEditMode(false);
      } else {
        const response = await fetch(`${apiURL}/api/profile`, {
          method: "POST",
          headers: header,
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          console.error("Error saving profile");
          return;
        }

        const created = await response.json();
        setProfile(created);
        setEditMode(false);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    localStorage.setItem("notificationEnabled", notificationEnabled);
  }, [notificationEnabled]);

  const handleUserDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`${apiURL}/api/users`, {
          method: "DELETE",
          headers: header,
        });

        if (!response.ok) {
          console.error("Error deleting user");
          return;
        }
        const data = await response.json();
        console.log("User deleted successfully:", data);
        localStorage.removeItem("jwt");
        localStorage.removeItem("jwt_expiration");
        // window.location.href = "/auth/login";
        navigate("/auth/login");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <ToastContainer />
      <main className="p-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Profile Settings
          </h2>
          {editMode ? (
            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-sm bg-gradient-to-r from-gray-500 to-gray-500 text-white font-semibold shadow hover:from-gray-600 hover:to-gray-600 transition disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <FaSave /> Save
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(profile);
                }}
                className="inline-flex items-center px-5 py-2 rounded-sm border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center px-6 py-2 rounded-sm bg-gray-900 text-white font-semibold shadow hover:bg-gray-700 transition"
            >
              Edit Info
            </button>
          )}
        </div>

        <section className="border border-gray-200 bg-white p-8 rounded-sm shadow-sm mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <FaGripLines />
              <h3 className="text-xl font-semibold">Profile Information</h3>
            </div>
            <button
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded-sm transition"
              onClick={() => setProfileExpanded(!profileExpanded)}
              aria-label="Expand profile section"
            >
              {profileExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          {!loading ? (
            <div
              className={`transition-all duration-300 ${
                profileExpanded
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["Full Name", "fullName"],
                  ["Title", "title"],
                  ["Job Title", "jobTitle"],
                  ["Role", "role"],
                  ["Gender", "gender"],
                  ["Language Preference", "languagePreference"],
                  ["Timezone", "timezone"],
                ].map(([label, key]) => (
                  <fieldset
                    key={key}
                    className="space-y-2 border border-gray-100 p-3 rounded-sm bg-gray-50"
                  >
                    <legend className="text-gray-700 font-medium text-sm mb-1">
                      {label}
                    </legend>
                    {key === "gender" ? (
                      <select
                        className="bg-white text-gray-900 select select-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                        disabled={!editMode}
                        value={formData[key] || ""}
                        onChange={(e) => handleChange(key, e.target.value)}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="bg-white text-gray-900 input input-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                        value={formData[key] || ""}
                        readOnly={!editMode}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    )}
                  </fieldset>
                ))}
              </div>
              <div className="mt-6">
                <label className="text-gray-700 font-medium text-sm mb-1 block">
                  Bio
                </label>
                <textarea
                  className="bg-white text-gray-900 textarea textarea-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                  rows={3}
                  value={formData.bio || ""}
                  readOnly={!editMode}
                  onChange={(e) => handleChange("bio", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 text-gray-500">Loading profile...</div>
          )}
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <FaHandFist className="text-primary-600" /> Preferences
          </h3>
          <div className="bg-white p-6 rounded-sm shadow border border-gray-200 flex items-center gap-4">
            <label className="flex items-center space-x-4 cursor-pointer py-2 px-3 rounded-sm hover:bg-gray-50 transition">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={notificationEnabled}
                onChange={() => setNotificationEnabled((prev) => !prev)}
              />
              <span className="text-gray-700 font-medium">
                Enable Notifications
              </span>
            </label>
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <FaUser className="text-red-500" /> User Information
          </h3>
          <div className="bg-white p-8 rounded-sm shadow border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <fieldset className="space-y-2 border border-gray-100 p-3 rounded-sm bg-gray-50 mb-4">
                <legend className="text-gray-700 font-medium text-sm mb-1">
                  User Name
                </legend>
                <input
                  type="text"
                  className="bg-white text-gray-900 input input-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                  value={profile?.user?.name || ""}
                  onChange={(e) => {
                    setProfile({
                      ...profile,
                      user: {
                        ...profile.user,
                        name: e.target.value,
                      },
                    });
                  }}
                />
              </fieldset>
              <fieldset className="space-y-2 border border-gray-100 p-3 rounded-sm bg-gray-50">
                <legend className="text-gray-700 font-medium text-sm mb-1">
                  Email
                </legend>
                <input
                  type="text"
                  className="bg-white text-gray-900 input input-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                  value={profile?.user?.email || ""}
                  onChange={(e) => {
                    setProfile({
                      ...profile,
                      user: {
                        ...profile.user,
                        email: e.target.value,
                      },
                    });
                  }}
                />
              </fieldset>
              <button
                className="mt-4 inline-flex items-center px-6 py-2 rounded-sm bg-gradient-to-r from-gray-500 to-gray-500 text-white font-semibold shadow hover:from-gray-600 hover:to-gray-600 transition"
                onClick={() => handleChangeUserInfo()}
              >
                Update User Info
              </button>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-800">
                Change Password
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                You can change your password here.
              </p>
              <div className="flex flex-col space-y-3">
                <fieldset className="space-y-2 border border-gray-100 p-3 rounded-sm bg-gray-50">
                  <legend className="text-gray-700 font-medium text-sm mb-1">
                    Current Password
                  </legend>
                  <input
                    type="password"
                    className="bg-white text-gray-900 input input-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </fieldset>
                <fieldset className="space-y-2 border border-gray-100 p-3 rounded-sm bg-gray-50">
                  <legend className="text-gray-700 font-medium text-sm mb-1">
                    New Password
                  </legend>
                  <input
                    type="password"
                    className="bg-white text-gray-900 input input-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </fieldset>
                <fieldset
                  className={`space-y-2 border border-gray-100 p-3 rounded-sm bg-gray-50 ${
                    passwordMismatched ? "border-red-500" : ""
                  }`}
                >
                  <legend className="text-gray-700 font-medium text-sm mb-1">
                    Confirm Password
                  </legend>
                  <input
                    type="password"
                    className="bg-white text-gray-900 input input-bordered w-full rounded-sm border-gray-300 focus:ring-2 focus:ring-gray-200"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </fieldset>
                {errorInfo && (
                  <p className="text-red-600 text-sm mt-1">{errorInfo}</p>
                )}
              </div>
              <button
                className="mt-4 inline-flex items-center px-6 py-2 rounded-sm bg-gradient-to-r from-gray-900 to-gray-900 text-white font-semibold shadow hover:from-gray-800 hover:to-gray-800 transition"
                onClick={() => handleChangePassword()}
              >
                Change Password
              </button>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-red-100 to-gray-100 p-8 rounded-sm shadow-sm mt-8 border border-red-200">
          <h3 className="text-xl font-semibold text-red-600 mb-4 flex items-center gap-2">
            <FaHandFist className="text-red-500" /> Danger Zone
          </h3>
          <button
            className="btn btn-error text-white px-6 py-2 rounded-sm font-semibold shadow hover:bg-red-600 transition"
            onClick={() => handleUserDelete()}
          >
            Delete Account
          </button>
        </section>
      </main>
    </div>
  );
};

export default Profile;
