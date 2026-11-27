"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  compact?: boolean;
}

export function MarkdownRenderer({
  content,
  compact = false,
}: MarkdownRendererProps) {
  return (
    <div
      className={`markdown-body ${compact ? "text-xs" : "text-sm"} leading-relaxed text-zinc-200`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-3 mt-5 border-b border-white/10 pb-2 text-lg font-bold text-white first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-2.5 mt-5 text-base font-bold text-emerald-200 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-4 text-sm font-semibold text-white first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-300">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 break-keep last:mb-0">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-1.5 pl-5 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-1.5 pl-5 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="text-zinc-200">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-emerald-400/50 bg-emerald-500/[0.06] py-2 pl-4 pr-3 text-zinc-300">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-white/10" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.06] text-zinc-100">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-white/8">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02]">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 font-semibold text-white">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-300">{children}</td>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-3.5 font-mono text-xs text-emerald-200">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-emerald-200">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="my-3">{children}</pre>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 underline decoration-emerald-400/40 underline-offset-2 hover:text-emerald-200"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
