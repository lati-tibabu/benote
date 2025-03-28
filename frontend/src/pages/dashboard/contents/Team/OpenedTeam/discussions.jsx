import React, { useEffect, useState } from "react";
import { AiOutlineDelete, AiOutlineSend } from "react-icons/ai";
import { FaReply, FaThumbsUp } from "react-icons/fa";
import { FaMessage, FaPaperPlane, FaXmark } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { set } from "lodash";
import { ToastContainer } from "react-toastify";

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
        console.log(response);

        throw new Error("Failed to fetch discussions");
      }

      const data = await response.json();
      setDiscussions(data);
    } catch (error) {
      console.error(error);
    }
  };

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
    // alert(`Deleting ${discussionId}`);
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
      fetchDiscussions();
    } catch (error) {
      console.error(error);
      alert("Failed to delete discussion");
    }
  };

  const DiscussionThread = ({ discussion }) => {
    return (
      <div className="ml-4 pl-1 mt-2 min-w-80 bg-white hover:bg-gray-50 p-2 rounded-lg">
        <div className="flex items-center gap-1 px-4 py-1 justify-between">
          <div className="flex items-center gap-1 py-1">
            <div className="p-4 w-5 h-5 bg-orange-600 flex items-center justify-center rounded-full text-white font-bold">
              {discussion["user.name"][0]}
            </div>
            <div className="font-bold text-sm">{discussion["user.name"]}</div>
          </div>
          <div
            onClick={() => handleDeleteDiscussion(discussion.id)}
            className="cursor-pointer hover:text-red-500 text-sm"
          >
            <AiOutlineDelete />
          </div>
        </div>
        <div className="rounded-lg border-2 border-gray-100 p-2">
          <div className="p-2" title={discussion["user.email"]}>
            {discussion.content}
          </div>
          <div className="px-2">
            <div className="text-xs text-gray-500">
              {formatPostDate(discussion.createdAt)}
            </div>
            <div className="flex items-center mt-2 gap-2">
              {/* <button className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700">
              <FaThumbsUp />
              Like
              {discussion?.likes}
            </button> */}
              <button
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setReplyData({
                    replying: true,
                    replyingTo: discussion.id,
                    content: discussion.content,
                  });
                }}
              >
                <FaReply />
                Reply
                {discussion.replies?.length > 0 &&
                  " (" + discussion.replies?.length + ")"}
              </button>
            </div>
          </div>
        </div>
        <div className="ml-4">
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
    // alert("submitting");
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
      const data = await response.json();
      setDiscussionData({ content: "", team_id: teamId, discussion_id: null });
      setReplyData({ replying: false, replyingTo: null, content: "" });
      fetchDiscussions();
    } catch (error) {
      console.error(error);
      alert("Failed to submit discussion");
    }
    // console.log(discussionData);
  };
  return (
    <div>
      <ToastContainer />
      Discussions
      <div className="rounded-lg p-2">
        <div className="flex flex-col h-96 max-w-4xl mx-auto overflow-auto gap-2 shadow rounded-lg p-2">
          {discussions ? (
            discussions?.map((discussion) => (
              <DiscussionThread discussion={discussion} />
            ))
          ) : (
            <span className="loading loading-spinner"></span>
          )}
        </div>
      </div>
      {/* form section */}
      <div>
        {replyData.replying && (
          <div className="flex flex-col border-t-2 border-blue-400 mt-2 p-2 mx-auto max-w-xl">
            <div className="text-sm flex items-center gap-1 text-gray-500">
              <FaReply />
              Replying To
              <div className="p-2">
                <FaXmark
                  color="red"
                  className="cursor-pointer"
                  onClick={() => {
                    setReplyData({
                      replying: false,
                      replyingTo: null,
                      content: "",
                    });
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 px-4 py-1 text-sm">
                {(replyData.content || "No content").slice(0, 50) + "..."}
              </div>
            </div>
          </div>
        )}
        <form
          className="flex items-center gap-2 mt-2 p-2 max-w-3xl mx-auto"
          onSubmit={handleSubmit}
        >
          <textarea
            name="content"
            onChange={(e) =>
              setDiscussionData({ ...discussionData, content: e.target.value })
            }
            value={discussionData.content}
            placeholder="Ask a question or start a discussion..."
            className="w-full h-16 p-3 text-sm rounded-lg resize-none bg-transparent focus:ring-2 focus:ring-blue-400 focus:outline-none border border-gray-400 bg-gray-100 transition-all"
          ></textarea>
          <button className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 bg-gray-50 p-3 rounded-lg shadow">
            <FaPaperPlane /> Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Discussions;
