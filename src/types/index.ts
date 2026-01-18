export interface TeamMember {
  id: number;
  full_name: string;
  title: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  education: string | null;
  bio: string | null;
  gender: 'm' | 'f' | null;
  created_at: string;
  updated_at: string;
}

export type GameMode = 'face-to-name' | 'title-to-face' | 'face-to-title';
export type GamePhase = 'idle' | 'question' | 'feedback' | 'results';
export type AppView = 'home' | 'play' | 'results' | 'team' | 'study';

export interface Question {
  target: TeamMember;
  options: TeamMember[];
  startTime: number;
}

export interface RoundData {
  question: Question;
  selectedId: number;
  correct: boolean;
  timeMs: number;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  currentRound: number;
  totalRounds: number;
  score: number;
  rounds: RoundData[];
  currentQuestion: Question | null;
}

export interface GameStats {
  totalGames: number;
  bestScore: number;
  averageScore: number;
  fastestRound: number;
}
