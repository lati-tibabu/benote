import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  atomDark,
  solarizedlight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { LuCopy, LuCheck, LuSun, LuMoon } from "react-icons/lu"; // Added Sun and Moon icons

/**
 * CodeHighlighter Component
 * Renders code blocks with syntax highlighting and a "Copy to Clipboard" button.
 * Handles both inline code and block code.
 *
 * @param {object} props - Component props.
 * @param {object} props.node - The AST node for the code block (from react-markdown).
 * @param {boolean} props.inline - True if it's an inline code snippet, false for a block.
 * @param {string} [props.className] - CSS classes from react-markdown, often contains language info.
 * @param {React.ReactNode} props.children - The actual code content.
 */
const CodeHighlighter = ({ node, inline, className, children, ...props }) => {
  // State to manage the "copied" feedback on the button
  const [copied, setCopied] = useState(false);
  // State to manage the current theme, defaulting to atomDark
  const [currentTheme, setCurrentTheme] = useState("solarizedLight");

  // Map theme names to their imported style objects
  const themes = {
    atomDark: atomDark,
    solarizedlight: solarizedlight,
  };

  // Extract the code string and remove any trailing newlines which react-markdown might add
  const codeString = String(children).replace(/\n$/, "");

  // Determine the language from the className (e.g., "language-js" -> "js")
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text"; // Default to 'text' if no language is specified

  /**
   * Handles the copy to clipboard action.
   * Copies the code string to the clipboard and shows "Copied!" feedback temporarily.
   */
  const handleCopy = () => {
    navigator.clipboard
      .writeText(codeString)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset 'copied' state after 2 seconds
      })
      .catch((err) => console.error("Failed to copy!", err)); // Log any errors during copy
  };

  /**
   * Toggles the code highlighting theme between atomDark and solarizedlight.
   */
  const toggleTheme = () => {
    setCurrentTheme((prevTheme) =>
      prevTheme === "atomDark" ? "solarizedlight" : "atomDark"
    );
  };

  // --- Inline Code Rendering ---
  if (inline) {
    return (
      <code
        className="text-sm font-mono bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-1 py-0.5 rounded"
        {...props}
      >
        {children}
      </code>
    );
  }

  // --- Block Code Rendering ---
  return (
    // Simplified wrapper div: light border, rounded, no shadow
    <div className="relative rounded-sm border border-gray-300 my-4 overflow-hidden">
      {/* Header bar for the code block: light border-b, text color adjusted */}
      <div className="flex justify-between items-center bg-gray-50 text-gray-700 px-4 py-2 text-xs font-semibold border-b border-gray-300">
        <span className="capitalize">
          {language === "text" ? "Code" : language}
        </span>
        <div className="flex gap-2">
          {" "}
          {/* Container for buttons */}
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 px-3 py-1 rounded-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            title={
              currentTheme === "atomDark"
                ? "Switch to Light Theme"
                : "Switch to Dark Theme"
            }
          >
            {currentTheme === "atomDark" ? (
              <LuSun className="text-lg" /> // Sun icon for light theme
            ) : (
              <LuMoon className="text-lg" /> // Moon icon for dark theme
            )}
            {currentTheme === "atomDark" ? "Light" : "Dark"}
          </button>
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 rounded-sm bg-gray-500 hover:bg-gray-600 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            title={copied ? "Copied!" : "Copy code to clipboard"}
          >
            {copied ? (
              <>
                <LuCheck className="text-green-300" /> Copied!
              </>
            ) : (
              <>
                <LuCopy className="text-lg" /> Copy
              </>
            )}
          </button>
        </div>
      </div>
      {/* SyntaxHighlighter component, using the dynamically chosen style */}
      <SyntaxHighlighter
        className="scrollbar-hide !m-0 !p-4 rounded-b-lg"
        language={language}
        style={themes[currentTheme]} // Dynamically apply the selected theme
        PreTag="div"
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeHighlighter;
