# Match Buddy 🏆
> **Intelligent AI Companion for Live Sports Across All Games & Teams**

---

## 📌 1. The Fan Problem
Watching live sports with friends or family can be intimidating for casual fans. When commentators shout *"That was a free hit"*, *"VAR overturned the penalty"*, *"Illegal screen on the pick-and-roll"*, or *"DRS flap is open in the Nouvelle Chicane"*, casual spectators often feel left behind. Googling during live action distracts from the excitement, and asking friends repeatedly feels awkward.

**Match Buddy** eliminates that friction. It acts like an intuitive, sports-savvy companion right by your side:
- **Instant Player Profiles:** Tap any player on field across any sport for a 3-sentence breakdown explaining **who they are, key highlights, and why they matter right now**.
- **Tactical Moment & Rule Breakdowns:** Tap any live event (Free Hit, Offside, VAR, Red Card, Shot Clock, Break Point, Super Tackle, Pit Strategy) for clear, jargon-free context.
- **Multi-Sport & Multi-Team Engine:** Seamlessly toggle between **Cricket**, **Football (El Clásico)**, **Basketball (NBA)**, **Tennis (Wimbledon)**, **Formula 1 (Monaco GP)**, **Kabaddi (PKL)**, or create **Any Custom Match**.
- **Bilingual & Multi-Persona:** Switch between **English** and **Hinglish** (Hindi in Roman script) with three distinct companion personas: **🤝 Casual Fan**, **🧠 Tactical Analyst**, and **🇮🇳 Desi Couch Buddy**.

---

## ✨ 2. Key Architecture & Features

### ⚡ 1. Live Match Engine & Win Probability
- **Universal Multi-Sport Scoreboard:** Dynamically renders sport-specific metrics (Overs & Runs in Cricket, Goals & Half in Football, Quarters & Shot Clock in Basketball, Sets & Games in Tennis, Laps in F1).
- **Animated Win Probability Meter:** Real-time dual-gradient win predictor that dynamically recalculates as match events occur.
- **Universal Live Match Auto-Simulation:** Click **"Simulate Live"** on *any* sport to watch the score tick, win probabilities shift, active performer stats update, and new milestone events drop into the timeline.

### 🤖 2. Google Gemini AI Integration
- Powered by Google's fastest generation model: **`gemini-2.0-flash`** (or `gemini-1.5-flash` / `gemini-1.5-pro`).
- Real-time word-by-word streaming through Next.js server route `/api/explain`.
- **Flexible Key Configuration:**
  - **In-App GUI Setup:** Users can paste their Gemini API Key directly into the header settings modal (stored securely in `localStorage` without needing a server restart).
  - **Latency Probe Test:** Includes a one-click **"Test Key Connection"** button that pings the model and displays live latency.
  - **Environment Variable:** Also supports `GEMINI_API_KEY` in `.env.local` for server-side persistence.
  - **Zero-Failure Offline Grounding:** If offline or running without a key, curated verified sports databases serve rich streaming fallbacks.

### 🎙️ 3. Interactive Audio & Bottom Sheet
- **In-Browser Speech Synthesis:** One-tap **"Listen"** button with animated audio equalizer waves for hands-free audio commentary.
- **Focus-Trapped & Accessible:** Touch swipe-down dismissal, ESC key listener, focus trapping, and ARIA live regions.
- **One-Tap Actions:** WhatsApp sharing and clipboard copying with feedback.

---

## 🛠️ 3. Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router) | React 19, Server & Client Components |
| **Language** | TypeScript | Strictly typed interfaces for all sport configurations |
| **Styling** | Tailwind CSS & Vanilla CSS | Curated HSL tokens, glassmorphism, native dark/light themes |
| **AI SDK** | `@google/generative-ai` | Streaming response generation with sports guardrails |
| **Icons** | `lucide-react` | Ultra-clean iconography |

---

## 🚀 4. How to Run Locally

### Prerequisites
- Node.js `v18+` or `v20+` / `v22+`
- npm

### Quick Start
1. **Clone & install dependencies:**
   ```bash
   git clone <repo-url>
   cd "Match Buddy"
   npm install
   ```

2. **Configure Gemini API Key (Optional):**
   Add your key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_key_from_google_ai_studio
   GEMINI_MODEL=gemini-2.0-flash
   ```
   *(Or simply run the app and click the **`Gemini Key`** button in the top bar!)*

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) on your desktop browser or mobile screen emulator.

---

## 🧪 5. Testing & Verification

Run the full Next.js production build and TypeScript audit:
```bash
npm run build
```
Builds statically and dynamically in under 1 second with **0 errors**.
