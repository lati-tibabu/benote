import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const Resources = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");

  const header = {
    Authorization: `Bearer ${token}`,
  };

  const userData = useSelector((state) => state.auth.user) || {};
  const { teamId } = useParams();

  const [resources, setResources] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiURL}/api/resources?teamId=${teamId}`, {
        headers: header,
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setResources(data);
        console.log("resources:", data); // Log the data received from the API
      } else {
        console.warn("Expected array but got:", data);
        setResources([]);
      }
    } catch (err) {
      console.error("Failed to fetch resources:", err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("team_id", teamId);

    try {
      const res = await fetch(`${apiURL}/api/resources`, {
        method: "POST",
        headers: header,
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setFile(null);
        setDescription("");
        fetchResources();
      } else {
        console.error("Upload failed:", data);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${apiURL}/api/resources/${id}`, {
        method: "DELETE",
        headers: header,
      });

      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      } else {
        console.error("Failed to delete file");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl, {
        headers: header,
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Upload Section */}
      <div className="bg-white border rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Resource</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input w-full border-gray-300 rounded-md shadow-sm"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full border-gray-300 rounded-md shadow-sm"
          />
          <button
            type="submit"
            className="btn btn-primary w-full py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
          >
            Upload
          </button>
        </form>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Resources</h2>
        <div className="flex space-x-2">
          <button
            className={`btn btn-sm ${
              isGridView
                ? "bg-blue-500 text-white"
                : "bg-transparent text-blue-500 border-blue-500"
            } hover:bg-blue-600`}
            onClick={() => setIsGridView(true)}
          >
            Grid
          </button>
          <button
            className={`btn btn-sm ${
              !isGridView
                ? "bg-blue-500 text-white"
                : "bg-transparent text-blue-500 border-blue-500"
            } hover:bg-blue-600`}
            onClick={() => setIsGridView(false)}
          >
            List
          </button>
        </div>
      </div>

      {/* File Display Section */}
      <div className="bg-white border rounded-xl shadow-md p-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse p-4 border rounded bg-gray-100 space-y-2"
              >
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : isGridView ? (
          // <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex gap-6 flex-wrap">
            {resources.map((res) => (
              <div
                key={res.id}
                className="w-fit max-w-40 bg-white p-5 border rounded-xl shadow-lg hover:shadow-xl space-y-2 transition-shadow overflow-clip"
              >
                <div>
                  <h4 className="font-semibold text-lg text-wrap">
                    {res.name}
                  </h4>
                  <p className="text-sm">{res.description}</p>
                  <p className="text-xs text-gray-500">
                    {(res.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {/* <button
                    className="btn btn-xs btn-accent"
                    onClick={() => handleDownload(res.path, res.name)}
                  >
                    Download
                  </button> */}
                  <a href={res.path} className="btn btn-xs btn-accent" download>
                    {" "}
                    Download
                  </a>
                  <button
                    className="btn btn-xs btn-danger"
                    onClick={() => handleDelete(res.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y">
            {resources.map((res) => (
              <li key={res.id} className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{res.name}</p>
                    <p className="text-sm">{res.description}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500">
                      {(res.size / 1024).toFixed(2)} KB
                    </span>
                    <button
                      className="btn btn-xs btn-accent"
                      onClick={() =>
                        handleDownload(`${apiURL}/${res.path}`, res.name)
                      }
                    >
                      Download
                    </button>
                    <button
                      className="btn btn-xs btn-danger"
                      onClick={() => handleDelete(res.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-center mt-6 space-x-4">
        <button className="btn btn-sm btn-outline">Previous</button>
        <button className="btn btn-sm btn-outline">Next</button>
      </div>
    </div>
  );
};

export default Resources;
