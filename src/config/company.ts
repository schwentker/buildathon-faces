export const companyConfig = {
  id: 'moraware',
  name: 'Moraware',
  tagline: 'Learn the Team',
  logo: null, // Can add logo URL here
  colors: {
    primary: '#0066CC',
    accent: '#FF6B00',
  },
  supabase: {
    table: 'team_members',
  },
  photos: {
    source: 'cdn' as const,
    cdnPattern: 'https://www.moraware.com/wp-content/uploads/2025/12/{slug}-533x533-1.png',
  },
  game: {
    defaultRounds: 10,
    modes: ['face-to-name', 'title-to-face', 'face-to-title'] as const,
  },
};

export type CompanyConfig = typeof companyConfig;
