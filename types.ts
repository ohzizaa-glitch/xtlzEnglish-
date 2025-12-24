
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

export interface Card {
  id: string;
  front: string;
  back: string;
  example?: string;
  tags: string[];
  level: string;
  type: ItemType;
  isFavorite: boolean;
  relatedRuleIds: string[];
  
  // SRS Fields
  status: CardStatus;
  viewCount: number;
  successCount: number;
  errorCount: number;
  lastShownDate: number | null;
  consecutiveSuccesses: number;
}

export interface Rule {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
  level: string;
  isFavorite: boolean;
}

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
  stats: DailyStat[];
}
