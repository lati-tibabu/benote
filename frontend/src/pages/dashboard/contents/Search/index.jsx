import React, { useState, useEffect, useCallback } from "react";

const apiURL = import.meta.env.VITE_API_URL;

const Search = () => {
  const [userOverview, setUserOverview] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [activeTab, setActiveTab] = useState("workspace");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define categories with their respective fields for searching and display
  const categories = [
    { key: "workspace", label: "Workspaces", fields: ["name", "description"] },
    { key: "teams", label: "Teams", fields: ["name"] },
    { key: "tasks", label: "Tasks", fields: ["title", "status"] },
    { key: "study_plans", label: "Study Plans", fields: ["title"] },
    { key: "roadmaps", label: "Roadmaps", fields: ["title"] },
    { key: "classrooms", label: "Classrooms", fields: ["name"] },
    {
      key: "receivedNotifications",
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

  // Fetch user overview data on component mount
  useEffect(() => {
    const fetchUserOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiURL}/api/users/overview/fetch`, {
          method: "GET",
          headers: getAuthHeader(),
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Unauthorized: Please log in again.");
          }
          throw new Error(
            `Failed to fetch user overview: ${response.statusText}`
          );
        }
        const data = await response.json();
        setUserOverview(data);
        setResults(data); // Initialize results with all data
      } catch (err) {
        console.error("Error fetching user overview:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOverview();
  }, [getAuthHeader]); // Dependency on getAuthHeader to re-run if it changes (though it's memoized)

  // Handle search input changes
  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);

    if (!userOverview) return; // If data hasn't loaded yet, do nothing

    if (!q) {
      setResults(userOverview); // If query is empty, show all data
      return;
    }

    const filtered = {};
    // Iterate over defined categories to filter relevant data
    categories.forEach((cat) => {
      const items = userOverview[cat.key];
      if (Array.isArray(items)) {
        filtered[cat.key] = items.filter((item) => {
          // Check if any of the specified fields for the category include the query
          return cat.fields.some((field) => {
            const value = item[field];
            return (
              typeof value === "string" &&
              value.toLowerCase().includes(q.toLowerCase())
            );
          });
        });
      } else {
        // For non-array properties (like id, name, email directly on userOverview),
        // we can decide whether to search them or not.
        // For this component, we're primarily searching within the arrays.
        // If you want to search user's name or email, you'd add them to 'categories'
        // or handle them separately.
      }
    });
    setResults(filtered);
  };

  // Helper to render a modern card for each item in a category
  const renderCard = (item, fields, catKey) => {
    const categoryStyles = {
      workspace: "border-blue-200 bg-blue-50 hover:shadow-blue-200",
      teams: "border-green-200 bg-green-50 hover:shadow-green-200",
      tasks: "border-yellow-200 bg-yellow-50 hover:shadow-yellow-200",
      study_plans: "border-purple-200 bg-purple-50 hover:shadow-purple-200",
      roadmaps: "border-pink-200 bg-pink-50 hover:shadow-pink-200",
      classrooms: "border-indigo-200 bg-indigo-50 hover:shadow-indigo-200",
      receivedNotifications: "border-gray-200 bg-gray-50 hover:shadow-gray-200",
    };
    return (
      <div
        key={item.id}
        className={`rounded-xl border p-4 mb-3 shadow-sm transition-all duration-200 flex flex-col gap-1 ${
          categoryStyles[catKey] || "border-gray-200 bg-white"
        } hover:scale-[1.02] hover:shadow-lg`}
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
        {catKey === "receivedNotifications" && (
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

  if (loading) {
    return <div className="text-center p-4">Loading user data...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg max-w-3xl max-h-[500px] mx-auto overflow-scroll scrollbar-hide">
      <div className="mb-4">
        <p className="text-2xl font-extrabold text-gray-800">Search Result</p>
        <p className="text-md text-gray-600">
          Your search results across all categories will be displayed here.
        </p>
        <input
          type="text"
          placeholder="Search all your data..."
          value={query}
          onChange={handleSearch}
          className="mt-4 p-3 border border-gray-300 bg-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabs for category filtering */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === cat.key
                ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                : "text-gray-600 hover:bg-gray-100 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab(cat.key)}
          >
            {cat.label} ({results[cat.key]?.length || 0})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 p-4 rounded-b-lg min-h-[200px] overflow-y-auto">
        {query && Object.values(results).every((arr) => arr.length === 0) ? (
          <p className="text-gray-500 text-center">
            No results found for "{query}" in any category.
          </p>
        ) : (
          categories.map((cat) =>
            activeTab === cat.key ? (
              <div key={cat.key}>
                {renderList(results[cat.key], cat.fields, cat.key)}
              </div>
            ) : null
          )
        )}
      </div>
    </div>
  );
};

export default Search;
