# bu!ld@th0n // FACES

> **"Know your judge, know your code."**

Memory training subsystem for **bu!ld@th0n** platform. Module gamifies onboarding process, requiring builders to demonstrate familiarity w/ AI Judges & Industry Mentors before they can submit their final build.

## 🎯 Objective
Unlock **Judge Selection Panel** by achieving 100% accuracy in faces game - theoretically. 

* **Level 1 (Legends):** Identify AI Judges (Fei-Fei Li, Jensen Huang, etc.).
* **Level 2 (Builders):** Unlock Mentors (Guillermo Rauch, John Carmack, etc.).

## 🛠 Tech Stack
* **Frontend:** React / Next.js (TypeScript)
* **Data:** Supabase (PostgreSQL)
* **Assets:** Supabase Storage (Headshots)
* **Vibe:** Hacker / Terminal / Dark Mode

## 🚀 Setup & Install

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    cd buildathon-faces
    npm install
    ```

2.  **Environment Variables**
    Create a `.env.local` file:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 💽 Data Schema

The game pulls from the `game_personalities` table in Supabase:

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Unique ID |
| `full_name` | text | e.g., "Mira Murati" |
| `role` | text | 'judge' or 'mentor' |
| `bio_blurb` | text | "Founder & CEO, Thinking Machines Lab" |
| `image_url` | text | URL to Supabase Storage bucket |

## 🕹 Game Logic

1.  **Fetch:** App loads randomized set of personalities from Supabase.
2.  **Loop:** Displays 1 face + 4 name options.
3.  **Scoring:**
    * Correct: +10 points, Face removed from pool.
    * Incorrect: -5 points, Face reshuffled into queue.
4.  **Win State:** When pool is empty, update user profile `judges_unlocked: true`.

## 🏗 Status
* [ ] **Core Game Loop:** Functional
* [ ] **Supabase Integration:** Pending
* [ ] **Mentor Mode Unlock:** Locked

---
*Built for the [bu!ld@th0n] protocol.*
