
import { ReviewItem, CardStatus } from '../types';

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

export const updateCardSRS = <T extends ReviewItem>(item: T, remembered: boolean): T => {
  const now = Date.now();
  const updatedItem = { ...item };
  
  updatedItem.viewCount += 1;
  updatedItem.lastShownDate = now;

  if (remembered) {
    updatedItem.successCount += 1;
    updatedItem.consecutiveSuccesses += 1;
    
    // Status Logic:
    // 1. If it was New, it becomes Learning.
    // 2. If it was Weak, it becomes Learning.
    // 3. If it was Learning/Known and reached 3 consecutive successes, it becomes Known.
    if (updatedItem.consecutiveSuccesses >= 3) {
      updatedItem.status = CardStatus.Known;
    } else {
      updatedItem.status = CardStatus.Learning;
    }
  } else {
    updatedItem.errorCount += 1;
    updatedItem.consecutiveSuccesses = 0;
    // Always becomes Weak if forgotten
    updatedItem.status = CardStatus.Weak;
  }

  return updatedItem;
};

export const getNextReviewBatch = (items: ReviewItem[], limit: number = 15): ReviewItem[] => {
  const now = Date.now();
  
  const isReadyForReview = (item: ReviewItem) => {
    if (!item.lastShownDate) return true; // New items
    
    const diff = now - item.lastShownDate;
    const hours = diff / (1000 * 60 * 60);
    const days = hours / 24;

    switch (item.status) {
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

  return [...items]
    .filter(isReadyForReview)
    // Sort by priority status and then by how long it has been since last view
    .sort((a, b) => {
      const prioDiff = getPriorityValue(b.status) - getPriorityValue(a.status);
      if (prioDiff !== 0) return prioDiff;
      return (a.lastShownDate || 0) - (b.lastShownDate || 0);
    })
    .slice(0, limit);
};
