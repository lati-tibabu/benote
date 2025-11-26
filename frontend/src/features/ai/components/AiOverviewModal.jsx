import React, { useEffect, useRef, useState } from "react";
import { HiX } from "react-icons/hi";
import AiSummary from "../../home/pages/Home/contents/ai-summary";

const AiOverviewModal = ({ open, onClose }) => {
  const modalRef = useRef(null);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowContent(true);
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 animate-fade-in">
      <div
        ref={modalRef}
        className="relative bg-white rounded-sm shadow-sm w-full max-w-3xl mx-4 p-0 animate-slide-down overflow-hidden"
        style={{ minHeight: 400, maxHeight: "90vh" }}
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl focus:outline-none z-10"
          onClick={onClose}
          aria-label="Close AI Overview"
        >
          <HiX />
        </button>
        <div className="pt-8 pb-2 px-8 border-b flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-50">
          <span role="img" aria-label="AI" className="text-2xl">
            🤖
          </span>
          <h2 className="text-2xl font-bold text-gray-700">AI Overview</h2>
        </div>
        <div className="p-0 m-0 overflow-y-auto" style={{ maxHeight: "80vh" }}>
          {showContent && <AiSummary />}
        </div>
      </div>
    </div>
  );
};

export default AiOverviewModal;
