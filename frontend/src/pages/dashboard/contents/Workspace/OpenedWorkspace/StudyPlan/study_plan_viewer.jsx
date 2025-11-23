import React, { useState } from "react";

function formatDateString(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

function formatTimeString(dateStr) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimeOfDay(dateStr) {
  if (!dateStr) return "other";
  const date = new Date(dateStr);
  if (isNaN(date)) return "other";
  const hour = date.getHours();
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

export default function StudyPlanViewer({ plan }) {
  const [selectedDate, setSelectedDate] = useState("");

  if (!plan) return null;

  // Get all unique dates from timeBlocks
  const uniqueDates = Array.from(
    new Set(
      (plan.timeBlocks || [])
        .map((block) =>
          block.start_time
            ? new Date(block.start_time).toISOString().split("T")[0]
            : null
        )
        .filter(Boolean)
    )
  );

  // If no date selected, default to first date
  React.useEffect(() => {
    if (!selectedDate && uniqueDates.length > 0) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  // Filter timeBlocks by selected date
  const filteredBlocks = selectedDate
    ? (plan.timeBlocks || []).filter(
        (block) =>
          block.start_time &&
          new Date(block.start_time).toISOString().split("T")[0] ===
            selectedDate
      )
    : plan.timeBlocks || [];

  // Group by time of day
  const grouped = { morning: [], afternoon: [], evening: [] };
  filteredBlocks.forEach((block) => {
    const tod = getTimeOfDay(block.start_time);
    if (grouped[tod]) grouped[tod].push(block);
    else grouped.evening.push(block); // fallback
  });

  // Icons for time of day
  const todIcons = {
    morning: "🌅",
    afternoon: "🌞",
    evening: "🌙",
  };

  // Job icon (optional, fallback to briefcase)
  const jobIcon = (
    <svg
      className="w-5 h-5 text-gray-500 mr-2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-7 4h8a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7a2 2 0 002 2z"
      />
    </svg>
  );

  return (
    <div className="backdrop-blur-md bg-white/80  border border-gray-100 rounded-sm shadow-sm p-8 max-w-4xl mx-auto space-y-10 transition-all overflow-hidden">
      <div className="flex flex-col md:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-700 tracking-tight mb-1">
            {plan.title}
          </h1>
          <p className="text-gray-600 text-lg font-medium mb-1">
            {plan.description}
          </p>
          <p className="text-sm text-gray-400">
            <span className="font-semibold">
              {formatDateString(plan.start_date)}
            </span>
            <span className="mx-2">—</span>
            <span className="font-semibold">
              {formatDateString(plan.end_date)}
            </span>
          </p>
        </div>
        {/* Modern horizontal scrollable day selector */}
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar scrollbar-hide">
            {uniqueDates.map((date) => (
              <button
                key={date}
                // className={`w-fit whitespace-nowrap px-4 py-2 rounded-sm border font-semibold min-w-[110px] shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300/60 focus:z-10
                className={`btn
                  ${
                    selectedDate === date
                      ? "bg-gradient-to-r from-gray-500 to-gray-300 text-white border-gray-400 scale-105 shadow-sm"
                      : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"
                  }
                `}
                onClick={() => setSelectedDate(date)}
                tabIndex={0}
              >
                <span className="block text-base font-semibold tracking-wide">
                  {formatDateString(date)}
                </span>
                {selectedDate === date && (
                  <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-5 h-1 bg-gray-300 rounded-sm animate-fadeIn"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-10">
        {filteredBlocks.length > 0 ? (
          <>
            {["morning", "afternoon", "evening"].map((tod) => (
              <div key={tod} className="">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{todIcons[tod]}</span>
                  <h3 className="text-2xl font-extrabold text-gray-700 capitalize tracking-tight">
                    {tod === "morning" && "Morning (7am - 12pm)"}
                    {tod === "afternoon" && "Afternoon (12pm - 6pm)"}
                    {tod === "evening" && "Evening/Night (6pm - 7am)"}
                  </h3>
                </div>
                {grouped[tod].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grouped[tod].map((block) => (
                      <div
                        key={block.id}
                        className="relative border border-gray-100 rounded-sm p-6 shadow-sm bg-white/90 hover:shadow-sm transition-all group backdrop-blur-md"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-2">
                          <div className="flex items-center gap-2">
                            {jobIcon}
                            <h2 className="text-lg font-bold text-gray-800 group-hover:underline">
                              {block.job}
                            </h2>
                          </div>
                          <span className="text-xs font-mono text-gray-500 bg-gray-100/60 px-3 py-1 rounded-sm">
                            {formatDateString(block.start_time)}{" "}
                            {formatTimeString(block.start_time)}
                            {block.end_time
                              ? ` - ${formatTimeString(block.end_time)}`
                              : ""}
                          </span>
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed">
                          {block.description}
                        </p>
                        {/* Decorative glass effect */}
                        <div className="absolute inset-0 rounded-sm pointer-events-none opacity-30 bg-gradient-to-br from-gray-100/60 to-white/0 dark:from-gray-900/40 dark:to-gray-900/0" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 italic text-center py-4 text-base">
                    No {tod} blocks for this date.
                  </div>
                )}
              </div>
            ))}
          </>
        ) : (
          <div className="text-gray-400 italic text-center py-12 text-lg">
            No time blocks available for this date.
          </div>
        )}
      </div>
    </div>
  );
}
