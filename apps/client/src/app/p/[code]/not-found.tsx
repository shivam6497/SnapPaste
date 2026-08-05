import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
      className="min-h-screen bg-[#0e0e0e] text-[#e4e4e4] flex items-center justify-center p-6"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
      <div className="max-w-md w-full">
        <div className="text-[#f59e0b] text-xs tracking-widest uppercase mb-4">// 404</div>
        <h1 className="text-2xl font-bold mb-2">paste not found</h1>
        <p className="text-[#525252] text-sm mb-8">
          this paste has expired, been deleted, or never existed.
        </p>
        <Link
          href="/"
          className="text-sm text-[#f59e0b] hover:underline"
        >
          &gt; create a new paste
        </Link>
      </div>
    </main>
  );
}