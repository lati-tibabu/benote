import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { FiFileText, FiAlertTriangle } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import {
  PiPaintBrushBold,
  PiTextAaBold,
  PiTextHOneBold,
  PiTextAlignLeftBold,
  PiPrinterBold,
} from "react-icons/pi";
import MarkdownRenderer from "../../../components/markdown-renderer";

// Expanded font options (place before the component)
const fontOptions = [
  // Serif
  { label: "Default", value: "" },
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
  // Sans-serif
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
  // Monospace
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
const colorThemes = [
  { label: "Default", bg: "bg-white", text: "text-blue-900" },
  { label: "Night", bg: "bg-gray-900", text: "text-gray-100" },
  { label: "Sepia", bg: "bg-yellow-50", text: "text-yellow-900" },
];
const fontSizes = [14, 16, 18, 20, 22];
const lineHeights = [1.4, 1.6, 1.8, 2];
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
  const [note, setNote] = useState(null);
  const [error, setError] = useState(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const [font, setFont] = useState("Georgia, serif");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [accentIdx, setAccentIdx] = useState(0);
  const noteCardRef = useRef(null);

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
    // Add a print class to the note card, print, then remove the class
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

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start py-10 px-2 ${colorThemes[themeIdx].bg}`}
    >
      {/* Notion-style note card */}
      <div className="w-full max-w-2xl mx-auto">
        {/* Preferences Bar */}
        <div
          className={`flex flex-wrap items-center gap-4 mb-6 p-3 rounded-xl bg-blue-50/60 border ${accentColors[accentIdx].border} shadow-sm`}
        >
          <span
            className={`flex items-center gap-2 ${accentColors[accentIdx].icon} font-medium`}
          >
            <PiPaintBrushBold /> Theme
            <select
              className="ml-1 bg-transparent"
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
            className={`flex items-center gap-2 ${accentColors[accentIdx].icon} font-medium`}
          >
            <PiTextAaBold /> Font
            <select
              className="ml-1 bg-transparent"
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
            className={`flex items-center gap-2 ${accentColors[accentIdx].icon} font-medium`}
          >
            <PiTextHOneBold /> Size
            <select
              className="ml-1 bg-transparent"
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
            className={`flex items-center gap-2 ${accentColors[accentIdx].icon} font-medium`}
          >
            <PiTextAlignLeftBold /> Line
            <select
              className="ml-1 bg-transparent"
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
            className={`flex items-center gap-2 ${accentColors[accentIdx].icon} font-medium`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>{" "}
            Color
            <select
              className="ml-1 bg-transparent"
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
          <span
            className={`flex items-center gap-2 ${accentColors[accentIdx].icon} font-medium`}
          >
            <button
              className="flex items-center gap-1 px-3 py-1 rounded bg-white/80 border border-gray-200 shadow hover:bg-gray-50 transition"
              onClick={handlePrint}
              title="Print note"
              type="button"
            >
              <PiPrinterBold className="text-lg" /> Print
            </button>
          </span>
        </div>
        <div
          ref={noteCardRef}
          className={`rounded-2xl shadow-lg border ${accentColors[accentIdx].border} px-8 py-8 transition-all duration-200 ${colorThemes[themeIdx].bg} ${colorThemes[themeIdx].text}`}
          style={{ fontFamily: font, fontSize: fontSize, lineHeight }}
        >
          {error ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <FiAlertTriangle className="text-2xl" />
              <p className="font-medium">Error: {error}</p>
            </div>
          ) : note ? (
            <div className="flex flex-col gap-6">
              <div
                className={`border-b ${accentColors[accentIdx].border} pb-4 mb-2`}
              >
                <h2 className="text-3xl font-bold flex items-center gap-2 mb-1 tracking-tight">
                  {note.title}
                </h2>
                <div className="flex flex-row gap-2 items-center justify-between mt-1">
                  <p
                    className={`font-medium ${accentColors[accentIdx].user} flex items-center gap-2`}
                  >
                    <AiOutlineUser className={accentColors[accentIdx].date} />
                    {note.user.name}
                  </p>
                  <p
                    className={`text-sm ${accentColors[accentIdx].date} font-mono`}
                  >
                    {new Date(note.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div
                className={`${accentColors[accentIdx].prose} prose max-w-none`}
                style={{ color: "inherit" }}
              >
                <MarkdownRenderer
                  content={note.content}
                  className={accentColors[accentIdx].user}
                />
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
