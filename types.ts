
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
  stats: DailyStat[];
}
