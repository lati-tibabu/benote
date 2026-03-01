import React from "react";
import { useLocation } from "react-router-dom";
import Chatbot from "./contents/chatbot";

function AskAI() {
  const location = useLocation();
  const initialPrompt = location?.state?.initialPrompt || "";

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-72px)] bg-slate-50">
      <Chatbot variant="full" initialPrompt={initialPrompt} />
    </div>
  );
}

export default AskAI;

// ---
// WARNING: This AI assistant is powered by Google Gemini. The content generated may be inaccurate, misleading, or inappropriate. Please use the information wisely and always verify important details independently.
