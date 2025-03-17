import React, { useEffect, useState } from "react";
import { FaEyeSlash, FaEye, FaKey } from "react-icons/fa6";
import { toast, ToastContainer } from "react-toastify";

const Index = () => {
  const [useGemini, setUseGemini] = useState(
    localStorage.getItem("useGemini") === "true"
  );
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState(
    localStorage.getItem("geminiApiKey") || ""
  );

  useEffect(() => {
    localStorage.setItem("useGemini", useGemini.toString());
  }, [useGemini]);

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem(
        "geminiApiKey",
        inputValue.length > 0 ? inputValue : ""
      );
      toast.success("Gemini API Key Succesfully saved");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="bg-gray-100 p-4 border-2 rounded-lg shadow-lg">
      <ToastContainer />
      <p className="text-2xl text-gray-800 font-semibold">
        AI Functionality Settings
      </p>

      {/* Toggle Gemini Feature */}
      <fieldset className="p-4 border rounded-lg flex items-center gap-3 bg-white shadow-md mt-3">
        <input
          type="checkbox"
          checked={useGemini}
          className="toggle toggle-primary"
          onChange={(e) => setUseGemini(e.target.checked)}
        />
        <span className="text-gray-700 font-medium">
          Use Gemini For LLM Features
        </span>
      </fieldset>

      {/* API Key Input Field */}
      {useGemini && (
        <div className="mt-4">
          <p className="text-gray-700 font-medium mb-1">Gemini API Key</p>

          <div className="border-2 w-full p-3 flex items-center rounded-lg bg-white shadow-md focus-within:border-purple-500">
            <FaKey className="mr-3 text-blue-600" size={20} />
            <input
              type={isVisible ? "text" : "password"}
              placeholder="Enter Your Gemini API Key"
              className="grow bg-transparent outline-none text-gray-800 placeholder-gray-400"
              autoComplete="off"
              spellCheck="false"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              className="text-blue-600 hover:text-purple-600 transition"
            >
              {isVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            <button
              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-purple-600 transition"
              onClick={handleSaveApiKey}
            >
              Save
            </button>
          </div>

          {/* Link to get API Key */}
          <p className="text-sm text-gray-600 mt-2">
            Don’t have an API key?{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get your API key here.
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default Index;
