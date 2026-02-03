export interface Project {
  id: number;
  title: string;
  category: string;
  videoUrl: string;
}

export interface CursorContextType {
  cursorType: 'default' | 'hover' | 'video';
  setCursorType: (type: 'default' | 'hover' | 'video') => void;
}
