import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTriangleExclamation } from "react-icons/fa6";
import { useSelector } from "react-redux";

const AiGeneratedTask = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
  const selectedModel = localStorage.getItem("selectedGeminiModel") || import.meta.env.VITE_DEFAULT_GEMINI_MODEL || "gemini-flash-latest";
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI
    ? genAI.getGenerativeModel({
        model: selectedModel,
      })
    : null;

  const userData = useSelector((state) => state.auth.user);

  // Helper function to check for date overlaps
  const checkOverlap = (newPlanStart, newPlanEnd, existingPlans) => {
    const newStart = new Date(newPlanStart).getTime();
    const newEnd = new Date(newPlanEnd).getTime();

    for (const existingPlan of existingPlans) {
      const existingStart = new Date(existingPlan.start_date).getTime();
      const existingEnd = new Date(existingPlan.end_date).getTime();

      if (newStart < existingEnd && newEnd > existingStart) {
        return true; // Overlap detected
      }
    }
    return false; // No overlap
  };

  const fetchStudyPlans = useCallback(async () => {
    try {
      const response = await fetch(`${apiURL}/api/studyPlans?air=true`, {
        headers: header,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudyPlans(data);
    } catch (error) {
      console.error("Error fetching study plans:", error);
      toast.error("Failed to fetch existing study plans. Please refresh.");
    }
  }, [apiURL, JSON.stringify(header)]);

  useEffect(() => {
    fetchStudyPlans();
  }, [fetchStudyPlans]);

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

  const requestAi = async (prompt) => {
    setLoading(true);
    setError(null);

    if (!apiKey || apiKey.length === 0) {
      const errorMessage =
        "API Key is missing or invalid. Please provide a valid API Key.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }
    if (!genAI || !model) {
      const errorMessage =
        "Gemini AI model could not be initialized. Check your API key.";
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
      return;
    }

    try {
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
                2. Output MUST be a single JSON object, not an array, strictly adhering to the 'responseSchema' provided.
                3. The study plan object must have:
                   - title: A clear and concise title for the overall study plan.
                   - description: A brief summary of what the plan covers.
                   - start_date: ISO 8601 date-time string (e.g., "2025-06-02T00:00:00Z"). The plan must start exactly at midnight (00:00:00) on the chosen day.
                   - end_date: ISO 8601 date-time string. The plan must span at least ${planLength} week(s) from the current date. The end_date must also be exactly at midnight (00:00:00) of the end day.
                   - timeBlocks: An array of detailed study sessions for this plan.
                     - Each timeBlock must represent a 1-hour duration.
                     - start_time: ISO 8601 date-time string (e.g., "2025-06-02T10:00:00Z") for the start of the session. The time portion must be exactly on the hour (e.g., 10:00, 14:00, not 10:29).
                     - end_time: ISO 8601 date-time string, exactly one hour after 'start_time'. The time portion must be exactly on the hour (e.g., 11:00, 15:00, not 11:29).
                     - job: The specific subject or topic for this 1-hour block.
                     - description: A brief explanation of what will be done during this block.
                     - If a subject or topic requires more than one hour, break it down into multiple consecutive 1-hour blocks, each starting and ending at a full hour.
                4. User Preferences & Constraints:
                   - Overall Plan Length: The generated plan should cover approximately ${planLength} week(s).
                   - Preferred Study Time: Incorporate the user's preferred study time: '${preferredTime}'.
                   - Additional Notes: Consider these additional notes: '${additionalNotes}'.
                5. Existing Study Plans Avoidance (STRICT RULES):
                   - Here are already existing study plans: ${JSON.stringify(
                     studyPlans
                   )}.
                   - Do not use the same 'title' as any of the existing study plans.
                   - The new plan's start_date must NOT be before or overlap with the time range of ANY existing study plan.
                   - Calculate the *latest* end date among all existing plans. The new plan's start_date must be *after* this latest end date.
                   - If it's impossible to generate a non-overlapping plan based on the current date and existing plans, state that directly in a user-friendly error message within the JSON's description field and provide guidance to the user, for example, "Cannot generate a plan as it would overlap with existing plans. Please try again later or adjust your request." (Though for a JSON schema, it's better to just adhere to the schema and let client-side validation handle this if the AI doesn't. We'll add client-side validation.)
                6. Only use information from the user's prompt. Do not invent or add extra tasks, topics, or subjects that were not explicitly requested by the user.
                7. The current UTC date and time to base your plan's start date is: ${new Date().toISOString()}. Ensure all generated dates/times are in the future relative to this timestamp and in ISO 8601 format with 'Z' for UTC.
                8. Strictly follow the responseSchema:
                9. Today is ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(prompt);
      let responseText = result.response.text();

      if (responseText.startsWith("```json") && responseText.endsWith("```")) {
        responseText = responseText
          .substring(7, responseText.length - 3)
          .trim();
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        const parseErrorMsg = `AI response could not be parsed as JSON. Please try again. Raw response: ${responseText.substring(
          0,
          200
        )}... (truncated)`;
        setError(parseErrorMsg);
        toast.error(parseErrorMsg);
        setAiResponse(null);
        setLoading(false);
        return;
      }

      // if (
      //   checkOverlap(
      //     parsedResponse.start_date,
      //     parsedResponse.end_date,
      //     studyPlans
      //   )
      // ) {
      //   const overlapError =
      //     "The generated study plan overlaps with an existing study plan. Please adjust your prompt or accept existing plans first.";
      //   setError(overlapError);
      //   toast.error(overlapError);
      //   setAiResponse(null);
      //   setLoading(false);
      //   return;
      // }

      const now = new Date();
      // if (new Date(parsedResponse.start_date) < now) {
      //   const pastDateError =
      //     "The generated study plan starts in the past. Please try generating again.";
      //   setError(pastDateError);
      //   toast.error(pastDateError);
      //   setAiResponse(null);
      //   setLoading(false);
      //   return;
      // }
      for (const block of parsedResponse.timeBlocks) {
        if (
          new Date(block.start_time) < now ||
          new Date(block.end_time) < now
        ) {
          const pastBlockDateError =
            "Some generated time blocks are in the past. Please try generating again.";
          setError(pastBlockDateError);
          toast.error(pastBlockDateError);
          setAiResponse(null);
          setLoading(false);
          return;
        }
      }

      setAiResponse(parsedResponse);
    } catch (error) {
      console.error("Error in requestAi:", error);
      if (!navigator.onLine) {
        setError(
          "It looks like you're offline. Please check your internet connection."
        );
        toast.error(
          "It looks like you're offline. Please check your internet connection."
        );
      } else if (error.message.includes("API_KEY_INVALID")) {
        setError("Your Gemini API Key is invalid. Please check and update it.");
        toast.error(
          "Your Gemini API Key is invalid. Please check and update it."
        );
      } else if (error.response) {
        setError("API error: " + (error.response.data || error.message));
        toast.error("API error: " + (error.response.data || error.message));
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
    if (!userPrompt.trim()) {
      toast.error("Please enter a prompt to generate a study plan.");
      setError("Please enter a prompt to generate a study plan.");
      return;
    }
    setError(null);
    setAiResponse(null);
    setGeneratedTasks([]);
    requestAi(userPrompt);
  };

  useEffect(() => {
    if (aiResponse && Object.keys(aiResponse).length > 0) {
      setGeneratedTasks([aiResponse]);
    } else {
      setGeneratedTasks([]);
    }
  }, [aiResponse]);

  const handleAcceptAiResponse = async () => {
    if (!generatedTasks.length || loading) return;

    setLoading(true);
    setError(null);

    try {
      const plan = generatedTasks[0];

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
      toast.success("Study plan and time blocks added successfully!");
      setUserPrompt("");
      setAiResponse(null);
      setGeneratedTasks([]);
      fetchStudyPlans();
    } catch (err) {
      console.error("Error during save process: ", err);
      setError("An unexpected error occurred while saving the study plan.");
      toast.error("An unexpected error occurred while saving the study plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 md:p-8 bg-white text-gray-800 font-sans min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
        AI Study Plan Generator
      </h1>

      {/* Input Form Section */}
      <section className="bg-gray-50 border border-gray-200 rounded-sm shadow-sm p-6 mb-10 transition-all duration-300 hover:shadow-sm">
        <form onSubmit={handleUserPrompt} className="flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Length of Plan */}
            <div className="flex flex-col">
              <label
                htmlFor="planLength"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Plan Length (weeks)
              </label>
              <input
                id="planLength"
                type="number"
                min={1}
                max={52}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
                value={planLength}
                onChange={(e) => setPlanLength(Number(e.target.value))}
              />
            </div>

            {/* Preferred Study Time */}
            <div className="flex flex-col">
              <label
                htmlFor="preferredTime"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Preferred Study Time
              </label>
              <input
                id="preferredTime"
                type="text"
                placeholder="e.g., 7-9pm, mornings, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              />
            </div>

            {/* Additional Notes */}
            <div className="flex flex-col">
              <label
                htmlFor="additionalNotes"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Additional Notes
              </label>
              <input
                id="additionalNotes"
                type="text"
                placeholder="Any other info..."
                className="w-full px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition duration-200 text-gray-900 placeholder-gray-400"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Prompt Input Area */}
          <div className="relative border border-gray-300 rounded-sm focus-within:ring-2 focus-within:ring-gray-500 focus-within:border-transparent transition duration-200 p-3 flex items-end">
            <textarea
              id="userPrompt"
              className="w-full resize-none outline-none border-none bg-transparent text-gray-900 placeholder-gray-400 h-24 sm:h-32 pr-10"
              placeholder="Describe your subject, syllabus, or study goal to generate a study plan..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="absolute bottom-3 right-3 p-2 bg-gray-600 text-white rounded-sm shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={loading}
              aria-label="Generate Study Plan"
            >
              <AiOutlineSend className="text-xl" />
            </button>
          </div>
        </form>
      </section>

      {/* Generated Plan / Status Section */}
      <section className="bg-white border border-gray-200 rounded-sm shadow-sm p-6">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Generated Plan
          </h2>
          {generatedTasks.length > 0 && !error && (
            <button
              onClick={handleAcceptAiResponse}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-sm shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Accept Plan"}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm flex items-start gap-3 mb-4">
            <FaTriangleExclamation className="text-red-500 text-2xl mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-sm h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="ml-4 text-gray-600 text-lg">
              Generating your plan...
            </p>
          </div>
        ) : (
          <div>
            {generatedTasks?.length > 0 ? (
              generatedTasks.map((plan, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 border border-gray-200 rounded-sm p-5 mb-6 shadow-sm"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-gray-700 mb-3">{plan.description}</p>
                  <div className="text-sm text-gray-600 mb-4 border-t border-b border-gray-100 py-2">
                    <p>
                      <strong>Start Date:</strong>{" "}
                      {new Date(plan.start_date).toLocaleString()}
                    </p>
                    <p>
                      <strong>End Date:</strong>{" "}
                      {new Date(plan.end_date).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
                      Time Blocks:
                    </h4>
                    {plan.timeBlocks?.map((block, bIdx) => (
                      <div
                        key={bIdx}
                        className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm hover:shadow-sm transition-shadow duration-200"
                      >
                        <p className="font-bold text-gray-900">{block.job}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {block.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <span className="mr-2 text-gray-400">🕒</span>
                          {new Date(block.start_time).toLocaleDateString()}{" "}
                          {new Date(block.start_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {new Date(block.end_time).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-500 text-lg">
                Your AI-generated study plan will appear here.
                <p className="text-sm text-gray-400 mt-2">
                  Enter your study goals above and click "Send" to generate a
                  plan.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default AiGeneratedTask;
