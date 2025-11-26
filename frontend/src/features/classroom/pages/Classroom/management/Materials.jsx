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
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-white to-gray-50 rounded-sm shadow-sm border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">
        Materials
      </h2>

      {isTeacher && (
        <form
          onSubmit={handleUpload}
          className="mb-10 bg-white/80 rounded-sm shadow p-6 flex flex-col gap-4 border border-gray-100"
        >
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input bg-white text-black file-input-bordered w-full focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              placeholder="Enter file description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea bg-white text-black textarea-bordered w-full min-h-[60px] focus:ring-2 focus:ring-gray-400 transition"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 rounded-sm bg-gray-600 text-white font-semibold shadow hover:bg-gray-700 transition"
            >
              Upload
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700">
          Uploaded Materials
        </h3>
        <button
          onClick={() => setIsGridView(!isGridView)}
          className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-sm hover:bg-gray-100 transition"
        >
          Switch to {isGridView ? "List" : "Grid"} View
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12 text-lg font-medium">
          Loading materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="text-center text-gray-400 py-12 text-lg font-medium">
          No materials available at the moment.
        </div>
      ) : (
        <div
          className={`grid ${
            isGridView ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1"
          } gap-6`}
        >
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-sm border border-gray-100 shadow-sm p-5 flex flex-col justify-between group hover:shadow-sm hover:border-gray-200 transition"
            >
              <div>
                <h4 className="text-lg font-semibold text-gray-800 group-hover:text-gray-700 break-words mb-1 truncate">
                  {material.name}
                </h4>
                <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                  {material.description || "No description"}
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  Size: {formatBytes(parseInt(material.size))}
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <a
                  href={material.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-sm hover:bg-gray-100 transition"
                >
                  Download
                </a>
                {userData?.id === material.uploader_id && (
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-sm hover:bg-red-100 transition"
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
