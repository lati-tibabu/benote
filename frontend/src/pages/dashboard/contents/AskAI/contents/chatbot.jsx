import React, { useState, useEffect, useRef } from "react";
import { AiOutlineSend } from "react-icons/ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import MarkdownRenderer from "../../../../../components/markdown-renderer"; // Assuming this renders markdown
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [genAI, setGenAI] = useState(null);
  const [processing, setProcessing] = useState(false);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  const apiKey = localStorage.getItem("geminiApiKey");
  const token = localStorage.getItem("jwt");

  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Initialize Generative AI
  useEffect(() => {
    if (apiKey) {
      setGenAI(new GoogleGenerativeAI(apiKey));
    } else {
      console.error("Gemini API Key not found in localStorage.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          text: "Error: Gemini API Key not found. Please ensure it's set in localStorage.",
        },
      ]);
    }
  }, [apiKey]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generationConfig = {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    // responseMimeType: "application/json",
  };

  // Reintroduce user data and date into the context for AI interactions
  const userData = useSelector((state) => state.auth.user) || {};
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleSend = async () => {
    if (input.trim() && !processing) {
      const userMessage = { sender: "user", text: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setProcessing(true);

      if (!genAI) {
        console.error("Generative AI not initialized.");
        setMessages((prev) => [
          ...prev,
          {
            sender: "system",
            text: "AI not ready. Please check API key configuration.",
          },
        ]);
        setProcessing(false);
        return;
      }

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chatSession = model.startChat({
          generationConfig,
          history: [
            {
              role: "user",
              parts: [
                {
                  text: `Current Date: ${currentDate}\nLogged-in User: ${
                    userData.name || "Unknown User"
                  }\nUser Email: ${userData.email || "Unknown Email"}\n\n${
                    userMessage.text
                  }`,
                },
              ],
            },
          ],
        });

        const result = await chatSession.sendMessage(userMessage.text);
        const textResponse = await result.response.text();

        setMessages((prev) => [...prev, { sender: "ai", text: textResponse }]);
      } catch (error) {
        console.error("AI request failed:", error);
        setMessages((prev) => [
          ...prev,
          {
            sender: "system",
            text: `Error from AI: ${
              error.message || "Something went wrong."
            }. Please try again.`,
          },
        ]);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard!");
    });
  };

  // Check if AI functionality should be enabled
  const useGemini = localStorage.getItem("useGemini") === "true";

  if (!useGemini) {
    return (
      <div className="flex flex-col h-[70vh] max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between shadow-md">
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
    <div className="flex flex-col h-[70vh] max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
      <ToastContainer />
      {/* Chat header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between shadow-md">
        <h2 className="text-xl font-semibold">AI Assistant</h2>
        {processing && (
          <div className="flex items-center">
            <span className="text-sm mr-2">Thinking...</span>
            <div className="dot-pulse"></div>
          </div>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`relative max-w-[70%] p-3 rounded-lg shadow-md break-words ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none animate-slide-in-right"
                  : "bg-gray-200 text-gray-800 rounded-bl-none animate-slide-in-left"
              } ${
                msg.sender === "system"
                  ? "text-sm italic text-gray-600 bg-transparent shadow-none"
                  : ""
              }`}
            >
              {msg.sender === "ai" ? (
                <>
                  <MarkdownRenderer content={msg.text} />
                  <div className="text-right mt-2">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => handleCopy(msg.text)}
                    >
                      Copy
                    </button>
                  </div>
                </>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 flex items-center shadow-lg">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full py-2 px-4 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          placeholder={processing ? "AI is typing..." : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={processing}
        />
        <button
          className={`bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
            input.trim() && !processing
              ? "hover:bg-blue-700 transform hover:scale-105"
              : "opacity-60 cursor-not-allowed"
          }`}
          onClick={handleSend}
          disabled={!input.trim() || processing}
        >
          <AiOutlineSend size={20} />
        </button>
      </div>

      {/* Tailwind CSS Custom Styles for Animations (add to your main CSS file or a style block) */}
      <style jsx>{`
        /* Scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f4f8; /* Light blue-gray for track */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af; /* Gray for thumb */
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* Darker gray on hover */
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        /* Dot pulse animation for "Thinking..." */
        .dot-pulse {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #fff; /* White dots */
          color: #fff;
          animation: dotPulse 1s ease-in-out infinite;
        }

        .dot-pulse::before,
        .dot-pulse::after {
          content: "";
          display: inline-block;
          position: absolute;
          top: 0;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #fff;
          color: #fff;
          animation: dotPulse 1s ease-in-out infinite;
        }

        .dot-pulse::before {
          left: -15px;
          animation-delay: 0.2s;
        }

        .dot-pulse::after {
          left: 15px;
          animation-delay: 0.4s;
        }

        @keyframes dotPulse {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

export default Chatbot;
