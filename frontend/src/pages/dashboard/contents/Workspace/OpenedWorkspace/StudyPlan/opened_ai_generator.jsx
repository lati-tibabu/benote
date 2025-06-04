import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import { FaExclamationCircle } from "react-icons/fa"; // Changed icon for a softer look
import { useSelector } from "react-redux";

const OpenedAIStudyGenerators = ({ plan, onSuccess }) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedBlocks, setGeneratedBlocks] = useState([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const userData = useSelector((state) => state.auth.user);

  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem("geminiApiKey");
  const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  const model = genAI
    ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    : null;

  // Helper function to check for time block overlaps
  const checkBlockOverlap = useCallback(
    (newBlockStart, newBlockEnd, existingBlocks) => {
      const newStart = new Date(newBlockStart).getTime();
      const newEnd = new Date(newBlockEnd).getTime();

      for (const existingBlock of existingBlocks) {
        const existingStart = new Date(existingBlock.start_time).getTime();
        const existingEnd = new Date(existingBlock.end_time).getTime();

        // Check for overlap: (start1 < end2 && end1 > start2)
        if (newStart < existingEnd && newEnd > existingStart) {
          return true; // Overlap detected
        }
      }
      return false; // No overlap
    },
    []
  );

  // Only generate time blocks for the current plan
  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
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
      required: ["timeBlocks"],
    },
  };

  const requestAi = async (prompt) => {
    setLoading(true);
    setError(null);
    setAiResponse(null); // Clear previous AI response on new request
    setGeneratedBlocks([]); // Clear previous generated blocks

    try {
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
      if (!plan || !plan.id || !plan.start_date || !plan.end_date) {
        const errorMessage =
          "Invalid study plan provided. Cannot generate time blocks.";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      const currentPlanStartDate = new Date(plan.start_date);
      const currentPlanEndDate = new Date(plan.end_date);
      const now = new Date();

      // Filter existing blocks for only those within the plan's future duration
      const relevantExistingBlocks = (plan.timeBlocks || []).filter(
        (block) =>
          new Date(block.start_time) >= now && // Only consider blocks that are in the future
          new Date(block.start_time) >= currentPlanStartDate &&
          new Date(block.end_time) <= currentPlanEndDate
      );

      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {
                text: `
                You are an expert study plan assistant. Your task is to generate a set of 1-hour time blocks for an existing study plan, based on the user's prompt.
                
                Study Plan Context:
                - Title: ${plan?.title}
                - Description: ${plan?.description}
                - Plan Start Date (inclusive): ${plan?.start_date}
                - Plan End Date (inclusive): ${plan?.end_date}
                - Current Date & Time: ${now.toISOString()}
                
                Instructions for generating time blocks:
                1. Only generate an array of timeBlock objects (do NOT return a full plan object or any other top-level properties).
                2. Each timeBlock must be exactly 1 hour long.
                3. The 'start_time' and 'end_time' for each block must be ISO 8601 date-time strings (e.g., "YYYY-MM-DDTHH:00:00Z"). The time portion must be exactly on the hour (e.g., 10:00, 11:00).
                4. All generated time blocks MUST fall entirely within the 'Plan Start Date' and 'Plan End Date' provided above.
                5. All generated time blocks MUST start AFTER the 'Current Date & Time' provided above.
                6. STRICT RULE for Overlaps: Do NOT generate any time blocks that overlap with the following existing time blocks for this plan:
                   ${JSON.stringify(relevantExistingBlocks)}
                   (Consider both existing blocks provided and blocks you might generate in the same response to avoid self-overlap).
                7. If the user's prompt requests more hours than can be accommodated without overlap within the plan's duration and after the current time, generate as many valid blocks as possible.
                8. For each block, provide a concise 'job' (e.g., "Math Revision", "History Reading") and a brief 'description' of what will be done.
                9. Only use information directly from the user's prompt and the provided plan context. Do not invent or add extra tasks/subjects.
                10. Strictly follow the responseSchema: { "timeBlocks": [ { /* block object */ }, ... ] }
                
                User prompt for new time blocks: ${prompt}
                `,
              },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(prompt);
      let responseText = result.response.text();

      // Clean up potential markdown formatting if AI wraps JSON in ```json...```
      if (responseText.startsWith("```json") && responseText.endsWith("```")) {
        responseText = responseText
          .substring(7, responseText.length - 3)
          .trim();
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        const parseErrorMsg = `AI response could not be parsed as JSON. Please try again. Raw response: ${responseText.substring(
          0,
          200
        )}... (truncated)`;
        setError(parseErrorMsg);
        toast.error(parseErrorMsg);
        setLoading(false);
        return;
      }

      // Validate the structure of the AI response
      if (!parsed || !Array.isArray(parsed.timeBlocks)) {
        const structureError =
          "AI response has an invalid structure. Expected an object with a 'timeBlocks' array.";
        setError(structureError);
        toast.error(structureError);
        setLoading(false);
        return;
      }

      // --- Client-side validation of generated blocks ---
      const validBlocks = [];
      const parentPlanStartDate = new Date(plan.start_date);
      const parentPlanEndDate = new Date(plan.end_date);

      // Combine existing blocks with currently generated blocks to check for total overlaps
      let allBlocksForOverlapCheck = [...relevantExistingBlocks]; // Start with existing future blocks

      for (const newBlock of parsed.timeBlocks) {
        const newBlockStart = new Date(newBlock.start_time);
        const newBlockEnd = new Date(newBlock.end_time);

        // 1. Check if block is exactly 1 hour
        if (newBlockEnd.getTime() - newBlockStart.getTime() !== 3600000) {
          // 1 hour in milliseconds
          console.warn("Skipping block: Not exactly 1 hour long", newBlock);
          continue;
        }

        // 2. Check if block is within parent plan's dates
        if (
          newBlockStart < parentPlanStartDate ||
          newBlockEnd > parentPlanEndDate
        ) {
          console.warn(
            "Skipping block: Outside parent plan's date range",
            newBlock
          );
          setError(
            "Some generated blocks are outside the study plan's date range."
          );
          continue;
        }

        // 3. Check if block is in the future
        if (newBlockStart < now) {
          console.warn("Skipping block: Starts in the past", newBlock);
          setError(
            "Some generated blocks are in the past. Please regenerate or adjust your prompt."
          );
          continue;
        }

        // 4. Check for overlap with existing blocks OR other newly generated blocks
        if (
          checkBlockOverlap(
            newBlock.start_time,
            newBlock.end_time,
            allBlocksForOverlapCheck
          )
        ) {
          console.warn(
            "Skipping block: Overlaps with existing or other generated blocks",
            newBlock
          );
          setError(
            "Some generated blocks overlap with existing or newly proposed blocks. Please regenerate."
          );
          continue;
        }

        // If all checks pass, add to valid blocks and to our running list for overlap checks
        validBlocks.push(newBlock);
        allBlocksForOverlapCheck.push(newBlock); // Add to the list to check subsequent generated blocks against
      }

      if (validBlocks.length === 0 && parsed.timeBlocks.length > 0) {
        // If AI generated blocks but none were valid, set an error
        setError(
          "AI generated blocks, but none were valid or all had issues (e.g., overlaps, out of range). Please refine your prompt."
        );
      } else if (validBlocks.length < parsed.timeBlocks.length) {
        // If some blocks were valid but others were discarded
        toast.warn(
          "Some generated time blocks had issues and were not included."
        );
      }

      setGeneratedBlocks(validBlocks); // Only set valid blocks
      if (validBlocks.length > 0) {
        toast.success("Time blocks generated successfully! Review and save.");
      } else if (!error) {
        // If no other specific error was set
        setError(
          "AI could not generate any valid time blocks based on your request and plan constraints."
        );
        toast.info("AI could not generate any valid time blocks.");
      }
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
        setError(
          "An unexpected error occurred. Please try again. " + error.message
        );
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
      toast.error("Please enter a prompt to generate time blocks.");
      setError("Please enter a prompt to generate time blocks.");
      return;
    }
    if (!plan || !plan.id) {
      toast.error("No study plan selected to generate time blocks for.");
      setError("No study plan selected.");
      return;
    }
    setError(null);
    setAiResponse(null);
    setGeneratedBlocks([]); // Clear previous generated blocks
    requestAi(userPrompt);
  };

  // Save generated time blocks to backend
  const handleAcceptAiResponse = async () => {
    if (!generatedBlocks.length) return;
    setLoading(true);
    setError(null);
    try {
      // Bulk insert if your API supports it, otherwise loop
      const timeBlocksToSave = generatedBlocks.map((block) => ({
        ...block,
        user_id: userData?.id,
        workspace_id: plan?.workspace_id,
        study_plan_id: plan?.id,
      }));

      const res = await fetch(`${apiURL}/api/timeBlocks`, {
        // Assuming a bulk endpoint
        method: "POST",
        headers: header,
        body: JSON.stringify(timeBlocksToSave),
      });

      if (!res.ok) {
        let errMsg = "Failed to save time blocks.";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (jsonErr) {
          errMsg = `Failed to save time blocks (status: ${res.status}).`;
        }
        throw new Error(errMsg);
      }

      toast.success("Time blocks added to plan successfully!");
      setUserPrompt("");
      setAiResponse(null);
      setGeneratedBlocks([]);
      if (onSuccess) onSuccess(); // Callback to parent to refresh plan data
    } catch (err) {
      console.error("Error saving time blocks:", err);
      setError(`Failed to save time blocks: ${err.message}`);
      toast.error(`Failed to save time blocks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate suggested prompts using AI on mount
  useEffect(() => {
    const fetchSuggestedPrompts = async () => {
      if (!apiKey || !genAI || !model || !plan || !plan.title) return;
      setLoadingSuggestions(true);
      setSuggestedPrompts([]);
      try {
        const suggestionPrompt = `You are an expert study assistant. Given the following study plan context, generate 3 creative, helpful, and diverse prompts a student might use to generate 1-hour study time blocks. Each prompt should be concise, actionable, and relevant to the plan. Return ONLY a JSON array of strings, no explanations or extra text.\n\nStudy Plan Title: ${
          plan.title
        }\nDescription: ${
          plan.description || "No description"
        }\nPlan Start Date: ${plan.start_date}\nPlan End Date: ${
          plan.end_date
        }`;
        const chatSession = model.startChat({
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 512,
            responseMimeType: "application/json",
          },
          history: [
            {
              role: "user",
              parts: [{ text: suggestionPrompt }],
            },
          ],
        });
        const result = await chatSession.sendMessage(suggestionPrompt);
        let responseText = result.response.text();
        if (
          responseText.startsWith("```json") &&
          responseText.endsWith("```")
        ) {
          responseText = responseText
            .substring(7, responseText.length - 3)
            .trim();
        }
        let prompts = [];
        try {
          prompts = JSON.parse(responseText);
          if (!Array.isArray(prompts)) prompts = [];
        } catch {
          prompts = [];
        }
        setSuggestedPrompts(prompts);
      } catch (e) {
        setSuggestedPrompts([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestedPrompts();
    // eslint-disable-next-line
  }, [apiKey, plan?.id]);

  return (
    <div className="bg-white p-6 rounded-xl overflow-auto shadow-lg max-w-2xl mx-auto max-h-[70vh] my-8 font-sans text-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
        AI Time Block Generator
      </h2>
      <div className="text-lg font-semibold text-blue-700 mb-5">
        For Plan:{" "}
        <span className="text-gray-800">
          {plan?.title || "No Plan Selected"}
        </span>
      </div>

      {/* Input Form Section */}
      <section className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-6 mb-8 transition-all duration-300 hover:shadow-md">
        <form onSubmit={handleUserPrompt} className="flex flex-col space-y-4">
          {/* Suggested Prompts Section */}
          {(loadingSuggestions || suggestedPrompts.length > 0) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {loadingSuggestions ? (
                <span className="text-gray-400 text-sm">
                  Loading suggestions...
                </span>
              ) : (
                suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition border border-blue-200"
                    onClick={() => {
                      setUserPrompt(prompt);
                      setError(null);
                      setAiResponse(null);
                      setGeneratedBlocks([]);
                      requestAi(prompt);
                    }}
                  >
                    {prompt}
                  </button>
                ))
              )}
            </div>
          )}

          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 min-h-[100px] text-gray-900 placeholder-gray-500 resize-none"
            placeholder="Describe what study blocks you need, e.g., 'Generate 3 hours of Math exercises for tomorrow morning', 'Add 2 hours of history reading on Wednesday afternoon'."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            aria-label="Enter your prompt for time block generation"
          ></textarea>
          <button
            type="submit"
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-2"></span>
            ) : (
              <AiOutlineSend className="text-xl mr-2" />
            )}
            Generate Time Blocks
          </button>
        </form>
      </section>

      {/* Generated Blocks / Status Section */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Review Generated Blocks
          </h3>
          {generatedBlocks.length > 0 && !error && (
            <button
              onClick={handleAcceptAiResponse}
              disabled={loading}
              className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save to Plan"}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 mb-4 text-sm">
            <FaExclamationCircle className="text-red-500 text-xl mt-0.5" />{" "}
            {/* Softer icon */}
            <p className="font-medium">{error}</p>
          </div>
        )}

        {loading && !error ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-3"></div>
            <p>Generating...</p>
          </div>
        ) : (
          <div className="mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {generatedBlocks.length > 0 ? (
              <div className="space-y-3">
                {generatedBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <p className="font-bold text-gray-900 text-base mb-1">
                      {block.job}
                    </p>
                    <p className="text-sm text-gray-700">{block.description}</p>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <span className="mr-1 text-gray-400 text-sm">🕒</span>
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
            ) : (
              <div className="py-8 text-center text-gray-500">
                AI-generated time blocks will appear here.
                <p className="text-sm text-gray-400 mt-1">
                  Specify what you want to study within the plan.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default OpenedAIStudyGenerators;
