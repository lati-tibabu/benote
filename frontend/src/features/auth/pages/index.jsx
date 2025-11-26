import React from "react";
import { Link, Outlet } from "react-router-dom";
import { AiOutlineInfo } from "react-icons/ai";
import { Footer } from "@shared/components/layout";

function AuthPages() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-6 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/">
            <img src="/rect19.png" alt="Logo" className="cursor-pointer w-12" />
          </Link>
          <h1 className="text-lg font-bold text-gray-800 hidden md:block">
            Benote
          </h1>
        </div>
        {/* <Link to="/info" className="hidden md:block">
          <div className="bg-gray-800 text-white p-2 rounded-sm hover:bg-gray-700 transition">
            <AiOutlineInfo size={24} />
          </div>
        </Link> */}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center py-10">
        <div className="w-full max-w-4xl bg-white shadow-sm rounded-sm p-6">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 py-4 text-center text-sm text-gray-600">
        <Footer />
      </footer>
    </div>
  );
}

export default AuthPages;
