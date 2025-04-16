import React, { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import {
  FaChevronDown,
  FaChevronRight,
  FaChevronUp,
  FaGripLines,
  FaHandFist,
} from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import { updateAuthenticatedUser } from "../../../../redux/slices/authSlice";
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
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Manage Your Information</h2>
          {editMode ? (
            <div className="space-x-2">
              <button
                onClick={saveProfile}
                className="btn btn-success text-white"
                disabled={isSaving}
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <div className="flex items-center gap-2 ">
                    <FaSave />
                    Save
                  </div>
                )}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(profile);
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="btn btn-primary bg-gray-900 text-white border-none hover:bg-gray-700"
            >
              Edit Info
            </button>
          )}
        </div>

        <div className=" border border-gray-300 bg-gray-100 p-6 rounded-lg shadow mb-6">
          <div className="p-2 flex justify-between items-center">
            <FaGripLines />
            <h3 className="text-lg font-semibold">Profile Information</h3>
            <div
              className="p-2 bg-gray-500 rounded-full cursor-pointer"
              onClick={() => setProfileExpanded(!profileExpanded)}
            >
              {profileExpanded ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>
          {!loading ? (
            <div
              className={`bg-white p-6 rounded-lg shadow space-y-4 ${
                profileExpanded ? "" : "hidden"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="space-y-2 border-1 p-1 rounded-md"
                  >
                    <legend className="label">{label}</legend>
                    {key === "gender" ? (
                      <select
                        className="bg-white text-black select select-bordered w-full"
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
                        className="bg-white text-black input input-bordered w-full"
                        value={formData[key] || ""}
                        readOnly={!editMode}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    )}
                  </fieldset>
                ))}
                {/* <div>
                <label className="label">Verified</label>
                <input
                  type="checkbox"
                  className="toggle toggle-success"
                  checked={formData.isVerified || false}
                  disabled={!editMode}
                  onChange={(e) => handleChange("isVerified", e.target.checked)}
                />
              </div> */}
              </div>
              <div>
                <label className="label">Bio</label>
                <textarea
                  className="bg-white text-black textarea textarea-bordered w-full"
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
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">User Information</h3>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <fieldset className="space-y-2 border-1 p-1 rounded-md">
                  <legend className="label">User Name</legend>
                  <input
                    type="text"
                    className="bg-white text-black input input-bordered w-full"
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
                    // disabled={!editMode}
                  />
                </fieldset>
                <fieldset className="space-y-2 border-1 p-1 rounded-md">
                  <legend className="label">Email</legend>
                  <input
                    type="text"
                    className="bg-white text-black input input-bordered w-full"
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
                    // disabled={!editMode}
                  />
                </fieldset>
                <button
                  className="btn btn-primary bg-gray-900 text-white border-none hover:bg-gray-700 mt-2"
                  onClick={() => handleChangeUserInfo()}
                >
                  Update User Info
                </button>
              </div>
              <div>
                <h2>Change Password</h2>
                <p className="text-sm text-gray-500">
                  You can change your password here.
                </p>
                <div className="flex flex-col space-y-2">
                  <fieldset className="space-y-2 border-1 p-1 rounded-md">
                    <legend className="label">Current Password</legend>
                    <input
                      type="password"
                      className="bg-white text-black input input-bordered w-full"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                    />
                  </fieldset>
                  <fieldset className="space-y-2 border-1 p-1 rounded-md">
                    <legend className="label">New Password</legend>
                    <input
                      type="password"
                      className="bg-white text-black input input-bordered w-full"
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
                    className={`space-y-2 border-1 p-1 rounded-md ${
                      passwordMismatched && "border-red-600"
                    }`}
                  >
                    <legend className="label">Confirm Password</legend>
                    <input
                      type="password"
                      className="bg-white text-black input input-bordered w-full"
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
                    <p className="text-red-600 text-sm">{errorInfo}</p>
                  )}
                </div>
                <button
                  className="btn btn-primary bg-gray-900 text-white border-none hover:bg-gray-700 mt-2"
                  onClick={() => handleChangePassword()}
                >
                  Change Password
                </button>
              </div>
              {/* <fieldset className="space-y-2 border-1 p-1 rounded-md"> */}
            </div>
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
          <input
            type="file"
            className="file-input file-input-bordered w-full max-w-xs"
          />
        </div> */}

        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h3 className="text-lg font-semibold mb-4">Preferences</h3>
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="toggle" defaultChecked />
            <span>Enable Notifications</span>
          </label>
        </div>

        <div className="bg-red-100 p-6 rounded-lg shadow mt-6">
          <h3 className="text-lg font-semibold text-red-600  mb-4">
            Danger Zone
          </h3>
          <button
            className="btn btn-error text-white"
            onClick={() => handleUserDelete()}
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
