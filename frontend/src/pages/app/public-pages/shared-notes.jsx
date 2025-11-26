import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Import Link
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
import MarkdownRenderer from "@features/notes/components/markdown-renderer";

// Expanded font options for user selection
const fontOptions = [
  // Default/System UI
  {
    label: "Default System UI",
    value:
      "-apple-system, BlinkMacMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
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
  {
    label: "Default",
    bg: "bg-white",
    text: "text-gray-800",
    prefBg: "bg-gray-50",
    prefBorder: "border-gray-200",
  },
  {
    label: "Night",
    bg: "bg-gray-800",
    text: "text-gray-200",
    prefBg: "bg-gray-700",
    prefBorder: "border-gray-600",
  },
  {
    label: "Sepia",
    bg: "bg-yellow-50",
    text: "text-yellow-900",
    prefBg: "bg-yellow-100",
    prefBorder: "border-yellow-200",
  },
  {
    label: "Solarized Light",
    bg: "bg-gray-100",
    text: "text-gray-700",
    prefBg: "bg-gray-200",
    prefBorder: "border-gray-300",
  },
  {
    label: "Solarized Dark",
    bg: "bg-gray-900",
    text: "text-gray-100",
    prefBg: "bg-gray-800",
    prefBorder: "border-gray-700",
  },
  {
    label: "Nord",
    bg: "bg-nord-bg",
    text: "text-nord-text",
    prefBg: "bg-nord-dark",
    prefBorder: "border-nord-border",
  },
];

// Extend Tailwind CSS configuration if you use Nord theme custom colors
// In tailwind.config.js:
// theme: {
//   extend: {
//     colors: {
//       'nord-bg': '#2E3440',
//       'nord-dark': '#3B4252',
//       'nord-text': '#D8DEE9',
//       'nord-border': '#4C566A',
//       'nord-accent': '#88C0D0', // Example accent for Nord
//     },
//   },
// },

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
    label: "gray",
    value: "gray",
    border: "border-gray-100",
    icon: "text-gray-700",
    user: "text-gray-700",
    date: "text-gray-400",
    prose: "prose-gray",
  },
  {
    label: "gray",
    value: "gray",
    border: "border-gray-100",
    icon: "text-gray-700",
    user: "text-gray-700",
    date: "text-gray-400",
    prose: "prose-gray",
  },
  {
    label: "gray",
    value: "gray",
    border: "border-gray-100",
    icon: "text-gray-700",
    user: "text-gray-700",
    date: "text-gray-400",
    prose: "prose-gray",
  },
  {
    label: "gray",
    value: "gray",
    border: "border-gray-100",
    icon: "text-gray-700",
    user: "text-gray-700",
    date: "text-gray-400",
    prose: "prose-gray",
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
  {
    label: "White",
    value: "white",
    border: "border-gray-200", // A subtle border for white accent
    icon: "text-gray-500", // A contrasting icon color for white
    user: "text-gray-600",
    date: "text-gray-400",
    prose: "prose-gray", // Use a sensible default prose color for white
  },
  {
    label: "Black",
    value: "black",
    border: "border-gray-700", // A subtle border for black accent
    icon: "text-gray-900", // A contrasting icon color for black
    user: "text-gray-900",
    date: "text-gray-600",
    prose: "prose-black", // Tailwind's prose-black will ensure black text
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

  // Get current accent color details and theme details
  const currentAccent = accentColors[accentIdx];
  const currentTheme = colorThemes[themeIdx];

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-start py-12 px-4 transition-colors duration-200 ${currentTheme.bg}`}
      style={{ fontFamily: font, fontSize: `${fontSize}px`, lineHeight }}
    >
      {/* Top Bar for Navigation and Settings Toggle */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <Link // Changed to Link component
          to="/public/notes"
          className={`text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-2 text-base font-medium`}
        >
          <PiFile className="text-lg" /> Public Notes
        </Link>
        <button
          onClick={() => setShowPreferences(!showPreferences)}
          className={`p-2.5 rounded-sm bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors shadow-sm`}
          title="Toggle Note Settings"
        >
          <PiGearSixFill className={`text-2xl ${currentAccent.icon}`} />
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        {/* Preferences Bar - Conditionally rendered with smooth transition */}
        <div
          className={`flex flex-wrap items-center gap-4 mb-8 p-5 rounded-sm shadow-sm transition-all duration-300 ease-in-out ${
            currentTheme.prefBg
          } ${currentTheme.prefBorder} ${
            showPreferences
              ? "max-h-96 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 overflow-hidden -translate-y-2"
          }`}
        >
          <span
            className={`flex items-center gap-2 ${currentTheme.text} font-medium text-sm py-2 px-3 rounded-sm bg-white/70 border border-gray-100`}
          >
            <PiPaintBrushBold className="text-lg" /> Theme
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
            className={`flex items-center gap-2 ${currentTheme.text} font-medium text-sm py-2 px-3 rounded-sm bg-white/70 border border-gray-100`}
          >
            <PiTextAaBold className="text-lg" /> Font
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
            className={`flex items-center gap-2 ${currentTheme.text} font-medium text-sm py-2 px-3 rounded-sm bg-white/70 border border-gray-100`}
          >
            <PiTextHOneBold className="text-lg" /> Size
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
            className={`flex items-center gap-2 ${currentTheme.text} font-medium text-sm py-2 px-3 rounded-sm bg-white/70 border border-gray-100`}
          >
            <PiTextAlignLeftBold className="text-lg" /> Line
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
            className={`flex items-center gap-2 ${currentTheme.text} font-medium text-sm py-2 px-3 rounded-sm bg-white/70 border border-gray-100`}
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
            className="flex items-center gap-1 px-4 py-2 rounded-sm bg-white border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition text-sm text-gray-700"
            onClick={handlePrint}
            title="Print note"
            type="button"
          >
            <PiPrinterBold className="text-lg" /> Print
          </button>
        </div>
        <div
          ref={noteCardRef}
          className={`rounded-sm shadow-sm border ${currentAccent.border} px-10 py-10 transition-all duration-200 ${currentTheme.bg} ${currentTheme.text}`}
        >
          {error ? (
            <div className="flex items-center gap-3 text-red-700 bg-red-50 p-4 rounded-sm border border-red-200 shadow-sm">
              <FiAlertTriangle className="text-2xl text-red-500" />
              <p className="font-medium">Error: {error}</p>
            </div>
          ) : note ? (
            <div className="flex flex-col gap-6">
              <div className={`border-b ${currentAccent.border} pb-4 mb-2`}>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  {note.title}
                </h2>
                <div className="flex flex-row gap-2 items-center justify-between mt-1">
                  <p
                    className={`font-medium ${currentAccent.user} flex items-center gap-2 text-lg`}
                  >
                    <AiOutlineUser
                      className={`text-xl ${currentAccent.date}`}
                    />
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
                className={`${currentAccent.prose} prose prose-lg max-w-none`}
                style={{ color: "inherit" }}
              >
                <MarkdownRenderer
                  className={`${currentAccent.user}`}
                  content={note.content}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 py-16 animate-pulse">
              <FiFileText className="text-6xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
