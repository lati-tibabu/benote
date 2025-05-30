import React, { useEffect, useState } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useSelector } from "react-redux";

const AiGeneratedTask = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null); // Changed from [] to null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Changed from undefined to null
  const { workspaceId } = useParams();
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [planLength, setPlanLength] = useState(1); // in weeks
  const [preferredTime, setPreferredTime] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem("geminiApiKey");
  // API Key validation before model init
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI
    ? genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      })
    : null;

  // storing the authenticated user data in the userData
  const userData = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchStudyPlans = async () => {
      try {
        const response = await fetch(`${apiURL}/api/studyPlans?air=true`, {
          headers: header,
        });
        const data = await response.json();
        setStudyPlans(data);
      } catch (error) {
        console.error("Error fetching study plans:", error);
        toast.error("Failed to fetch existing study plans.");
      }
    };
    fetchStudyPlans();
  }, [apiURL, JSON.stringify(header)]); // Added dependencies to useEffect

  // Corrected responseSchema to be a single object
  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        start_date: { type: "string", format: "date-time" },
        end_date: { type: "string", format: "date-time" },
        timeBlocks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              start_time: { type: "string", format: "date-time" },
              end_time: { type: "string", format: "date-time" },
              job: { type: "string" },
              description: { type: "string" },
            },
            required: ["start_time", "end_time", "job", "description"],
          },
        },
      },
      required: [
        "title",
        "description",
        "start_date",
        "end_date",
        "timeBlocks",
      ],
    },
  };

  // Updated AI prompt and response handling for a single plan
  const requestAi = async (prompt) => {
    setLoading(true);
    setError(null); // Reset error state on new request
    try {
      if (!apiKey || !genAI || !model) {
        const errorMessage =
          "API Key is missing or invalid. Please provide a valid API Key.";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: `
                You are an expert study plan assistant. Your task is to analyze the user's prompt and generate a single, comprehensive study plan object (not an array).
                Instructions for generating the study plan:
                1. Understand all subjects, topics, or goals mentioned in the user's prompt and include them in a single plan.
                2. Output MUST be a single JSON object, not an array.
                3. The study plan object must have:
                  - title: A clear and concise title for the overall study plan.
                  - description: A brief summary of what the plan covers.
                  - start_date: ISO 8601 date-time string for when the plan begins. The time portion must be exactly at 00 minutes (e.g., 10:00, 14:00, not 10:29), and the plan should start at 00:00 (midnight) of the chosen day.
                  - end_date: ISO 8601 date-time string for when the plan ends (at least one week after start_date, and plan should span at least ${planLength} week(s) from the current date). and the plan should end at 00:00 (midnight) of the end day.
                  - timeBlocks: An array of detailed study sessions for this plan.
                    - Each timeBlock must represent a 1-hour duration.
                    - start_time: ISO 8601 date-time string for the start of the session. The time portion must be exactly on the hour (e.g., 10:00, 14:00, not 10:29).
                    - end_time: ISO 8601 date-time string, exactly one hour after 'start_time'. The time portion must be exactly on the hour (e.g., 11:00, 15:00, not 11:29).
                    - job: The specific subject or topic for this 1-hour block.
                    - description: A brief explanation of what will be done during this block.
                    - If a subject or topic requires more than one hour, break it down into multiple consecutive 1-hour blocks, each starting and ending at a full hour.
                4. User Preferences & Constraints:
                  - Overall Plan Length: The generated plan should cover approximately ${planLength} week(s).
                  - Preferred Study Time: Incorporate the user's preferred study time: '${preferredTime}'.
                  - Additional Notes: Consider these additional notes: '${additionalNotes}'.
                5. Existing Study Plans Avoidance:
                  - Here are already existing study plans: ${JSON.stringify(
                    studyPlans
                  )}.
                  - Do not use the same 'title' as any of the existing study plans.
                  - Ensure the time of the study plan you generate does NOT overlap with the time periods of existing study plans.
                  - STRICT RULE: The new plan's start_date must NOT be before the end_date of any existing study plan. The new plan can only start after all previous plans have ended. If there is any overlap or the new plan starts before another plan ends, do NOT generate the plan and return an error message instead.
                6. Only use information from the user's prompt. Do not invent or add extra tasks, topics, or subjects that were not explicitly requested by the user.
                7. Strict JSON Schema Adherence: The response must strictly follow the provided JSON schema (responseSchema in generationConfig) as a single object. Any deviation will cause parsing errors.
                The current date and time to base your plan's start date is: ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(prompt);
      let response = result.response.text();
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (e) {
        const parseErrorMsg =
          "AI response could not be parsed. Please try again. Raw response: " +
          response;
        setError(parseErrorMsg);
        toast.error(parseErrorMsg);
        setAiResponse(null); // Changed to null
        setLoading(false);
        return;
      }
      setAiResponse(parsed);
    } catch (error) {
      console.error("Error in requestAi:", error);
      if (!navigator.onLine) {
        setError(
          "It looks like you're offline. Please check your internet connection."
        );
        toast.error(
          "It looks like you're offline. Please check your internet connection."
        );
      } else if (error.response) {
        setError("API error: " + error.response.data);
        toast.error("API error: " + error.response.data);
      } else {
        setError("An unexpected error occurred. Please try again.");
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserPrompt = (e) => {
    e.preventDefault();
    if (!apiKey || apiKey.length === 0) {
      toast.error("API Key is invalid or missing!");
      setError("API Key is invalid or missing!");
      return;
    }
    if (!userPrompt.trim()) {
      toast.error("Please enter a prompt to generate a study plan.");
      setError("Please enter a prompt to generate a study plan.");
      return;
    }
    setError(null);
    setAiResponse(null);
    requestAi(userPrompt);
  };

  // Update effect to handle single object response
  useEffect(() => {
    if (!aiResponse || Object.keys(aiResponse).length === 0) {
      setGeneratedTasks([]);
      return;
    }
    setGeneratedTasks([aiResponse]); // always wrap in array for rendering logic
  }, [aiResponse]);

  const handleAcceptAiResponse = async () => {
    if (!generatedTasks.length) return;
    setLoading(true); // Show loading during save
    setError(null); // Clear any previous errors

    try {
      for (const plan of generatedTasks) {
        // 1. Add the study plan
        const planRes = await fetch(`${apiURL}/api/studyPlans`, {
          method: "POST",
          headers: header,
          body: JSON.stringify({
            title: plan.title,
            description: plan.description,
            start_date: plan.start_date,
            end_date: plan.end_date,
            user_id: userData?.id,
            workspace_id: workspaceId,
          }),
        });

        if (!planRes.ok) {
          let errMsg = "Failed to add study plan";
          try {
            const err = await planRes.json();
            errMsg = err.message || errMsg;
          } catch (jsonErr) {
            errMsg = `Failed to add study plan (status: ${planRes.status})`;
          }
          console.error("Error creating study plan:", errMsg);
          setError(errMsg);
          toast.error(errMsg);
          setLoading(false);
          return;
        }
        const newPlan = await planRes.json();

        // 2. Add time blocks (bulk)
        if (plan.timeBlocks && plan.timeBlocks.length > 0) {
          const timeBlocks = plan.timeBlocks.map((block) => ({
            ...block,
            study_plan_id: newPlan.id,
            user_id: userData?.id,
            workspace_id: workspaceId,
          }));
          const tbRes = await fetch(`${apiURL}/api/timeBlocks`, {
            method: "POST",
            headers: header,
            body: JSON.stringify(timeBlocks),
          });

          if (!tbRes.ok) {
            let tbErrMsg = "Failed to add time blocks";
            try {
              const err = await tbRes.json();
              tbErrMsg = err.message || tbErrMsg;
            } catch (jsonErr) {
              tbErrMsg = `Failed to add time blocks (status: ${tbRes.status})`;
            }
            console.error("Error creating time blocks:", tbErrMsg);
            setError(tbErrMsg);
            toast.error(tbErrMsg);
            setLoading(false);
            return;
          }
        }
      }
      toast.success("Study plan(s) and time blocks added successfully!");
      setUserPrompt("");
      setAiResponse(null); // Reset to null after successful save
      setGeneratedTasks([]);
    } catch (err) {
      console.error("Error creating study plan: ", err);
      setError("An error occurred while saving the study plan.");
      toast.error("An error occurred while saving the study plan.");
    } finally {
      setLoading(false); // Hide loading after save
    }
  };

  return (
    <div>
      <div className="text-2xl text-gray-800 mt-5">AI Generated Study Plan</div>
      <form
        action=""
        className="border-2 p-3 mt-10 flex flex-col gap-4 rounded-lg"
        onSubmit={handleUserPrompt}
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1">
              Length of Plan (weeks)
            </label>
            <input
              type="number"
              min={1}
              max={52}
              className="input bg-white text-black input-bordered w-24"
              value={planLength}
              onChange={(e) => setPlanLength(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1">
              Preferred Study Time
            </label>
            <input
              type="text"
              placeholder="e.g. 7-9pm, mornings, etc."
              className="input bg-white text-black input-bordered w-40"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-[120px]">
            <label className="text-xs font-semibold mb-1">
              Additional Notes
            </label>
            <input
              type="text"
              placeholder="Any other info..."
              className="input bg-white text-black input-bordered"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-between items-end mt-2">
          <textarea
            name=""
            id=""
            className="w-full bg-transparent ring-0 outline-none border-none resize-none"
            placeholder="Describe your subject, syllabus, or study goal to generate a study plan"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          ></textarea>
          <button
            className="text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 btn border-none shadow ml-2"
            type="submit" // Ensure button is type="submit" for form submission
          >
            <AiOutlineSend className="text-xl" />
          </button>
        </div>
      </form>

      <div className="border-2 p-3 mt-10 rounded-lg">
        <div className="border-b-2 pb-2 px-4 flex justify-between">
          <p className="text-gray-800 font-bold "></p>
          {generatedTasks.length > 0 && (
            <button
              className="btn btn-sm btn-success"
              onClick={handleAcceptAiResponse}
              disabled={loading} // Disable button while saving
            >
              Accept
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-500 bg-red-100 border-red-500 border p-1 rounded-md flex items-center gap-2">
            <FaTriangleExclamation size={30} />
            {error}
          </p>
        )}
        {loading ? (
          <div className="flex items-center justify-center mt-4">
            <span className="loading loading-dots loading-lg"></span>
          </div>
        ) : (
          <div>
            {/* Render the new array-based study plan */}
            {generatedTasks?.length > 0 ? (
              generatedTasks.map((plan, idx) => (
                <div
                  key={idx}
                  className="border p-3 rounded-lg bg-gray-50 mb-4"
                >
                  <div className="text-xl font-semibold">{plan.title}</div>
                  <div className="text-sm mb-2">{plan.description}</div>
                  <div className="text-xs text-gray-500 mb-2">
                    Start: {new Date(plan.start_date).toLocaleString()}
                    <br />
                    End: {new Date(plan.end_date).toLocaleString()}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    {plan.timeBlocks?.map((block, bIdx) => (
                      <div key={bIdx} className="border p-2 rounded bg-white">
                        <div className="font-semibold">{block.job}</div>
                        <div className="text-sm text-gray-600">
                          {block.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          🕒 {new Date(block.start_time).toLocaleString()} -{" "}
                          {new Date(block.end_time).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No study plan generated yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiGeneratedTask;
