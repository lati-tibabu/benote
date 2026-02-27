import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AiOutlineRedo,
  AiOutlineUndo,
} from "react-icons/ai";
import {
  PiArrowLeft,
  PiCheckCircleDuotone,
  PiCloudArrowUp,
  PiCodeBlock,
  PiCopy,
  PiDownloadSimple,
  PiEye,
  PiFloppyDisk,
  PiImage,
  PiLink,
  PiListBullets,
  PiListNumbers,
  PiParagraph,
  PiQuotes,
  PiShareFat,
  PiSparkleDuotone,
  PiTextB,
  PiTextHOne,
  PiTextHTwo,
  PiTextItalic,
  PiTextUnderline,
} from "react-icons/pi";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";
import NoteChat from "./noteChat";
import GeminiIcon from "@features/ai/components/geminiIcon";

const MODE_EDIT = "edit";
const MODE_SPLIT = "split";
const MODE_PREVIEW = "preview";
const AUTOSAVE_DELAY = 1200;
const HISTORY_LIMIT = 200;

const OpenedNote = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = useMemo(
    () => ({
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const { note_id } = useParams();
  const workspace = useSelector((state) => state.workspace.workspace);
  const useGemini = localStorage.getItem("useGemini") === "true";
  const userData = useSelector((state) => state.auth.user);

  const [layoutMode, setLayoutMode] = useState(MODE_SPLIT);
  const [aiAssistMode, setAiAssistMode] = useState(false);
  const [editorFont, setEditorFont] = useState("Inter, system-ui, sans-serif");

  const [noteData, setNoteData] = useState({
    id: "",
    title: "",
    content: "",
    public: false,
    workspace_id: workspace?.id,
    owned_by: userData?.id,
  });
  const [draft, setDraft] = useState("");
  const [persistedSnapshot, setPersistedSnapshot] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState("saved");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const previewRef = useRef(null);
  const editorRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  const deferredDraft = useDeferredValue(draft);
  const localDraftKey = useMemo(() => `benote-note-draft-${note_id}`, [note_id]);
  const isDirty =
    draft !== persistedSnapshot.content ||
    (noteData.title || "") !== (persistedSnapshot.title || "");

  const setEditorSelection = (start, end) => {
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      editorRef.current.selectionStart = start;
      editorRef.current.selectionEnd = end;
    });
  };

  const pushToUndo = useCallback((value) => {
    const stack = undoStackRef.current;
    stack.push(value);
    if (stack.length > HISTORY_LIMIT) {
      stack.shift();
    }
  }, []);

  const setDraftWithHistory = useCallback(
    (nextValue) => {
      setDraft((previousValue) => {
        if (previousValue === nextValue) return previousValue;
        pushToUndo(previousValue);
        redoStackRef.current = [];
        return nextValue;
      });
    },
    [pushToUndo]
  );

  const handleUndo = useCallback(() => {
    if (!undoStackRef.current.length) return;

    const previous = undoStackRef.current.pop();
    setDraft((currentValue) => {
      redoStackRef.current.push(currentValue);
      return previous;
    });
  }, []);

  const handleRedo = useCallback(() => {
    if (!redoStackRef.current.length) return;

    const next = redoStackRef.current.pop();
    setDraft((currentValue) => {
      pushToUndo(currentValue);
      return next;
    });
  }, [pushToUndo]);

  const replaceSelection = (transform) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = draft.slice(start, end);
    const { nextValue, nextSelectionStart, nextSelectionEnd } = transform({
      start,
      end,
      selectedText,
      value: draft,
    });

    setDraftWithHistory(nextValue);
    setEditorSelection(nextSelectionStart, nextSelectionEnd);
  };

  const applyWrap = (left, right = left, placeholder = "text") => {
    replaceSelection(({ start, end, selectedText, value }) => {
      const content = selectedText || placeholder;
      const nextValue =
        value.slice(0, start) + left + content + right + value.slice(end);
      const caretStart = start + left.length;
      const caretEnd = caretStart + content.length;

      return {
        nextValue,
        nextSelectionStart: caretStart,
        nextSelectionEnd: caretEnd,
      };
    });
  };

  const applyLinePrefix = (prefix) => {
    replaceSelection(({ start, end, value }) => {
      const selected = value.slice(start, end);
      const base = selected || "List item";
      const lines = base
        .split("\n")
        .map((line) => (line.trim() ? `${prefix}${line}` : line))
        .join("\n");

      const nextValue = value.slice(0, start) + lines + value.slice(end);
      return {
        nextValue,
        nextSelectionStart: start,
        nextSelectionEnd: start + lines.length,
      };
    });
  };

  const applyTemplate = (template, selectStartOffset = 0, selectEndOffset = 0) => {
    replaceSelection(({ start, end, value }) => {
      const nextValue = value.slice(0, start) + template + value.slice(end);
      return {
        nextValue,
        nextSelectionStart: start + selectStartOffset,
        nextSelectionEnd:
          start + (selectEndOffset > 0 ? selectEndOffset : template.length),
      };
    });
  };

  const saveNote = useCallback(
    async ({ notify = false } = {}) => {
      if (!note_id) return false;

      const payload = {
        ...noteData,
        content: draft,
      };

      setSaveState("saving");
      try {
        const response = await fetch(`${apiURL}/api/notes/${note_id}`, {
          method: "PUT",
          headers: header,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          setSaveState("error");
          if (notify) toast.error("Failed to save note");
          return false;
        }

        const now = new Date();
        setSaveState("saved");
        setLastSavedAt(now);
        setPersistedSnapshot({ title: payload.title || "", content: payload.content || "" });
        localStorage.removeItem(localDraftKey);
        if (notify) toast.success("Note saved");
        return true;
      } catch (error) {
        console.error(error);
        setSaveState("error");
        if (notify) toast.error("Save failed due to network error");
        return false;
      }
    },
    [apiURL, draft, header, localDraftKey, noteData, note_id]
  );

  const fetchNote = useCallback(async () => {
    if (!workspace?.id || !note_id) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiURL}/api/notes/${workspace.id}/${note_id}`, {
        method: "GET",
        headers: header,
      });

      if (!response.ok) {
        toast.error("Error fetching note");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const cachedDraft = localStorage.getItem(localDraftKey);
      const restoredContent = cachedDraft ?? data.content ?? "";

      setNoteData(data);
      setDraft(restoredContent);
      undoStackRef.current = [];
      redoStackRef.current = [];
      setPersistedSnapshot({ title: data.title || "", content: data.content || "" });
      setSaveState(cachedDraft ? "unsaved" : "saved");
      if (cachedDraft && cachedDraft !== data.content) {
        toast.info("Recovered unsaved local draft for this note");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load note");
    } finally {
      setLoading(false);
    }
  }, [apiURL, header, localDraftKey, note_id, workspace?.id]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  useEffect(() => {
    if (!note_id || loading) return;
    if (!isDirty) return;

    setSaveState("unsaved");
    localStorage.setItem(localDraftKey, draft);

    const timer = setTimeout(() => {
      saveNote({ notify: false });
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [draft, isDirty, loading, localDraftKey, note_id, saveNote]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleTitleChange = (e) => {
    setNoteData((prev) => ({ ...prev, title: e.target.value }));
  };

  const handlePublish = async () => {
    if (!noteData?.id || !workspace?.id) {
      toast.error("Invalid note context");
      return;
    }

    try {
      const response = await fetch(
        `${apiURL}/api/notes/${workspace.id}/${noteData.id}/publish`,
        {
          method: "PATCH",
          headers: header,
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to publish");
      }

      const publicUrl = `${window.location.origin}/public/notes/${noteData.id}`;
      setNoteData((prev) => ({ ...prev, public: true }));
      navigator.clipboard.writeText(publicUrl);
      toast.success("Published and link copied");
    } catch (error) {
      toast.error(error.message || "Publish failed");
    }
  };

  const copyPublicUrl = async () => {
    const url = `${window.location.origin}/public/notes/${noteData.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Public URL copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDownloadPdf = () => {
    if (!previewRef.current) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<html><head><title>${noteData?.title || "Note"}</title>`);
    printWindow.document.write(pdfStyles);
    printWindow.document.write("</head><body>");
    printWindow.document.write(`<header>${noteData?.title || "Untitled Note"}</header>`);
    printWindow.document.write(previewRef.current.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 350);
    };
  };

  const handleEditorKeydown = (event) => {
    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;

    const key = event.key.toLowerCase();

    if (key === "b") {
      event.preventDefault();
      applyWrap("**");
      return;
    }
    if (key === "i") {
      event.preventDefault();
      applyWrap("*");
      return;
    }
    if (key === "u") {
      event.preventDefault();
      applyWrap("++", "++", "underlined");
      return;
    }
    if (key === "k") {
      event.preventDefault();
      applyTemplate("[link text](https://)", 1, 10);
      return;
    }
    if (key === "s") {
      event.preventDefault();
      saveNote({ notify: true });
      return;
    }
    if (key === "z" && event.shiftKey) {
      event.preventDefault();
      handleRedo();
      return;
    }
    if (key === "z") {
      event.preventDefault();
      handleUndo();
      return;
    }
    if (key === "y") {
      event.preventDefault();
      handleRedo();
      return;
    }
    if (event.shiftKey && key === "7") {
      event.preventDefault();
      applyLinePrefix("1. ");
      return;
    }
    if (event.shiftKey && key === "8") {
      event.preventDefault();
      applyLinePrefix("- ");
      return;
    }
    if (event.shiftKey && key === "9") {
      event.preventDefault();
      applyLinePrefix("> ");
      return;
    }
    if (event.shiftKey && key === "c") {
      event.preventDefault();
      applyTemplate("```\ncode\n```", 4, 8);
    }
  };

  const toolbarActions = [
    {
      label: "Bold",
      icon: PiTextB,
      shortcut: "Ctrl+B",
      action: () => applyWrap("**"),
    },
    {
      label: "Italic",
      icon: PiTextItalic,
      shortcut: "Ctrl+I",
      action: () => applyWrap("*"),
    },
    {
      label: "Underline",
      icon: PiTextUnderline,
      shortcut: "Ctrl+U",
      action: () => applyWrap("++", "++", "underlined"),
    },
    {
      label: "Heading 1",
      icon: PiTextHOne,
      shortcut: "",
      action: () => applyLinePrefix("# "),
    },
    {
      label: "Heading 2",
      icon: PiTextHTwo,
      shortcut: "",
      action: () => applyLinePrefix("## "),
    },
    {
      label: "Bullet List",
      icon: PiListBullets,
      shortcut: "Ctrl+Shift+8",
      action: () => applyLinePrefix("- "),
    },
    {
      label: "Numbered List",
      icon: PiListNumbers,
      shortcut: "Ctrl+Shift+7",
      action: () => applyLinePrefix("1. "),
    },
    {
      label: "Blockquote",
      icon: PiQuotes,
      shortcut: "Ctrl+Shift+9",
      action: () => applyLinePrefix("> "),
    },
    {
      label: "Code Block",
      icon: PiCodeBlock,
      shortcut: "Ctrl+Shift+C",
      action: () => applyTemplate("```\ncode\n```", 4, 8),
    },
    {
      label: "Link",
      icon: PiLink,
      shortcut: "Ctrl+K",
      action: () => applyTemplate("[link text](https://)", 1, 10),
    },
    {
      label: "Image",
      icon: PiImage,
      shortcut: "",
      action: () => applyTemplate("![alt text](https://)", 2, 10),
    },
    {
      label: "Video",
      icon: PiParagraph,
      shortcut: "",
      action: () =>
        applyTemplate("[https://www.youtube.com/watch?v=dQw4w9WgXcQ](https://www.youtube.com/watch?v=dQw4w9WgXcQ)"),
    },
  ];

  const statusLabel =
    saveState === "saving"
      ? "Saving..."
      : saveState === "error"
        ? "Save failed"
        : saveState === "unsaved"
          ? "Unsaved changes"
          : lastSavedAt
            ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Saved";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[1480px] flex-col gap-4 rounded-2xl border border-gray-200 bg-white/80 p-3 shadow-sm backdrop-blur sm:p-5">
      <ToastContainer position="top-right" autoClose={2400} hideProgressBar />

      {loading ? (
        <div className="animate-pulse space-y-4 p-3 sm:p-6">
          <div className="h-10 w-1/3 rounded-lg bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-100" />
          <div className="h-[55vh] rounded-xl bg-gray-100" />
        </div>
      ) : (
        <>
          <header className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <button
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50"
                  onClick={() => window.history.back()}
                  aria-label="Back to notes"
                  title="Back"
                >
                  <PiArrowLeft size={18} />
                </button>
                <input
                  type="text"
                  value={noteData.title || ""}
                  onChange={handleTitleChange}
                  className="w-full min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-lg font-semibold text-gray-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  placeholder="Untitled note"
                  aria-label="Note title"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${
                    saveState === "error"
                      ? "bg-red-50 text-red-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {saveState === "saving" ? (
                    <PiSparkleDuotone className="animate-spin" />
                  ) : (
                    <PiCheckCircleDuotone />
                  )}
                  {statusLabel}
                </span>

                <button
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  onClick={() => saveNote({ notify: true })}
                  title="Save (Ctrl+S)"
                >
                  <PiFloppyDisk size={16} /> Save
                </button>

                {noteData?.public ? (
                  <button
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    onClick={copyPublicUrl}
                    title="Copy public URL"
                  >
                    <PiCopy size={16} /> Copy Link
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white transition hover:bg-black"
                    onClick={handlePublish}
                    title="Publish note"
                  >
                    <PiShareFat size={16} /> Publish
                  </button>
                )}

                <button
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                  onClick={handleDownloadPdf}
                  title="Download PDF"
                >
                  <PiDownloadSimple size={16} /> PDF
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  className={`rounded-md px-3 py-1 text-sm ${layoutMode === MODE_EDIT ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}
                  onClick={() => setLayoutMode(MODE_EDIT)}
                >
                  Edit
                </button>
                <button
                  className={`rounded-md px-3 py-1 text-sm ${layoutMode === MODE_SPLIT ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}
                  onClick={() => setLayoutMode(MODE_SPLIT)}
                >
                  Split
                </button>
                <button
                  className={`rounded-md px-3 py-1 text-sm ${layoutMode === MODE_PREVIEW ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}
                  onClick={() => setLayoutMode(MODE_PREVIEW)}
                >
                  Preview
                </button>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                Font
                <select
                  value={editorFont}
                  onChange={(event) => setEditorFont(event.target.value)}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Inter, system-ui, sans-serif">Inter</option>
                  <option value="'IBM Plex Sans', sans-serif">IBM Plex Sans</option>
                  <option value="'Source Serif 4', serif">Source Serif</option>
                  <option value="'Courier New', monospace">Courier New</option>
                </select>
              </label>
            </div>
          </header>

          <div className="grid min-h-[70vh] grid-cols-1 gap-4 lg:grid-cols-12">
            {(layoutMode === MODE_EDIT || layoutMode === MODE_SPLIT) && (
              <section
                className={
                  layoutMode === MODE_SPLIT
                    ? "rounded-xl border border-gray-200 bg-white lg:col-span-6"
                    : "rounded-xl border border-gray-200 bg-white lg:col-span-12"
                }
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                  <h2 className="text-sm font-semibold text-gray-700">Editor</h2>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <PiCloudArrowUp size={14} /> Autosave every {AUTOSAVE_DELAY / 1000}s
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50/80 p-2">
                  <button
                    onClick={handleUndo}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Undo (Ctrl/Cmd+Z)"
                    disabled={!undoStackRef.current.length}
                  >
                    <AiOutlineUndo size={14} />
                    <span className="hidden sm:inline">Undo</span>
                  </button>
                  <button
                    onClick={handleRedo}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Redo (Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z)"
                    disabled={!redoStackRef.current.length}
                  >
                    <AiOutlineRedo size={14} />
                    <span className="hidden sm:inline">Redo</span>
                  </button>
                  {toolbarActions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-50"
                        title={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                      >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <textarea
                  ref={editorRef}
                  value={draft}
                  onChange={(event) => setDraftWithHistory(event.target.value)}
                  onKeyDown={handleEditorKeydown}
                  className="min-h-[58vh] w-full resize-none border-0 bg-white p-4 text-base leading-7 text-gray-800 outline-none"
                  style={{ fontFamily: editorFont }}
                  placeholder="Write your note... Markdown and keyboard shortcuts are supported."
                  aria-label="Note editor"
                />

                <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-500">
                  Shortcuts: Ctrl/Cmd+B, I, U, K, S, and Ctrl/Cmd+Shift+7/8/9/C
                </div>
              </section>
            )}

            {(layoutMode === MODE_PREVIEW || layoutMode === MODE_SPLIT) && (
              <section
                className={
                  layoutMode === MODE_SPLIT
                    ? "rounded-xl border border-gray-200 bg-white lg:col-span-6"
                    : "rounded-xl border border-gray-200 bg-white lg:col-span-12"
                }
              >
                <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                  <h2 className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <PiEye size={16} /> Live Preview
                  </h2>
                </div>

                <div className="max-h-[64vh] overflow-y-auto px-4 py-4 sm:px-6" ref={previewRef}>
                  {deferredDraft?.trim() ? (
                    <MarkdownRenderer
                      content={deferredDraft}
                      className="prose prose-gray max-w-none"
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
                      Preview updates in real time as you type.
                    </div>
                  )}
                </div>
              </section>
            )}

            {useGemini && (
              <aside className="rounded-xl border border-gray-200 bg-white lg:col-span-12">
                <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                  <button
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700"
                    onClick={() => setAiAssistMode((prev) => !prev)}
                  >
                    <GeminiIcon width={18} /> AI Assistant
                  </button>
                  <span className="text-xs text-gray-500">
                    {aiAssistMode ? "Visible" : "Hidden"}
                  </span>
                </div>
                {aiAssistMode && <NoteChat noteContext={draft} />}
              </aside>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OpenedNote;

const pdfStyles = `
  <style>
    body {
      font-family: Inter, Arial, sans-serif;
      margin: 32px;
      color: #111827;
      line-height: 1.7;
      background: #ffffff;
    }
    header {
      font-size: 1.7rem;
      font-weight: 700;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.7rem;
      margin-bottom: 1.2rem;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
    }
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 8px;
      overflow: auto;
    }
    blockquote {
      border-left: 4px solid #93c5fd;
      padding-left: 1rem;
      color: #1f2937;
      background: #eff6ff;
    }
  </style>
`;
