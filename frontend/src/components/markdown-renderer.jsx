import React from "react";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeHighlighter from "./_notes/code-highlighter";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="flex flex-col gap-4 hover:[&>*]:bg-gray-100 hover:[&>*]:cursor-pointer">
      <MarkDown
        // className="border-2 overflow-hidden"
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: CodeHighlighter,
          a: ({ node, ...props }) => (
            <a className="text-blue-500 underline" {...props} />
          ),
          p: ({ node, ...props }) => {
            const firstChar = props.children[0]?.toString().trim().charAt(0);
            return (
              <p
                className={`text-justify${
                  firstChar === "#"
                    ? "font-bold bg-blue-200 w-fit p-1 rounded text-blue-700"
                    : ""
                }`}
                {...props}
              />
            );
          },

          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 space-y-2" {...props} />
          ),
          input: ({ node, ...props }) => {
            if (props.type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  className="bg-white cursor-pointer bg-transparent focus:ring-0 rounded items-center"
                  {...props}
                />
              );
            }
            return <input {...props} />;
          },
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h2 className="text-xl font-bold" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h2 className="text-lg font-bold" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h2 className="text-md font-bold" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h2 className="text-sm font-bold" {...props} />
          ),

          table: ({ node, ...props }) => (
            <table
              className="table-auto border-collapse overflow-auto"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th className="border px-4 py-2 bg-gray-200" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border px-4 py-2" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 pl-4" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img {...props} className="max-w-full rounded-box mx-auto p-2" />
          ),
        }}
      >
        {content}
      </MarkDown>
    </div>
  );
};

export default MarkdownRenderer;
