import React, { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  atomDark,
  solarizedlight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { LuCopy, LuCheck, LuSun, LuMoon, LuWrapText, LuHash } from "react-icons/lu";

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
  const [copied, setCopied] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("solarizedlight");
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  const themes = {
    atomDark: atomDark,
    solarizedlight: solarizedlight,
  };

  const codeString = useMemo(
    () => String(children).replace(/\n$/, ""),
    [children]
  );

  const language = useMemo(() => {
    const match = /language-([a-z0-9+-]+)/i.exec(className || "");
    return match ? match[1].toLowerCase() : "text";
  }, [className]);

  const isInlineCode = useMemo(() => {
    if (typeof inline === "boolean") {
      return inline;
    }

    const hasLanguageClass = Boolean(className && className.includes("language-"));
    const hasMultilineContent = codeString.includes("\n");

    return !hasLanguageClass && !hasMultilineContent;
  }, [inline, className, codeString]);

  /**
   * Handles the copy to clipboard action.
   * Copies the code string to the clipboard and shows "Copied!" feedback temporarily.
   */
  const handleCopy = () => {
    navigator.clipboard
      .writeText(codeString)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => console.error("Failed to copy!", error));
  };

  /**
   * Toggles the code highlighting theme between atomDark and solarizedlight.
   */
  const toggleTheme = () => {
    setCurrentTheme((prevTheme) =>
      prevTheme === "atomDark" ? "solarizedlight" : "atomDark"
    );
  };

  if (isInlineCode) {
    return (
      <code
        className="text-[0.92em] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md border border-blue-100"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="relative my-5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-gray-50 to-slate-50 px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="inline-flex items-center rounded-full bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            {language === "text" ? "code" : language}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setWrapLines((prev) => !prev)}
            className={`p-1.5 rounded-md border transition-colors ${
              wrapLines
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title={wrapLines ? "Disable wrap" : "Wrap long lines"}
          >
            <LuWrapText className="text-sm" />
          </button>

          <button
            onClick={() => setShowLineNumbers((prev) => !prev)}
            className={`p-1.5 rounded-md border transition-colors ${
              showLineNumbers
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-200 text-gray-500 hover:text-gray-700"
            }`}
            title={showLineNumbers ? "Hide line numbers" : "Show line numbers"}
          >
            <LuHash className="text-sm" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border bg-white border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            title={
              currentTheme === "atomDark"
                ? "Switch to light syntax"
                : "Switch to dark syntax"
            }
          >
            {currentTheme === "atomDark" ? (
              <LuSun className="text-sm" />
            ) : (
              <LuMoon className="text-sm" />
            )}
          </button>

          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-gray-900 text-white hover:bg-black"
            }`}
            title={copied ? "Copied" : "Copy code"}
          >
            {copied ? <LuCheck className="text-sm" /> : <LuCopy className="text-sm" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        className="custom-code-scrollbar !m-0"
        language={language}
        style={themes[currentTheme]}
        showLineNumbers={showLineNumbers}
        wrapLongLines={wrapLines}
        lineNumberStyle={{
          minWidth: "2.25em",
          paddingRight: "1em",
          color: currentTheme === "atomDark" ? "#6b7280" : "#94a3b8",
        }}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.875rem",
          lineHeight: "1.65",
          padding: "1rem",
          overflowX: "auto",
        }}
        PreTag="div"
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>

      <style>{`
        .custom-code-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-code-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-code-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-code-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default CodeHighlighter;
