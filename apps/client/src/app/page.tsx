"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPaste } from "@/lib/api";
import { CreatePasteRequest } from "@snappaste/types";
import CopyShareLinkButton from '@/components/CopyShareLinkButton';

const LANGUAGES = [
  "plaintext",
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "cpp",
  "c",
  "css",
  "html",
  "json",
  "bash",
  "sql",
];

const EXPIRY_OPTIONS = [
  { label: "1h", value: "1h" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "never", value: "never" },
];

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blink, setBlink] = useState(true);

  const [form, setForm] = useState<CreatePasteRequest>({
    title: "",
    content: "",
    language: "plaintext",
    expiresIn: "24h",
    burnAfterRead: false,
    password: "",
  });

  useEffect(() => {
    const interval = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(interval);
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isBurn, setIsBurn] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: CreatePasteRequest = {
        ...form,
        password: form.password || undefined,
        title: form.title || undefined,
      };
      const res = await createPaste(payload);

      if (form.burnAfterRead) {
        setShareCode(res.code);
        setIsBurn(true);
      } else {
        router.push(`/p/${res.code}`);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  }

  if (shareCode && isBurn) {
    const shareUrl = `${window.location.origin}/p/${shareCode}`;
    return (
      <main
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        className="min-h-screen bg-[#0e0e0e] text-[#e4e4e4] flex items-center justify-center p-6"
      >
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <div className="w-full max-w-md">
          <div className="text-[#f59e0b] text-xs tracking-widest uppercase mb-4">
            // paste created
          </div>
          <h1 className="text-lg font-bold mb-1">⚡ burn after read</h1>
          <p className="text-[#525252] text-xs mb-6">
            this paste will be deleted after the first view. share the link
            below — do not open it yourself.
          </p>

          <div className="bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-sm text-[#e4e4e4] mb-3 break-all">
            {shareUrl}
          </div>

          <CopyShareLinkButton url={shareUrl} />

          <button
            onClick={() => {
              setShareCode(null);
              setIsBurn(false);
            }}
            className="mt-4 text-xs text-[#525252] hover:text-[#f59e0b] transition-colors"
          >
            &gt; create another paste
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="min-h-screen bg-[#0e0e0e] text-[#e4e4e4] p-6 md:p-10"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-[#f59e0b] text-xs mb-3 tracking-widest uppercase">
            // terminal paste
          </div>
          <h1 className="text-2xl font-bold text-[#e4e4e4] flex items-center gap-1">
            SnapPaste
            <span
              className={`text-[#f59e0b] ml-1 ${blink ? "opacity-100" : "opacity-0"} transition-opacity`}
            >
              ▋
            </span>
          </h1>
          <p className="text-[#525252] text-xs mt-2">
            paste → short link → expires. no accounts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-[#525252] text-xs">// title</label>
            <input
              name="title"
              type="text"
              placeholder="untitled"
              value={form.title}
              onChange={handleChange}
              className="bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-sm text-[#e4e4e4] placeholder-[#3a3a3a] focus:outline-none focus:border-[#f59e0b] transition-colors"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1">
            <label className="text-[#525252] text-xs">
              // content <span className="text-[#f59e0b]">*</span>
            </label>
            <textarea
              name="content"
              placeholder="$ paste your code or text here..."
              value={form.content}
              onChange={handleChange}
              required
              rows={10}
              className="bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-sm text-[#e4e4e4] placeholder-[#3a3a3a] focus:outline-none focus:border-[#f59e0b] transition-colors font-mono resize-none min-h-50 md:min-h-95"
            />
          </div>

          {/* Language + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[#525252] text-xs">// language</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-sm text-[#e4e4e4] focus:outline-none focus:border-[#f59e0b] transition-colors"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#525252] text-xs">// expires</label>
              <select
                name="expiresIn"
                value={form.expiresIn}
                onChange={handleChange}
                className="bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-sm text-[#e4e4e4] focus:outline-none focus:border-[#f59e0b] transition-colors"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[#525252] text-xs">
              // password <span className="text-[#3a3a3a]">(optional)</span>
            </label>
            <input
              name="password"
              type="password"
              placeholder="leave empty for public paste"
              value={form.password}
              onChange={handleChange}
              className="bg-[#161616] border border-[#2a2a2a] px-3 py-2 text-sm text-[#e4e4e4] placeholder-[#3a3a3a] focus:outline-none focus:border-[#f59e0b] transition-colors"
            />
          </div>

          {/* Burn after read */}
          <label className="flex items-center gap-3 text-xs text-[#525252] cursor-pointer select-none border border-[#2a2a2a] px-3 py-2 hover:border-[#f59e0b] transition-colors">
            <input
              name="burnAfterRead"
              type="checkbox"
              checked={form.burnAfterRead}
              onChange={handleChange}
              className="accent-[#f59e0b]"
            />
            <span>// burn_after_read — deletes on first view</span>
          </label>

          {error && (
            <p className="text-red-400 text-xs border border-red-900 px-3 py-2 bg-red-950/30">
              error: {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-40 text-[#0e0e0e] font-bold py-2 px-6 text-sm transition-colors text-left"
          >
            {loading ? "> creating..." : "> create paste"}
          </button>
        </form>

        <div className="mt-10 text-[#a79898] text-xs border-t border-[#1a1a1a] pt-4">
          snappaste — no tracking. no accounts. pastes expire.
        </div>
      </div>
    </main>
  );
}
