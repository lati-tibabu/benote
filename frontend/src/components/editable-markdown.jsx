import React, { useState, useRef } from "react";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeHighlighter from "./_notes/code-highlighter";

const EditableMarkdown = ({ initialContent }) => {
  const [content, setContent] = useState(initialContent);
  const contentRef = useRef(null);

  // Handles direct text updates
  const handleInput = () => {
    if (contentRef.current) {
      setContent(contentRef.current.innerText); // Sync content
    }
  };

  return (
    <div
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      className="border p-3 rounded-md bg-gray-100 min-h-[100px] cursor-text focus:outline-none"
    >
      <MarkDown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeHighlighter,
          a: ({ node, ...props }) => (
            <a className="text-blue-500 underline" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 space-y-2" {...props} />
          ),
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold" {...props} />
          ),
          table: ({ node, ...props }) => (
            <table className="table-auto border-collapse w-full" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border px-4 py-2 bg-gray-200" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </MarkDown>
    </div>
  );
};

export default EditableMarkdown;
