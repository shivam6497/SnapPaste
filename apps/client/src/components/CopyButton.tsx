'use client';

import { useState } from 'react';

interface Props {
  code: string;
}

export default function CopyButton({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/p/${code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs border border-[#2a2a2a] px-3 py-1.5 text-[#525252] hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
    >
      {copied ? '✓ copied' : '> copy link'}
    </button>
  );
}