import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Settings = () => {
  const workspace = useSelector((state) => state.workspace.workspace);

  // Initialize state from the workspace model
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);
  const [emoji, setEmoji] = useState(workspace.emoji);
  const [privacy, setPrivacy] = useState(
    workspace.belongs_to_team ? "Team-based" : "Private"
  );
  const [ownedBy, setOwnedBy] = useState(workspace.creator.name);
  const [team, setTeam] = useState(workspace.belongs_to_team);

  useEffect(() => {
    setName(workspace.name);
    setDescription(workspace.description);
    setEmoji(workspace.emoji);
    setPrivacy(workspace.belongs_to_team ? "Team-based" : "Private");
    setOwnedBy(workspace.creator.name);
    setTeam(workspace.belongs_to_team);
  }, [workspace]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleDescriptionChange = (e) => setDescription(e.target.value);
  const handleEmojiChange = (e) => setEmoji(e.target.value);
  const handlePrivacyChange = (e) => setPrivacy(e.target.value);

  const handleSave = () => {
    // Handle saving the settings (UI part only for now)
    alert("Settings saved!");
  };

  const handleDelete = () => {
    // Handle delete confirmation and deletion
    if (
      window.confirm(
        "Are you sure you want to delete this workspace? This action is irreversible."
      )
    ) {
      alert("Workspace deleted.");
    }
  };

  const handleMigrate = (newPrivacy) => {
    // Handle workspace migration between private and team-based
    const migrationConfirmed = window.confirm(
      `Are you sure you want to migrate the workspace to ${newPrivacy} settings?`
    );
    if (migrationConfirmed) {
      setPrivacy(newPrivacy);
      alert(`Workspace migrated to ${newPrivacy}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">
        Workspace Settings
      </h2>
      <form className="space-y-6">
        <div className="flex flex-col">
          <label
            htmlFor="workspace-name"
            className="text-lg font-medium text-gray-600 mb-2"
          >
            Workspace Name
          </label>
          <input
            type="text"
            id="workspace-name"
            value={name}
            onChange={handleNameChange}
            className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent"
            placeholder="Enter workspace name"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="workspace-description"
            className="text-lg font-medium text-gray-600 mb-2"
          >
            Description
          </label>
          <textarea
            id="workspace-description"
            value={description}
            onChange={handleDescriptionChange}
            className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent"
            placeholder="Enter workspace description"
            required
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="workspace-emoji"
            className="text-lg font-medium text-gray-600 mb-2"
          >
            Workspace Emoji
          </label>
          <input
            type="text"
            id="workspace-emoji"
            value={emoji}
            onChange={handleEmojiChange}
            className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent"
            placeholder="Choose workspace emoji"
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="workspace-privacy"
            className="text-lg font-medium text-gray-600 mb-2"
          >
            Privacy Settings
          </label>
          <select
            id="workspace-privacy"
            value={privacy}
            onChange={handlePrivacyChange}
            className="p-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 bg-transparent"
          >
            <option value="Private">Private</option>
            <option value="Team-based">Team-based</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-lg font-medium text-gray-600 mb-2">
            Owned By
          </label>
          <p className="text-gray-500">{ownedBy}</p>{" "}
          {/* Assuming you display the owner ID or name here */}
        </div>

        <div className="flex flex-col">
          <label className="text-lg font-medium text-gray-600 mb-2">Team</label>
          <p className="text-gray-500">
            {team ? `Assigned to Team: ${team}` : "No team assigned"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row mt-6 gap-1">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Save Settings
          </button>
          <button
            type="button"
            onClick={() =>
              handleMigrate(privacy === "Private" ? "Team-based" : "Private")
            }
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
          >
            Migrate to {privacy === "Private" ? "Team-based" : "Private"}
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
            onClick={handleDelete}
          >
            Delete Workspace
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
