"use client";

import { useState } from "react";
import { Paste } from "@snappaste/types";
import { unlockPaste } from "@/app/actions/paste.actions";
import HighlightedPasteViewer from "./HighlightedPasteViewer";

interface Props {
  code: string;
}

export default function PasswordPrompt({ code }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    paste: Paste;
    highlightedHtml: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await unlockPaste(code, password);
      setResult(data);
    } catch (err: any) {
      const message = err?.message || "";
      if (message.includes("403") || message.includes("Invalid password")) {
        setError("incorrect password");
      } else if (message.includes("429") || message.includes("Too many")) {
        setError("too many failed attempts. try again in 15 minutes.");
      } else {
        setError("something went wrong. try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <HighlightedPasteViewer
        paste={result.paste}
        highlightedHtml={result.highlightedHtml}
      />
    );
  }

  return (
    <main
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="min-h-screen bg-[#0e0e0e] text-[#e4e4e4] flex items-center justify-center p-6"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-sm">
        <div className="text-[#f59e0b] text-xs tracking-widest uppercase mb-4">
          // protected
        </div>
        <h1 className="text-lg font-bold mb-1">password required</h1>
        <p className="text-[#525252] text-xs mb-6">
          this paste is password protected.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[#525252] text-xs">// password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="enter password"
              required
              autoFocus
              className="bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-sm text-[#e4e4e4] placeholder-[#3a3a3a] focus:outline-none focus:border-[#f59e0b] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs border border-red-900 px-3 py-2 bg-red-950/30">
              error: {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-40 text-[#0e0e0e] font-bold py-2 px-6 text-sm transition-colors text-left"
          >
            {loading ? "> unlocking..." : "> unlock paste"}
          </button>
        </form>
      </div>
    </main>
  );
}
