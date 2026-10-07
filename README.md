# CodeMentor AI – AI-Powered Code Explainer & Reviewer

> **Tagline:** *Don't just fix your code. Understand it.*

CodeMentor AI is a full-stack developer learning studio that turns code fixes into permanent understanding. Unlike general chat boxes, CodeMentor AI produces structured 9-chapter learning reports, provides a stateful 4-level DSA Hint Ladder with server-enforced spoiler prevention, and remembers recurring mistake patterns across sessions.

---

## 🌟 Key Features

1. **Structured Learning Reports (9 Chapters)**
   - **Summary**: Concise explanation.
   - **How It Works**: Line-by-line execution walkthrough.
   - **What's Wrong & Why**: Concrete failing inputs, root causes, mistake tags, and confidence ratings.
   - **How to Improve**: Original vs. improved line diff.
   - **Why This Is Better**: Explicit comparison and worked counts.
   - **Complexity**: AI-estimated time and space Big-O comparison.
   - **Edge Cases**: Boundary conditions worth testing.
   - **Confidence**: Model-reported confidence level and caveats.
   - **Remember**: Key takeaways, self-check questions, and recurrence callouts.

2. **DSA Hint Ladder (Levels 1–4)**
   - **Level 1 (Understand)**: Problem restatement, constraints, clarifying questions, worked example, edge cases.
   - **Level 2 (Key Observation)**: Guiding question observation.
   - **Level 3 (Direction)**: Technique category and rationale.
   - **Level 4 (Algorithm Outline)**: Plain-English numbered algorithm steps.
   - *Stateful & Server-Authoritative*: The server owns state and per-level schemas, preventing spoiler leakage.

3. **Mistake Memory**
   - Controlled 8-tag vocabulary (`off-by-one`, `null-handling`, `missing-edge-case`, `inefficient-lookup`, `mutation-side-effect`, `incorrect-condition`, `incorrect-loop-bound`, `unnecessary-computation`).
   - Server-derived tagging and automatic recurrence callouts when a mistake pattern recurs in $\ge 2$ earlier analyses.

4. **Light & Dark Themes**
   - First-class Light and Dark themes with 3 core brand colors per theme (CodeMentor Teal palette).
   - Zero theme flash script in `<head>`.

5. **Security & Untrusted Input Stance**
   - User code is never executed.
   - Per-request random delimiter code fences protect against prompt injection.
   - Automatic redaction of code and AI outputs in operational logs.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, TypeScript `strict`)
- **Styling**: Tailwind CSS + CSS Variables Tokens + Radix UI Primitives
- **Editor**: CodeMirror 6 (`@uiw/react-codemirror`)
- **Database**: MongoDB Atlas with official `mongodb` driver
- **Authentication**: Better Auth with MongoDB adapter (Google & GitHub OAuth)
- **AI Integration**: Google Gemini API (`@google/generative-ai`) with Zod schema enforcement and repair pass
- **Testing**: Vitest, React Testing Library, JSDOM

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js v18+
- npm or pnpm
- MongoDB instance (MongoDB Atlas cluster or local MongoDB)

### 2. Installation & Environment Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- `MONGODB_URI`: your MongoDB connection string.
- `GEMINI_API_KEY`: your Google Gemini API key from Google AI Studio.
- `BETTER_AUTH_SECRET`: secret string for sessions.

### 3. Initialize Database Indexes & Seed Demo Data

```bash
# Ensure database indexes (TTL, multi-key, unique)
npm run ensure-indexes

# (Optional) Seed demo history for interview demonstration
npm run seed-demo
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run unit, security, and leakage tests
npm run test

# Run type check
npm run typecheck

# Run AI Golden Set evaluation harness
npm run eval

# Build for production
npm run build
```

---

## 📁 Complete Folder Structure

```
codementor-ai/
├── app/
│   ├── (app)/app/           # Authenticated product pages (Workspace, History, Account)
│   ├── (marketing)/         # Public landing, privacy, terms pages
│   ├── api/                 # Next.js Route Handlers (/api/analyze, /api/hint, etc.)
│   ├── globals.css          # CSS Variables for Light & Dark design tokens
│   └── layout.tsx           # Root layout with no-flash theme initialization
├── components/
│   ├── ui/                  # Design system primitives (Button, Select, Dialog, ThemeToggle, etc.)
│   ├── workspace/           # Workspace Studio components (CodeEditor, LanguageSelect, FocusSelector)
│   ├── analysis/            # Report components (AnalysisReport, IssueRow, DiffView, ComplexityBlock)
│   ├── hint/                # DSA Hint Ladder components (HintLadder, HintRung, AttemptBox)
│   ├── history/             # History listing and PatternChips components
│   └── marketing/           # Landing page sections & sample report
├── lib/
│   ├── api-handler.ts       # Standardized API wrapper (CSRF, size limit, envelope)
│   ├── auth.ts              # Better Auth setup
│   ├── db.ts                # Cached MongoClient singleton
│   ├── env.ts               # Environment variable validation
│   ├── errors.ts            # AppError and Error Catalog
│   ├── hash.ts              # SHA-256 code hashing
│   └── logger.ts            # Redacted JSON logger
├── models/                  # MongoDB repositories & index definitions
├── schemas/                 # Zod single source of truth schemas
├── services/                # Business logic & AI pipelines (analysis, hint, quota, insight)
├── scripts/                 # Index initialization and seeding scripts
├── evals/                   # Golden set AI evaluation harness
├── tests/                   # Automated unit, leakage, and security tests
├── package.json
└── README.md
```
