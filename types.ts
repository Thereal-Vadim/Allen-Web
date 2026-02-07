export interface Project {
  id: number | string;
  title: string;
  category: string;
  videoUrl: string;
  // New fields for Home Page (WorkSection)
  director?: string;
  role?: string;
  imageUrl?: string;
  isFeatured?: boolean; // If true, shows on Home Page
  showInWork?: boolean; // If true, shows on Work Page
  size?: 'medium' | 'large'; // Controls grid size on Home Page
  galleryUrls?: string[]; // Array of additional video URLs for the gallery view
  order?: number; // For sorting projects
}

export interface CursorContextType {
  cursorType: 'default' | 'hover' | 'video';
  setCursorType: (type: 'default' | 'hover' | 'video') => void;
}

export type NavView = 'home' | 'work' | 'prices' | 'about' | 'contact' | 'admin';

// --- ABOUT PAGE TYPES ---

export interface SoftwareItem {
  name: string;
  cat: string;
  level: string;
}

export interface GearGroup {
  category: string;
  items: string[];
}

export interface AboutPageData {
  bio: string;
  profileImageUrl: string;
  philosophy: string;
  software: SoftwareItem[];
  gear: GearGroup[];
}