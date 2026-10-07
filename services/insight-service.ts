import { AnalysesRepository } from '../models/analyses.repo';

export interface RecurrenceInsight {
  tag: string;
  earlierCount: number;
  href: string;
  message: string;
}

export class InsightService {
  static async computeRecurrenceInsight(userId: string, tags: string[]): Promise<RecurrenceInsight | null> {
    if (!tags || tags.length === 0) return null;

    let maxTag: string | null = null;
    let maxCount = 0;

    for (const tag of tags) {
      const count = await AnalysesRepository.countUserTagOccurrences(userId, tag);
      // count includes the current analysis, so earlier count = count - 1
      const earlierCount = Math.max(0, count - 1);
      if (earlierCount >= 2 && earlierCount > maxCount) {
        maxCount = earlierCount;
        maxTag = tag;
      }
    }

    if (!maxTag || maxCount < 2) {
      return null;
    }

    return {
      tag: maxTag,
      earlierCount: maxCount,
      href: `/app/history?tag=${encodeURIComponent(maxTag)}`,
      message: `You've hit \`${maxTag}\` in ${maxCount} earlier analyses. View them in History.`,
    };
  }
}
