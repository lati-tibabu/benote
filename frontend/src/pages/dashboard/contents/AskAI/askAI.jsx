import React, { useState } from "react";
import Chatbot from "./contents/chatbot";

function AskAI() {
  return (
    <div className="p-4 min-h-screen bg-gray-100">
      {/* <h1 className="text-2xl font-bold mb-4">AskAI</h1> */}
      <Chatbot />
    </div>
  );
}

export default AskAI;
