import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiFileText, FiAlertTriangle } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import {
  PiPaintBrushBold,
  PiTextAaBold,
  PiTextHOneBold,
  PiTextAlignLeftBold,
  PiPrinterBold,
  PiGearSixFill,
  PiFile,
} from "react-icons/pi";
import MarkdownRenderer from "../../../components/markdown-renderer";

// Expanded font options for user selection
const fontOptions = [
  // Default/System UI
  {
    label: "Default System UI",
    value:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  },
  // Popular sans-serif fonts
  { label: "Montserrat (sans-serif)", value: "'Montserrat', sans-serif" },
  { label: "Poppins (sans-serif)", value: "'Poppins', sans-serif" },
  // Serif fonts
  { label: "Georgia (serif)", value: "Georgia, serif" },
  {
    label: "Times New Roman (serif)",
    value: "'Times New Roman', Times, serif",
  },
  { label: "Garamond (serif)", value: "Garamond, serif" },
  { label: "Palatino (serif)", value: "Palatino, 'Palatino Linotype', serif" },
  {
    label: "Cambria (serif)",
    value: "Cambria, Cochin, Georgia, Times, 'Times New Roman', serif",
  },
  {
    label: "Baskerville (serif)",
    value:
      "Baskerville, 'Baskerville Old Face', 'Hoefler Text', Garamond, Times, serif",
  },
  // Other sans-serif fonts
  { label: "Arial (sans-serif)", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana (sans-serif)", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma (sans-serif)", value: "Tahoma, Geneva, sans-serif" },
  {
    label: "Trebuchet MS (sans-serif)",
    value: "'Trebuchet MS', Helvetica, sans-serif",
  },
  { label: "Helvetica (sans-serif)", value: "Helvetica, Arial, sans-serif" },
  {
    label: "Calibri (sans-serif)",
    value: "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
  },
  {
    label: "Century Gothic (sans-serif)",
    value: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif",
  },
  { label: "Impact (sans-serif)", value: "Impact, Charcoal, sans-serif" },
  // Monospace fonts
  { label: "Monospace (generic)", value: "monospace" },
  {
    label: "Courier New (monospace)",
    value: "'Courier New', Courier, monospace",
  },
  {
    label: "Lucida Console (monospace)",
    value: "'Lucida Console', Monaco, monospace",
  },
  { label: "Monaco (monospace)", value: "Monaco, 'Lucida Console', monospace" },
];

// Color themes for the note background and text
const colorThemes = [
  { label: "Default", bg: "bg-white", text: "text-blue-900" },
  { label: "Night", bg: "bg-gray-900", text: "text-gray-100" },
  { label: "Sepia", bg: "bg-yellow-50", text: "text-yellow-900" },
];

// Font sizes for readability customization
const fontSizes = [14, 16, 18, 20, 22];

// Line heights for text spacing
const lineHeights = [1.4, 1.6, 1.8, 2];

// Accent colors for borders, icons, and prose styling
const accentColors = [
  {
    label: "Gray",
    value: "gray",
    border: "border-gray-100",
    icon: "text-gray-700",
    user: "text-gray-700",
    date: "text-gray-400",
    prose: "prose-gray",
  },
  {
    label: "Blue",
    value: "blue",
    border: "border-blue-100",
    icon: "text-blue-700",
    user: "text-blue-700",
    date: "text-blue-400",
    prose: "prose-blue",
  },
  {
    label: "Green",
    value: "green",
    border: "border-green-100",
    icon: "text-green-700",
    user: "text-green-700",
    date: "text-green-400",
    prose: "prose-green",
  },
  {
    label: "Purple",
    value: "purple",
    border: "border-purple-100",
    icon: "text-purple-700",
    user: "text-purple-700",
    date: "text-purple-400",
    prose: "prose-purple",
  },
  {
    label: "Pink",
    value: "pink",
    border: "border-pink-100",
    icon: "text-pink-700",
    user: "text-pink-700",
    date: "text-pink-400",
    prose: "prose-pink",
  },
  {
    label: "Orange",
    value: "orange",
    border: "border-orange-100",
    icon: "text-orange-700",
    user: "text-orange-700",
    date: "text-orange-400",
    prose: "prose-orange",
  },
];

const SharedNotes = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const { note_id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const [font, setFont] = useState("Georgia, serif");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [accentIdx, setAccentIdx] = useState(0);
  const [showPreferences, setShowPreferences] = useState(false); // State to toggle preferences bar visibility

  const noteCardRef = useRef(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedThemeIdx = localStorage.getItem("noteThemeIdx");
    const savedFont = localStorage.getItem("noteFont");
    const savedFontSize = localStorage.getItem("noteFontSize");
    const savedLineHeight = localStorage.getItem("noteLineHeight");
    const savedAccentIdx = localStorage.getItem("noteAccentIdx");

    if (savedThemeIdx !== null) setThemeIdx(Number(savedThemeIdx));
    if (savedFont !== null) setFont(savedFont);
    if (savedFontSize !== null) setFontSize(Number(savedFontSize));
    if (savedLineHeight !== null) setLineHeight(Number(savedLineHeight));
    if (savedAccentIdx !== null) setAccentIdx(Number(savedAccentIdx));
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("noteThemeIdx", themeIdx.toString());
    localStorage.setItem("noteFont", font);
    localStorage.setItem("noteFontSize", fontSize.toString());
    localStorage.setItem("noteLineHeight", lineHeight.toString());
    localStorage.setItem("noteAccentIdx", accentIdx.toString());
  }, [themeIdx, font, fontSize, lineHeight, accentIdx]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(
          `${apiURL}/api/notes/public/${note_id}/note`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch the note");
        }
        const data = await response.json();
        setNote(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchNote();
  }, [note_id, apiURL]);

  const handlePrint = () => {
    if (noteCardRef.current) {
      noteCardRef.current.classList.add("print-note-card");
      window.print();
      setTimeout(() => {
        noteCardRef.current.classList.remove("print-note-card");
      }, 1000);
    } else {
      window.print();
    }
  };

  // Get current accent color details
  const currentAccent = accentColors[accentIdx];

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start py-10 px-2 transition-colors duration-200 ${colorThemes[themeIdx].bg}`}
      style={{ fontFamily: font, fontSize: `${fontSize}px`, lineHeight }}
    >
      {/* Top Bar for Navigation and Settings Toggle */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 px-4 sm:px-0">
        <button
          onClick={() => navigate("/public/notes")}
          className={`px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-${currentAccent.value}-400 transition-colors flex items-center gap-2 text-sm bg-${currentAccent.value}-500 hover:bg-${currentAccent.value}-600`}
        >
          <PiFile /> Public Notes
        </button>
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className={`p-2 rounded-full bg-${currentAccent.value}-50/60 hover:bg-${currentAccent.value}-100 focus:outline-none focus:ring-2 focus:ring-${currentAccent.value}-400 transition-colors shadow-sm`}
          title="Toggle Note Settings"
        >
          <PiGearSixFill className={`text-2xl ${currentAccent.icon}`} />
        </button>
      </div>

      <div className="w-full max-w-2xl mx-auto">
        {/* Preferences Bar - Conditionally rendered with smooth transition */}
        <div
          className={`flex flex-wrap items-center gap-4 mb-6 p-3 rounded-xl bg-${
            currentAccent.value
          }-50/60 border ${
            currentAccent.border
          } shadow-sm transition-all duration-300 ease-in-out ${
            showPreferences
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <span
            className={`flex items-center gap-2 ${colorThemes[themeIdx].text} font-medium text-sm`}
          >
            <PiPaintBrushBold /> Theme
            <select
              className="ml-1 bg-transparent border-none focus:ring-0 text-sm"
              value={themeIdx}
              onChange={(e) => setThemeIdx(Number(e.target.value))}
            >
              {colorThemes.map((t, i) => (
                <option value={i} key={t.label}>
                  {t.label}
                </option>
              ))}
            </select>
          </span>
          <span
            className={`flex items-center gap-2 ${colorThemes[themeIdx].text} font-medium text-sm`}
          >
            <PiTextAaBold /> Font
            <select
              className="ml-1 bg-transparent border-none focus:ring-0 text-sm"
              value={font}
              onChange={(e) => setFont(e.target.value)}
            >
              {fontOptions.map((f) => (
                <option value={f.value} key={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </span>
          <span
            className={`flex items-center gap-2 ${colorThemes[themeIdx].text} font-medium text-sm`}
          >
            <PiTextHOneBold /> Size
            <select
              className="ml-1 bg-transparent border-none focus:ring-0 text-sm"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            >
              {fontSizes.map((s) => (
                <option value={s} key={s}>
                  {s}px
                </option>
              ))}
            </select>
          </span>
          <span
            className={`flex items-center gap-2 ${colorThemes[themeIdx].text} font-medium text-sm`}
          >
            <PiTextAlignLeftBold /> Line
            <select
              className="ml-1 bg-transparent border-none focus:ring-0 text-sm"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
            >
              {lineHeights.map((lh) => (
                <option value={lh} key={lh}>
                  {lh}
                </option>
              ))}
            </select>
          </span>
          <span
            className={`flex items-center gap-2 ${colorThemes[themeIdx].text} font-medium text-sm`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>{" "}
            Color
            <select
              className="ml-1 bg-transparent border-none focus:ring-0 text-sm"
              value={accentIdx}
              onChange={(e) => setAccentIdx(Number(e.target.value))}
            >
              {accentColors.map((c, i) => (
                <option value={i} key={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </span>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded bg-white/80 border border-gray-200 shadow hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-sm"
            onClick={handlePrint}
            title="Print note"
            type="button"
          >
            <PiPrinterBold className="text-lg" /> Print
          </button>
        </div>
        <div
          ref={noteCardRef}
          className={`rounded-2xl shadow-lg border ${currentAccent.border} px-8 py-8 transition-all duration-200 ${colorThemes[themeIdx].bg} ${colorThemes[themeIdx].text}`}
        >
          {error ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <FiAlertTriangle className="text-2xl" />
              <p className="font-medium">Error: {error}</p>
            </div>
          ) : note ? (
            <div className="flex flex-col gap-6">
              <div className={`border-b ${currentAccent.border} pb-4 mb-2`}>
                <h2 className="text-3xl font-bold flex items-center gap-2 mb-1 tracking-tight">
                  {note.title}
                </h2>
                <div className="flex flex-row gap-2 items-center justify-between mt-1">
                  <p
                    className={`font-medium ${currentAccent.user} flex items-center gap-2`}
                  >
                    <AiOutlineUser className={currentAccent.date} />
                    {note.user.name}
                  </p>
                  <p className={`text-sm ${currentAccent.date} font-mono`}>
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div
                className={`${currentAccent.prose} prose max-w-none`}
                style={{ color: "inherit" }}
              >
                <MarkdownRenderer content={note.content} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center text-blue-400 py-10">
              <svg
                className="animate-spin h-6 w-6 mr-2 text-blue-400"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              <span className="text-base">Loading note...</span>
            </div>
          )}
        </div>
      </div>
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .print-note-card, .print-note-card * {
            visibility: visible !important;
          }
          .print-note-card {
            position: absolute !important;
            left: 0; top: 0; width: 100vw; min-height: 100vh;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
            color: #222 !important;
            z-index: 9999;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SharedNotes;
