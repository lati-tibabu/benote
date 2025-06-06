import React from "react";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeHighlighter from "./_notes/code-highlighter";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles

const MarkdownRenderer = ({ content, className }) => {
  return (
    <div
      // className={`flex flex-col gap-4 hover:[&>*]:bg-gray-100 hover:[&>*]:cursor-pointer ${className}`}
      className={`flex flex-col gap-4 ${className}`}
    >
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
                // className={`text-justify${
                className={`${
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

// Markdown rederer with mermaid support
// import React, { useLayoutEffect, useRef } from "react";
// import MarkDown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import mermaid from "mermaid";
// import CodeHighlighter from "./_notes/code-highlighter";
// import "katex/dist/katex.min.css";

// mermaid.initialize({
//   startOnLoad: false,
//   theme: "default",
//   securityLevel: "loose",
// });

// const MermaidBlock = ({ chart }) => {
//   const containerRef = useRef(null);
//   const uniqueId = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

//   useLayoutEffect(() => {
//     if (!chart || !containerRef.current) return;

//     let isMounted = true;
//     const renderMermaid = async () => {
//       try {
//         const { svg, bindFunctions } = await mermaid.render(
//           uniqueId.current,
//           chart
//         );
//         if (isMounted && containerRef.current) {
//           containerRef.current.innerHTML = svg;
//           bindFunctions?.(containerRef.current);
//         }
//       } catch (err) {
//         if (isMounted && containerRef.current) {
//           console.error("Mermaid render failed:", err);
//           containerRef.current.innerHTML = `<pre class="text-red-500">Error rendering Mermaid diagram:\n${err.message}</pre>`;
//         }
//       }
//     };

//     renderMermaid();
//     return () => {
//       isMounted = false;
//     };
//   }, [chart]);

//   return <div ref={containerRef} className="w-full overflow-auto" />;
// };

// const MarkdownRenderer = ({ content, className }) => {
//   return (
//     <div className={`flex flex-col gap-4 ${className || ""}`}>
//       <MarkDown
//         remarkPlugins={[remarkGfm, remarkMath]}
//         rehypePlugins={[rehypeKatex]}
//         components={{
//           code: ({ node, inline, className = "", children, ...props }) => {
//             const match = /language-(\w+)/.exec(className || "");
//             const lang = match?.[1] || "";

//             if (!inline && lang === "mermaid") {
//               return <MermaidBlock chart={String(children).trim()} />;
//             }

//             return <CodeHighlighter {...props} value={String(children)} />;
//           },
//           a: ({ node, ...props }) => (
//             <a className="text-blue-500 underline" {...props} />
//           ),
//           p: ({ node, ...props }) => {
//             const firstChar = props.children?.[0]
//               ?.toString()
//               ?.trim()
//               ?.charAt(0);
//             const highlightClass =
//               firstChar === "#"
//                 ? "font-bold bg-blue-200 w-fit p-1 rounded text-blue-700"
//                 : "";
//             return <p className={highlightClass} {...props} />;
//           },
//           ul: ({ node, ...props }) => (
//             <ul className="list-disc pl-5 space-y-2" {...props} />
//           ),
//           ol: ({ node, ...props }) => (
//             <ol className="list-decimal pl-5 space-y-2" {...props} />
//           ),
//           input: ({ node, ...props }) => {
//             if (props.type === "checkbox") {
//               return (
//                 <input
//                   type="checkbox"
//                   className="cursor-pointer rounded focus:ring-0"
//                   {...props}
//                 />
//               );
//             }
//             return <input {...props} />;
//           },
//           h1: (props) => <h1 className="text-3xl font-bold" {...props} />,
//           h2: (props) => <h2 className="text-2xl font-bold" {...props} />,
//           h3: (props) => <h3 className="text-xl font-bold" {...props} />,
//           h4: (props) => <h4 className="text-lg font-bold" {...props} />,
//           h5: (props) => <h5 className="text-md font-bold" {...props} />,
//           h6: (props) => <h6 className="text-sm font-bold" {...props} />,
//           table: (props) => (
//             <table
//               className="table-auto border-collapse overflow-auto"
//               {...props}
//             />
//           ),
//           th: (props) => (
//             <th className="border px-4 py-2 bg-gray-200" {...props} />
//           ),
//           td: (props) => <td className="border px-4 py-2" {...props} />,
//           blockquote: (props) => (
//             <blockquote
//               className="border-l-4 border-gray-300 pl-4 italic text-gray-600"
//               {...props}
//             />
//           ),
//           img: (props) => (
//             <img {...props} className="max-w-full rounded-lg mx-auto p-2" />
//           ),
//         }}
//       >
//         {content}
//       </MarkDown>
//     </div>
//   );
// };

// export default MarkdownRenderer;
