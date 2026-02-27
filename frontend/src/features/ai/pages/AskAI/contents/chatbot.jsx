import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  AiOutlineSend,
  AiOutlineCode,
  AiOutlinePicture,
  AiOutlineEdit,
  AiOutlineBulb,
  AiOutlineCalendar,
  AiOutlinePlus,
} from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import {
  PiGearSixBold,
  PiChatCircle,
  PiFolder,
  PiCheckCircle,
  PiTrash,
} from "react-icons/pi";

import MarkdownRenderer from "@features/notes/components/markdown-renderer";

function Chatbot({ initialPrompt = "" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [genAI, setGenAI] = useState(null);
  const [chatSession, setChatSession] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [actionResult, setActionResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const [chatSessions, setChatSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTargetType, setAddTargetType] = useState("task");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [sourceContent, setSourceContent] = useState("");
  const [isAddingContent, setIsAddingContent] = useState(false);

  const [aiTone, setAiTone] = useState("Friendly");
  const [aiPurpose, setAiPurpose] = useState("Everyday assistant");
  const [aiOther, setAiOther] = useState("");
  const [assistantMode, setAssistantMode] = useState("General");
  const [outputStyle, setOutputStyle] = useState("Actionable");

  const messagesEndRef = useRef(null);
  const hasSentInitialPrompt = useRef(false);
  const navigate = useNavigate();

  const apiKey = localStorage.getItem("geminiApiKey");
  const token = localStorage.getItem("jwt");
  const selectedModel =
    localStorage.getItem("geminiModel") ||
    import.meta.env.VITE_DEFAULT_GEMINI_MODEL ||
    "gemini-2.5-flash";

  const userData = useSelector((state) => state.auth.user) || {};
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const useGemini = localStorage.getItem("useGemini") === "true";

  const generationConfig = {
    temperature: 0.45,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  };

  const modeOptions = [
    "General",
    "Coding",
    "Debugging",
    "Writing",
    "Study",
    "Image prompts",
  ];
  const outputStyles = ["Actionable", "Detailed", "Concise", "Step-by-step"];

  const quickActions = [
    {
      label: "Draft content",
      icon: AiOutlineEdit,
      mode: "Writing",
      prompt:
        "Help me draft a concise professional announcement post. Ask me 3 quick questions first.",
    },
    {
      label: "Generate image prompt",
      icon: AiOutlinePicture,
      mode: "Image prompts",
      prompt:
        "Create a high-quality image prompt for a modern productivity app hero section illustration. Include style, lighting, composition, and a negative prompt.",
    },
    {
      label: "Debug code",
      icon: AiOutlineCode,
      mode: "Debugging",
      prompt:
        "Help me debug this issue. Ask for error logs and environment details, then give me a fix checklist.",
    },
    {
      label: "Plan my day",
      icon: AiOutlineCalendar,
      mode: "General",
      prompt:
        "Build a practical day plan with deep-work blocks, breaks, and priorities based on typical work hours.",
    },
    {
      label: "Brainstorm ideas",
      icon: AiOutlineBulb,
      mode: "General",
      prompt: "Give me 10 creative ideas and rank the top 3 with reasons.",
    },
  ];

  const checkUserIntent = (userMessage) => {
    const toolCalls = [];
    const lowerMessage = userMessage.toLowerCase();

    const workspaceMatch = lowerMessage.match(
      /(?:create|make|add)\s+(?:a\s+)?(?:new\s+)?workspace(?:\s+(?:called|named))?\s+(.+)/i
    );
    if (workspaceMatch) {
      let name = workspaceMatch[1].trim();
      name = name.replace(/[.,!?]$/, "");
      toolCalls.push({
        tool: "create_workspace",
        args: {
          name,
          description: "",
          owned_by: userData.id,
        },
      });
    }

    const taskMatch = lowerMessage.match(
      /(?:create|make|add)\s+(?:a\s+)?(?:new\s+)?task(?:\s+(?:called|named))?\s+(.+)/i
    );
    if (taskMatch) {
      let title = taskMatch[1].trim();
      title = title.replace(/[.,!?]$/, "");
      toolCalls.push({
        tool: "create_task",
        args: {
          title,
          description: "",
          status: "todo",
          assigned_to: userData.id,
        },
      });
    }

    if (/(?:list|show|get|fetch|my)\s+(?:my\s+)?workspaces/i.test(lowerMessage)) {
      toolCalls.push({
        tool: "list_workspaces",
        args: {},
      });
    }

    return toolCalls;
  };

  const buildAssistantInstruction = () => {
    const customInstruction = aiOther?.trim()
      ? `\nCustom instruction: ${aiOther.trim()}`
      : "";

    return [
      `Current Date: ${currentDate}`,
      `Logged-in User: ${userData.name || "Unknown User"}`,
      `User Email: ${userData.email || "Unknown Email"}`,
      "",
      "You are Benote AI, a practical assistant inside a productivity app.",
      "You can help with everyday tasks, coding, debugging, writing, brainstorming, study planning, and content creation.",
      "If users ask for image generation, provide strong image prompts and concept directions.",
      "Do not claim to render final images unless a dedicated image generation tool is available.",
      "When users ask for coding/debugging help, provide clear steps and runnable examples.",
      "When system action results are provided, acknowledge them naturally and continue helping.",
      "Be concise and useful.",
      "",
      `Preferred tone: ${aiTone}`,
      `Purpose profile: ${aiPurpose}`,
      `Current mode: ${assistantMode}`,
      `Output style: ${outputStyle}`,
      customInstruction,
    ].join("\n");
  };

  const executeMcpTool = async (toolCall) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/mcp/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: toolCall.tool,
            arguments: toolCall.args,
          },
        }),
      });

      const result = await response.json();

      if (result.error) {
        return { success: false, text: `Failed: ${result.error.message}` };
      }

      const contentText =
        result.result?.content?.[0]?.text || "Action completed successfully";
      const data = result.result?.data;

      return {
        success: true,
        text: `Success: ${contentText}`,
        data,
        tool: toolCall.tool,
      };
    } catch (error) {
      return { success: false, text: `Error executing tool: ${error.message}` };
    }
  };

  const saveMessageToDB = async (message, sender, sessionIdOverride = null) => {
    const sessionIdToUse = sessionIdOverride || currentSessionId;
    if (!sessionIdToUse) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/chat-history/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
          sender,
          sessionId: sessionIdToUse,
        }),
      });
    } catch (error) {
      console.error("Error saving message to DB:", error);
    }
  };

  const fetchChatSessions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat-history/sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const sessions = await response.json();
      setChatSessions(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    }
  };

  const fetchWorkspaces = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/workspaces`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!Array.isArray(data)) return;
      setWorkspaces(data);
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  const normalizedWorkspaceOptions = [...new Map(
    (workspaces || [])
      .map((entry) => {
        const ws = entry?.workspace || entry;
        if (!ws?.id || !ws?.name) return null;
        return [ws.id, { id: ws.id, name: ws.name }];
      })
      .filter(Boolean)
  ).values()];

  const openAddContentModal = (targetType, content) => {
    setAddTargetType(targetType);
    setSourceContent(content || "");
    setSelectedWorkspaceId(normalizedWorkspaceOptions[0]?.id || "");
    setShowAddModal(true);
  };

  const normalizeTaskStatus = (status) => {
    const value = String(status || "").toLowerCase().trim();
    if (["done", "completed", "complete"].includes(value)) return "done";
    if (["in_progress", "in progress", "doing", "ongoing"].includes(value)) {
      return "in_progress";
    }
    return "todo";
  };

  const parseTaskContentWithLlm = async (content) => {
    const model = genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                  due_date: { type: "string" },
                },
                required: ["title", "description", "status"],
              },
            },
          },
          required: ["tasks"],
        },
      },
    });

    const prompt = [
      "Convert the following generated content into task objects.",
      "Rules:",
      "- Return valid JSON only according to schema.",
      "- Create 1-8 actionable tasks.",
      "- status must be one of: todo, in_progress, done.",
      "- due_date should be ISO 8601 if inferable, otherwise use current date + 3 days.",
      `Current time: ${new Date().toISOString()}`,
      "",
      "Generated content:",
      content,
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  };

  const parseRoadmapContentWithLlm = async (content) => {
    const model = genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            roadmapItems: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: { type: "string" },
                },
                required: ["title", "description", "status"],
              },
            },
          },
          required: ["title", "description", "roadmapItems"],
        },
      },
    });

    const prompt = [
      "Convert the following generated content into a roadmap JSON.",
      "Rules:",
      "- Return valid JSON only according to schema.",
      "- Include a concise roadmap title and summary description.",
      "- Create 3-12 roadmapItems with practical steps.",
      "- status values should be short labels like pending, in-progress, done.",
      "",
      "Generated content:",
      content,
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  };

  const handleAddGeneratedContent = async () => {
    if (!sourceContent?.trim()) {
      toast.error("No generated content selected.");
      return;
    }
    if (!selectedWorkspaceId) {
      toast.error("Please select a workspace.");
      return;
    }
    if (!genAI) {
      toast.error("AI model is not ready.");
      return;
    }

    setIsAddingContent(true);
    try {
      if (addTargetType === "task") {
        const parsed = await parseTaskContentWithLlm(sourceContent);
        const parsedTasks = Array.isArray(parsed?.tasks) ? parsed.tasks : [];
        if (!parsedTasks.length) {
          throw new Error("No tasks parsed from content.");
        }

        const payload = parsedTasks.map((item) => ({
          title: item.title?.trim() || "Untitled task",
          description: item.description?.trim() || "Task generated from AI content.",
          status: normalizeTaskStatus(item.status),
          due_date: item.due_date || null,
          workspace_id: selectedWorkspaceId,
          assigned_to: userData?.id,
        }));

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to create tasks.");
        }

        toast.success("Generated content added to tasks.");
        setShowAddModal(false);
        navigate(`/app/workspace/open/${selectedWorkspaceId}/tasks`);
        return;
      }

      const parsedRoadmap = await parseRoadmapContentWithLlm(sourceContent);
      const roadmapResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmaps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: parsedRoadmap?.title?.trim() || "AI Generated Roadmap",
          description:
            parsedRoadmap?.description?.trim() ||
            "Roadmap generated from AI assistant content.",
          workspace_id: selectedWorkspaceId,
          created_by: userData?.id,
        }),
      });

      if (!roadmapResponse.ok) {
        const errorText = await roadmapResponse.text();
        throw new Error(errorText || "Failed to create roadmap.");
      }

      const createdRoadmap = await roadmapResponse.json();
      const roadmapItems = Array.isArray(parsedRoadmap?.roadmapItems)
        ? parsedRoadmap.roadmapItems
        : [];

      if (roadmapItems.length > 0) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/roadmapItems`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: roadmapItems.map((item) => ({
              title: item.title?.trim() || "Untitled step",
              description: item.description?.trim() || "",
              status: item.status?.trim() || "pending",
              roadmap_id: createdRoadmap.id,
            })),
          }),
        });
      }

      toast.success("Generated content added to roadmap.");
      setShowAddModal(false);
      navigate(`/app/workspace/open/${selectedWorkspaceId}/roadmaps/${createdRoadmap.id}`);
    } catch (error) {
      console.error("Error adding generated content:", error);
      toast.error(error.message || "Failed to add generated content.");
    } finally {
      setIsAddingContent(false);
    }
  };

  const fetchMessagesForSession = async (sessionId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat-history/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetched = await response.json();
      setMessages(
        fetched.map((msg) => ({
          sender: msg.sender,
          text: msg.message,
          timestamp: msg.createdAt,
        }))
      );
    } catch (error) {
      console.error("Error fetching messages for session:", error);
    }
  };

  const createNewSession = async (options = {}) => {
    const { resetMessages = true } = options;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat-history/session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: `Chat ${new Date().toLocaleDateString()}`,
          }),
        }
      );
      const newSession = await response.json();
      setCurrentSessionId(newSession.sessionId);
      if (resetMessages) {
        setMessages([]);
      }
      await fetchChatSessions();
      return newSession.sessionId;
    } catch (error) {
      console.error("Error creating new session:", error);
      return null;
    }
  };

  const generateSessionName = async (firstMessage, sessionId = currentSessionId) => {
    if (!genAI || !sessionId) return;

    try {
      const model = genAI.getGenerativeModel({ model: selectedModel });
      const prompt = `Based on this first message from a user: "${firstMessage}", generate a concise title (3-6 words max). Return only the title.`;

      const result = await model.generateContent(prompt);
      const title = result.response.text().trim();

      await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat-history/session/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title }),
        }
      );

      fetchChatSessions();
    } catch (error) {
      console.error("Error generating session name:", error);
    }
  };

  const deleteSession = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this chat session?")) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat-history/session/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchChatSessions();
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const deleteAllSessions = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL chat sessions? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/chat-history/sessions`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChatSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
      await createNewSession();
    } catch (error) {
      console.error("Error deleting all sessions:", error);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  const applyQuickAction = (action) => {
    setAssistantMode(action.mode);
    setInput(action.prompt);
  };

  const handleSavePreferences = () => {
    setShowSettings(false);
    setChatSession(null);
    setMessages((prev) => [
      ...prev,
      {
        sender: "system",
        text: `AI preferences updated.\nTone: ${aiTone}\nPurpose: ${aiPurpose}\nMode: ${assistantMode}\nOutput style: ${outputStyle}${
          aiOther ? `\nOther: ${aiOther}` : ""
        }`,
      },
    ]);
  };

  const handleSend = async (overrideInput) => {
    const messageText = (overrideInput ?? input).trim();
    if (!messageText || processing) return;

    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = await createNewSession({ resetMessages: false });
      if (!activeSessionId) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "system",
            text: "Unable to create chat session. Please try again.",
          },
        ]);
        return;
      }
    }

    const userMessage = { sender: "user", text: messageText };
    const currentMessages = [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    saveMessageToDB(messageText, "user", activeSessionId);

    if (currentMessages.length === 1) {
      generateSessionName(messageText, activeSessionId);
    }

    setInput("");
    setProcessing(true);

    if (!genAI || !chatSession) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          text: "AI not ready. Please check API key configuration or refresh the page.",
        },
      ]);
      setProcessing(false);
      return;
    }

    try {
      const toolCalls = checkUserIntent(userMessage.text);
      let mcpActionResult = null;

      if (toolCalls.length > 0) {
        const toolCall = toolCalls[0];
        setStatusMessage(`Executing ${toolCall.tool.replace("_", " ")}...`);
        setActionResult(null);

        mcpActionResult = await executeMcpTool(toolCall);

        if (toolCall.tool === "create_workspace") {
          if (mcpActionResult.success && mcpActionResult.data) {
            setStatusMessage("Workspace created! Click to view.");
            setActionResult({
              type: "workspace",
              id: mcpActionResult.data.id,
              name: mcpActionResult.data.name,
            });
            setTimeout(() => setStatusMessage(""), 15000);
          } else {
            setStatusMessage("Finalizing response...");
            setTimeout(() => setStatusMessage(""), 3000);
          }
        } else {
          setStatusMessage("Finalizing response...");
          setTimeout(() => setStatusMessage(""), 3000);
        }
      }

      let messageToSend = `${userMessage.text}\n\n[System preferences:\n${buildAssistantInstruction()}\n]`;

      if (mcpActionResult) {
        const resultText = mcpActionResult.text || "Action executed.";
        messageToSend += `\n\n[System: The user's request may have been automatically processed. Action Result: ${resultText}. Please confirm this to the user naturally.]`;

        if (mcpActionResult.tool === "list_workspaces" && mcpActionResult.data) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              type: "workspace_list",
              workspaces: mcpActionResult.data,
              text: "Here are your workspaces:",
            },
          ]);
        }
      }

      const result = await chatSession.sendMessage(messageToSend);
      const textResponse = await result.response.text();

      setMessages((prev) => [...prev, { sender: "ai", text: textResponse }]);
      saveMessageToDB(textResponse, "ai", activeSessionId);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          text: `Error from AI: ${error.message || "Something went wrong."}. Please try again.`,
        },
      ]);
    } finally {
      setProcessing(false);
      setStatusMessage("");
    }
  };

  useEffect(() => {
    if (apiKey) {
      setGenAI(new GoogleGenerativeAI(apiKey));
      return;
    }

    setMessages((prev) => {
      const hasError = prev.some(
        (msg) =>
          msg.sender === "system" &&
          msg.text.includes("Gemini API Key not found")
      );
      if (hasError) return prev;

      return [
        ...prev,
        {
          sender: "system",
          text: "Error: Gemini API Key not found. Please ensure it's set in localStorage.",
        },
      ];
    });
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processing]);

  useEffect(() => {
    if (!genAI || chatSession) return;

    const model = genAI.getGenerativeModel({ model: selectedModel });
    const session = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: buildAssistantInstruction() }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Hello! I’m Benote AI. I can help with productivity, coding/debugging, writing, and generating strong image prompts. What would you like to work on?",
            },
          ],
        },
      ],
    });

    setChatSession(session);
  }, [
    genAI,
    chatSession,
    selectedModel,
    aiTone,
    aiPurpose,
    aiOther,
    assistantMode,
    outputStyle,
  ]);

  useEffect(() => {
    if (!initialPrompt || hasSentInitialPrompt.current) return;
    if (!genAI || !chatSession || processing) return;

    hasSentInitialPrompt.current = true;
    setInput(initialPrompt);
    handleSend(initialPrompt);
  }, [initialPrompt, genAI, chatSession, processing]);

  useEffect(() => {
    const initializeChat = async () => {
      await fetchChatSessions();
      await fetchWorkspaces();
    };

    if (token) {
      initializeChat();
    }
  }, [token]);

  useEffect(() => {
    const initializeSession = async () => {
      if (chatSessions.length > 0 && !currentSessionId) {
        const latestSession = chatSessions[0];
        setCurrentSessionId(latestSession.session_id);
        await fetchMessagesForSession(latestSession.session_id);
      }
    };

    initializeSession();
  }, [chatSessions, currentSessionId, token]);

  if (!useGemini) {
    return (
      <div className="flex flex-col h-full w-full max-w-none mx-auto bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden animate-fade-in">
        <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-xl font-semibold">AI Assistant</h2>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center text-gray-600">
          <p>
            AI functionality is currently disabled. Please enable it in your
            settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[86vh] w-full max-w-7xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 font-sans">
      {showSidebar && (
        <div className="w-80 bg-slate-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                <PiChatCircle className="text-gray-500" size={18} />
                Recent Chats
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={deleteAllSessions}
                  className="px-2 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                  title="Delete All Sessions"
                >
                  <PiTrash size={14} />
                </button>
                <button
                  onClick={createNewSession}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                >
                  New Chat
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {chatSessions.length > 0 ? (
              chatSessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`mb-2 p-3 bg-white rounded-lg border cursor-pointer transition-colors relative ${
                    currentSessionId === session.session_id
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-100 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setCurrentSessionId(session.session_id);
                    fetchMessagesForSession(session.session_id);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.session_id);
                    }}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Session"
                  >
                    <PiTrash size={14} />
                  </button>

                  <div className="flex items-center gap-2 mb-1">
                    <PiChatCircle className="text-gray-500" size={16} />
                    <span className="text-xs text-gray-500">Chat</span>
                  </div>

                  <p className="text-sm text-gray-700 font-medium line-clamp-2 pr-6">
                    {session.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {session.messageCount} messages • {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm mt-8">
                No chat sessions yet
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={true}
        />

        <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
              <PiChatCircle size={24} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900">Benote Assistant</h2>
              <div className="flex items-center gap-1.5 animate-fade-in text-xs">
                {statusMessage ? (
                  <svg
                    className="animate-spin h-3 w-3 text-blue-500"
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
                  <span
                    className={`w-2 h-2 rounded-full ${
                      processing ? "bg-blue-500 animate-pulse" : "bg-emerald-500"
                    }`}
                  ></span>
                )}
                <span className="text-xs text-gray-500 font-medium truncate">
                  {statusMessage
                    ? statusMessage
                    : processing
                    ? "Thinking..."
                    : "Ready for chat, coding, content, and more"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              title="Chat History"
              onClick={() => setShowSidebar((prev) => !prev)}
            >
              <PiChatCircle size={20} />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              title="AI Settings"
              onClick={() => setShowSettings(true)}
            >
              <PiGearSixBold size={24} />
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            onClick={() => {
              if (actionResult && actionResult.type === "workspace") {
                navigate(`/workspaces/${actionResult.id}`);
              }
            }}
            className={`bg-blue-50/80 backdrop-blur-sm border-b border-blue-100 py-2 px-4 flex items-center justify-center gap-2 text-blue-700 text-xs font-medium animate-slide-in-top sticky top-[73px] z-10 ${
              actionResult ? "cursor-pointer hover:bg-blue-100" : ""
            }`}
            title={actionResult ? "Click to view created item" : "Processing..."}
          >
            {processing && !actionResult ? (
              <svg
                className="animate-spin h-3.5 w-3.5"
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
            ) : actionResult ? (
              <PiCheckCircle className="text-blue-600" size={16} />
            ) : null}

            {statusMessage}
            {actionResult && (
              <span className="ml-1 text-blue-500 underline decoration-blue-300">
                Open
              </span>
            )}
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative scale-100 animate-fade-in mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <PiGearSixBold className="text-blue-500" />
                AI Preferences
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Response Tone
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                    >
                      <option>Friendly</option>
                      <option>Formal</option>
                      <option>Concise</option>
                      <option>Encouraging</option>
                      <option>Technical</option>
                      <option>Casual</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" height="20" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assistant Purpose
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      value={aiPurpose}
                      onChange={(e) => setAiPurpose(e.target.value)}
                    >
                      <option>Everyday assistant</option>
                      <option>Study assistant</option>
                      <option>Motivational coach</option>
                      <option>Technical Q&amp;A</option>
                      <option>Writing assistant</option>
                      <option>Brainstorming</option>
                      <option>Coding and debugging</option>
                      <option>Content and image prompt creator</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="fill-current h-4 w-4" height="20" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                  <div className="flex flex-wrap gap-2">
                    {modeOptions.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setAssistantMode(mode)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          assistantMode === mode
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Output style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {outputStyles.map((style) => (
                      <button
                        key={style}
                        onClick={() => setOutputStyle(style)}
                        className={`px-3 py-2 rounded-lg text-xs border transition-colors ${
                          outputStyle === style
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Custom Instructions
                  </label>
                  <input
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    type="text"
                    placeholder="e.g. Use bullet points and be brief"
                    value={aiOther}
                    onChange={(e) => setAiOther(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-all transform hover:-translate-y-0.5"
                  onClick={handleSavePreferences}
                >
                  Save Changes
                </button>
              </div>

              <button
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setShowSettings(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Add Generated Content to {addTargetType === "task" ? "Tasks" : "Roadmap"}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Content will be converted by LLM automatically before saving.
              </p>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Workspace
              </label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
                value={selectedWorkspaceId}
                onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                disabled={isAddingContent}
              >
                {normalizedWorkspaceOptions.length === 0 ? (
                  <option value="">No workspace found</option>
                ) : (
                  normalizedWorkspaceOptions.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.name}
                    </option>
                  ))
                )}
              </select>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 max-h-36 overflow-y-auto">
                {sourceContent?.slice(0, 500)}
                {sourceContent?.length > 500 ? "..." : ""}
              </div>

              <div className="flex justify-end gap-2 mt-5">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAddingContent}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  onClick={handleAddGeneratedContent}
                  disabled={isAddingContent || normalizedWorkspaceOptions.length === 0}
                >
                  {isAddingContent ? "Adding..." : `Add to ${addTargetType}`}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-gradient-to-b from-slate-50/70 to-white">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 animate-fade-in px-4">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-2 border border-blue-100">
                <PiChatCircle className="text-blue-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Smarter assistant for your daily work
              </h3>
              <p className="text-gray-600 max-w-2xl text-sm">
                Ask for everyday help, coding/debugging, writing, study support,
                workspace actions, or image prompt generation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 max-w-4xl w-full">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => applyQuickAction(action)}
                      className="text-left bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1.5 text-blue-600">
                        <Icon size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {action.mode}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {action.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {action.prompt}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-2xl">
                {[
                  "Create a workspace called Design Lab",
                  "Review this function for bugs",
                  "Generate a YouTube script outline",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Supports MCP actions + general assistant tasks
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 group ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center shadow-sm border border-gray-50">
                  <PiChatCircle className="text-gray-500" size={16} />
                </div>
              )}

              {msg.sender === "system" && <div className="w-8 shrink-0"></div>}

              <div
                className={`relative max-w-[82%] p-4 shadow-sm break-words leading-relaxed text-[15px] ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm animate-slide-in-right"
                    : msg.sender === "ai"
                    ? "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm animate-slide-in-left"
                    : "text-xs text-gray-500 bg-gray-100/80 px-4 py-2 rounded-full mx-auto shadow-none border-none italic my-1"
                }`}
                style={msg.sender === "system" ? { maxWidth: "fit-content" } : {}}
              >
                {msg.sender === "ai" ? (
                  msg.type === "workspace_list" ? (
                    <div className="flex flex-col gap-3 w-full min-w-[280px]">
                      <p className="font-semibold text-gray-800 text-sm">{msg.text}</p>
                      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                        {msg.workspaces && msg.workspaces.length > 0 ? (
                          msg.workspaces.map((ws) => (
                            <div
                              key={ws.id}
                              className="bg-white p-3 rounded-xl border border-blue-50 shadow-sm hover:shadow-md transition-all hover:border-blue-200 group relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-l"></div>
                              <div className="pl-3">
                                <h4 className="font-bold text-gray-800 text-sm truncate flex items-center gap-2">
                                  <PiFolder className="text-gray-500" size={16} />
                                  {ws.name}
                                </h4>

                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                  {ws.description || "No description provided."}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                                  <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                                    Workspace
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 italic p-2">
                            No workspaces found.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-blue prose-p:my-1 prose-headings:my-2 prose-ul:my-1">
                      <MarkdownRenderer content={msg.text} />
                      <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors mr-1"
                          onClick={() => openAddContentModal("task", msg.text)}
                        >
                          <AiOutlinePlus className="w-3 h-3" />
                          Add to Task
                        </button>
                        <button
                          className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors mr-1"
                          onClick={() => openAddContentModal("roadmap", msg.text)}
                        >
                          <AiOutlinePlus className="w-3 h-3" />
                          Add to Roadmap
                        </button>
                        <button
                          className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                          onClick={() => handleCopy(msg.text)}
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  msg.text
                )}
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm border border-gray-100">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
          ))}

          {processing && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center shadow-sm border border-gray-50">
                <PiChatCircle className="text-gray-500" size={16} />
              </div>

              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1 w-fit">
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex flex-wrap gap-2 mb-3">
            {modeOptions.map((mode) => (
              <button
                key={mode}
                onClick={() => setAssistantMode(mode)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  assistantMode === mode
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="relative flex items-end bg-gray-50 border border-gray-200 rounded-2xl focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-sm">
            <textarea
              className="flex-1 bg-transparent py-3.5 pl-4 pr-12 text-gray-700 placeholder-gray-400 focus:outline-none resize-none max-h-44 min-h-[56px] custom-scrollbar"
              placeholder={
                processing
                  ? "Please wait..."
                  : "Ask anything: everyday tasks, coding, debugging, writing, image prompts..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={processing}
              autoFocus
              rows={1}
            />

            <button
              className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${
                input.trim() && !processing
                  ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:scale-105"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              onClick={handleSend}
              disabled={!input.trim() || processing}
            >
              <AiOutlineSend size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-gray-400">
              AI can make mistakes. Verify important information.
            </span>
            <span className="text-[10px] text-gray-400">
              Enter to send • Shift+Enter for new line
            </span>
          </div>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 20px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #94a3b8;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          .animate-slide-in-left {
            animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
      </div>
    </div>
  );
}

export default Chatbot;
