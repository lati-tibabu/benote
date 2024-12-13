// src/pages/NotFound.jsx
import React from "react";

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full text-center p-8 bg-white shadow-xl rounded-lg">
        {/* <h1 className="text-5xl font-bold text-gray-80  0 mb-4">404</h1> */}
        <p className="text-xl font-semibold text-gray-700 mb-6">
          Oops! The page you are looking for doesn't exist.
        </p>
        <div className="flex justify-center mb-8">
          <img
            src="/page_not_found.svg"
            alt="404 Error"
            className="w-44 h-44"
          />
        </div>
        <p className="text-gray-600 mb-6">
          It seems you've lost your way, but don't worry. We can help you get
          back on track.
        </p>
        <a
          href="/"
          className="btn w-full md:w-48 mx-auto text-white bg-gray-800 hover:bg-gray-600 transition duration-300"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
};

export default NotFound;
