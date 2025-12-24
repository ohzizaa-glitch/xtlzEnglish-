
import { Card, Rule, CardStatus, ItemType } from './types';

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const INITIAL_CARDS: Card[] = [
  {
    id: '1',
    front: 'Serendipity',
    back: 'Интуитивная прозорливость, счастливая случайность',
    example: 'It was serendipity that I found this shop.',
    tags: ['vocabulary', 'advanced'],
    level: 'C1',
    type: ItemType.Word,
    isFavorite: false,
    relatedRuleIds: [],
    status: CardStatus.New,
    viewCount: 0,
    successCount: 0,
    errorCount: 0,
    lastShownDate: null,
    consecutiveSuccesses: 0
  },
  {
    id: '2',
    front: 'Piece of cake',
    back: 'Проще простого (пара пустяков)',
    example: 'The exam was a piece of cake.',
    tags: ['idioms', 'casual'],
    level: 'B1',
    type: ItemType.Phrase,
    isFavorite: true,
    relatedRuleIds: [],
    status: CardStatus.Learning,
    viewCount: 2,
    successCount: 1,
    errorCount: 1,
    lastShownDate: Date.now() - 86400000,
    consecutiveSuccesses: 1
  }
];

export const INITIAL_RULES: Rule[] = [
  {
    id: 'r1',
    title: 'Present Perfect',
    explanation: 'Используется для связи прошлого с настоящим. Важен результат, а не время.',
    examples: ['I have already finished my work.', 'Have you ever been to London?'],
    level: 'B1',
    isFavorite: false
  }
];
