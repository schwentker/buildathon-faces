import { companyConfig } from '../config/company';

// Direct URL mapping from Moraware website (URLs aren't fully consistent)
const PHOTO_URLS: Record<string, string> = {
  'Lynne': 'https://www.moraware.com/wp-content/uploads/elementor/thumbs/Lynne-533x533-1-rg7ff0x2b3roaxltmndfs7zz41nsrizuhd7j6poljm.png',
  'Amelia': 'https://www.moraware.com/wp-content/uploads/2025/12/Amelia-533x533-1.png',
  'Annie': 'https://www.moraware.com/wp-content/uploads/2025/12/Annie-533x533-1.png',
  'Angela': 'https://www.moraware.com/wp-content/uploads/2025/12/Angela-533x533-1.png',
  'Amanda': 'https://www.moraware.com/wp-content/uploads/2025/12/Amanda-533x533-1.png',
  'Danny': 'https://www.moraware.com/wp-content/uploads/2025/12/Danny-533x533-1.png',
  'Kaitlyn': 'https://www.moraware.com/wp-content/uploads/2025/12/Katie-533x533-1.png', // Photo labeled Katie
  'Jaime': 'https://www.moraware.com/wp-content/uploads/2025/12/Jamie-533x533-1.png',
  'Evan': 'https://www.moraware.com/wp-content/uploads/2025/12/Evan-533x533-1.png',
  'Jon': 'https://www.moraware.com/wp-content/uploads/2025/12/Jon-533x533-1.png',
  'Almie': 'https://www.moraware.com/wp-content/uploads/2025/12/Almie-533x533-1.png',
  'Christy': 'https://www.moraware.com/wp-content/uploads/2025/12/Christy-533x533-1.png',
  'Ryan': 'https://www.moraware.com/wp-content/uploads/2025/12/Ryan-533x533-1.png',
  'Loren': 'https://www.moraware.com/wp-content/uploads/2025/12/Loren-533x533-1-1.png',
  'Calen': 'https://www.moraware.com/wp-content/uploads/2025/12/calen-533x533-1.png',
  'Derek': 'https://www.moraware.com/wp-content/uploads/2025/12/Loren-533x533-1.png', // Note: website shows wrong photo for Derek
  'Chris': 'https://www.moraware.com/wp-content/uploads/2025/12/Chris-533x533-1.png',
  'Jordan': 'https://www.moraware.com/wp-content/uploads/2025/12/Jordan-533x533-1.png',
  'Richard': 'https://www.moraware.com/wp-content/uploads/2025/12/Rich-533x533-1.png', // Photo labeled Rich
  'Chelsea': 'https://www.moraware.com/wp-content/uploads/2025/12/Chelsea-533x533-1.png',
  'Julie': 'https://www.moraware.com/wp-content/uploads/2025/12/Julie-533x533-1.png',
  'Harry': 'https://www.moraware.com/wp-content/uploads/2025/12/Harry-533x533-1.png',
  'Ted': 'https://www.moraware.com/wp-content/uploads/2025/12/Ted-533x533-1-1.png',
  'Patrick': 'https://www.moraware.com/wp-content/uploads/2025/12/Patrick-533x533-1.png',
};

export function getPhotoSlug(fullName: string): string {
  return fullName.split(' ')[0];
}

export function getPhotoUrl(fullName: string): string {
  const firstName = fullName.split(' ')[0];
  
  // Check direct mapping first
  if (PHOTO_URLS[firstName]) {
    return PHOTO_URLS[firstName];
  }
  
  // Fallback to CDN pattern
  if (companyConfig.photos.source === 'cdn') {
    return companyConfig.photos.cdnPattern.replace('{slug}', firstName);
  }
  
  return getPlaceholderUrl(fullName);
}

// Generate a placeholder image URL for fallback
export function getPlaceholderUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0066CC&color=fff&size=256&font-size=0.4&bold=true`;
}
