'use client';

import { useState } from 'react';

interface Props {
  url: string;
}

export default function CopyShareLinkButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="w-full bg-[#f59e0b] hover:bg-[#d97706] disabled:opacity-40 text-[#0e0e0e] font-bold py-2 px-6 text-sm transition-colors text-left"
    >
      {copied ? '✓ link copied' : '> copy share link'}
    </button>
  );
}