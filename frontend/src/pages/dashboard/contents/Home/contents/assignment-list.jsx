import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AssignmentList = () => {
  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `${apiURL}/api/assignments/classroom/all`,
          {
            headers: header,
          }
        );

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        const now = new Date();

        const overdueList = [];
        const upcomingList = [];

        data.enrolledClassrooms.forEach((classroom) => {
          classroom.assignments.forEach((assignment) => {
            const dueDate = new Date(assignment.due_date);
            const entry = {
              ...assignment,
              classroom: classroom.name,
              dueDateObj: dueDate,
            };

            if (dueDate < now) {
              overdueList.push(entry);
            } else {
              upcomingList.push(entry);
            }
          });
        });

        // Optional: sort by due date
        overdueList.sort((a, b) => a.dueDateObj - b.dueDateObj);
        upcomingList.sort((a, b) => a.dueDateObj - b.dueDateObj);

        setOverdue(overdueList);
        setUpcoming(upcomingList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading assignments:", error);
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Overdue: reddish gray, Upcoming: greenish gray
  const AssignmentCard = ({ assignment, overdue }) => (
    <button
      type="button"
      onClick={() => navigate(`/app/classroom/${assignment.classroom_id}`)}
      className={`relative flex flex-col gap-2 p-6 rounded-sm shadow bg-gradient-to-br ${
        overdue
          ? 'from-red-50 to-gray-50 border-red-200 ring-2 ring-red-300'
          : 'from-green-50 to-gray-50 border-green-200 ring-1 ring-green-200'
      } hover:shadow-sm transition group focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-[0.98] text-left w-full cursor-pointer`}
      tabIndex={0}
      aria-label={`View classroom for ${assignment.title}`}
    >
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg sm:text-xl text-gray-900 group-hover:text-gray-700 transition select-none truncate" style={{maxWidth: '85%'}} title={assignment.title}>
          {assignment.title}
        </h3>
        {overdue && (
          <span className="ml-2 px-2 py-0.5 text-xs rounded-sm bg-red-100 text-red-600 font-medium animate-pulse">
            Overdue
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700/80 line-clamp-2 select-none">
        {assignment.description}
      </p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs font-medium flex items-center gap-1 ${overdue ? 'text-red-500' : 'text-green-600'}`}> 
          <svg
            className="inline w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 16v-4m8-4h-4m-8 0H4"
            />
          </svg>
          {assignment.classroom}
        </span>
        <span
          className={`text-xs font-semibold ${
            overdue ? "text-red-600" : "text-green-700"
          }`}
        >
          Due: {assignment.dueDateObj.toLocaleDateString()}
        </span>
      </div>
    </button>
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg
          className="animate-spin h-8 w-8 text-gray-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <span className="text-lg text-gray-500 font-medium">
          Loading assignments...
        </span>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block w-1 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-sm"></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight select-none">
            Overdue Assignments
          </h2>
        </div>
        {overdue.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {overdue.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                overdue={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-100 rounded-sm px-4 py-8 text-base font-medium shadow-sm">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            No overdue assignments. Great job!
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-block w-1 h-8 bg-gradient-to-b from-gray-300 to-gray-500 rounded-sm"></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight select-none">
            Upcoming Assignments
          </h2>
        </div>
        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                overdue={false}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-100 rounded-sm px-4 py-8 text-base font-medium shadow-sm">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            No upcoming assignments. You're all caught up!
          </div>
        )}
      </section>
    </div>
  );
};

export default AssignmentList;
