/* eslint-disable react/prop-types */
import React from "react";
import MarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import CodeHighlighter from "./code-highlighter";
import "katex/dist/katex.min.css";

const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/i;
const VIDEO_REGEX = /\.(mp4|webm|ogg)(\?.*)?$/i;
const AUDIO_REGEX = /\.(mp3|wav|ogg|m4a)(\?.*)?$/i;
const UNDERLINE_REGEX = /(\+\+[^+]+?\+\+)/g;

const renderInlineUnderline = (children) =>
  React.Children.toArray(children).flatMap((child, childIndex) => {
    if (typeof child !== "string") return child;
    return child.split(UNDERLINE_REGEX).map((segment, segmentIndex) => {
      if (segment.startsWith("++") && segment.endsWith("++")) {
        return (
          <u key={`u-${childIndex}-${segmentIndex}`}>
            {segment.slice(2, -2)}
          </u>
        );
      }
      return segment;
    });
  });

const extractText = (children) => {
  const pieces = React.Children.toArray(children).map((child) => {
    if (typeof child === "string") return child;
    if (React.isValidElement(child)) {
      return extractText(child.props?.children);
    }
    return "";
  });
  return pieces.join("").trim();
};

const EmbeddedMedia = ({ href, children }) => {
  if (!href) return <span>{children}</span>;

  const youtubeMatch = href.match(YOUTUBE_REGEX);
  if (youtubeMatch) {
    return (
      <div className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
            title="Embedded media"
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (href.match(VIDEO_REGEX)) {
    return (
      <video
        controls
        preload="metadata"
        className="my-4 w-full rounded-xl border border-gray-200 bg-black/95 shadow-sm"
      >
        <source src={href} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (href.match(AUDIO_REGEX)) {
    return (
      <audio
        controls
        preload="metadata"
        className="my-4 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
      >
        <source src={href} />
        Your browser does not support the audio element.
      </audio>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-700 underline decoration-blue-300 underline-offset-2 transition-colors hover:text-blue-800"
    >
      {children}
    </a>
  );
};

const MarkdownRenderer = ({ content, className }) => {
  return (
    <div
      className={`markdown-renderer flex flex-col gap-4 text-gray-800 leading-7 ${className || ""}`}
    >
      <MarkDown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: ({ inline, className, children, ...props }) => (
            <CodeHighlighter
              inline={inline}
              className={className}
              {...props}
            >
              {children}
            </CodeHighlighter>
          ),
          a: ({ href, children, ...props }) => {
            const raw = extractText(children);
            const mediaOnlyLink = raw === href || raw.startsWith("!media ");
            if (mediaOnlyLink) {
              return <EmbeddedMedia href={href}>{children}</EmbeddedMedia>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline decoration-blue-300 underline-offset-2 transition-colors hover:text-blue-800"
                {...props}
              >
                {children}
              </a>
            );
          },
          p: ({ children, ...props }) => (
            <p className="text-gray-800" {...props}>
              {renderInlineUnderline(children)}
            </p>
          ),
          li: ({ children, ...props }) => (
            <li className="text-gray-800" {...props}>
              {renderInlineUnderline(children)}
            </li>
          ),
          ul: ({ ...props }) => (
            <ul className="list-disc pl-6 space-y-2 marker:text-gray-400" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal pl-6 space-y-2 marker:text-gray-400"
              {...props}
            />
          ),
          input: ({ ...props }) => {
            if (props.type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled
                  {...props}
                />
              );
            }
            return <input {...props} />;
          },
          h1: ({ children, ...props }) => (
            <h1
              className="mt-8 border-b border-gray-200 pb-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl"
              {...props}
            >
              {renderInlineUnderline(children)}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="mt-7 border-b border-gray-200 pb-2 text-2xl font-semibold text-gray-900 md:text-3xl"
              {...props}
            >
              {renderInlineUnderline(children)}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="mt-6 text-xl font-semibold text-gray-900 md:text-2xl" {...props}>
              {renderInlineUnderline(children)}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="mt-5 text-lg font-semibold text-gray-900 md:text-xl" {...props}>
              {renderInlineUnderline(children)}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="mt-4 text-base font-semibold text-gray-800 md:text-lg" {...props}>
              {renderInlineUnderline(children)}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="mt-3 text-sm font-semibold uppercase tracking-wide text-gray-600 md:text-base" {...props}>
              {renderInlineUnderline(children)}
            </h6>
          ),
          table: ({ ...props }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table
                className="min-w-full divide-y divide-gray-200 bg-white"
                {...props}
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-gray-50" {...props} />
          ),
          th: ({ ...props }) => (
            <th
              className="border-b border-gray-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600"
              {...props}
            />
          ),
          td: ({ ...props }) => (
            <td
              className="border-b border-gray-100 px-4 py-3 text-sm text-gray-700"
              {...props}
            />
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="rounded-r-lg border-l-4 border-blue-200 bg-blue-50/60 py-2 pl-4 italic text-gray-700"
              {...props}
            >
              {renderInlineUnderline(children)}
            </blockquote>
          ),
          img: ({ ...props }) => (
            <img
              {...props}
              className="mx-auto my-4 block h-auto max-w-full rounded-xl border border-gray-100 shadow-sm"
              loading="lazy"
            />
          ),
          hr: ({ ...props }) => (
            <hr className="my-8 border-t-2 border-gray-200" {...props} />
          ),
          strong: ({ children, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props}>
              {renderInlineUnderline(children)}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="text-gray-800" {...props}>
              {renderInlineUnderline(children)}
            </em>
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
//             <a className="text-gray-500 underline" {...props} />
//           ),
//           p: ({ node, ...props }) => {
//             const firstChar = props.children?.[0]
//               ?.toString()
//               ?.trim()
//               ?.charAt(0);
//             const highlightClass =
//               firstChar === "#"
//                 ? "font-bold bg-gray-200 w-fit p-1 rounded text-gray-700"
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
//             <img {...props} className="max-w-full rounded-sm mx-auto p-2" />
//           ),
//         }}
//       >
//         {content}
//       </MarkDown>
//     </div>
//   );
// };

// export default MarkdownRenderer;
