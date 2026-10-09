# Match Buddy 🏏
> **AI Companion for Casual Fans Watching a Live Cricket Match**

---

## 📌 1. The Fan Problem
Watching live cricket with friends can be intimidating for casual fans. When commentators say *"That was a free hit"* or *"Australia have taken a DRS review"*, or when a new bowler comes in, a casual fan like **Riya (24)** often feels lost. Googling mid-over causes her to miss the next ball, and asking friends repeatedly feels awkward. 

**Match Buddy** solves this by acting like a cricket-savvy friend sitting right next to you on the couch:
- Tap any batter or bowler on field for an instant 3-line intro explaining **why they matter right now**.
- Tap any match event or type any rule (e.g. *Free Hit*, *DRS*, *LBW*, *DLS*, *Super Over*) for a concise 2-line explanation tied directly to the live match situation.
- Toggles effortlessly between simple **English** and **Hinglish** (Hindi in Roman script).

---

## ✨ 2. Key Features

- **Live Match Situation Header:**
  - Pulsing red `LIVE` badge, teams (`IND vs AUS, 2nd T20I`), big score (`112/3`), overs progress bar (`14.2 / 20`), and real-time chase status (`Need 54 off 34 balls · RRR 9.5`).
- **Interactive "On the Field" Roster:**
  - Batting cards with live scores (Hardik Pandya `41* (28)`, Suryakumar Yadav `22* (14)`), striker indicator (`🏏*`), and bowler cards (Pat Cummins, Mitchell Starc).
  - Tapping any player slides up an AI breakdown grounded in verified career highlights and match stakes.
- **Moments Feed (Live Timeline):**
  - Newest-first vertical timeline of crucial match events: No-ball & Free Hit, DRS LBW review, wickets, Powerplay conclusion, and Impact Player substitutions.
  - One-tap **"Explain"** button on every event.
- **Interactive Ask Bar:**
  - Sticky at bottom with quick-query chips (`"What is DLS?"`, `"What is LBW?"`, `"What is a super over?"`) and open text search (max 200 chars).
- **"Just Joined? Catch Me Up":**
  - A 30-second 4-sentence innings summary for late joiners.
- **Smart AI Bottom Sheet:**
  - Smooth 250ms slide-up modal with drag handle, swipe-to-dismiss, backdrop click, Escape key listener, and focus trapping.
  - Word-by-word streaming animation with shimmer skeleton loading.
  - Dedicated **"Why it matters right now"** callout box with a purple left border (`#7C5CFF`).
  - **Read Aloud (Voice)**: In-browser speech synthesis for audio commentary.
  - **One-tap Copy** with toast feedback & **WhatsApp Share**.
- **Live Match Auto-Simulation Mode:**
  - Toggle live simulation with Play/Pause button: ticks score, overs, and bowler/batter figures every 6 seconds, dropping new events into the feed with a 3-second highlight fade.
- **English & Hinglish Support:**
  - Toggle anytime (`EN` / `हिंग`). If a card is open, switching languages instantly re-explains in the selected tongue.
- **Dark & Light Mode:**
  - Native dark mode default (`#0B0E14`) and clean light mode (`#F5F6F8`) with `localStorage` memory.
- **Fail-safe Grounding & Offline Support:**
  - Curated verified facts in `/data/match.ts`. If offline, rate-limited, or slow (>8s), the app serves grounded fallback text with an explanatory badge—the screen is never blank.

---

## 🛠️ 3. Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom design tokens matching the design system specifications)
- **Icons:** `lucide-react`
- **AI Backend:** Server route `/app/api/explain` calling `@google/generative-ai` (Gemini) with streaming, rate limiting (20 req / 10 min), and sports query guardrails.

---

## 🔒 4. How the AI is Used & Grounded Facts Strategy

1. **Grounded Facts Architecture:**  
   LLMs can hallucinate player statistics or career numbers. To protect user trust, verified facts (birthplaces, roles, validated career achievements) are stored in `/data/match.ts`. The prompt instructs Gemini to use **only** verified facts and provide the current situational interpretation.
2. **Strict Guardrails:**  
   - Maximum 200 characters per user query.
   - Non-sports questions (e.g. homework requests) are politely declined.
   - Rate limiting: In-memory tracker permits max 20 requests per IP per 10 minutes.
   - Security: Gemini API keys live strictly on the server (`process.env.GEMINI_API_KEY`) and are never exposed to the client.

---

## 🚀 5. How to Run Locally

### Prerequisites
- Node.js `v18+` or `v20+` / `v22+`
- npm

### Steps
1. **Clone the repository & install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd "Match Buddy"
   npm install
   ```

2. **Configure Environment Variables (Optional):**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API Key (get one free at [aistudio.google.com](https://aistudio.google.com/apikey)):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```
   > *Note:* If you run without an API key, Match Buddy will automatically use its built-in verified fallback streaming engine so you can test the entire UI and experience without needing your own API balance!

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) on your desktop browser or mobile emulator.

4. **Verify production build:**
   ```bash
   npm run build
   ```

---

## 🌐 6. Deployment (Vercel)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "feat: complete Match Buddy live cricket AI companion"
   git remote add origin https://github.com/<your-username>/match-buddy.git
   git push -u origin main
   ```
2. **Import into Vercel:**
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** → **"Project"**.
   - Select your `match-buddy` GitHub repository.
3. **Set Environment Variables in Vercel:**
   - Under **Environment Variables**, add:
     - `GEMINI_API_KEY`: your Google Gemini API key
     - `GEMINI_MODEL`: `gemini-2.0-flash`
4. **Deploy:**
   - Click **Deploy**. Vercel will build and deploy the app to a production URL (e.g., `https://match-buddy-xxx.vercel.app`).
   - Test on your mobile phone over mobile data!
