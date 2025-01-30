import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const WorkspaceNotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/app/workspace");
  };

  return (
    <div className=" bg-gray-50 text-gray-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Warning Icon */}
        <AiFillWarning size={80} color="orange" />
        <div className="text-2xl font-semibold text-center">
          Workspace Option Not Found!
        </div>
        <div className="text-center text-gray-600">
          It seems like the workspace you’re trying to access doesn’t exist or
          is unavailable. Please go back to the home page and try again.
        </div>
        <button
          onClick={handleGoBack}
          className="btn text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default WorkspaceNotFound;
