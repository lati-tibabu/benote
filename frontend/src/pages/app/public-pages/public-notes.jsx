import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  PiSpinnerGap,
  PiGlobeSimpleFill,
  PiMagnifyingGlass,
  PiGridFourFill,
  PiListFill,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiEye,
  PiEyeSlash,
  PiFileLight,
} from "react-icons/pi";
import MarkdownRenderer from "../../../components/markdown-renderer";

const apiURL = import.meta.env.VITE_API_URL;

// Helper component to manage individual note content preview
const NoteCard = ({ note, viewStyle, truncateContent, formatDate }) => {
  const [showIndividualContentPreview, setShowIndividualContentPreview] =
    useState(false);

  return (
    <Link
      to={`/public/notes/${note.id}`}
      key={note.id}
      className={`block bg-white rounded-sm border border-gray-200 hover:border-gray-400 transition-all duration-300 transform hover:-translate-y-1 relative group overflow-hidden ${
        viewStyle === "list" ? "w-full max-w-3xl" : "" // Constrain width in list view
      }`}
    >
      <div className="p-7">
        {/* Note icon, separate from title */}
        <div className="flex justify-between items-start mb-3">
          <PiFileLight className="text-gray-400 text-3xl" />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowIndividualContentPreview((prev) => !prev);
            }}
            aria-label={
              showIndividualContentPreview
                ? "Hide content preview"
                : "Show content preview"
            }
            className="p-1 rounded-sm text-gray-500 hover:bg-gray-100 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            {showIndividualContentPreview ? (
              <PiEyeSlash className="text-xl" />
            ) : (
              <PiEye className="text-xl" />
            )}
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors leading-tight">
          {note.title}
        </h2>

        {/* Conditionally rendered content preview */}
        {showIndividualContentPreview && (
          <p className="text-gray-600 text-base leading-relaxed mb-5 line-clamp-3">
            <MarkdownRenderer content={truncateContent(note.content, 30)} />
          </p>
        )}

        {/* Metadata */}
        <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4 mt-4">
          <p>
            <span className="font-semibold text-gray-700">Author:</span>{" "}
            {note.user?.name || "Unknown"}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Published:</span>{" "}
            {formatDate(note.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

const PublicNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");

  // State for user-selected font, initialized from local storage
  const [selectedFont, setSelectedFont] = useState(
    localStorage.getItem("selectedFont") || "Inter"
  );
  // State for user-selected items per page
  const [itemsPerPage, setItemsPerPage] = useState(
    parseInt(localStorage.getItem("itemsPerPage") || "9", 10)
  );
  // State for user-selected view style (grid or list)
  const [viewStyle, setViewStyle] = useState(
    localStorage.getItem("viewStyle") || "grid"
  );

  // Effect to apply the selected font to the document body
  useEffect(() => {
    document.body.style.fontFamily = getFontFamily(selectedFont);
    localStorage.setItem("selectedFont", selectedFont);
  }, [selectedFont]);

  // Effects to save user preferences to local storage
  useEffect(() => {
    localStorage.setItem("itemsPerPage", itemsPerPage.toString());
  }, [itemsPerPage]);

  useEffect(() => {
    localStorage.setItem("viewStyle", viewStyle);
  }, [viewStyle]);

  // Helper function to get actual CSS font family
  const getFontFamily = (fontName) => {
    switch (fontName) {
      case "Inter":
        return "'Inter', sans-serif";
      case "Roboto":
        return "'Roboto', sans-serif";
      case "Open Sans":
        return "'Open Sans', sans-serif";
      case "Monospace":
        return "monospace";
      default:
        return "'Inter', sans-serif";
    }
  };

  const fetchPublicNotes = useCallback(async (page, search, size) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${apiURL}/api/notes/public/notes/search`);
      url.searchParams.append("page", page);
      url.searchParams.append("pageSize", size);
      if (search) {
        url.searchParams.append("search", search);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data.notes || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicNotes(currentPage, currentSearchTerm, itemsPerPage);
  }, [currentPage, currentSearchTerm, itemsPerPage, fetchPublicNotes]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const executeSearch = () => {
    setCurrentPage(1);
    setCurrentSearchTerm(searchTerm);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  const truncateContent = useCallback((content, wordLimit) => {
    if (!content) return "";
    const words = content.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return content;
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-700">
        <PiSpinnerGap className="animate-spin text-6xl text-gray-600 mb-4" />
        <p className="text-lg">Loading public notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-red-700">
        <p className="text-center py-10 text-xl font-medium">
          Error fetching notes: {error}. Please try again later.
        </p>
        <button
          onClick={() => fetchPublicNotes(1, currentSearchTerm, itemsPerPage)}
          className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-sm shadow-sm hover:bg-gray-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-10 bg-gray-50 min-h-screen flex flex-col"
      style={{ fontFamily: getFontFamily(selectedFont) }}
    >
      {/* Header Section */}
      <header className="flex flex-col items-center justify-center mb-10">
        <div className="flex items-center mb-4">
          <PiGlobeSimpleFill className="text-gray-600 text-5xl mr-4" />
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Benote Public Notes
          </h1>
        </div>
        {/* Search Input Field and Button */}
        <div className="relative w-full max-w-2xl mb-8 flex items-center">
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
            aria-label="Search notes"
            className="flex-grow px-6 py-3 pl-14 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-3 focus:ring-gray-300 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-white text-lg"
          />
          <PiMagnifyingGlass className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl" />
          <button
            onClick={executeSearch}
            aria-label="Submit search"
            className="ml-4 px-8 py-3 bg-gray-600 text-white font-semibold rounded-sm shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-3 focus:ring-gray-400 transition-colors text-lg"
          >
            Search
          </button>
        </div>

        {/* User Preferences: Font, Items per Page, View Style */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
          {/* Font Selection */}
          <div className="flex items-center space-x-3">
            <label
              htmlFor="font-select"
              className="text-gray-700 text-lg font-medium"
            >
              Font:
            </label>
            <select
              id="font-select"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              aria-label="Select font style"
              className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-800 cursor-pointer text-base"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Monospace">Monospace</option>
            </select>
          </div>

          {/* Items per Page Selection */}
          <div className="flex items-center space-x-3">
            <label
              htmlFor="items-per-page-select"
              className="text-gray-700 text-lg font-medium"
            >
              Notes per page:
            </label>
            <select
              id="items-per-page-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value, 10));
                setCurrentPage(1); // Reset to first page when items per page changes
              }}
              aria-label="Select number of notes per page"
              className="px-4 py-2 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-800 cursor-pointer text-base"
            >
              <option value="6">6</option>
              <option value="9">9</option>
              <option value="12">12</option>
              <option value="15">15</option>
            </select>
          </div>

          {/* View Style Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 text-lg font-medium">View:</span>
            <button
              onClick={() => setViewStyle("grid")}
              aria-label="View as grid"
              className={`p-3 rounded-sm transition-colors duration-200 ${
                viewStyle === "grid"
                  ? "bg-gray-600 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <PiGridFourFill className="text-2xl" />
            </button>
            <button
              onClick={() => setViewStyle("list")}
              aria-label="View as list"
              className={`p-3 rounded-sm transition-colors duration-200 ${
                viewStyle === "list"
                  ? "bg-gray-600 text-white shadow-sm"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <PiListFill className="text-2xl" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {notes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-sm border border-gray-200 mx-auto max-w-3xl">
          <p className="text-gray-700 text-2xl font-semibold mb-4">
            {currentSearchTerm
              ? `No public notes found for "${currentSearchTerm}".`
              : "No public notes are available at the moment."}
          </p>
          {!currentSearchTerm && (
            <p className="text-gray-600 text-lg">
              Check back later for new content!
            </p>
          )}
          {currentSearchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentSearchTerm("");
                setCurrentPage(1);
              }}
              className="mt-6 px-6 py-3 bg-gray-500 text-white font-medium rounded-sm hover:bg-gray-600 transition-colors shadow-sm"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Notes Display */}
          <section
            className={`${
              viewStyle === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "flex flex-col space-y-6 items-center"
            } mb-12`}
          >
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                viewStyle={viewStyle}
                truncateContent={truncateContent}
                formatDate={formatDate}
              />
            ))}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className="p-3 bg-gray-600 text-white font-medium rounded-sm shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors transform hover:scale-105 text-lg"
              >
                <PiCaretLeftBold className="text-xl" />
              </button>
              <span className="text-gray-800 text-lg font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className="p-3 bg-gray-600 text-white font-medium rounded-sm shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors transform hover:scale-105 text-lg"
              >
                <PiCaretRightBold className="text-xl" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-gray-200 mt-16">
        &copy; {new Date().getFullYear()} Benote. All rights
        reserved.
      </footer>
    </div>
  );
};

export default PublicNotesPage;
