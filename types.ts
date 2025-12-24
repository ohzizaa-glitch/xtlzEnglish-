
export enum CardStatus {
  New = 'New',
  Learning = 'Learning',
  Known = 'Known',
  Weak = 'Weak'
}

export enum ItemType {
  Word = 'Word',
  Phrase = 'Phrase',
  Rule = 'Rule'
}

export type ReviewMode = 
  | 'flashcards' 
  | 'writing' 
  | 'grammar_choice' 
  | 'grammar_translate' 
  | 'grammar_question';

export interface SRSFields {
  status: CardStatus;
  viewCount: number;
  successCount: number;
  errorCount: number;
  lastShownDate: number | null;
  consecutiveSuccesses: number;
}

export interface Card extends SRSFields {
  id: string;
  front: string;
  back: string;
  example?: string;
  tags: string[];
  level: string;
  type: ItemType.Word | ItemType.Phrase;
  isFavorite: boolean;
  relatedRuleIds: string[];
}

export interface Rule extends SRSFields {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
  level: string;
  type: ItemType.Rule;
  isFavorite: boolean;
}

export type ReviewItem = Card | Rule;

export interface DailyStat {
  date: string; // YYYY-MM-DD
  addedCount: number;
  repeatedCount: number;
}

export interface UserProfile {
  name: string;
  level: string;
  streak: number;
  lastActiveDate: string | null;
  completedTopicIds: string[]; // IDs of completed curriculum topics
  stats: DailyStat[];
}

// --- CURRICULUM TYPES ---

export interface StudyTopic {
  id: string;
  title: string;
  category: string; // e.g., "Lesson 1", "Grammar"
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  description: string;
  order: number;
  vocabCount: number; // How many words AI should generate
  vocabTheme: string; // The specific theme for vocabulary
}

export interface GeneratedLesson {
  rule: {
    title: string;
    explanation: string;
    examples: string[];
  };
  words: {
    front: string;
    back: string;
    example: string;
    type: 'Word' | 'Phrase';
  }[];
  dialogIntro: string; // Context for the practice dialog
}
