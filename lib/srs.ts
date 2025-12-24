
import { Card, CardStatus } from '../types';

/**
 * Priority: Weak > Learning > New > Known
 */
export const getPriorityValue = (status: CardStatus): number => {
  switch (status) {
    case CardStatus.Weak: return 4;
    case CardStatus.Learning: return 3;
    case CardStatus.New: return 2;
    case CardStatus.Known: return 1;
    default: return 0;
  }
};

export const updateCardSRS = (card: Card, remembered: boolean): Card => {
  const now = Date.now();
  const updatedCard = { ...card };
  
  updatedCard.viewCount += 1;
  updatedCard.lastShownDate = now;

  if (remembered) {
    updatedCard.successCount += 1;
    updatedCard.consecutiveSuccesses += 1;
    
    // Status Logic:
    // 1. If it was New, it becomes Learning.
    // 2. If it was Weak, it becomes Learning.
    // 3. If it was Learning/Known and reached 3 consecutive successes, it becomes Known.
    if (updatedCard.consecutiveSuccesses >= 3) {
      updatedCard.status = CardStatus.Known;
    } else {
      updatedCard.status = CardStatus.Learning;
    }
  } else {
    updatedCard.errorCount += 1;
    updatedCard.consecutiveSuccesses = 0;
    // Always becomes Weak if forgotten
    updatedCard.status = CardStatus.Weak;
  }

  return updatedCard;
};

export const getNextReviewBatch = (cards: Card[], limit: number = 15): Card[] => {
  const now = Date.now();
  
  const isReadyForReview = (card: Card) => {
    if (!card.lastShownDate) return true; // New cards
    
    const diff = now - card.lastShownDate;
    const hours = diff / (1000 * 60 * 60);
    const days = hours / 24;

    switch (card.status) {
      case CardStatus.Weak:
        return hours >= 2; // Show Weak every 2 hours
      case CardStatus.Learning:
        return days >= 1; // Show Learning every 1 day
      case CardStatus.Known:
        return days >= 5; // Show Known every 5-7 days
      case CardStatus.New:
      default:
        return true;
    }
  };

  return [...cards]
    .filter(isReadyForReview)
    // Sort by priority status and then by how long it has been since last view
    .sort((a, b) => {
      const prioDiff = getPriorityValue(b.status) - getPriorityValue(a.status);
      if (prioDiff !== 0) return prioDiff;
      return (a.lastShownDate || 0) - (b.lastShownDate || 0);
    })
    .slice(0, limit);
};
