import { db, MasteryRecord, GameSession } from '../db';
import { Operation, TopicType, RangePreset } from '../stores/useGameStore';

/**
 * Topic Suggestions Engine
 * 
 * Rule-based system for suggesting practice topics:
 * - Identifies operations/topics not recently practiced
 * - Surfaces weak facts from mastery data
 * - Suggests progression to new topics
 * - No AI/ML - simple heuristics only (Core tier)
 */

export type SuggestionType = 
  | 'not-practiced'      // Haven't practiced this in a while
  | 'weak-facts'         // These specific facts need work
  | 'new-operation'      // Try something new
  | 'progression'        // Ready for next level
  | 'weak-operation';    // This operation needs attention

export interface Suggestion {
  id: string;
  type: SuggestionType;
  priority: number;       // 1 = highest, 5 = lowest
  headline: string;       // Short attention-grabbing text
  description: string;    // Explanation of why
  icon: string;           // Emoji icon
  
  // Actionable config - what to start practicing
  action: {
    operations: Operation[];
    selectedNumbers?: number[];    // For mult/div
    rangePreset?: RangePreset;     // For add/sub
    focusFacts?: string[];         // Specific facts to target
  };
}

// Days threshold for "not recently practiced"
const STALE_DAYS_THRESHOLD = 7;
// Weight threshold for "weak" facts
const WEAK_WEIGHT_THRESHOLD = 7;
// Accuracy threshold for weak operation
const WEAK_ACCURACY_THRESHOLD = 0.65;
// Minimum attempts before judging an operation
const MIN_ATTEMPTS_FOR_JUDGMENT = 10;

export class TopicSuggestions {
  
  /**
   * Get 1-3 practice suggestions for a profile
   */
  static async getSuggestions(profileId: string, limit = 2): Promise<Suggestion[]> {
    const [masteryRecords, recentSessions] = await Promise.all([
      db.mastery.where('profileId').equals(profileId).toArray(),
      db.sessions
        .where('profileId')
        .equals(profileId)
        .reverse()
        .limit(20)
        .toArray(),
    ]);
    
    const suggestions: Suggestion[] = [];
    
    // 1. Check for weak facts (highest priority)
    const weakFactsSuggestion = this.getWeakFactsSuggestion(masteryRecords);
    if (weakFactsSuggestion) {
      suggestions.push(weakFactsSuggestion);
    }
    
    // 2. Check for weak operations
    const weakOpSuggestion = this.getWeakOperationSuggestion(masteryRecords);
    if (weakOpSuggestion) {
      suggestions.push(weakOpSuggestion);
    }
    
    // 3. Check for not recently practiced operations
    const staleSuggestion = this.getStalePracticeSuggestion(masteryRecords, recentSessions);
    if (staleSuggestion) {
      suggestions.push(staleSuggestion);
    }
    
    // 4. Check for progression opportunities
    const progressionSuggestion = this.getProgressionSuggestion(masteryRecords, recentSessions);
    if (progressionSuggestion) {
      suggestions.push(progressionSuggestion);
    }
    
    // 5. Suggest trying new operations if applicable
    const newOpSuggestion = this.getNewOperationSuggestion(masteryRecords);
    if (newOpSuggestion) {
      suggestions.push(newOpSuggestion);
    }
    
    // Sort by priority and deduplicate
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
    uniqueSuggestions.sort((a, b) => a.priority - b.priority);
    
    return uniqueSuggestions.slice(0, limit);
  }
  
  /**
   * Get a single "next time try" suggestion for post-game screen
   * Based on what was just practiced
   */
  static async getPostGameSuggestion(
    profileId: string,
    justPracticed: { operations: Operation[]; selectedNumbers?: number[] }
  ): Promise<Suggestion | null> {
    const masteryRecords = await db.mastery
      .where('profileId')
      .equals(profileId)
      .toArray();
    
    // Find a different weak area to suggest
    const operationScores = this.calculateOperationScores(masteryRecords);
    
    // Find worst operation that wasn't just practiced
    const otherOperations = operationScores.filter(
      os => !justPracticed.operations.includes(os.operation)
    );
    
    if (otherOperations.length > 0) {
      // Sort by score (lower = weaker)
      otherOperations.sort((a, b) => a.score - b.score);
      const weakest = otherOperations[0];
      
      if (weakest.score < 0.75) {
        return {
          id: `postgame-${weakest.operation}`,
          type: 'weak-operation',
          priority: 2,
          headline: `Next time try ${this.getOperationLabel(weakest.operation)}`,
          description: this.getPostGameDescription(weakest),
          icon: this.getOperationIcon(weakest.operation),
          action: {
            operations: [weakest.operation],
            selectedNumbers: weakest.operation === 'multiplication' || weakest.operation === 'division'
              ? this.getWeakNumbers(masteryRecords, weakest.operation)
              : undefined,
            rangePreset: weakest.operation === 'addition' || weakest.operation === 'subtraction'
              ? 'starter'
              : undefined,
          },
        };
      }
    }
    
    // If user is strong everywhere, suggest progression
    const currentOp = justPracticed.operations[0];
    if (currentOp === 'addition' || currentOp === 'subtraction') {
      return {
        id: 'postgame-progression',
        type: 'progression',
        headline: 'Ready for a bigger challenge?',
        description: 'Try increasing your number range next time!',
        icon: '🚀',
        priority: 3,
        action: {
          operations: justPracticed.operations,
          rangePreset: 'builder',
        },
      };
    }
    
    return null;
  }
  
  /**
   * Analyze weak facts and create suggestion
   */
  private static getWeakFactsSuggestion(records: MasteryRecord[]): Suggestion | null {
    const weakFacts = records
      .filter(r => r.weight >= WEAK_WEIGHT_THRESHOLD)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
    
    if (weakFacts.length === 0) return null;
    
    // Group by operation
    const operationCounts: Record<Operation, number> = {
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
    };
    
    weakFacts.forEach(f => operationCounts[f.operation]++);
    
    // Find dominant operation
    const dominantOp = (Object.entries(operationCounts) as [Operation, number][])
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'multiplication';
    
    // Format facts for display (limit to 3)
    const displayFacts = weakFacts
      .slice(0, 3)
      .map(f => this.formatFact(f.fact))
      .join(', ');
    
    return {
      id: 'weak-facts',
      type: 'weak-facts',
      priority: 1,
      headline: 'These facts need work',
      description: displayFacts,
      icon: '🎯',
      action: {
        operations: [dominantOp],
        focusFacts: weakFacts.map(f => f.fact),
        selectedNumbers: this.extractNumbersFromFacts(weakFacts),
      },
    };
  }
  
  /**
   * Find operations with low accuracy
   */
  private static getWeakOperationSuggestion(records: MasteryRecord[]): Suggestion | null {
    const scores = this.calculateOperationScores(records);
    
    // Find weakest operation with sufficient data
    const weak = scores.find(
      s => s.attempts >= MIN_ATTEMPTS_FOR_JUDGMENT && s.score < WEAK_ACCURACY_THRESHOLD
    );
    
    if (!weak) return null;
    
    const accuracyPercent = Math.round(weak.score * 100);
    
    return {
      id: `weak-op-${weak.operation}`,
      type: 'weak-operation',
      priority: 2,
      headline: `${this.getOperationLabel(weak.operation)} needs practice`,
      description: `${accuracyPercent}% accuracy – let's improve!`,
      icon: this.getOperationIcon(weak.operation),
      action: {
        operations: [weak.operation],
        selectedNumbers: weak.operation === 'multiplication' || weak.operation === 'division'
          ? this.getWeakNumbers(records, weak.operation)
          : undefined,
        rangePreset: 'starter',
      },
    };
  }
  
  /**
   * Find operations not practiced recently
   */
  private static getStalePracticeSuggestion(
    records: MasteryRecord[],
    sessions: GameSession[]
  ): Suggestion | null {
    const now = Date.now();
    const staleMs = STALE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000;
    
    // Track last practice date per operation
    const lastPracticed: Record<Operation, number> = {
      addition: 0,
      subtraction: 0,
      multiplication: 0,
      division: 0,
    };
    
    // From mastery records
    records.forEach(r => {
      const lastTime = new Date(r.lastAttemptAt).getTime();
      if (lastTime > lastPracticed[r.operation]) {
        lastPracticed[r.operation] = lastTime;
      }
    });
    
    // From recent sessions
    sessions.forEach(s => {
      const sessionTime = new Date(s.startedAt).getTime();
      s.config?.operations?.forEach(op => {
        const operation = op as Operation;
        if (operation in lastPracticed && sessionTime > lastPracticed[operation]) {
          lastPracticed[operation] = sessionTime;
        }
      });
    });
    
    // Find stale operations (excluding never-practiced)
    const staleOps = (Object.entries(lastPracticed) as [Operation, number][])
      .filter(([, time]) => time > 0 && (now - time) > staleMs)
      .sort((a, b) => a[1] - b[1]); // Oldest first
    
    if (staleOps.length === 0) return null;
    
    const [staleOp, lastTime] = staleOps[0];
    const daysAgo = Math.floor((now - lastTime) / (24 * 60 * 60 * 1000));
    
    return {
      id: `stale-${staleOp}`,
      type: 'not-practiced',
      priority: 3,
      headline: `You haven't practiced ${this.getOperationLabel(staleOp).toLowerCase()} in a while`,
      description: `It's been ${daysAgo} days – let's refresh!`,
      icon: '💭',
      action: {
        operations: [staleOp],
        selectedNumbers: staleOp === 'multiplication' || staleOp === 'division'
          ? [2, 3, 4, 5]
          : undefined,
        rangePreset: 'starter',
      },
    };
  }
  
  /**
   * Suggest progression when user is strong
   */
  private static getProgressionSuggestion(
    records: MasteryRecord[],
    sessions: GameSession[]
  ): Suggestion | null {
    const scores = this.calculateOperationScores(records);
    
    // Find strong operations (>85% accuracy, 20+ attempts)
    const strongOps = scores.filter(
      s => s.score >= 0.85 && s.attempts >= 20
    );
    
    if (strongOps.length === 0) return null;
    
    const strongest = strongOps[0];
    
    // Check what numbers they've practiced for mult/div
    if (strongest.operation === 'multiplication' || strongest.operation === 'division') {
      const practicedNumbers = new Set<number>();
      records
        .filter(r => r.operation === strongest.operation && r.status === 'mastered')
        .forEach(r => {
          const match = r.fact.match(/(\d+)[×÷](\d+)/);
          if (match) {
            practicedNumbers.add(parseInt(match[1]));
            practicedNumbers.add(parseInt(match[2]));
          }
        });
      
      // Suggest next number to learn
      const allNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const nextNumber = allNumbers.find(n => !practicedNumbers.has(n));
      
      if (nextNumber) {
        return {
          id: `progression-${nextNumber}x`,
          type: 'progression',
          priority: 4,
          headline: `You're strong on ${strongest.operation} – ready for ${nextNumber}×?`,
          description: 'Time to expand your mastery!',
          icon: '🚀',
          action: {
            operations: [strongest.operation],
            selectedNumbers: [nextNumber],
          },
        };
      }
    }
    
    return null;
  }
  
  /**
   * Suggest trying a new operation
   */
  private static getNewOperationSuggestion(records: MasteryRecord[]): Suggestion | null {
    const allOps: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
    
    const practicedOps = new Set(records.map(r => r.operation));
    const newOps = allOps.filter(op => !practicedOps.has(op));
    
    if (newOps.length === 0) return null;
    
    // Prioritize: addition > multiplication > subtraction > division
    const priorityOrder: Operation[] = ['addition', 'multiplication', 'subtraction', 'division'];
    const suggestedOp = priorityOrder.find(op => newOps.includes(op)) || newOps[0];
    
    return {
      id: `new-${suggestedOp}`,
      type: 'new-operation',
      priority: 5,
      headline: `Try something new: ${this.getOperationLabel(suggestedOp)}!`,
      description: 'Expand your math skills',
      icon: '✨',
      action: {
        operations: [suggestedOp],
        selectedNumbers: suggestedOp === 'multiplication' || suggestedOp === 'division'
          ? [2, 3, 4]
          : undefined,
        rangePreset: 'starter',
      },
    };
  }
  
  // ========== Helpers ==========
  
  private static calculateOperationScores(records: MasteryRecord[]) {
    const ops: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
    
    return ops.map(operation => {
      const opRecords = records.filter(r => r.operation === operation);
      const attempts = opRecords.reduce((sum, r) => sum + r.attempts, 0);
      const correct = opRecords.reduce((sum, r) => sum + r.correct, 0);
      const score = attempts > 0 ? correct / attempts : 0.5;
      
      return { operation, attempts, correct, score };
    }).sort((a, b) => a.score - b.score);
  }
  
  private static getWeakNumbers(records: MasteryRecord[], operation: Operation): number[] {
    const numberWeights: Record<number, number> = {};
    
    records
      .filter(r => r.operation === operation)
      .forEach(r => {
        const match = r.fact.match(/(\d+)[×÷](\d+)/);
        if (match) {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          numberWeights[num1] = (numberWeights[num1] || 0) + r.weight;
          numberWeights[num2] = (numberWeights[num2] || 0) + r.weight;
        }
      });
    
    // Get top 3 weak numbers
    return Object.entries(numberWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([num]) => parseInt(num))
      .filter(n => n >= 1 && n <= 12);
  }
  
  private static extractNumbersFromFacts(facts: MasteryRecord[]): number[] {
    const numbers = new Set<number>();
    
    facts.forEach(f => {
      const match = f.fact.match(/(\d+)[×÷+−-](\d+)/);
      if (match) {
        const num1 = parseInt(match[1]);
        const num2 = parseInt(match[2]);
        if (num1 >= 1 && num1 <= 12) numbers.add(num1);
        if (num2 >= 1 && num2 <= 12) numbers.add(num2);
      }
    });
    
    return Array.from(numbers);
  }
  
  private static formatFact(fact: string): string {
    return fact
      .replace('×', ' × ')
      .replace('÷', ' ÷ ')
      .replace('+', ' + ')
      .replace('-', ' − ');
  }
  
  private static getOperationLabel(op: Operation): string {
    const labels: Record<Operation, string> = {
      addition: 'Addition',
      subtraction: 'Subtraction',
      multiplication: 'Times Tables',
      division: 'Division',
    };
    return labels[op];
  }
  
  private static getOperationIcon(op: Operation): string {
    const icons: Record<Operation, string> = {
      addition: '➕',
      subtraction: '➖',
      multiplication: '✖️',
      division: '➗',
    };
    return icons[op];
  }
  
  private static getPostGameDescription(opScore: { operation: Operation; score: number; attempts: number }): string {
    const accuracy = Math.round(opScore.score * 100);
    
    if (accuracy < 50) {
      return `${this.getOperationLabel(opScore.operation)} could use more practice (${accuracy}% accuracy)`;
    } else if (accuracy < 70) {
      return `Keep working on ${this.getOperationLabel(opScore.operation).toLowerCase()} to improve`;
    } else {
      return `A bit more practice with ${this.getOperationLabel(opScore.operation).toLowerCase()} will help`;
    }
  }
  
  private static deduplicateSuggestions(suggestions: Suggestion[]): Suggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(s => {
      // Dedupe by type + primary operation
      const key = `${s.type}-${s.action.operations[0]}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
