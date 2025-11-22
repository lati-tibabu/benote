import React from "react";
// import { AiOutlineArrowLeft } from "react-icons/ai";
import { FaChevronCircleLeft } from "react-icons/fa";

function AppInfo() {
  const handleBack = () => {
    history.back();
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-left px-6">
      <div className="w-screen pl-6">
        <FaChevronCircleLeft
          onClick={handleBack}
          color="black"
          size={40}
          cursor={"pointer"}
        />
      </div>
      <img src={`/rect19.png`} alt="Benote Logo" className="w-36 h-auto mb-6" />
      <p className="text-lg text-black max-w-2xl">
        <strong>Benote (Benote)</strong> is an all-in-one
        productivity tool designed to help students and teachers manage tasks,
        collaborate efficiently, and stay organized. It offers features like
        task scheduling, real-time collaboration, mind mapping, Pomodoro timers,
        note-taking, and project tracking. With a user-friendly interface,
        multilingual support (Amharic and Afaan Oromo), and AI-powered features
        like task prioritization and recommendations, Benote aims to tackle
        procrastination and improve productivity. The app also includes
        gamification elements like leaderboards and rewards, fostering
        motivation and engagement. Whether for individual planning or team
        collaboration, Benote empowers users to achieve their academic goals
        effectively.
      </p>
    </div>
  );
}

export default AppInfo;
