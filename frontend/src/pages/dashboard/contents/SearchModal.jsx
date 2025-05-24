import React, { useEffect, useRef } from "react";
import { HiX } from "react-icons/hi";
import Search from "./Search";

const SearchModal = ({ open, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-opacity-40 transition-opacity animate-fade-in">
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-slide-down"
      >
        <button
          //   className="absolute top-[-3] right-[-3] text-gray-500 hover:text-gray-800 text-2xl focus:outline-none"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl focus:outline-none z-10"
          onClick={onClose}
          aria-label="Close search"
        >
          <HiX />
        </button>
        <Search />
      </div>
    </div>
  );
};

export default SearchModal;
