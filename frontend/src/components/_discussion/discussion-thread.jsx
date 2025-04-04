import React from "react";
import { AiOutlineDelete } from "react-icons/ai";

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
          {/* {discussion.content} */}
          <MarkdownRenderer content={discussion.content} />
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

export default DiscussionThread;
