# ⚡ SnapPaste

A minimal, secure, and developer-focused pastebin built for sharing code snippets seamlessly. Features automatic expiration, password protection, burn-after-read, syntax highlighting, and zero tracking.

## UI

![UI](./apps/client/public/favicon.svg)

## ✨ Features

- **⚡ Burn After Read:** Pastes that self-destruct permanently after being viewed once.
- **🔒 Password Protection:** Secure private pastes with bcrypt-hashed passwords and rate-limiting.
- **⏰ Expiration Timers:** Set custom paste expiry (1 Hour, 1 Day, 7 Days, 30 Days, or Never).
- **🎨 Code Syntax Highlighting:** Powered by [Shiki](https://shiki.style/) (`vitesse-dark` theme) for clean, accurate syntax rendering across multiple programming languages.
- **🧹 Automated Sweeper:** BullMQ & Redis background worker runs scheduled cleanup tasks every 15 minutes to automatically delete expired pastes.
- **🖥️ Terminal-Inspired UI:** Dark-themed, minimal interface built with JetBrains Mono typography.
- **🛡️ Anonymous & Private:** No user accounts, no telemetry, and no tracking.

---

## 🏗️ Architecture & Monorepo Structure

SnapPaste is structured as a **Turborepo** monorepo managed with `pnpm`:

```text
SnapPaste/
├── apps/
│   ├── client/        # Next.js 16 (React 19) App Router frontend
│   └── server/        # Express.js backend REST API + Prisma ORM + BullMQ worker
├── packages/
│   ├── types/         # Shared TypeScript interfaces (@snappaste/types)
│   ├── eslint-config/ # Shared ESLint configurations
│   └── typescript-config/ # Shared tsconfig bases
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 🛠️ Tech Stack

### Frontend (`apps/client`)
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling:** TailwindCSS + Custom CSS
- **Syntax Highlighting:** [Shiki](https://shiki.style/)
- **HTTP Client:** Axios

### Backend (`apps/server`)
- **Runtime:** Node.js + Express.js + TypeScript
- **Database ORM:** [Prisma](https://www.prisma.io/) (PostgreSQL)
- **Background Jobs:** [BullMQ](https://docs.bullmq.io/) + Redis (`ioredis`)
- **Security:** Bcrypt (password hashing) + Zod (schema validation)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- **Node.js** `>= 18.0.0`
- **pnpm** `>= 9.0.0` (`npm i -g pnpm`)
- **PostgreSQL** instance
- **Redis** server

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/SnapPaste.git
   cd SnapPaste
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**

   **Backend (`apps/server/.env`):**
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/snappaste?schema=public"
   REDIS_HOST="127.0.0.1"
   REDIS_PORT=6379
   ```

   **Frontend (`apps/client/.env.local`):**
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:5000/api"
   ```

4. **Run Database Migrations:**
   ```bash
   cd apps/server
   npx prisma migrate dev --name init
   cd ../..
   ```

5. **Start Development Mode:**
   Run both frontend and backend concurrently via Turborepo:
   ```bash
   pnpm dev
   ```

   - **Frontend:** [http://localhost:3000](http://localhost:3000)
   - **Backend API:** [http://localhost:5000](http://localhost:5000)
   - **API Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

## ⚙️ Available Scripts

Run from the root directory:

| Script | Description |
|---|---|
| `pnpm dev` | Starts client and server in development mode concurrently |
| `pnpm build` | Builds all applications and workspace packages |
| `pnpm lint` | Runs ESLint across all apps and packages |
| `pnpm format` | Formats code with Prettier |

---

## 🔄 Background Job Cleanup Workflow

SnapPaste uses **BullMQ** backed by **Redis** to purge expired pastes without affecting client HTTP request performance:

```
[Express Server Startup]
          │
          ▼
┌──────────────────┐       No       ┌────────────────────────┐
│ Registered Job in│───────────────►│ Add Cron Job           │
│ Redis already?   │                │ pattern: '*/15 * * * *'│
└──────────────────┘                └────────────────────────┘
          │ Yes                                 │
          └─────────────────┬───────────────────┘
                            │
                            ▼ (Every 15 minutes)
                ┌───────────────────────┐
                │ BullMQ Worker Trigger │
                └───────────────────────┘
                            │
                            ▼
          ┌───────────────────────────────────┐
          │ DELETE FROM "Paste"               │
          │ WHERE "expiresAt" <= NOW()        │
          └───────────────────────────────────┘
```


