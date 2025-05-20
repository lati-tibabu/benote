import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { convertFileToMarkdown } from "../utils/fileConverterClient";
import { toast, ToastContainer } from "react-toastify";

const FileToNoteUploader = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const userData = useSelector((state) => state.auth.user) || {};

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const { workspaceId } = useParams();
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);

    try {
      const { title, content } = await convertFileToMarkdown(file);

      const noteData = {
        title,
        content,
        workspace_id: workspaceId,
        owned_by: userData?.id,
      };

      const response = await fetch(`${apiURL}/api/notes`, {
        method: "POST",
        body: JSON.stringify(noteData),
        headers: header,
      });

      if (!response.ok) {
        alert("Something went wrong");
        return;
      }

      const data = await response.json();
      const noteId = data.id;

      toast.success("Note is added to db");

      alert("Note created successfully.");
      console.log(noteData);
    } catch (error) {
      console.error(error);
      alert("An error occurred while processing the file.");
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="file-uploader">
      <ToastContainer />
      <input
        type="file"
        accept=".pdf, .doc,.docx,.txt"
        onChange={handleFileChange}
      />
      <button
        onClick={handleUpload}
        disabled={loading}
        className="btn btn-primary mt-2"
      >
        {loading ? "Uploading..." : "Upload and Convert to Note"}
      </button>
    </div>
  );
};

export default FileToNoteUploader;
