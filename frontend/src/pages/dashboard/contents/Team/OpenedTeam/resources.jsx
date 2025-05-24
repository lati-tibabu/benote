import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  FaDownload,
  FaTrash,
  FaTh,
  FaList,
  FaUpload,
  FaFileAlt,
} from "react-icons/fa"; // Removed FaFolder

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
  const [isDragging, setIsDragging] = useState(false); // For drag and drop
  const [isUploading, setIsUploading] = useState(false); // For upload overlay

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiURL}/api/resources?teamId=${teamId}`, {
        headers: header,
      });
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
      console.log(resources);
    } catch (err) {
      console.error("Fetch error:", err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
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
        alert(`Upload failed: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }
    try {
      const res = await fetch(`${apiURL}/api/resources/${id}`, {
        method: "DELETE",
        headers: header,
      });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      } else {
        console.error("Delete failed:", await res.json());
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      // Assuming fileUrl from backend is already fully qualified or needs a base path
      const fullFileUrl = fileUrl.startsWith("http")
        ? fileUrl
        : `${apiURL}/${fileUrl}`;

      const response = await fetch(fullFileUrl, {
        headers: header,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
      alert("Failed to download the file. Please try again.");
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Helper to get file icon based on extension
  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/pdf.png"
            alt="PDF"
            className="w-6 h-6"
          />
        );
      case "doc":
      case "docx":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/ms-word.png"
            alt="Word"
            className="w-6 h-6"
          />
        );
      case "xls":
      case "xlsx":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/ms-excel.png"
            alt="Excel"
            className="w-6 h-6"
          />
        );
      case "ppt":
      case "pptx":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/ms-powerpoint.png"
            alt="PowerPoint"
            className="w-6 h-6"
          />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/image.png"
            alt="Image"
            className="w-6 h-6"
          />
        );
      case "zip":
      case "rar":
        return (
          <img
            src="https://img.icons8.com/color/48/000000/zip.png"
            alt="Archive"
            className="w-6 h-6"
          />
        );
      default:
        return <FaFileAlt className="w-6 h-6 text-gray-500" />;
    }
  };

  useEffect(() => {
    fetchResources();
  }, [teamId]); // Added teamId to dependency array for re-fetch on team change

  return (
    <div className="flex min-h-screen bg-gray-100 max-w-[1000px] mx-auto">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-8 w-full">
        {/* Header Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
          <p className="text-gray-600 mt-2">
            Manage all your team's shared resources here.
          </p>
        </div>

        {isUploading && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                Uploading...
              </p>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Upload Section - Reimagined */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upload New Resource
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
                ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-600">
                  <span className="font-semibold text-blue-600">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {file ? file.name : "No file selected"}
                </p>
              </label>
            </div>
            <input
              type="text"
              placeholder="Enter description for the file (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={!file} // Disable if no file is selected
            >
              Upload Resource
            </button>
          </form>
        </div>

        {/* Resources Display and View Toggle */}
        <div className="bg-white shadow-md rounded-lg p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Available Resources
            </h2>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <button
                className={`p-2 rounded-md transition-colors duration-200 ${
                  isGridView
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setIsGridView(true)}
                title="Grid View"
              >
                <FaTh className="text-lg" />
              </button>
              <button
                className={`p-2 rounded-md transition-colors duration-200 ${
                  !isGridView
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setIsGridView(false)}
                title="List View"
              >
                <FaList className="text-lg" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          ) : resources.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No resources uploaded yet. Start by uploading a file!
            </p>
          ) : isGridView ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col p-4"
                >
                  <div className="flex items-center mb-3">
                    {getFileIcon(res.name)}
                    <h3 className="ml-3 text-lg font-semibold text-gray-800 truncate flex-1">
                      {res.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 flex-grow mb-2">
                    {res.description || "No description provided."}
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    Size: {(res.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="flex-1 btn btn-sm bg-blue-500 text-white hover:bg-blue-600 border-none rounded-md flex items-center justify-center py-2 px-3"
                      onClick={() => handleDownload(res.path, res.name)}
                    >
                      <FaDownload className="mr-1" /> Download
                    </button>
                    <button
                      className="flex-1 btn btn-sm bg-red-500 text-white hover:bg-red-600 border-none rounded-md flex items-center justify-center py-2 px-3"
                      onClick={() => handleDelete(res.id)}
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                {/* head */}
                <thead>
                  <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">File Name</th>
                    <th className="py-3 px-6 text-left">Description</th>
                    <th className="py-3 px-6 text-left">Uploader</th>
                    <th className="py-3 px-6 text-center">Size</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm font-light">
                  {resources.map((res) => (
                    <tr
                      key={res.id}
                      className="border-b border-gray-200 hover:bg-gray-100"
                    >
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(res.name)}
                          <span className="ml-3 font-medium">{res.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <span className="truncate block max-w-xs">
                          {res.description || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-left">
                        <span className="truncate block max-w-xs">
                          {res.uploader?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        {(res.size / 1024 / 1024).toFixed(2)} MB
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <button
                            className="btn btn-xs btn-ghost text-blue-500 hover:text-blue-700"
                            onClick={() => handleDownload(res.path, res.name)}
                          >
                            <FaDownload className="text-lg" />
                          </button>
                          <button
                            className="btn btn-xs btn-ghost text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(res.id)}
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Placeholder */}
        <div className="flex justify-center mt-8 space-x-2">
          <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md px-4 py-2">
            Previous
          </button>
          <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md px-4 py-2">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resources;
