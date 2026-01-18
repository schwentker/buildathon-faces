import { supabase } from './supabase';
import type { TeamMember } from '../types';
import { companyConfig } from '../config/company';

// Mock data for development/fallback - matches real Moraware team
export const MOCK_TEAM: TeamMember[] = [
  { id: 1, full_name: "Lynne Dewhurst", title: "Head of Support & Onboarding", linkedin_url: "https://www.linkedin.com/in/lynnedewhurst", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 2, full_name: "Amelia Roberts", title: "Support", linkedin_url: "https://www.linkedin.com/in/amelia-roberts-61312676", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 3, full_name: "Annie Miller", title: "Support", linkedin_url: "https://www.linkedin.com/in/annie-miller-58b45a123", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 4, full_name: "Angela Smolsnik", title: "Support", linkedin_url: "https://www.linkedin.com/in/angela-smolsnik-0b4b82220", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 5, full_name: "Amanda King", title: "Onboarding", linkedin_url: "https://www.linkedin.com/in/amanda-king-2483084a", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 6, full_name: "Danny", title: "Onboarding Specialist", linkedin_url: null, photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 7, full_name: "Kaitlyn Rataezyk", title: "Onboarding", linkedin_url: "https://www.linkedin.com/in/kaitlyn-rataezyk-b403a510b", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 8, full_name: "Jaime Couden", title: "Head of Sales", linkedin_url: "https://www.linkedin.com/in/jaime-couden", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 9, full_name: "Evan Mayer", title: "Sales", linkedin_url: "https://www.linkedin.com/in/eamayer", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 10, full_name: "Jon Burgstrom Jr", title: "Sales", linkedin_url: "https://www.linkedin.com/in/jon-burgstrom-jr-91a05a48", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 11, full_name: "Almie Borromeo", title: "Sales", linkedin_url: "https://www.linkedin.com/in/almieborromeo", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 12, full_name: "Christy Qualle", title: "Head of Marketing", linkedin_url: "https://www.linkedin.com/in/christyqualle", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 13, full_name: "Ryan Kanine", title: "Marketing", linkedin_url: "https://www.linkedin.com/in/ryankanine", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 14, full_name: "Loren Curtis", title: "Head of Engineering", linkedin_url: "https://www.linkedin.com/in/loren-curtis-6066661", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 15, full_name: "Calen Lopata", title: "Development", linkedin_url: "https://www.linkedin.com/in/calenlopata", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 16, full_name: "Derek Lewsey", title: "Development", linkedin_url: "https://www.linkedin.com/in/dereklewsey", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 17, full_name: "Chris Clarke", title: "Development", linkedin_url: "https://www.linkedin.com/in/chris-clarke-260933126", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 18, full_name: "Jordan Freeman", title: "Development", linkedin_url: "https://www.linkedin.com/in/jordan-freeman-62ba1126", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 19, full_name: "Richard Keating", title: "Development", linkedin_url: "https://www.linkedin.com/in/richard-keating-96168558", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 20, full_name: "Chelsea Hendrickson", title: "Product", linkedin_url: "https://www.linkedin.com/in/chelsea-hendrickson-b1193535", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 21, full_name: "Julie Parrish", title: "Documentation", linkedin_url: "https://www.linkedin.com/in/julie-parrish-writes", photo_url: null, education: null, bio: null, gender: 'f', created_at: "", updated_at: "" },
  { id: 22, full_name: "Harry Hollander", title: "Co-founder", linkedin_url: "https://www.linkedin.com/in/harryhollander", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 23, full_name: "Ted Pitts", title: "Co-founder", linkedin_url: "https://www.linkedin.com/in/tedpitts", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
  { id: 24, full_name: "Patrick Ramsey", title: "CEO", linkedin_url: "https://www.linkedin.com/in/patrickramsey", photo_url: null, education: null, bio: null, gender: 'm', created_at: "", updated_at: "" },
];

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  if (!supabase) {
    console.log('Using mock data (no Supabase connection)');
    return MOCK_TEAM;
  }

  try {
    const { data, error } = await supabase
      .from(companyConfig.supabase.table)
      .select('*')
      .order('full_name');

    if (error) {
      console.error('Supabase error:', error);
      return MOCK_TEAM;
    }

    return data || MOCK_TEAM;
  } catch (err) {
    console.error('Failed to fetch team:', err);
    return MOCK_TEAM;
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomOptions(
  allMembers: TeamMember[],
  target: TeamMember,
  count: number = 4
): TeamMember[] {
  // Filter to same gender if target has gender set
  const sameGender = target.gender 
    ? allMembers.filter(m => m.gender === target.gender && m.id !== target.id)
    : allMembers.filter(m => m.id !== target.id);
  
  // If not enough same-gender options, fall back to all members
  const pool = sameGender.length >= count - 1 
    ? sameGender 
    : allMembers.filter(m => m.id !== target.id);
  
  const shuffled = shuffleArray(pool);
  const distractors = shuffled.slice(0, count - 1);
  
  // Insert target at random position
  const options = [...distractors];
  const insertIndex = Math.floor(Math.random() * count);
  options.splice(insertIndex, 0, target);
  
  return options;
}
