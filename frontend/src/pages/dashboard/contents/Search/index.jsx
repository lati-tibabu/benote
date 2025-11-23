import React, { useState, useEffect, useCallback } from "react";

const apiURL = import.meta.env.VITE_API_URL;

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState("workspace");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  // Define categories with their respective fields for searching and display
  const categories = [
    { key: "workspace", label: "Workspaces", fields: ["name", "description"] },
    { key: "teams", label: "Teams", fields: ["name"] },
    { key: "tasks", label: "Tasks", fields: ["title", "status"] },
    { key: "study_plans", label: "Study Plans", fields: ["title"] },
    { key: "roadmaps", label: "Roadmaps", fields: ["title"] },
    { key: "classrooms", label: "Classrooms", fields: ["name"] },
    {
      key: "notifications",
      label: "Notifications",
      fields: ["message", "type"],
    },
  ];

  // Memoize the header to avoid re-creation on every render
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("jwt");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // Fetch search results from backend API
  const fetchSearchResults = useCallback(
    async (tabKey, searchQuery, pageNum = 1) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${apiURL}/api/search?type=${tabKey}&query=${encodeURIComponent(
            searchQuery
          )}&page=${pageNum}&pageSize=${pageSize}`,
          {
            headers: getAuthHeader(),
          }
        );
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized: Please log in again.");
          }
          throw new Error(
            `Failed to fetch search results: ${response.statusText}`
          );
        }
        const data = await response.json();
        setResults((prev) => ({ ...prev, [tabKey]: data.results }));
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
        setResults((prev) => ({ ...prev, [tabKey]: [] }));
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeader]
  );

  // Fetch results when query or activeTab or page changes
  useEffect(() => {
    if (query.trim() !== "") {
      fetchSearchResults(activeTab, query, page);
    } else {
      // If query is empty, clear results for the tab
      setResults((prev) => ({ ...prev, [activeTab]: [] }));
      setTotal(0);
    }
    // eslint-disable-next-line
  }, [query, activeTab, page]);

  // Handle search input changes
  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
    // Optionally trigger search for the new tab if query is not empty
    if (query.trim() !== "") {
      fetchSearchResults(tabKey, query, 1);
    }
  };

  // Pagination controls
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < Math.ceil(total / pageSize)) setPage(page + 1);
  };

  // Helper to render a modern card for each item in a category
  const renderCard = (item, fields, catKey) => {
    const categoryStyles = {
      workspace: "border-gray-200 bg-gray-50 hover:shadow-gray-200",
      teams: "border-green-200 bg-green-50 hover:shadow-green-200",
      tasks: "border-yellow-200 bg-yellow-50 hover:shadow-yellow-200",
      study_plans: "border-gray-200 bg-gray-50 hover:shadow-gray-200",
      roadmaps: "border-gray-200 bg-gray-50 hover:shadow-gray-200",
      classrooms: "border-gray-200 bg-gray-50 hover:shadow-gray-200",
      notifications: "border-gray-200 bg-gray-50 hover:shadow-gray-200",
    };
    return (
      <div
        key={item.id}
        className={`rounded-sm border p-4 mb-3 shadow-sm transition-all duration-200 flex flex-col gap-1 ${
          categoryStyles[catKey] || "border-gray-200 bg-white"
        } hover:scale-[1.02] hover:shadow-sm`}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg text-gray-800 truncate">
            {fields[0] && item[fields[0]]}
          </span>
          {fields[1] && item[fields[1]] && (
            <span className="ml-2 text-xs text-gray-500 truncate">
              {item[fields[1]]}
            </span>
          )}
        </div>
        {fields.slice(2).map(
          (f) =>
            item[f] && (
              <div key={f} className="text-xs text-gray-400 truncate">
                {item[f]}
              </div>
            )
        )}
        {catKey === "notifications" && (
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {item.type &&
                item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
            <span className="text-xs text-gray-400">
              {item.createdAt && new Date(item.createdAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Helper to render all cards for a category
  const renderList = (items, fields, catKey) => {
    if (!items || items.length === 0)
      return (
        <div className="text-gray-400 text-center py-4">
          No results found for this category.
        </div>
      );
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => renderCard(item, fields, catKey))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-sm max-w-3xl max-h-[500px] mx-auto overflow-scroll scrollbar-hide">
      <div className="mb-4">
        <p className="text-2xl font-extrabold text-gray-800">Search Result</p>
        <p className="text-md text-gray-600">
          Search your data by category. Results are fetched from the server.
        </p>
        <input
          type="text"
          placeholder="Search all your data..."
          value={query}
          onChange={handleSearch}
          className="mt-4 p-3 border border-gray-300 bg-white rounded-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>

      {/* Tabs for category filtering */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === cat.key
                ? "bg-gray-100 text-gray-700 border-b-2 border-gray-500"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-500"
            }`}
            onClick={() => handleTabChange(cat.key)}
          >
            {cat.label} ({results[cat.key]?.length || 0})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 p-4 rounded-b-lg min-h-[200px] overflow-y-auto">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">Error: {error}</div>
        ) : query &&
          (!results[activeTab] || results[activeTab].length === 0) ? (
          <p className="text-gray-500 text-center">
            No results found for "{query}" in this category.
          </p>
        ) : (
          renderList(
            results[activeTab],
            categories.find((c) => c.key === activeTab)?.fields || [],
            activeTab
          )
        )}
      </div>
      {/* Pagination */}
      {query && total > pageSize && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>{`Page ${page} of ${Math.ceil(total / pageSize)}`}</span>
          <button
            onClick={handleNextPage}
            disabled={page === Math.ceil(total / pageSize)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Search;
