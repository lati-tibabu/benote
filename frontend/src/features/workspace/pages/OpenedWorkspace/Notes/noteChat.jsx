import React, { useState } from "react";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "react-toastify";
import { AiOutlineCopy, AiOutlineCheck } from "react-icons/ai";
import {
  MdOutlineQuiz,
  MdOutlineSummarize,
  MdOutlineSpellcheck,
  MdOutlineExpand,
  MdOutlineNoteAlt,
  MdOutlineFormatListBulleted,
} from "react-icons/md";

const NoteChat = ({ noteContext = "There is no note provided" }) => {
  const apiKey = localStorage.getItem("geminiApiKey");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  const [askAI, setAskAI] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiResponse, setAiResponse] = useState(null);
  const [copied, setCopied] = useState(false);

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
        content: { type: "string" },
      },
      required: ["title", "content"],
    },
  };

  const requestAi = async (prompt) => {
    setLoading(true);
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: noteChatPrompt(noteContext) }],
          },
        ],
      });
      const result = await chatSession.sendMessage(prompt);
      setAiResponse(JSON.parse(result.response.text()));
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (apiKey && apiKey.length > 0) {
      setError(null);
      setAiResponse(null);
      setCopied(false);
      askAI && requestAi(askAI);
    } else {
      toast.error("API Key is invalid!");
    }
  };

  const noteMakingPrompt =
    "You are a note-making assistant AI. The provided content is lengthy, unstructured, and may include irrelevant details. Analyze the content and generate a comprehensive, well-structured, and exam-focused note. Include all important points necessary for understanding and retention. Use bullet points for listing key information. Use tables for comparisons. Explain any code blocks clearly and emphasize their purpose with relevant examples. Ensure the final note is complete, logically organized, and easy to review. Do not include any explanatory or concluding text outside the note itself. Output only the refined note.";

  return (
    <div className="flex flex-col h-screen bg-white p-0 md:p-6 transition-all duration-200">
      {/* Input Section */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center gap-2 border-b border-gray-200 px-4 py-3 bg-white sticky top-0 z-10"
      >
        <input
          type="text"
          placeholder="Ask AI about this note..."
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base px-2 py-1"
          onChange={(e) => setAskAI(e.target.value)}
          value={askAI}
          autoFocus
        />
        <button
          type="submit"
          className="text-gray-500 hover:text-gray-600 transition-colors"
          title="Ask"
        >
          <MdOutlineNoteAlt size={22} />
        </button>
      </form>

      {/* Minimalistic Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center items-center py-3 px-2 border-b border-gray-100 bg-white">
        <button
          className="group flex items-center gap-1 px-3 py-1 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-gray-600 transition-colors text-sm font-medium"
          onClick={() =>
            requestAi("Convert the entire content to markdown rich")
          }
          title="Markdown"
        >
          <MdOutlineFormatListBulleted
            size={18}
            className="group-hover:text-gray-600"
          />{" "}
          Markdown
        </button>
        <button
          className="group flex items-center gap-1 px-3 py-1 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-teal-600 transition-colors text-sm font-medium"
          onClick={() =>
            requestAi(
              "Quiz from the content make sure it is comprehensive and review"
            )
          }
          title="Quiz"
        >
          <MdOutlineQuiz size={18} className="group-hover:text-teal-600" /> Quiz
        </button>
        <button
          className="group flex items-center gap-1 px-3 py-1 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-gray-600 transition-colors text-sm font-medium"
          onClick={() => requestAi("Summarize the content")}
          title="Summarize"
        >
          <MdOutlineSummarize
            size={18}
            className="group-hover:text-gray-600"
          />{" "}
          Summarize
        </button>
        <button
          className="group flex items-center gap-1 px-3 py-1 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-gray-600 transition-colors text-sm font-medium"
          onClick={() => requestAi("Grammar correct and replace the original")}
          title="Grammar"
        >
          <MdOutlineSpellcheck
            size={18}
            className="group-hover:text-gray-600"
          />{" "}
          Grammar
        </button>
        <button
          className="group flex items-center gap-1 px-3 py-1 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-gray-600 transition-colors text-sm font-medium"
          onClick={() =>
            requestAi("Expand the note to make it more comprehensive")
          }
          title="Expand"
        >
          <MdOutlineExpand size={18} className="group-hover:text-gray-600" />{" "}
          Expand
        </button>
        <button
          className="group flex items-center gap-1 px-3 py-1 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-gray-600 transition-colors text-sm font-medium"
          onClick={() => requestAi(noteMakingPrompt)}
          title="Notefy"
        >
          <MdOutlineNoteAlt size={18} className="group-hover:text-gray-600" />{" "}
          Notefy
        </button>
      </div>

      {/* Chat Area (Bot's response) */}
      <div className="flex-1 overflow-y-auto px-2 md:px-8 py-6 bg-white">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin rounded-sm h-8 w-8 border-b-2 border-gray-300"></span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {aiResponse ? (
                <div className="relative group bg-gray-50 border border-gray-100 rounded-sm p-4 shadow-sm w-full h-full min-h-[200px] flex flex-col">
                  <button
                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(aiResponse.content);
                      toast.success("Copied to clipboard!");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    }}
                    title="Copy"
                  >
                    {copied ? (
                      <AiOutlineCheck className="text-gray-500" />
                    ) : (
                      <AiOutlineCopy />
                    )}
                    {copied && <span>Copied</span>}
                  </button>
                  <div className="flex-1 w-full h-full overflow-x-auto">
                    <MarkdownRenderer content={aiResponse?.content} />
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-12 text-base select-none">
                  Ask a question or use an action above to get started.
                </div>
              )}
              {error && (
                <div className="text-red-500 text-sm mt-2 text-center">
                  {error.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteChat;

const noteChatPrompt = (note) => {
  return `
        You are a helpful assistant for the user's note. Your task is to provide relevant and detailed responses based on the content of the note provided.
  
        ## Instructions:

        - **Read the note carefully** and understand its content.
        - **Answer the user's questions** based on the information in the note.
        - **Assist the user with questions related to the note** only. 
        - Your responses should be **focused on providing information directly from the note**. 
        - If the user asks for an answer outside the context of the note, give them answer based on the note context and encourage them to ask about the note.
        - **Do not add any extra information** beyond what is relevant to the note unless explicitly requested. 
        - Be professional, clear, and helpful. 
        - give response in a markdown format and you can also use LaTex in between $ for formulas and other important.
        - you should provide output in a json format with two keys title and content.
        - content should be in a markdown format.
        - content is your main response and title is the title of the note.
        - If the user asks for a specific section or detail, provide that information directly from the note.
        - use emojis to make it more fun and if user dont like make it without emojis.
        - If the user asks for a summary, provide a concise summary of the note.
  
        ## General Guidelines:
        - Keep your responses **direct and informative**, with relevant details from the note.
        - If a user asks for clarification or elaboration, **explain in detail using content from the note**.
        - **Do not guess or infer information** not present in the note.
        - If the note is incomplete, politely inform the user and ask for clarification.
        - You may rephrase parts of the note for clarity if needed.
        - Always make your answers **clear and concise**, while also ensuring accuracy.
  
        **User Prompt**: Please ask questions or request clarifications related to the note. 
        
        **Example**: 
        - User asks: "Can you explain the section about XYZ?"
        - Your response: Provide a clear explanation of the section based on the note.
        
        - User asks: "Can you summarize the note?"
        - Your response: Provide a concise summary based on the content of the note.
        
        - If the user asks a question unrelated to the note, you should gently guide them back to asking about the note, saying something like: 
          - "I can only assist with questions related to the note provided."
        
        ## Current Note Context:
        - **Note**: ${note ? note : "No note available yet."}
        - **Date**: ${new Date().toLocaleDateString()}
        - **Time**: ${new Date().toLocaleTimeString()}
  
        ## Respond based on this context.
    `;
};
