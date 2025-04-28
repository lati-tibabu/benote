import React, { useState } from "react";
import MarkdownRenderer from "../../../../../../components/markdown-renderer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast, ToastContainer } from "react-toastify";
import { AiFillCopy } from "react-icons/ai";

const NoteChat = ({ noteContext = "There is no note provided" }) => {
  const apiKey = localStorage.getItem("geminiApiKey");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const [askAI, setAskAI] = useState(null);
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
        title: {
          type: "string",
        },
        content: {
          type: "string",
        },
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
            parts: [
              {
                text: noteChatPrompt(noteContext),
              },
            ],
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
    if (apiKey.length > 0) {
      setError(null);
      setAiResponse(null);
      setCopied(false);
      askAI && requestAi(askAI);
    } else {
      toast.error("API Key is invalid!");
    }
  };
  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      {/* <ToastContainer /> */}
      {/* Input Section at the top */}
      <div className="mb-4">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask AI from the note..."
            className="input w-full text-black border bg-transparent border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setAskAI(e.target.value)}
            value={askAI}
          />
        </form>
      </div>

      {/* Chat Area (Bot's response) */}
      <div className="flex-1 overflow-y-auto p-4 bg-white rounded-lg shadow-lg space-y-4">
        {/* AI's answer */}
        {loading ? (
          <span className="loading loading-dots loading-lg"></span>
        ) : (
          <div className="flex items-start space-x-3">
            {aiResponse ? (
              <div>
                <div className="flex items-center justify-end">
                  <div
                    className="flex items-center gap-2 bg-gray-200 w-fit p-2 rounded-md mb-2 cursor-pointer hover:bg-gray-300"
                    onClick={() => {
                      navigator.clipboard.writeText(aiResponse.content);
                      toast.success("Copied to clipboard!");
                      setCopied(true);
                    }}
                  >
                    {copied ? (
                      <div className="flex items-center gap-2">
                        <AiFillCopy className="text-green-500" />
                        Copied
                      </div>
                    ) : (
                      <AiFillCopy className="text-gray-500" />
                    )}
                  </div>
                </div>
                <MarkdownRenderer content={aiResponse?.content} />
              </div>
            ) : (
              <p>Hello! How can I help you with your notes?</p>
            )}
            {error && (
              <div className="text-red-500 text-sm mt-2">{error.message}</div>
            )}
          </div>
        )}
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
