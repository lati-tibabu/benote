import React, { useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { useSelector } from "react-redux";

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

  // console.log("Profile:", profile);

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
    try {
      const response = await fetch(`${apiURL}/api/users/${profile.userId}`, {
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
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Profile Dashboard</h1>
        <nav className="space-x-6">
          <button className="font-medium text-blue-600">Profile</button>
          {/* <button className="hover:text-blue-600">Settings</button>
          <button className="hover:text-blue-600">Security</button>
          <button className="hover:text-red-600">Logout</button> */}
        </nav>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Manage Your Profile</h2>
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
              Edit Profile
            </button>
          )}
        </div>

        {/* {Object.keys(profile).length > 0 ? ( */}
        {!loading ? (
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
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
            onClick={() => handleUserDelete}
          >
            Delete Account
          </button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
