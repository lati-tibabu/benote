import React, { useEffect, useRef, useState } from "react";
import {
  AiOutlineDelete,
  AiOutlineDisconnect,
  AiOutlineWifi,
} from "react-icons/ai";
import { FaReply } from "react-icons/fa";
import { FaPaperPlane, FaXmark } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import useSocket from "../../../../../hooks/useSocket";
import MarkdownRenderer from "../../../../../components/markdown-renderer";

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      console.error("Connection Error");
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
  // console.log("Socket", socket?.connected);

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
        // console.log(response);
        throw new Error("Failed to fetch discussions");
      }

      const data = await response.json();
      setDiscussions(data);
    } catch (error) {
      console.error(error);
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

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });
      socket.on("error", (err) => {
        console.error("Socket error:", err.message);
      });

      return () => {
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
    if (!socket) {
      console.warn(
        "Socket not initialized yet, backend may not support socket connections."
      );
      return;
    }

    try {
      const messageListener = (data) => {
        console.log("New message received", data);
        fetchDiscussions();
      };

      socket.on("message", messageListener);

      return () => {
        if (socket) {
          socket.off("message", messageListener);
        }
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
  }, [replyData.replyingTo]);

  const formatPostDate = (createdAt) => {
    const dateFormat = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    const postDate = new Date(createdAt).getTime();

    // Check if the post was created within the last 7 days
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
        toast.error("Unable to delete, are you the owner of the post");
        throw new Error("Failed to delete discussion");
      }
      if (socket && socket.connected) {
        socket.emit("discussionMessage", "update", teamId);
      } else {
        console.warn("Socket not connected. Cannot emit message.");
      }

      fetchDiscussions();
    } catch (error) {
      console.error(error);
      alert("Failed to delete discussion");
    }
  };

  const DiscussionThread = ({ discussion }) => {
    return (
      <div className="ml-6 pl-2 mt-3 bg-white hover:bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 flex items-center justify-center rounded-full text-white font-semibold text-lg">
              {discussion["user.name"][0]}
            </div>
            <div className="font-semibold text-gray-800 text-sm">
              {discussion["user.name"]}
            </div>
          </div>
          <div
            onClick={() => handleDeleteDiscussion(discussion.id)}
            className="cursor-pointer hover:text-red-500 text-gray-600 text-lg transition-colors"
          >
            <AiOutlineDelete />
          </div>
        </div>

        <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="text-gray-700" title={discussion["user.email"]}>
            <MarkdownRenderer content={discussion.content} />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {formatPostDate(discussion.createdAt)}
          </div>
          <div className="flex items-center mt-3 gap-3">
            <button
              className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition"
              onClick={() => {
                setReplyData({
                  replying: true,
                  replyingTo: discussion.id,
                  content: discussion.content,
                });
              }}
            >
              <FaReply className="text-blue-400" />
              Reply{" "}
              {discussion.replies?.length > 0 &&
                `(${discussion.replies.length})`}
            </button>
          </div>
        </div>

        <div className="ml-6 mt-2">
          {discussion.replies?.length > 0 &&
            discussion.replies.map((reply) => (
              <DiscussionThread key={reply.id} discussion={reply} />
            ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!discussionData.content) {
      alert("Discussion content cannot be empty");
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
      // const data = await response.json();

      if (socket && socket.connected) {
        socket.emit("discussionMessage", "update", teamId);
      } else {
        console.warn("Socket not connected. Cannot emit message.");
      }

      setDiscussionData({ content: "", team_id: teamId, discussion_id: null });
      setReplyData({ replying: false, replyingTo: null, content: "" });
      fetchDiscussions();
    } catch (error) {
      console.error(error);
      alert("Failed to submit discussion");
    }
    // console.log(discussionData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiscussionData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer />
      <div className="text-sm font-bold mb-4">
        {isConnected ? (
          <span className="text-green-600 flex items-center gap-2">
            Connected <AiOutlineWifi />
          </span>
        ) : (
          <span className="text-red-500 flex items-center gap-2">
            Disconnected
            <AiOutlineDisconnect />
          </span>
        )}
      </div>

      <div className="rounded-lg p-4 bg-white shadow-md">
        <div className="flex flex-col h-96 max-w-4xl mx-auto overflow-auto gap-4 scrollbar-hide">
          {discussions ? (
            discussions.map((discussion) => (
              <DiscussionThread key={discussion.id} discussion={discussion} />
            ))
          ) : (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner text-blue-500"></span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mt-6">
        {replyData.replying && (
          <div className="flex flex-col border-t-2 border-blue-400 mt-2 p-4 bg-white rounded-lg shadow-md max-w-xl mx-auto">
            <div className="text-sm flex items-center gap-2 text-gray-500">
              <FaReply />
              Replying To
              <FaXmark
                color="red"
                className="cursor-pointer ml-auto"
                onClick={() => {
                  setReplyData({
                    replying: false,
                    replyingTo: null,
                    content: "",
                  });
                }}
              />
            </div>
            <div className="mt-2 text-gray-700 text-sm">
              {(replyData.content || "No content").slice(0, 50) + "..."}
            </div>
          </div>
        )}

        <form
          className="flex items-center gap-4 mt-4 p-4 bg-white rounded-lg shadow-md max-w-3xl mx-auto"
          onSubmit={handleSubmit}
        >
          <textarea
            name="content"
            onChange={handleInputChange}
            value={discussionData.content}
            placeholder="Ask a question or start a discussion..."
            className="w-full h-16 p-3 text-sm rounded-lg resize-none bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-300 transition-all"
          ></textarea>
          <button className="flex items-center gap-2 text-sm text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg shadow-md">
            <FaPaperPlane /> Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Discussions;
