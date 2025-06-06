import React, { useState, useEffect } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { FiSettings, FiEye, FiEyeOff } from "react-icons/fi";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";

const AiGeneratedNote = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [currentNoteTitle, setCurrentNoteTitle] = useState("");
  const [currentNoteContent, setCurrentNoteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { workspaceId } = useParams();

  // Generation options
  const [noteLength, setNoteLength] = useState("medium");
  const [noteTone, setNoteTone] = useState("professional");
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeLatex, setIncludeLatex] = useState(false);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(false);
  const [noteType, setNoteType] = useState("general");

  // Settings visibility
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(true);

  // Follow-up suggestions
  const [followUpSuggestions, setFollowUpSuggestions] = useState([]);

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

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.user) || {};

  // Chat history
  const [chatHistory, setChatHistory] = useState([]);

  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
        },
        content: {
          type: "string",
        },
        followUps: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: ["title", "content"],
    },
  };

  const requestAi = async (prompt, currentNoteContentForContext = "") => {
    setLoading(true);
    setError(null);
    setCurrentNoteTitle("");
    setCurrentNoteContent("");
    setFollowUpSuggestions([]);

    if (!genAI || !model) {
      toast.error("Gemini API Key is not set or invalid!");
      setLoading(false);
      return;
    }

    const initialSystemPrompt = noteGenerationPrompt(
      userData?.name,
      noteLength,
      noteTone,
      includeEmojis,
      includeLatex,
      includeTableOfContents,
      noteType
    );

    const fullPrompt = currentNoteContentForContext
      ? `Given the following note content, apply the instruction: "${prompt}"\n\nNote content:\n${currentNoteContentForContext}`
      : prompt;

    try {
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", parts: [{ text: fullPrompt }] },
      ]);

      const chatSession = model.startChat({
        generationConfig,
        history:
          chatHistory.length > 0
            ? chatHistory
            : [
                {
                  role: "user",
                  parts: [{ text: initialSystemPrompt }],
                },
              ],
      });

      const result = await chatSession.sendMessage(fullPrompt);
      const responseText = result.response.text();
      const parsedResponse = JSON.parse(responseText);

      setCurrentNoteTitle(parsedResponse.title);
      setCurrentNoteContent(parsedResponse.content);
      setFollowUpSuggestions(parsedResponse.followUps || []);

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { role: "model", parts: [{ text: responseText }] },
      ]);
    } catch (error) {
      console.error("Error requesting AI:", error);
      setError(
        "Failed to generate/modify note. Please check your API key and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUserPrompt = (e) => {
    e.preventDefault();
    if (!apiKey || apiKey.length === 0) {
      toast.error("API Key is invalid or missing! Please set it.");
      return;
    }
    if (userPrompt.trim()) {
      requestAi(userPrompt, currentNoteContent);
      setUserPrompt("");
    } else {
      toast.info("Please enter a prompt to generate or modify the note.");
    }
  };

  const handleFollowUpClick = (followUpText) => {
    setUserPrompt(followUpText);
  };

  const handleAcceptAiResponse = async () => {
    if (!currentNoteTitle || !currentNoteContent) {
      toast.warn("No note content to accept.");
      return;
    }
    try {
      const noteDataToSave = {
        owned_by: userData?.id,
        workspace_id: workspaceId,
        title: currentNoteTitle,
        content: currentNoteContent,
      };

      const response = await fetch(`${apiURL}/api/notes`, {
        method: "POST",
        body: JSON.stringify(noteDataToSave),
        headers: header,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Something went wrong while saving the note."
        );
      }

      const data = await response.json();
      const noteId = data.id;

      toast.success("Note successfully added to your workspace!");
      setCurrentNoteTitle("");
      setCurrentNoteContent("");
      setUserPrompt("");
      setChatHistory([]);
      setFollowUpSuggestions([]);

      navigate(`/app/workspace/open/${workspaceId}/notes/${noteId}`);
    } catch (err) {
      console.error("Error creating note: ", err);
      toast.error(`Error saving note: ${err.message}`);
    }
  };

  const handleReset = () => {
    setUserPrompt("");
    setCurrentNoteTitle("");
    setCurrentNoteContent("");
    setLoading(false);
    setError(null);
    setChatHistory([]);
    setFollowUpSuggestions([]);
    setNoteLength("medium");
    setNoteTone("professional");
    setIncludeEmojis(true);
    setIncludeLatex(false);
    setIncludeTableOfContents(false);
    setNoteType("general");
    setShowSettings(false);
    setShowChatHistory(true);
    toast.info("All fields reset!");
  };

  const noteGenerationPrompt = (
    userName,
    length,
    tone,
    emojis,
    latex,
    toc,
    type
  ) => {
    const todayDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    let lengthInstruction = "";
    if (length === "short") {
      lengthInstruction =
        "Keep the note very concise, focusing on main points.";
    } else if (length === "medium") {
      lengthInstruction = "Provide a moderately detailed note.";
    } else if (length === "long") {
      lengthInstruction = "Generate a detailed and comprehensive note.";
    } else if (length === "very long") {
      lengthInstruction =
        "Generate the most extensive and detailed output possible.";
    }

    let toneInstruction = "";
    switch (tone) {
      case "formal":
        toneInstruction = "Maintain a formal and objective tone.";
        break;
      case "informal":
        toneInstruction = "Use an informal and conversational tone.";
        break;
      case "friendly":
        toneInstruction = "Adopt a friendly and approachable tone.";
        break;
      case "professional":
        toneInstruction = "Ensure a professional and business-like tone.";
        break;
      case "academic":
        toneInstruction = "Write in an academic and scholarly tone.";
        break;
      case "humorous":
        toneInstruction =
          "Inject humor where appropriate, while remaining informative.";
        break;
      default:
        toneInstruction = "Maintain a professional yet simple tone.";
    }

    const emojiInstruction = emojis
      ? "Add relevant emojis to make the note more engaging and to the title."
      : "Do not include any emojis in the note or its title.";
    const latexInstruction = latex
      ? "For mathematical equations and scientific notations, use LaTeX formatting enclosed by '$' for inline equations and '$$' for block equations."
      : "Do not use LaTeX formatting; represent equations plainly.";
    const tocInstruction = toc
      ? "If the note is long and has multiple sections, include a Table of Contents at the beginning."
      : "Do not include a Table of Contents.";

    let typeSpecificInstruction = "";
    switch (type) {
      case "lecture note":
        typeSpecificInstruction =
          "Structure the note as if it's a lecture summary, highlighting key concepts, definitions, and examples.";
        break;
      case "code assist":
        typeSpecificInstruction =
          "Focus on providing code examples, explanations of programming concepts, and best practices. Use code blocks extensively.";
        break;
      case "meeting minutes":
        typeSpecificInstruction =
          "Format the note as meeting minutes, including attendees, agenda items, discussions, decisions, and action items.";
        break;
      case "research summary":
        typeSpecificInstruction =
          "Summarize research findings, methodologies, results, and conclusions in a structured academic format.";
        break;
      case "general":
      default:
        typeSpecificInstruction = ""; // No specific instruction needed for general notes
    }

    return `
      You are now an intelligent note assistant. Your task is to assist the user by either restructuring large text inputs into well-organized Markdown format or generating structured notes from scratch based on a topic. You also need to be able to modify existing notes based on user instructions. After generating the note, suggest 1-3 concise follow-up questions or actions related to the generated note, structured as a JSON array of strings under the key "followUps". These follow-ups should be distinct from the note content itself.

      ## Instructions:

      ### **1. If the user provides a large text or topic to generate a note:**
        - Extract key concepts and main ideas.
        - Organize the information into clear sections with appropriate Markdown headers (\`#\`, \`##\`, \`###\`).
        - Retain important details while improving clarity and readability.
        - Preserve bullet points, numbered lists, and code blocks if present.
        - Maintain logical flow and concise phrasing without losing meaning.

      ### **2. If the user asks to modify an existing note (which will be provided as context):**
        - Understand the modification request (e.g., "summarize this section," "expand on point X," "change tone to Y," "add an example for Z").
        - Apply the requested changes precisely to the provided note content.
        - **Crucially, output the ENTIRE modified note content, not just the changed part.**
        - Ensure the modified note still adheres to the general guidelines below, unless explicitly overridden by the modification request.

      ### **3. If the user asks for a new topic:**
        - Suggest **one or more relevant topics** related to the user’s interest.
        - Format them as a list, including a brief description of each topic.
        - Keep the suggestions useful and educational, ensuring relevance to the user's context.

      ## General Guidelines:
        - The current user name is ${
          userName ? userName : "User"
        }. If the name is not correctly present as it is loaded dynamically, please refer to the user as "User".
        - **Length Preference**: ${lengthInstruction}
        - **Tone Preference**: ${toneInstruction}
        - **Emojis**: ${emojiInstruction}
        - **LaTeX Formulas**: ${latexInstruction}
        - **Table of Contents**: ${tocInstruction}
        - **Note Type Focus**: ${typeSpecificInstruction}
        - **Never** add extra information beyond what is relevant to the user’s request, unless it's a direct part of note generation/modification.
        - Always format notes in **Markdown** for readability and usability.
        - Use **tables, code blocks, or quotes** if needed for better organization.
        - Ensure a professional yet simple tone that is user-friendly.
        - Keep responses **well-structured, logical, and useful**.
        - Use **clear headings** and **subheadings** to organize content effectively.
        - You can perform internal searches or use your existing knowledge to fulfill the request.
        - Today's date is ${todayDate} and the current time is ${currentTime}.
        - Do not explicitly state that you are generating a "very long" output if that option is selected. Just generate it.
        - **IMPORTANT**: Your response must be a JSON object with 'title' (string), 'content' (string), and 'followUps' (array of strings) properties. Example: \`{"title": "My Note", "content": "This is my note content.", "followUps": ["What about X?", "Can you expand on Y?"]}\`
      `;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full p-4 bg-gray-50 rounded-md overflow-hidden">
      {/* Left Panel */}
      <div className="w-full lg:w-2/5 p-4 bg-white rounded-md lg:mr-4 flex flex-col h-full overflow-y-auto border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 leading-tight">
            AI Note Assistant
          </h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 ease-in-out"
            title={showSettings ? "Hide Settings" : "Show Settings"}
          >
            <FiSettings className="text-xl" />
          </button>
        </div>

        {/* Note Generation Settings */}
        <div
          className={`relative z-10 transition-all duration-300 ease-in-out ${
            showSettings
              ? "max-h-screen opacity-100 mb-6"
              : "max-h-0 opacity-0 mb-0"
          }`}
          style={{
            transform: showSettings ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          {showSettings && (
            <div className="p-4 bg-white border border-gray-200 rounded-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Generation Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Note Length */}
                <div>
                  <label
                    htmlFor="noteLength"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Note Length
                  </label>
                  <div className="relative">
                    <select
                      id="noteLength"
                      className="block text-gray-800 bg-white w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 appearance-none transition-all duration-200 ease-in-out"
                      value={noteLength}
                      onChange={(e) => setNoteLength(e.target.value)}
                    >
                      <option value="short">Short & Sweet</option>
                      <option value="medium">Medium Detail</option>
                      <option value="long">Comprehensive</option>
                      <option value="very long">Extensive</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Note Tone */}
                <div>
                  <label
                    htmlFor="noteTone"
                    className="block text-gray-800 bg-white text-sm font-medium mb-2"
                  >
                    Tone
                  </label>
                  <div className="relative">
                    <select
                      id="noteTone"
                      className="block text-gray-800 bg-white w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200 ease-in-out"
                      value={noteTone}
                      onChange={(e) => setNoteTone(e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="academic">Academic</option>
                      <option value="friendly">Friendly</option>
                      <option value="informal">Informal</option>
                      <option value="formal">Formal</option>
                      <option value="humorous">Humorous</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Note Type/Purpose */}
                <div>
                  <label
                    htmlFor="noteType"
                    className="block text-gray-800 bg-white text-sm font-medium  mb-2"
                  >
                    Note Type
                  </label>
                  <div className="relative">
                    <select
                      id="noteType"
                      className="block text-black bg-white w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200 ease-in-out"
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                    >
                      <option value="general">General Note</option>
                      <option value="lecture note">Lecture Note</option>
                      <option value="code assist">Code Assist</option>
                      <option value="meeting minutes">Meeting Minutes</option>
                      <option value="research summary">Research Summary</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  {/* Checkbox: Emojis */}
                  <div className="flex items-center group">
                    <input
                      id="includeEmojis"
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-colors duration-200"
                      checked={includeEmojis}
                      onChange={(e) => setIncludeEmojis(e.target.checked)}
                    />
                    <label
                      htmlFor="includeEmojis"
                      className="ml-2 block text-base font-medium text-gray-800 select-none cursor-pointer group-hover:text-blue-700 transition-colors duration-200"
                    >
                      Emojis
                    </label>
                  </div>

                  {/* Checkbox: LaTeX */}
                  <div className="flex items-center group">
                    <input
                      id="includeLatex"
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-colors duration-200"
                      checked={includeLatex}
                      onChange={(e) => setIncludeLatex(e.target.checked)}
                    />
                    <label
                      htmlFor="includeLatex"
                      className="ml-2 block text-base font-medium text-gray-800 select-none cursor-pointer group-hover:text-blue-700 transition-colors duration-200"
                    >
                      LaTeX
                    </label>
                  </div>

                  {/* Checkbox: Table of Contents */}
                  <div className="flex items-center group">
                    <input
                      id="includeTableOfContents"
                      type="checkbox"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-colors duration-200"
                      checked={includeTableOfContents}
                      onChange={(e) =>
                        setIncludeTableOfContents(e.target.checked)
                      }
                    />
                    <label
                      htmlFor="includeTableOfContents"
                      className="ml-2 block text-base font-medium text-gray-800 select-none cursor-pointer group-hover:text-blue-700 transition-colors duration-200"
                    >
                      Table of Contents
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2 p-3 bg-gray-50 rounded-t-md border border-b-0 border-gray-200 sticky top-0 z-10">
            <h3 className="text-lg font-semibold text-gray-800">
              Chat History
            </h3>
            <button
              onClick={() => setShowChatHistory(!showChatHistory)}
              className="p-1.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              title={
                showChatHistory ? "Hide Chat History" : "Show Chat History"
              }
            >
              {showChatHistory ? (
                <FiEyeOff className="text-lg" />
              ) : (
                <FiEye className="text-lg" />
              )}
            </button>
          </div>
          {showChatHistory && (
            <div className="flex-1 min-h-[10rem] max-h-[20rem] overflow-y-auto p-3 bg-gray-50 rounded-b-md border border-t-0 border-gray-200">
              {chatHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-2">
                  Your conversation with AI will appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md ${
                        message.role === "user"
                          ? "bg-blue-50 text-blue-900 self-end ml-auto"
                          : "bg-gray-100 text-gray-800 self-start mr-auto"
                      }`}
                    >
                      <strong className="capitalize">
                        {message.role === "user" ? "You" : "AI"}:
                      </strong>
                      {message.role === "model"
                        ? (() => {
                            try {
                              const parsed = JSON.parse(message.parts[0].text);
                              return (
                                <div>
                                  <p className="font-semibold">
                                    {parsed.title}
                                  </p>
                                  <MarkdownRenderer content={parsed.content} />
                                </div>
                              );
                            } catch (e) {
                              return message.parts[0].text;
                            }
                          })()
                        : message.parts[0].text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Follow-up Suggestions */}
        {followUpSuggestions.length > 0 && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-md border border-indigo-200">
            <h3 className="text-md font-semibold text-indigo-800 mb-2">
              Quick Follow-ups:
            </h3>
            <div className="flex flex-wrap gap-2">
              {followUpSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleFollowUpClick(suggestion)}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200 ease-in-out"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Prompt Input */}
        <form
          className="mt-auto p-3 flex items-center rounded-md focus-within:ring-2 focus-within:ring-blue-300 transition-all duration-200 ease-in-out bg-white border border-gray-200"
          onSubmit={handleUserPrompt}
        >
          <textarea
            className="flex-grow bg-transparent text-gray-800 placeholder-gray-500 outline-none border-none resize-none px-2 py-1 text-md font-medium"
            placeholder={
              currentNoteContent
                ? "Refine this note: summarize, expand, change tone, add examples..."
                : "What topic do you need a note on, or what text to restructure?"
            }
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={2}
          ></textarea>
          <button
            type="submit"
            className="ml-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-transform transform hover:scale-105 active:scale-95 duration-200 flex-shrink-0"
            title="Send to AI"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <AiOutlineSend className="text-xl" />
            )}
          </button>
        </form>

        {/* Reset Button */}
        <div className="mt-4 text-center">
          <button
            onClick={handleReset}
            className="px-4 py-1 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Right Panel: AI Response Display */}
      <div className="w-full lg:w-3/5 p-4 bg-white rounded-md lg:ml-4 flex flex-col h-full overflow-y-auto border border-gray-200 mt-4 lg:mt-0">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          {loading && !currentNoteTitle ? (
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          ) : (
            <input
              type="text"
              className="text-2xl font-semibold text-gray-900 border-none outline-none w-full bg-transparent placeholder-gray-400 focus:ring-0"
              value={currentNoteTitle || ""}
              onChange={(e) => setCurrentNoteTitle(e.target.value)}
              placeholder="Untitled Note"
            />
          )}

          {(currentNoteTitle || currentNoteContent) && !loading && (
            <button
              className="ml-3 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 flex-shrink-0"
              onClick={handleAcceptAiResponse}
              disabled={loading}
            >
              Accept & Save
            </button>
          )}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-semibold">Generation Error:</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-1 opacity-80">
                Please verify your Gemini API key and try again.
              </p>
            </div>
          </div>
        )}

        <div className="flex-grow min-h-[150px] relative">
          {loading && !currentNoteContent ? (
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-11/12 animate-pulse delay-75"></div>
              <div className="h-5 bg-gray-200 rounded w-10/12 animate-pulse delay-150"></div>
              <div className="h-5 bg-gray-200 rounded w-full animate-pulse delay-200"></div>
              <div className="h-5 bg-gray-200 rounded w-9/12 animate-pulse delay-250"></div>
            </div>
          ) : (
            <div className="prose max-w-none mt-2 py-1 text-gray-800">
              <MarkdownRenderer content={currentNoteContent} />
              {!currentNoteContent && !loading && !error && (
                <div className="text-center text-gray-500 text-lg py-8 border border-dashed border-gray-300 rounded-md bg-gray-50">
                  <p className="mb-1">
                    Your AI-generated note will appear here.
                  </p>
                  <p>
                    Start by entering a prompt or selecting your preferences on
                    the left.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiGeneratedNote;
