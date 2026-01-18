# Moraware Team Recognition Game

A Lumosity-style learning game designed to help new hires, remote colleagues, and team members quickly learn who's who at Moraware.

## Why This Exists

Joining a company or collaborating across departments is harder when you can't put faces to names. This is especially true for remote and hybrid teams where hallway introductions don't happen organically.

This game transforms the "getting to know the team" process from passive (scrolling a directory) to active (engaged learning through play). Research shows active recall and spaced repetition dramatically improve retention compared to passive review.

I built this as a practical solution to a real onboarding challenge, demonstrating how lightweight, purpose-built tools can improve team dynamics without requiring enterprise software budgets or lengthy implementation cycles.

## How It Works

**Three Quiz Modes:**
- **Face → Name:** See a photo, identify the person from four options
- **Title → Face:** See a job title, find the matching person
- **Face → Title:** See a photo, guess their role

**Study Mode:** Flashcard-style review of all team members with photos, titles, and LinkedIn profiles.

**Smart Matching:** Quiz options are gender-matched to increase difficulty and prevent easy elimination.

**Progress Tracking:** High scores saved locally. No login required.

## Live Demo

[sandboxlabs.ai/moraware-team](https://sandboxlabs.ai/moraware-team)

## Potential Enhancements

The current version is intentionally simple. Future iterations could include:

- **Spaced Repetition Algorithm:** Surface people you struggle with more frequently
- **Timed Challenge Mode:** 60-second rounds for competitive play
- **Team Leaderboard:** Foster friendly competition during onboarding
- **Slack Integration:** Daily "Who's this?" challenges in team channels
- **Department Filtering:** Focus on learning specific teams
- **New Hire Spotlight:** Automatically surface recently joined members
- **Analytics Dashboard:** Track team-wide learning progress

## Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Database | Supabase (PostgreSQL) |
| Icons | Lucide React |
| Hosting | Static deployment (Hugo/Cloudflare) |

The architecture supports multi-company deployment through a simple configuration layer, making it adaptable for different organizations with minimal modification.

## Self-Hosting / Implementation

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)

### Quick Start

```bash
# Clone and install
git clone https://github.com/schwentker/moraware-team-game.git
cd moraware-team-game
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Development
npm run dev

# Production build
npm run build
```

### Database Setup

Create a `team_members` table in Supabase:

```sql
CREATE TABLE public.team_members (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  full_name text NOT NULL UNIQUE,
  title text,
  linkedin_url text UNIQUE,
  photo_url text,
  education text,
  bio text,
  gender char(1),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Customization

Update `src/config/company.ts` with your organization's details:

```typescript
export const companyConfig = {
  id: 'your-company',
  name: 'Your Company',
  tagline: 'Learn the Team',
  colors: {
    primary: '#0066CC',
    accent: '#FF6B00',
  },
  // ...
};
```

Photo URLs are mapped in `src/lib/photo-utils.ts` to handle naming inconsistencies between data sources and CDN paths.

## Project Structure

```
src/
├── config/
│   └── company.ts       # Company branding & settings
├── lib/
│   ├── photo-utils.ts   # Photo URL resolution
│   ├── supabase.ts      # Database client
│   └── team-service.ts  # Data layer & mock data
├── types/
│   └── index.ts         # TypeScript interfaces
├── App.tsx              # Main application
└── index.css            # Tailwind styles
```

## About the Developer

Built by [Robert Schwentker](https://www.linkedin.com/in/schwentker), AI Education Strategist at Sandbox Labs AI. With 25+ years in developer relations and technology education, I focus on building practical tools that solve real problems at the intersection of AI, education, and team enablement.

---

*Built with care for Moraware*
