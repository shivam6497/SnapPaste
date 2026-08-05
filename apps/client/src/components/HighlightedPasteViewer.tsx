"use client";

import { Paste } from "@snappaste/types";
import Link from "next/link";
import CopyButton from "./CopyButton";
import CopyContentButton from "./CopyContentButton";

interface Props {
  paste: Paste;
  highlightedHtml: string;
}

export default function HighlightedPasteViewer({
  paste,
  highlightedHtml,
}: Props) {
  return (
    <main
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="min-h-screen bg-[#0e0e0e] text-[#e4e4e4] p-4 md:p-10"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="text-[#f59e0b] text-xs tracking-widest uppercase mb-2">
              // snappaste
            </div>
            <h1 className="text-lg font-bold text-[#e4e4e4] truncate">
              {paste.title || "untitled"}
            </h1>
            <div className="flex flex-wrap gap-3 mt-1 text-[#525252] text-xs">
              <span>{paste.language || "plaintext"}</span>
              {paste.expiresAt && (
                <span>
                  expires {new Date(paste.expiresAt).toLocaleDateString('en-CA')}
                </span>
              )}
              {paste.burnAfterRead && (
                <span className="text-[#f59e0b]">⚡ burn after read</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0 items-center">
            <CopyButton code={paste.code} />
            <Link
              href="/"
              className="text-xs border border-[#2a2a2a] px-3 py-1.5 text-[#525252] hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors whitespace-nowrap"
            >
              &gt; new paste
            </Link>
          </div>
        </div>

        {/* Code block */}
        <div className="border border-[#2a2a2a] overflow-hidden">
          {/* Terminal bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2a] bg-[#161616]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]" />
              <span className="text-[#3a3a3a] text-xs ml-2 truncate">
                {paste.title || "untitled"} — {paste.language || "plaintext"}
              </span>
            </div>

            <CopyContentButton content={paste.content} />
          </div>

          {/* Highlighted code */}
          <div
            className="text-sm overflow-x-auto [&>pre]:p-4 [&>pre]:m-0 [&>pre]:bg-[#0e0e0e]! [&>pre]:overflow-auto [&>pre]:min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>

        <div className="mt-6 text-[#a79898] text-xs border-t border-[#1a1a1a] pt-4">
          snappaste — no tracking. no accounts. pastes expire.
        </div>
      </div>
    </main>
  );
}
