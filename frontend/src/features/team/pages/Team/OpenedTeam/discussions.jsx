import React, { useEffect, useRef, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineDisconnect,
  AiOutlineWifi,
} from "react-icons/ai";
import { FaReply } from "react-icons/fa";
import { FaPaperPlane, FaXmark } from "react-icons/fa6";
import { FaRegComments, FaUserCircle } from "react-icons/fa";
import { BsSendFill } from "react-icons/bs";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Added toast import
import "react-toastify/dist/ReactToastify.css"; // Added toast CSS
import useSocket from "../../../../../hooks/useSocket";
import MarkdownRenderer from "@features/notes/components/markdown-renderer";

const Discussions = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const { teamId } = useParams();
  const [discussions, setDiscussions] = useState(null);
  const [discussionData, setDiscussionData] = useState({
    content: "",
    team_id: teamId,
    discussion_id: null,
  });

  const [replyData, setReplyData] = useState({
    replying: false,
    replyingTo: null,
    content: "",
  });

  const socket = useSocket(apiURL);

  const [isConnected, setIsConnected] = useState(socket?.connected);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [discussions]);

  useEffect(() => {
    if (!socket) {
      console.warn(
        "Socket not initialized yet, backend may not support socket connections."
      );
      return;
    }

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (error) => {
      console.error("Connection Error:", error.message);
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [socket]);

  const fetchDiscussions = async () => {
    try {
      const response = await fetch(
        `${apiURL}/api/discussions?team_id=${teamId}`,
        {
          method: "GET",
          headers: header,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch discussions");
      }

      const data = await response.json();
      setDiscussions(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load discussions."); // Added toast notification
    }
  };

  useEffect(() => {
    if (!socket) {
      console.warn(
        "Socket not initialized yet, backend may not support socket connections."
      );
      return;
    }

    try {
      socket.emit("teamDiscussionRegister", teamId);

      const messageListener = (data) => {
        console.log("New message received", data);
        fetchDiscussions();
      };

      socket.on("message", messageListener);
      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
      socket.on("error", (err) => {
        console.error("Socket error:", err.message);
      });

      return () => {
        socket.off("message", messageListener);
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("error");
        socket.off("teamDiscussionRegister");
      };
    } catch (error) {
      console.error("Socket error:", error.message);
    }
  }, [socket, teamId]);

  useEffect(() => {
    fetchDiscussions();
  }, [teamId]);

  useEffect(() => {
    setDiscussionData({
      content: "",
      team_id: teamId,
      discussion_id: replyData.replyingTo,
    });
  }, [replyData.replyingTo, teamId]); // Added teamId to dependency array

  const formatPostDate = (createdAt) => {
    const dateFormat = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    const postDate = new Date(createdAt).getTime();

    if (Date.now() - postDate > 7 * 86400000) {
      return new Date(createdAt).toLocaleDateString("en-US", dateFormat);
    } else {
      return new Date(createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "numeric",
      });
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm("Are you sure you want to delete this discussion?"))
      return;
    try {
      const response = await fetch(
        `${apiURL}/api/discussions/${discussionId}`,
        {
          method: "DELETE",
          headers: header,
        }
      );
      if (!response.ok) {
        toast.error("Unable to delete. Are you the owner of the post?");
        throw new Error("Failed to delete discussion");
      }
      if (socket && socket.connected) {
        socket.emit("discussionMessage", "update", teamId);
      } else {
        console.warn("Socket not connected. Cannot emit message.");
      }

      fetchDiscussions();
      toast.success("Discussion deleted successfully!"); // Added toast notification
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete discussion."); // Added toast notification
    }
  };

  // --- Telegram-like Chat Bubble Thread ---
  const DiscussionThread = ({ discussion }) => {
    const isOwn =
      discussion["user.email"] === (localStorage.getItem("userEmail") || "");
    return (
      <div
        className={`flex ${
          isOwn ? "justify-end" : "justify-start"
        } w-full mb-2`}
      >
        <div
          className={`max-w-[70%] flex flex-col ${
            isOwn ? "items-end" : "items-start"
          }`}
        >
          <div
            className={`flex items-center gap-2 ${
              isOwn ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-sm bg-gray-100 text-gray-600">
              <FaUserCircle size={22} />
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {discussion["user.name"]}
            </span>
          </div>
          <div
            className={`mt-1 px-4 py-2 rounded-sm shadow-sm border ${
              isOwn
                ? "bg-gray-100 border-gray-200 text-gray-900"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            <MarkdownRenderer content={discussion.content} />
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-gray-400">
                {formatPostDate(discussion.createdAt)}
              </span>
              <button
                className="ml-2 text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                onClick={() => {
                  setReplyData({
                    replying: true,
                    replyingTo: discussion.id,
                    content: discussion.content,
                  });
                }}
              >
                <FaReply className="text-gray-400" /> Reply
                {discussion.replies?.length > 0 && (
                  <span className="ml-1 text-gray-400">
                    ({discussion.replies.length})
                  </span>
                )}
              </button>
              {isOwn && (
                <button
                  className="ml-2 text-xs text-red-400 hover:text-red-600"
                  onClick={() => handleDeleteDiscussion(discussion.id)}
                  title="Delete"
                >
                  <AiOutlineDelete />
                </button>
              )}
            </div>
          </div>
          {/* Replies */}
          <div className="pl-6 mt-1 w-full">
            {discussion.replies?.length > 0 &&
              discussion.replies.map((reply) => (
                <DiscussionThread key={reply.id} discussion={reply} />
              ))}
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!discussionData.content.trim()) {
      toast.warn("Discussion content cannot be empty.");
      return;
    }
    try {
      const response = await fetch(`${apiURL}/api/discussions`, {
        method: "POST",
        headers: header,
        body: JSON.stringify(discussionData),
      });
      if (!response.ok) {
        throw new Error("Failed to submit discussion");
      }

      if (socket && socket.connected) {
        socket.emit("discussionMessage", "update", teamId);
      } else {
        console.warn("Socket not connected. Cannot emit message.");
      }

      setDiscussionData({ content: "", team_id: teamId, discussion_id: null });
      setReplyData({ replying: false, replyingTo: null, content: "" });
      fetchDiscussions();
      toast.success("Discussion submitted!"); // Added toast notification
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit discussion."); // Added toast notification
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiscussionData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-0 sm:p-6 flex flex-col">
      <ToastContainer />
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white/80 shadow-sm">
        <FaRegComments className="text-gray-500" size={22} />
        <h1 className="font-bold text-lg text-gray-900">Team Discussions</h1>
        <span
          className={`ml-auto text-xs font-bold flex items-center gap-1 ${
            isConnected ? "text-gray-600" : "text-red-500"
          }`}
        >
          {isConnected ? (
            <>
              Connected <AiOutlineWifi />
            </>
          ) : (
            <>
              Disconnected <AiOutlineDisconnect />
            </>
          )}
        </span>
      </div>
      {/* Chat Area */}
      <div className="flex-1 flex flex-col justify-end max-w-3xl mx-auto w-full">
        <div className="flex flex-col gap-2 px-2 py-4 overflow-y-auto scrollbar-hide">
          {discussions && discussions.length > 0 ? (
            discussions.map((discussion) => (
              <DiscussionThread key={discussion.id} discussion={discussion} />
            ))
          ) : discussions && discussions.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No discussions yet. Start one!
            </div>
          ) : (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner text-gray-500"></span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      {/* Reply Preview */}
      {replyData.replying && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-t border-gray-200">
          <FaReply className="text-gray-400" />
          <span className="text-xs text-gray-700">Replying to:</span>
          <span className="text-xs text-gray-500 truncate max-w-xs">
            {(replyData.content || "No content").slice(0, 50) + "..."}
          </span>
          <FaXmark
            className="ml-auto text-red-400 cursor-pointer hover:text-red-600"
            size={18}
            onClick={() =>
              setReplyData({ replying: false, replyingTo: null, content: "" })
            }
          />
        </div>
      )}
      {/* Input Area */}
      <form
        className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-100 shadow-sm max-w-3xl mx-auto w-full"
        onSubmit={handleSubmit}
      >
        <textarea
          name="content"
          onChange={handleInputChange}
          value={discussionData.content}
          placeholder="Type a message..."
          className="w-full h-12 p-2 text-sm rounded-sm resize-none bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:outline-none border border-gray-200 transition-all"
        ></textarea>
        <button
          className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white rounded-sm p-3 shadow-sm transition"
          type="submit"
          title="Send"
        >
          <BsSendFill size={18} />
        </button>
      </form>
    </div>
  );
};

export default Discussions;
