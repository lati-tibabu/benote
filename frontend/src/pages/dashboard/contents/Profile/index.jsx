import React from "react";

const Profile = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-5 shadow-md">
        <h2 className="text-xl font-bold mb-5">Dashboard</h2>
        <ul className="menu space-y-2">
          <li>
            <p className="active">Profile</p>
          </li>
          <li>
            <a>Settings</a>
          </li>
          <li>
            <a>Security</a>
          </li>
          <li>
            <a>Logout</a>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold">Profile Management</h1>

        {/* Profile Info */}
        <div className="bg-white p-6 rounded-lg shadow mt-4">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value="John Doe"
                readOnly
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input input-bordered w-full"
                value="johndoe@example.com"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-lg shadow mt-4">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="toggle" defaultChecked />
            <span>Enable Notifications</span>
          </label>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-6 rounded-lg shadow mt-4">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Danger Zone
          </h2>
          <button className="btn btn-error">Delete Account</button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
