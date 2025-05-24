import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Footer1 from "../../components/_footers/footer1";
import { AiOutlineArrowRight } from "react-icons/ai";
import {
  FaTasks,
  FaUsers,
  FaBell,
  FaChartLine,
  FaStickyNote,
  FaUpload,
  FaComments,
} from "react-icons/fa";

function Home() {
  const location = useLocation();
  const page = location.pathname;
  const [buttonHovered, setButtonHovered] = useState(false);

  return (
    <div className="flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-800 min-h-screen">
      {/* Header Section */}
      <header className="p-4 w-full flex flex-row justify-between items-center backdrop-blur-sm z-20 animate-fade-in">
        <div className="flex items-center gap-4">
          <img src="rect19.png" alt="Logo" className="w-14 animate-logo-pop" />
          <span className="ml-2 text-xl font-bold text-blue-700 hidden sm:inline">
            Student Productivity Hub
          </span>
        </div>
        {/* <nav className="flex-1 flex justify-center gap-8 text-base font-medium">
          <Link
            to="/app/about"
            className="hover:text-blue-600 transition-colors duration-150"
          >
            About Us
          </Link>
          <Link
            to="/app/contact"
            className="hover:text-blue-600 transition-colors duration-150"
          >
            Contact Us
          </Link>
        </nav> */}
        <div className="flex gap-3">
          <Link to="/login">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-blue-700 border border-blue-600 hover:bg-blue-50 font-semibold shadow-sm transition-all duration-200">
              <span className="text-lg">
                <i className="">
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      fill="currentColor"
                    />
                  </svg>
                </i>
              </span>
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-sm transition-all duration-200">
              <span className="text-lg">
                <i className="">
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h8v-2h2v2h6v-2c0-2.66-5.33-4-8-4z"
                      fill="currentColor"
                    />
                    <path
                      d="M17 11v-2h-2V7h-2v2h-2v2h2v2h2v-2h2z"
                      fill="currentColor"
                    />
                  </svg>
                </i>
              </span>
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="h-screen/2 xl:h-fit text-center m-3 flex flex-col-reverse md:flex-row items-center gap-8 animate-fade-in-up delay-100">
        <div className="flex-1 flex flex-col justify-center items-center bg-transparent">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-700 drop-shadow-xl animate-title-pop">
            🚀 Student Productivity Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl animate-fade-in-up delay-200">
            Your ultimate platform to boost academic performance and manage
            tasks efficiently.
          </p>
          <Link to="/app/home">
            <button
              className="btn btn-outline btn-black text-black flex items-center gap-2 px-7 py-3 rounded-full font-semibold shadow-md bg-white hover:bg-blue-50 border-2 border-blue-600 hover:text-blue-700 transition-all duration-200 animate-btn-bounce"
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
              style={{
                boxShadow: buttonHovered
                  ? "0 8px 32px rgba(0,0,0,0.12)"
                  : undefined,
              }}
            >
              Get Started
              <AiOutlineArrowRight
                className={`transition-all duration-300 ${
                  buttonHovered ? "w-6 h-6 opacity-100 ml-1" : "w-0 opacity-0"
                }`}
              />
            </button>
          </Link>
        </div>
        <div
          className="hidden md:block flex-1 rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-100 bg-clip-content right-0 animate-img-float"
          title="Happy User"
        >
          <img
            src="/productivity/happy-user-male.jpg"
            alt="Happy User"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </section>

      {/* About Section */}
      <section className="flex flex-col md:flex-row justify-between items-center p-8 md:p-16 gap-8 bg-white/90 shadow-xl rounded-2xl mx-4 my-8 animate-fade-in-up delay-200">
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-700">
            🎓 Boost Your Academic Performance
          </h2>
          <p className="text-lg text-gray-600">
            The Student Productivity Hub provides a range of tools and resources
            to help students improve their productivity and achieve their
            academic goals.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="/productivity/undraw_bookshelves_vhu6.svg"
            alt="Productivity tools"
            className="w-full h-auto max-w-xs md:max-w-md animate-img-float"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="p-8 md:p-16 bg-gradient-to-br from-blue-50 to-blue-100 animate-fade-in-up delay-300">
        <h3 className="text-3xl md:text-4xl font-bold mb-12 text-center text-blue-700">
          🌟 Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature Cards */}
          <div className="feature-item text-center bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-200 hover:border-blue-500 animate-card-pop hover:scale-105">
            <FaTasks className="text-4xl text-blue-600 mb-4 mx-auto animate-icon-spin" />
            <h4 className="text-xl font-bold mb-2 text-blue-700">
              Task Management
            </h4>
            <p className="text-gray-600 text-base">
              Stay organized by creating and managing tasks, setting deadlines,
              and receiving AI-powered recommendations.
            </p>
          </div>
          <div className="feature-item text-center bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-200 hover:border-blue-500 animate-card-pop hover:scale-105 delay-100">
            <FaChartLine className="text-4xl text-blue-600 mb-4 mx-auto animate-icon-spin-slow" />
            <h4 className="text-xl font-bold mb-2 text-blue-700">
              AI-Powered Study Planner
            </h4>
            <p className="text-gray-600 text-base">
              Create personalized study plans with AI to optimize your learning
              experience.
            </p>
          </div>
          <div className="feature-item text-center bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-200 hover:border-blue-500 animate-card-pop hover:scale-105 delay-200">
            <FaUsers className="text-4xl text-blue-600 mb-4 mx-auto animate-icon-bounce" />
            <h4 className="text-xl font-bold mb-2 text-blue-700">
              Collaboration Tools
            </h4>
            <p className="text-gray-600 text-base">
              Work seamlessly with peers on group projects with integrated chat
              and file-sharing features.
            </p>
          </div>
          <div className="feature-item text-center bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-200 hover:border-blue-500 animate-card-pop hover:scale-105 delay-300">
            <FaBell className="text-4xl text-blue-600 mb-4 mx-auto animate-icon-bounce" />
            <h4 className="text-xl font-bold mb-2 text-blue-700">
              Real-Time Notifications
            </h4>
            <p className="text-gray-600 text-base">
              Get timely reminders for deadlines, tasks, and study goals.
            </p>
          </div>
          <div className="feature-item text-center bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-200 hover:border-blue-500 animate-card-pop hover:scale-105 delay-400">
            <FaStickyNote className="text-4xl text-blue-600 mb-4 mx-auto animate-icon-pop" />
            <h4 className="text-xl font-bold mb-2 text-blue-700">
              AI Note Creation
            </h4>
            <p className="text-gray-600 text-base">
              Create and organize notes effortlessly with AI-powered tools.
            </p>
          </div>
          <div className="feature-item text-center bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-200 hover:border-blue-500 animate-card-pop hover:scale-105 delay-500">
            <FaUpload className="text-4xl text-blue-600 mb-4 mx-auto animate-icon-pop" />
            <h4 className="text-xl font-bold mb-2 text-blue-700">
              Document Upload
            </h4>
            <p className="text-gray-600 text-base">
              Upload documents and convert them into notes for easy access and
              management.
            </p>
          </div>
          <div className="feature-item text-center bg-white/90 rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-200 hover:border-blue-500 animate-card-pop hover:scale-105 delay-600">
            <FaComments className="text-4xl text-blue-600 mb-4 mx-auto animate-icon-pop" />
            <h4 className="text-xl font-bold mb-2 text-blue-700">
              Chat with Notes
            </h4>
            <p className="text-gray-600 text-base">
              Interact with your notes using AI-powered chat for better
              understanding and insights.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="p-8 md:p-16 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center rounded-2xl shadow-xl mx-4 my-8 animate-fade-in-up delay-400">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          🎯 Start Boosting Your Productivity Today
        </h3>
        <p className="text-lg mb-6">
          Join the Student Productivity Hub and take control of your academic
          journey. Start managing your tasks, collaborating with classmates, and
          improving your study habits with ease.
        </p>
        <Link to="/app/home">
          <button className="btn btn-outline btn-white text-blue-600 bg-white hover:bg-gray-100 px-8 py-3 rounded-full font-semibold shadow-lg border-2 border-white hover:text-blue-700 transition-all duration-200 animate-btn-bounce">
            Get Started
          </button>
        </Link>
      </section>

      {/* Footer */}
      <Footer1 />
      {/* Custom Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        .animate-fade-in-up { animation: fadeInUp 1s ease; }
        .animate-title-pop { animation: popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
        .animate-btn-bounce { animation: bounceIn 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
        .animate-btn-slide-in { animation: slideInRight 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
        .animate-logo-pop { animation: popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
        .animate-img-float { animation: floatImg 3s ease-in-out infinite alternate; }
        .animate-card-pop { animation: cardPop 0.8s cubic-bezier(.68,-0.55,.27,1.55); }
        .animate-icon-spin { animation: iconSpin 2s linear infinite; }
        .animate-icon-spin-slow { animation: iconSpin 4s linear infinite; }
        .animate-icon-bounce { animation: iconBounce 1.5s infinite alternate; }
        .animate-icon-pop { animation: popIn 0.7s cubic-bezier(.68,-0.55,.27,1.55); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 80% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes bounceIn { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes floatImg { 0% { transform: translateY(0); } 100% { transform: translateY(-18px); } }
        @keyframes cardPop { 0% { transform: scale(0.8); opacity: 0; } 80% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes iconSpin { 100% { transform: rotate(360deg); } }
        @keyframes iconBounce { 0% { transform: translateY(0); } 100% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
}

export default Home;
