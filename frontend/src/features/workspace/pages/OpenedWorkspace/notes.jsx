import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AiOutlineFile,
  AiOutlinePlus,
  AiOutlineSearch,
} from "react-icons/ai";
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiGridFour,
  PiList,
  PiSparkle,
  PiUploadSimple,
} from "react-icons/pi";
import { FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { clearNotes, setNotes } from "@redux/slices/notesSlice";
import AiGeneratedNote from "./Notes/ai-generated-note";
import GeminiIcon from "@features/ai/components/geminiIcon";
import FileToNoteUploader from "@features/notes/components/FileToNoteUploader";

const Notes = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = useMemo(
    () => ({
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  const { workspaceId } = useParams();
  const useGemini = localStorage.getItem("useGemini") === "true";
  const notesState = useSelector((state) => state.notes.notes);
  const notes = useMemo(
    () => (Array.isArray(notesState) ? notesState : []),
    [notesState]
  );
  const userData = useSelector((state) => state.auth.user) || {};

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formatDate = useCallback(
    (dateValue) =>
      new Date(dateValue).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    []
  );

  const fetchNotes = useCallback(
    async (page, size) => {
      if (!notes.length) setLoading(true);

      try {
        const response = await fetch(
          `${apiURL}/api/notes/${workspaceId}?page=${page}&pageSize=${size}`,
          {
            method: "GET",
            headers: header,
          }
        );

        if (!response.ok) {
          dispatch(clearNotes());
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to fetch notes.");
          return;
        }

        const data = await response.json();
        dispatch(setNotes(data.notes || []));
        setTotalItems(data.totalItems || 0);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        setPageSize(data.pageSize || 10);
      } catch (error) {
        console.error("Error fetching notes:", error);
        toast.error("Network error or server unavailable.");
      } finally {
        setLoading(false);
      }
    },
    [apiURL, dispatch, header, notes.length, workspaceId]
  );

  useEffect(() => {
    fetchNotes(currentPage, pageSize);
  }, [currentPage, fetchNotes, pageSize, workspaceId]);

  const filteredNotes = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return notes;

    return notes.filter((note) => {
      const title = note.title?.toLowerCase() || "";
      const owner = note.user?.name?.toLowerCase() || "";
      return title.includes(normalized) || owner.includes(normalized);
    });
  }, [notes, searchTerm]);

  const handleAddNewNote = async () => {
    const newTitle = `Note_${new Date()
      .toISOString()
      .replace(/\..+/, "")
      .replace(/:/g, "-")
      .replace(/T/g, "_")}`;

    const newNoteData = {
      workspace_id: workspaceId,
      owned_by: userData.id,
      title: newTitle,
      content: "",
    };

    try {
      const response = await fetch(`${apiURL}/api/notes`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(newNoteData),
      });

      if (!response.ok) {
        toast.error("Error creating the note");
        return;
      }

      const data = await response.json();
      toast.success("Note created");
      fetchNotes(currentPage, pageSize);
      navigate(data.id);
    } catch (error) {
      console.error("Network error creating note:", error);
      toast.error("Network error or server unavailable.");
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      if (!window.confirm("Delete this note permanently?")) return;

      const response = await fetch(`${apiURL}/api/notes/${id}`, {
        method: "DELETE",
        headers: header,
      });

      if (!response.ok) {
        toast.error("Error deleting note");
        return;
      }

      toast.success("Note deleted");
      fetchNotes(currentPage, pageSize);
    } catch (error) {
      toast.error("Error deleting note");
      console.error("Network error deleting note:", error);
    }
  };

  const selectNote = (id) => navigate(id);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-[1480px] flex-col gap-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-3 shadow-sm sm:p-5">
      <ToastContainer position="top-right" autoClose={2400} hideProgressBar />

      <header className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-gray-900">
              <AiOutlineFile className="text-blue-600" size={24} />
              Workspace Notes
            </h1>
            <p className="text-sm text-gray-600">
              {totalItems} notes in this workspace
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {useGemini && (
              <button
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                onClick={() => document.getElementById("ai_gen_note")?.showModal()}
              >
                <GeminiIcon size={16} />
                AI Note
              </button>
            )}

            <button
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
              onClick={() =>
                document.getElementById("upload_note_modal")?.showModal()
              }
            >
              <PiUploadSimple size={16} />
              Upload
            </button>

            <button
              className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-black"
              onClick={handleAddNewNote}
            >
              <AiOutlinePlus size={16} />
              New Note
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:max-w-sm">
            <AiOutlineSearch className="text-gray-500" size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title or owner"
              className="w-full bg-transparent text-sm text-gray-700 outline-none"
              aria-label="Search notes"
            />
          </label>

          <div className="inline-flex w-fit items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              className={`rounded-md px-2 py-1 text-sm transition ${
                viewMode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              }`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <PiList size={18} />
            </button>
            <button
              className={`rounded-md px-2 py-1 text-sm transition ${
                viewMode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <PiGridFour size={18} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(pageSize)].map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-3 rounded bg-gray-100" />
                <div className="h-3 w-4/5 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </section>
      ) : filteredNotes.length === 0 ? (
        <section className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center text-gray-500">
          <PiSparkle size={34} className="mb-3 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700">No matching notes</h2>
          <p className="mt-1 text-sm">Try another search or create a new note.</p>
          <button
            onClick={handleAddNewNote}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
          >
            <AiOutlinePlus size={16} />
            Create Note
          </button>
        </section>
      ) : viewMode === "list" ? (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note, index) => (
                  <tr key={note.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="inline-flex max-w-[20rem] items-center gap-2 truncate font-medium text-gray-800 hover:text-blue-700"
                        onClick={() => selectNote(note.id)}
                      >
                        <AiOutlineFile className="text-gray-400" size={16} />
                        <span className="truncate">{note.title}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(note.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(note.updatedAt)}</td>
                    <td className="px-4 py-3 text-gray-700">{note.user?.name || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="rounded-md p-2 text-red-500 transition hover:bg-red-50"
                        title="Delete"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <FaTrash size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              onClick={() => selectNote(note.id)}
            >
              <div className="flex items-start gap-2">
                <AiOutlineFile size={18} className="mt-0.5 text-blue-600" />
                <h2 className="line-clamp-2 text-base font-semibold text-gray-800">
                  {note.title}
                </h2>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>Created: {formatDate(note.createdAt)}</p>
                <p>Updated: {formatDate(note.updatedAt)}</p>
                <p>
                  Owner: <span className="font-medium text-gray-700">{note.user?.name || "-"}</span>
                </p>
              </div>

              <button
                className="absolute right-3 top-3 rounded-md p-2 text-red-500 opacity-0 transition hover:bg-red-50 group-hover:opacity-100"
                title="Delete"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDeleteNote(note.id);
                }}
              >
                <FaTrash size={13} />
              </button>
            </article>
          ))}
        </section>
      )}

      {totalPages > 1 && (
        <footer className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PiCaretLeftBold size={16} />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PiCaretRightBold size={16} />
          </button>
        </footer>
      )}

      <dialog id="upload_note_modal" className="modal backdrop:bg-black/50">
        <div className="modal-box max-w-xl rounded-xl border border-gray-200 bg-white p-6">
          <form method="dialog" className="absolute right-3 top-3">
            <button className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-gray-100">
              x
            </button>
          </form>

          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <PiUploadSimple size={20} className="text-blue-600" />
            Upload File to Create Note
          </h3>
          <p className="mb-5 text-sm text-gray-600">
            Supported types: <span className="font-medium">.doc .docx .txt</span>
          </p>

          <FileToNoteUploader />
        </div>
      </dialog>

      <dialog id="ai_gen_note" className="modal backdrop:bg-black/60">
        <div className="modal-box h-[90vh] w-11/12 max-w-none overflow-hidden rounded-xl bg-transparent p-0 shadow-lg">
          <form method="dialog" className="absolute right-3 top-3 z-10">
            <button className="btn btn-sm btn-circle btn-ghost bg-black/40 text-white hover:bg-black/60">
              x
            </button>
          </form>
          <AiGeneratedNote />
        </div>
      </dialog>
    </div>
  );
};

export default Notes;
