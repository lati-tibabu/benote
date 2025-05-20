import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const apiURL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("jwt");
const header = {
  Authorization: `Bearer ${token}`,
};

const formatBytes = (bytes) => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
};

const Materials = ({ isTeacher }) => {
  const userData = useSelector((state) => state.auth.user) || {};
  const { classroomId } = useParams();

  const [materials, setMaterials] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiURL}/api/classroom-materials?classroomId=${classroomId}`,
        {
          headers: header,
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMaterials(data);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error("Failed to fetch materials:", err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [classroomId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("classroom_id", classroomId);

    try {
      const res = await fetch(`${apiURL}/api/classroom-materials`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFile(null);
        setDescription("");
        fetchMaterials();
      } else {
        console.error("Upload failed:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiURL}/api/classroom-materials/${id}`, {
        method: "DELETE",
        headers: header,
      });

      if (res.ok) {
        setMaterials((prev) => prev.filter((r) => r.id !== id));
      } else {
        console.error("Failed to delete file");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Materials</h2>

      {isTeacher && (
        <form
          onSubmit={handleUpload}
          className="bg-white shadow-md rounded-lg p-4 mb-6"
        >
          <div className="mb-4">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500"
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Enter file description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </form>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-600">
          Uploaded Materials
        </h3>
        <button
          onClick={() => setIsGridView(!isGridView)}
          className="text-sm text-blue-500"
        >
          Switch to {isGridView ? "List" : "Grid"} View
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading materials...</p>
      ) : materials.length === 0 ? (
        <p className="text-gray-500">No materials available at the moment.</p>
      ) : (
        <div
          className={`grid ${
            isGridView ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
          } gap-4`}
        >
          {materials.map((material) => (
            <div
              key={material.id}
              className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
            >
              <h4 className="font-semibold text-gray-800 break-words mb-1">
                {material.name}
              </h4>
              <p className="text-sm text-gray-500 mb-1">
                {material.description || "No description"}
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Size: {formatBytes(parseInt(material.size))}
              </p>
              <div className="flex gap-2">
                <a
                  href={material.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Download
                </a>
                {userData?.id === material.uploader_id && (
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Materials;
