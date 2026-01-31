export interface Personality {
  id: string;
  full_name: string;
  roles: string[];
  gender: 'female' | 'male' | 'other';
  organization: string;
  title: string;
  bio_blurb: string;
  image_url: string;
  linkedin_url?: string;
  created_at?: string;
}

export interface GameState {
  score: number;
  streak: number;
  highScore: number;
  judgesUnlocked: boolean;
}

export const VITE_FIX = true;