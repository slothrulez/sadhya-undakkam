# Sadhya Undakkam

> **Build your Sadhya. Get judged by Maveli.**

**Sadhya Undakkam** is an interactive Onam game where you build your own Sadhya by drawing portions on a banana leaf — then hand it over to **Maveli for judgment**.

Built at **Make-a-thon: Onam Edition**, hosted by **Friends of Figma Kochi**.

---

## The Concept

Sadhya is sacred to Kerala — vegetarian, traditional, and an essential part of Onam.

But then there's **Kannur**.

In some families, the Onam feast takes a different turn, with non-vegetarian dishes making their way onto the leaf. Whether that still counts as a *Sadhya* is, naturally, a matter of debate — the kind that starts at the dining table and ends in the family group chat.

So we turned that debate into a game.

**Normal Mode** lets you build the classic vegetarian Sadhya.

**Kannur Mode** lets you break the rules and see what happens when Maveli is handed a very different kind of feast.

Build your leaf, choose your portions, and let **Maveli judge your choices** based on stats like *Ammachi Approval* and *Verandah Drama Level*.

---

## How It Works

**Choose → Build → Get Judged → Score → Leaderboard**

1. Choose **Normal** or **Kannur** mode.
2. Pick dishes and draw their portions on the banana leaf.
3. Your choices and portion sizes affect your Sadhya's stats.
4. Submit your Sadhya to Maveli.
5. Get a score, reaction, and badge.
6. Save your creation to the leaderboard.

### Normal Mode

The classic vegetarian Sadhya.

**Choru · Parippu · Sambar · Rasam · Avial · Olan · Kaalan · Erissery · Puli Inji · Pappadam · Payasam**

### Kannur Mode

The rules are... slightly more flexible.

**Meen Curry · Kozhi Curry · Mutta Achar · Beef Fry · Prawn Masala · Kozhi Roast · Kela Fry · Upperi · Payasam**

---

## Stats

Every dish contributes to five stats:

- **Power**
- **Spice**
- **Crunch**
- **Chaos**
- **Sweetness**

Portion size determines how strongly each dish affects your final score.

---

## Maveli's Judgment

Once your Sadhya is complete, Maveli inspects it and gives you a score from **0–100**, along with a reaction or badge.

Examples:

- **Ammachi Approved™**
- **You Have Chosen Violence**
- **Group Chat Will Explode**
- **Ammachi is Disappointed**

---

## Leaderboard

Players can save their Sadhya and compete with other creations.

- **Supabase** for persistent leaderboard storage
- **localStorage** as a fallback

---

## Tech Stack

### Frontend

- **React** — UI
- **TypeScript** — Type safety
- **Vite** — Development & build
- **Tailwind CSS** — Styling
- **HTML Canvas** — Interactive Sadhya drawing

### Backend & Storage

- **Supabase** — Persistent leaderboard
- **localStorage** — Local fallback

### Tools

- **pnpm** — Package management
- **Node.js 22+** — Runtime

---

## Project Structure

```text
sadhya-undakkam/
├── src/
│   ├── App.tsx                 # App state & routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Styling
│   ├── types.ts                # TypeScript types
│   │
│   ├── pages/
│   │   ├── HomePage.tsx        # Mode selection
│   │   ├── BuilderPage.tsx     # Sadhya builder & drawing
│   │   ├── ResultPage.tsx      # Score & Maveli's judgment
│   │   └── LeaderboardPage.tsx # Leaderboard
│   │
│   ├── components/
│   │   └── MaveliCharacter.tsx # Maveli reactions
│   │
│   ├── data/
│   │   └── dishes.ts           # Dish data & stats
│   │
│   ├── lib/
│   │   └── leaderboard.ts      # Leaderboard logic
│   │
│   └── assets/
│       ├── *.mp3               # Audio assets
│       └── *.mp4               # Video assets
│
├── utils/
│   └── supabase/               # Supabase configuration
│
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites

- Node.js 22+
- pnpm or npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/slothrulez/sadhya-undakkam.git
cd sadhya-undakkam
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Configure Supabase

Supabase is used for persistent leaderboard storage.

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

You can also configure the credentials in:

```text
utils/supabase/info.ts
```

### 4. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

The app will be available at:

```text
http://localhost:5173
```

### 5. Build for Production

```bash
pnpm build
# or
npm run build
```

The production build will be generated in the `dist/` directory.

---

## Built with ❤️ at 

### Make-a-thon: Onam Edition

**Hosted by Friends of Figma Kochi**

The challenge was simple: **make something fun around Onam.**

So we took one of Kerala's most iconic traditions, added a little chaos, and made it playable.

## Live Demo

[Play Sadhya Undakkam](https://ethics-arch-62575693.figma.site/)
