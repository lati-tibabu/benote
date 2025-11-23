import React from "react";
import { AiFillWarning } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

const Unexpected = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate("/auth/login");
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      <div className="bg-white shadow-sm rounded-sm p-8 text-center max-w-lg">
        <AiFillWarning
          size={70}
          className="text-green-500 animate-bounce mx-auto"
        />
        <h1 className="text-3xl font-bold mt-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mt-2">
          This is a beta version, and errors are expected. If you encountered an
          issue, try logging in again.
        </p>
        <img
          src="/ErrorPics/unexpected-warning.png"
          width={180}
          alt="Error Illustration"
          className="mx-auto my-4"
        />
        <button
          onClick={handleRetry}
          className="bg-black text-white px-6 py-3 rounded-sm shadow-sm hover:bg-gray-800 transition duration-300"
        >
          Try Again
        </button>
        <p className="text-sm text-gray-500 mt-3">
          If the issue persists, please report it.
        </p>
      </div>
    </div>
  );
};

export default Unexpected;
