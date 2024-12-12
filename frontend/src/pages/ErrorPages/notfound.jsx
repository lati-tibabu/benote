// src/pages/NotFound.jsx
import React from "react";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full text-center p-8 bg-white shadow-xl rounded-lg">
        <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
        <p className="text-xl font-semibold text-gray-700 mb-6">
          Oops! The page you are looking for doesn't exist.
        </p>
        <div className="flex justify-center mb-8">
          <img
            src="https://img.icons8.com/ios/452/404.png"
            alt="404 Error"
            className="w-24 h-24"
          />
        </div>
        <p className="text-gray-600 mb-6">
          It seems you've lost your way, but don't worry. We can help you get
          back on track.
        </p>
        <a
          href="/"
          className="btn btn-primary w-full md:w-48 mx-auto text-white hover:bg-blue-600 transition duration-300"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFound;
