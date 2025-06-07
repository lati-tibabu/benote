import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PiSpinnerGap } from "react-icons/pi";
import { MdOutlinePublic, MdSearch } from "react-icons/md";
import MarkdownRenderer from "../../../components/markdown-renderer";

const apiURL = import.meta.env.VITE_API_URL;

const PublicNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(0);

  // State for user-selected font, initialized from local storage
  const [selectedFont, setSelectedFont] = useState(
    localStorage.getItem("selectedFont") || "Montserrat"
  );

  const pageSize = 9; // Changed to 9 for a 3-column grid aesthetic

  // Effect to apply the selected font to the document body
  useEffect(() => {
    document.body.style.fontFamily = getFontFamily(selectedFont);
    localStorage.setItem("selectedFont", selectedFont);
  }, [selectedFont]);

  // Helper function to get actual CSS font family
  const getFontFamily = (fontName) => {
    switch (fontName) {
      case "Montserrat":
        return "'Montserrat', sans-serif";
      case "Poppins":
        return "'Poppins', sans-serif";
      case "Monospace":
        return "monospace";
      default:
        return "'Montserrat', sans-serif"; // Default to Montserrat
    }
  };

  const fetchPublicNotes = useCallback(
    async (page, search) => {
      setLoading(true);
      setError(null);
      try {
        const url = new URL(`${apiURL}/api/notes/public/notes/search`);
        url.searchParams.append("page", page);
        url.searchParams.append("pageSize", pageSize);
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
        setNotes([]); // Clear notes on error
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    fetchPublicNotes(currentPage, searchTerm);
  }, [currentPage, searchTerm, triggerSearch, fetchPublicNotes]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentPage(1); // Reset to first page for new search results
    setTriggerSearch((prev) => prev + 1); // Increment to trigger useEffect
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // Function to truncate content for preview
  const truncateContent = (content, wordLimit) => {
    if (!content) return "";
    const words = content.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return content;
  };

  // Custom function to format date without external libraries
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 text-gray-700">
        <PiSpinnerGap className="animate-spin text-6xl text-blue-600 mb-4" />
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
          onClick={() => fetchPublicNotes(1, searchTerm)} // Retry fetching on error
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen flex flex-col"
      // Dynamically apply font family to this container as well for better control
      style={{ fontFamily: getFontFamily(selectedFont) }}
    >
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="flex items-center mb-4">
          <MdOutlinePublic className="text-blue-600 text-4xl mr-3" />
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            SPH Public Notes
          </h1>
        </div>
        {/* Search Input Field and Button */}
        <div className="relative w-full max-w-lg mb-6 flex">
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="flex-grow px-5 py-3 pl-12 border border-gray-200 rounded-l-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-gray-800 bg-white"
          />
          <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-2xl" />
          <button
            onClick={handleSearchSubmit}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-r-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Font Selection Dropdown */}
        <div className="mb-8 flex items-center space-x-3">
          <label htmlFor="font-select" className="text-gray-700 text-lg">
            Choose Font:
          </label>
          <select
            id="font-select"
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800"
          >
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
            <option value="Monospace">Monospace</option>
          </select>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <p className="text-gray-600 text-xl">
            {searchTerm
              ? `No public notes found for "${searchTerm}".`
              : "No public notes are available at the moment."}
          </p>
          {!searchTerm && (
            <p className="text-gray-500 mt-2">
              Check back later for new content!
            </p>
          )}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setTriggerSearch((prev) => prev + 1);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Link
                to={`/public/notes/${note.id}`}
                key={note.id}
                className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 relative group overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                    {note.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    <MarkdownRenderer
                      content={truncateContent(note.content, 25)}
                    />
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3 mt-3">
                    <p>
                      <span className="font-medium text-gray-700">Author:</span>{" "}
                      {note.user?.name || "Unknown"}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">
                        Published:
                      </span>{" "}
                      {formatDate(note.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center space-x-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors transform hover:scale-105 text-sm"
              >
                Previous
              </button>
              <span className="text-gray-800 text-base font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors transform hover:scale-105 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 text-sm border-t border-gray-200 mt-12">
        Student Productivity Hub 2025
      </footer>
    </div>
  );
};

export default PublicNotesPage;
