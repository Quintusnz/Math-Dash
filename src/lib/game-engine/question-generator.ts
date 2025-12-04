import { Question, NumberRange, RangeType, TopicType, Operation } from "../stores/useGameStore";
import { MasteryRecord } from "../db";

export type Difficulty = 'easy' | 'medium' | 'hard';

// ============================================
// Question History Tracking (prevent repeats)
// ============================================

// Track recent question facts to prevent repetition
const recentQuestionFacts: string[] = [];
const MAX_HISTORY_SIZE = 3; // Don't repeat any of the last 3 questions

/**
 * Check if a question fact was recently asked
 */
function wasRecentlyAsked(fact: string): boolean {
  return recentQuestionFacts.includes(fact);
}

/**
 * Record a question fact in the history
 */
function recordQuestionFact(fact: string): void {
  recentQuestionFacts.push(fact);
  // Keep only the last N questions
  while (recentQuestionFacts.length > MAX_HISTORY_SIZE) {
    recentQuestionFacts.shift();
  }
}

/**
 * Clear the question history (call when starting a new game session)
 */
export function clearQuestionHistory(): void {
  recentQuestionFacts.length = 0;
}

/**
 * Generate a normalized fact key for comparison
 * For commutative operations (addition, multiplication), order doesn't matter
 */
function getNormalizedFact(num1: number, num2: number, type: Question['type']): string {
  // For commutative operations, normalize by sorting the numbers
  if (type === 'addition' || type === 'multiplication') {
    const [smaller, larger] = num1 <= num2 ? [num1, num2] : [num2, num1];
    const symbol = type === 'addition' ? '+' : '×';
    return `${smaller}${symbol}${larger}`;
  }
  // For non-commutative operations, order matters
  const symbol = type === 'subtraction' ? '-' : '÷';
  return `${num1}${symbol}${num2}`;
}

// Options for question generation
export interface QuestionGeneratorOptions {
  difficulty?: Difficulty;
  weakFacts?: MasteryRecord[];
  allowedOperations?: Question['type'][];
  selectedNumbers?: number[]; // For multiplication/division (times tables)
  numberRange?: NumberRange;  // For addition/subtraction
  selectedTopics?: TopicType[]; // For special topics (number bonds, doubles, etc.)
}

/**
 * Check if a topic type is a special topic (not a basic operation)
 */
export function isSpecialTopic(type: TopicType): boolean {
  return ['number-bonds-10', 'number-bonds-20', 'number-bonds-50', 'number-bonds-100', 'doubles', 'halves', 'squares'].includes(type);
}

// ============================================
// Multiplication Table Spread Tracking
// ============================================

// Track which multipliers have been used for each times table to ensure even spread
const usedMultipliers: Map<number, Set<number>> = new Map();

/**
 * Get the next multiplier for a times table, ensuring even spread across 1-12
 */
function getSpreadMultiplier(tableNumber: number): number {
  if (!usedMultipliers.has(tableNumber)) {
    usedMultipliers.set(tableNumber, new Set());
  }
  
  const used = usedMultipliers.get(tableNumber)!;
  
  // If all multipliers have been used, reset
  if (used.size >= 12) {
    used.clear();
  }
  
  // Find available multipliers (1-12 that haven't been used recently)
  const available: number[] = [];
  for (let i = 1; i <= 12; i++) {
    if (!used.has(i)) {
      available.push(i);
    }
  }
  
  // Pick a random available multiplier
  const multiplier = available[Math.floor(Math.random() * available.length)];
  used.add(multiplier);
  
  return multiplier;
}

/**
 * Clear the multiplier tracking (call when starting a new game session)
 */
export function clearMultiplierTracking(): void {
  usedMultipliers.clear();
}

// ============================================
// Question Generation with Anti-Repeat Logic
// ============================================

/**
 * Generate a question based on the provided options
 * Supports basic operations AND special topics
 * Includes anti-repeat logic to avoid the same question appearing within 3 questions
 */
export function generateQuestion(options: QuestionGeneratorOptions = {}): Question {
  const {
    difficulty = 'easy',
    weakFacts = [],
    allowedOperations = ['addition', 'subtraction', 'multiplication', 'division'],
    selectedNumbers = [],
    numberRange,
    selectedTopics = []
  } = options;

  // If special topics are selected, randomly pick between special topics and allowed operations
  if (selectedTopics.length > 0) {
    // 50% chance to generate a special topic question if both are available
    const useSpecialTopic = allowedOperations.length === 0 || Math.random() < 0.5;
    if (useSpecialTopic) {
      const topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
      return generateSpecialTopicQuestion(topic);
    }
  }

  // Try to generate a non-repeating question (with max attempts to avoid infinite loop)
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const question = generateQuestionInternal(options, difficulty, weakFacts, allowedOperations, selectedNumbers, numberRange);
    
    // Check if this question was recently asked
    const normalizedFact = getNormalizedFact(
      parseOperandFromQuestion(question.text, 0),
      parseOperandFromQuestion(question.text, 1),
      question.type
    );
    
    if (!wasRecentlyAsked(normalizedFact) || attempt === maxAttempts - 1) {
      // Record this question and return it
      recordQuestionFact(normalizedFact);
      return question;
    }
    // Otherwise, try again
  }
  
  // Fallback (should never reach here due to maxAttempts - 1 check above)
  return generateQuestionInternal(options, difficulty, weakFacts, allowedOperations, selectedNumbers, numberRange);
}

/**
 * Parse an operand from a question text like "3 + 5" or "7 × 8"
 */
function parseOperandFromQuestion(text: string, index: 0 | 1): number {
  const match = text.match(/(\d+)\s*[\+\-\×\÷]\s*(\d+)/);
  if (match) {
    return parseInt(match[index + 1]);
  }
  return 0;
}

/**
 * Internal question generation (called by generateQuestion with retry logic)
 */
function generateQuestionInternal(
  options: QuestionGeneratorOptions,
  difficulty: Difficulty,
  weakFacts: MasteryRecord[],
  allowedOperations: Question['type'][],
  selectedNumbers: number[],
  numberRange?: NumberRange
): Question {

  // 30% chance to pick a weak fact if available
  if (weakFacts.length > 0 && Math.random() < 0.3) {
    const weakFact = weakFacts[Math.floor(Math.random() * weakFacts.length)];
    // Parse the fact string "7x8" back to numbers
    // This is a bit hacky, ideally we store operands. 
    // For now, let's just re-generate based on the operation of the weak fact to keep it simple,
    // OR try to parse the text.
    // Let's try to parse the fact string if it follows "num1 symbol num2" pattern.
    
    const match = weakFact.fact.match(/(\d+)([\+\-\×\÷])(\d+)/);
    if (match) {
      const [_, n1, sym, n2] = match;
      let num1 = parseInt(n1);
      let num2 = parseInt(n2);
      let answer = 0;
      let type: Question['type'] = 'addition';
      
      if (sym === '+') { answer = num1 + num2; type = 'addition'; }
      else if (sym === '-') { answer = num1 - num2; type = 'subtraction'; }
      else if (sym === '×') { answer = num1 * num2; type = 'multiplication'; }
      else if (sym === '÷') { answer = num1 / num2; type = 'division'; }
      
      // For add/sub with number range, check if weak fact fits the range
      const isAddSub = type === 'addition' || type === 'subtraction';
      let matchesRange = true;
      if (numberRange && isAddSub) {
        if (numberRange.rangeType === 'operand') {
          // Check first operand against min/max and second against min2/max2
          const firstMin = numberRange.min;
          const firstMax = numberRange.max;
          const secondMin = numberRange.min2 ?? numberRange.min;
          const secondMax = numberRange.max2 ?? numberRange.max;
          matchesRange = (num1 >= firstMin && num1 <= firstMax && num2 >= secondMin && num2 <= secondMax);
        } else {
          // Answer range mode
          matchesRange = (answer >= numberRange.min && answer <= numberRange.max);
        }
      }
      
      // Only use weak fact if it matches allowed operations AND selected numbers/range
      const matchesNumbers = selectedNumbers.length === 0 || 
        (type === 'multiplication' && (selectedNumbers.includes(num1) || selectedNumbers.includes(num2))) ||
        (type === 'division' && selectedNumbers.includes(num2)); // Practice dividing by X

      if (allowedOperations.includes(type) && (isAddSub ? matchesRange : matchesNumbers)) {
        // For multiplication with selected numbers, ensure table number is always second
        // Format: "multiplier × table" (e.g., "3 × 5" for 5 times table)
        if (type === 'multiplication' && selectedNumbers.length > 0) {
          // Check which number is the selected table number
          if (selectedNumbers.includes(num1) && !selectedNumbers.includes(num2)) {
            // num1 is the table, swap so table is second
            [num1, num2] = [num2, num1];
          }
          // If both or neither are in selectedNumbers, keep as-is or prefer second
          // (multiplication is commutative, so answer stays the same)
        }
        
        const displaySymbol = type === 'addition' ? '+' : type === 'subtraction' ? '-' : type === 'multiplication' ? '×' : '÷';
        return {
          id: crypto.randomUUID(),
          text: `${num1} ${displaySymbol} ${num2}`,
          answer,
          type,
          fact: `${num1}${displaySymbol}${num2}`
        };
      }
    }
  }

  const type = getRandomType(allowedOperations);
  let num1: number, num2: number, answer: number;

  // Helper to get a number from selected list or random
  const getTargetNumber = () => {
    if (selectedNumbers.length > 0) {
      return selectedNumbers[Math.floor(Math.random() * selectedNumbers.length)];
    }
    return null;
  };

  switch (type) {
    case 'addition': {
      if (numberRange) {
        // Use number range for addition
        const result = generateAdditionWithRange(numberRange);
        num1 = result.num1;
        num2 = result.num2;
        answer = result.answer;
      } else {
        // Legacy behavior with selected numbers
        const target = getTargetNumber();
        if (target !== null) {
          num1 = target;
          [num2] = getNumbers(difficulty);
          if (Math.random() > 0.5) [num1, num2] = [num2, num1];
        } else {
          [num1, num2] = getNumbers(difficulty);
        }
        answer = num1 + num2;
      }
      break;
    }
    case 'subtraction': {
      if (numberRange) {
        // Use number range for subtraction
        const result = generateSubtractionWithRange(numberRange);
        num1 = result.num1;
        num2 = result.num2;
        answer = result.answer;
      } else {
        // Legacy behavior with selected numbers
        const target = getTargetNumber();
        if (target !== null) {
          num2 = target;
          const [other] = getNumbers(difficulty);
          num1 = other + num2;
        } else {
          [num1, num2] = getNumbers(difficulty);
          if (num1 < num2) [num1, num2] = [num2, num1];
        }
        answer = num1 - num2;
      }
      break;
    }
    case 'multiplication': {
      const target = getTargetNumber();
      if (target !== null) {
        // For times tables practice, use spread logic to ensure even distribution
        // IMPORTANT: Format is always "multiplier × table" (e.g., "3 × 5" for 5 times table)
        // This means the selected table number is ALWAYS the second operand
        num2 = target; // The times table (e.g., 5 for "5 times table")
        num1 = getSpreadMultiplier(target); // The multiplier (1-12), spread evenly
      } else {
        [num1, num2] = getNumbers(difficulty, true);
      }
      answer = num1 * num2;
      break;
    }
    case 'division': {
      const target = getTargetNumber();
      if (target !== null) {
        // Practice dividing BY target (e.g. X / 5)
        num2 = target;
        // Answer should be within reasonable range (1-12)
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
      } else {
        [num2, answer] = getNumbers(difficulty, true);
        num1 = num2 * answer;
      }
      break;
    }
    default:
      num1 = 1; num2 = 1; answer = 2;
  }

  const symbol = type === 'addition' ? '+' : type === 'subtraction' ? '-' : type === 'multiplication' ? '×' : '÷';
  const fact = `${num1}${symbol}${num2}`;

  return {
    id: crypto.randomUUID(),
    text: `${num1} ${symbol} ${num2}`,
    answer,
    type,
    fact
  };
}

/**
 * Generate addition question based on number range
 */
function generateAdditionWithRange(range: NumberRange): { num1: number; num2: number; answer: number } {
  const { min, max, min2, max2, rangeType } = range;
  
  if (rangeType === 'answer') {
    // Answer must be within range - work backwards
    const answer = Math.floor(Math.random() * (max - min + 1)) + min;
    // Split the answer into two parts
    const num1 = Math.floor(Math.random() * (answer + 1)); // 0 to answer
    const num2 = answer - num1;
    return { num1, num2, answer };
  } else {
    // Operand range - each number within its own range
    // First operand uses min/max, second operand uses min2/max2 (or falls back to min/max)
    const firstMin = min;
    const firstMax = max;
    const secondMin = min2 ?? min;
    const secondMax = max2 ?? max;
    
    const num1 = Math.floor(Math.random() * (firstMax - firstMin + 1)) + firstMin;
    const num2 = Math.floor(Math.random() * (secondMax - secondMin + 1)) + secondMin;
    return { num1, num2, answer: num1 + num2 };
  }
}

/**
 * Generate subtraction question based on number range
 */
function generateSubtractionWithRange(range: NumberRange): { num1: number; num2: number; answer: number } {
  const { min, max, min2, max2, rangeType, allowNegatives } = range;
  
  if (rangeType === 'answer') {
    // Answer must be within range
    const answerMin = allowNegatives ? min : Math.max(0, min);
    const answerMax = max;
    const answer = Math.floor(Math.random() * (answerMax - answerMin + 1)) + answerMin;
    
    // num1 - num2 = answer, so num1 = answer + num2
    // Pick num2 randomly, but keep num1 reasonable (within 0-100 or so)
    const maxNum2 = Math.min(max, 100 - answer); // Keep num1 <= 100
    const num2 = Math.floor(Math.random() * (maxNum2 + 1));
    const num1 = answer + num2;
    
    return { num1, num2, answer };
  } else {
    // Operand range - each operand within its own range
    // First operand uses min/max, second operand uses min2/max2 (or falls back to min/max)
    const firstMin = min;
    const firstMax = max;
    const secondMin = min2 ?? min;
    const secondMax = max2 ?? max;
    
    let num1 = Math.floor(Math.random() * (firstMax - firstMin + 1)) + firstMin;
    let num2 = Math.floor(Math.random() * (secondMax - secondMin + 1)) + secondMin;
    
    // Ensure positive result unless negatives allowed
    if (!allowNegatives && num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    
    return { num1, num2, answer: num1 - num2 };
  }
}

function getRandomType(allowedOperations: Question['type'][]): Question['type'] {
  if (allowedOperations.length === 0) return 'addition';
  return allowedOperations[Math.floor(Math.random() * allowedOperations.length)];
}

function getNumbers(difficulty: Difficulty, isMultiplication = false): [number, number] {
  let max = 10;
  if (difficulty === 'medium') max = 20;
  if (difficulty === 'hard') max = 50;
  
  if (isMultiplication) max = Math.ceil(max / 2); // Smaller range for multiplication

  const n1 = Math.floor(Math.random() * max) + 1;
  const n2 = Math.floor(Math.random() * max) + 1;
  return [n1, n2];
}

// Legacy function signature for backwards compatibility
export function generateQuestionLegacy(
  difficulty: Difficulty = 'easy', 
  weakFacts: MasteryRecord[] = [],
  allowedOperations: Question['type'][] = ['addition', 'subtraction', 'multiplication', 'division'],
  selectedNumbers: number[] = []
): Question {
  return generateQuestion({
    difficulty,
    weakFacts,
    allowedOperations,
    selectedNumbers
  });
}

// ============================================
// Special Topic Question Generators
// ============================================

/**
 * Generate a question for a special topic
 */
function generateSpecialTopicQuestion(topic: TopicType): Question {
  switch (topic) {
    case 'number-bonds-10':
      return generateNumberBondsQuestion(10);
    case 'number-bonds-20':
      return generateNumberBondsQuestion(20);
    case 'number-bonds-50':
      return generateNumberBonds50Question();
    case 'number-bonds-100':
      return generateNumberBonds100Question();
    case 'doubles':
      return generateDoublesQuestion();
    case 'halves':
      return generateHalvesQuestion();
    case 'squares':
      return generateSquaresQuestion();
    default:
      // Fallback to addition if unknown topic
      return generateQuestion({ allowedOperations: ['addition'] });
  }
}

/**
 * Number Bonds to 10 or 20
 * Asks: "? + X = 10" or "10 - X = ?"
 * 
 * These are the pairs that sum to the target:
 * For 10: (0,10), (1,9), (2,8), (3,7), (4,6), (5,5)
 * For 20: (0,20), (1,19), (2,18), ... (10,10)
 */
function generateNumberBondsQuestion(target: 10 | 20): Question {
  const maxFirstNumber = target; // 0 to target
  const num1 = Math.floor(Math.random() * (maxFirstNumber + 1));
  const num2 = target - num1;
  
  // Randomly choose question format
  const format = Math.floor(Math.random() * 3);
  
  let text: string;
  let answer: number;
  let fact: string;
  
  switch (format) {
    case 0:
      // Format: "? + num2 = target" (find the complement)
      text = `? + ${num2} = ${target}`;
      answer = num1;
      fact = `${num1}+${num2}=${target}`;
      break;
    case 1:
      // Format: "num1 + ? = target"
      text = `${num1} + ? = ${target}`;
      answer = num2;
      fact = `${num1}+${num2}=${target}`;
      break;
    case 2:
    default:
      // Format: "target - num1 = ?"
      text = `${target} − ${num1} = ?`;
      answer = num2;
      fact = `${target}-${num1}=${num2}`;
      break;
  }
  
  const topicType: TopicType = target === 10 ? 'number-bonds-10' : 'number-bonds-20';
  
  return {
    id: crypto.randomUUID(),
    text,
    answer,
    type: topicType,
    fact
  };
}

/**
 * Number Bonds to 100
 * Uses friendly numbers: multiples of 5 and 10
 * Pairs like: (30, 70), (45, 55), (25, 75), etc.
 */
function generateNumberBonds100Question(): Question {
  // Use multiples of 5 for easier mental math
  const possibleFirstNumbers = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
  const num1 = possibleFirstNumbers[Math.floor(Math.random() * possibleFirstNumbers.length)];
  const num2 = 100 - num1;
  
  // Randomly choose question format
  const format = Math.floor(Math.random() * 3);
  
  let text: string;
  let answer: number;
  let fact: string;
  
  switch (format) {
    case 0:
      // Format: "? + num2 = 100"
      text = `? + ${num2} = 100`;
      answer = num1;
      fact = `${num1}+${num2}=100`;
      break;
    case 1:
      // Format: "num1 + ? = 100"
      text = `${num1} + ? = 100`;
      answer = num2;
      fact = `${num1}+${num2}=100`;
      break;
    case 2:
    default:
      // Format: "100 - num1 = ?"
      text = `100 − ${num1} = ?`;
      answer = num2;
      fact = `100-${num1}=${num2}`;
      break;
  }
  
  return {
    id: crypto.randomUUID(),
    text,
    answer,
    type: 'number-bonds-100',
    fact
  };
}

/**
 * Number Bonds to 50
 * Uses friendly numbers: multiples of 5
 * Pairs like: (15, 35), (20, 30), (25, 25), etc.
 */
function generateNumberBonds50Question(): Question {
  // Use multiples of 5 for easier mental math
  const possibleFirstNumbers = [5, 10, 15, 20, 25, 30, 35, 40, 45];
  const num1 = possibleFirstNumbers[Math.floor(Math.random() * possibleFirstNumbers.length)];
  const num2 = 50 - num1;
  
  // Randomly choose question format
  const format = Math.floor(Math.random() * 3);
  
  let text: string;
  let answer: number;
  let fact: string;
  
  switch (format) {
    case 0:
      // Format: "? + num2 = 50"
      text = `? + ${num2} = 50`;
      answer = num1;
      fact = `${num1}+${num2}=50`;
      break;
    case 1:
      // Format: "num1 + ? = 50"
      text = `${num1} + ? = 50`;
      answer = num2;
      fact = `${num1}+${num2}=50`;
      break;
    case 2:
    default:
      // Format: "50 - num1 = ?"
      text = `50 − ${num1} = ?`;
      answer = num2;
      fact = `50-${num1}=${num2}`;
      break;
  }
  
  return {
    id: crypto.randomUUID(),
    text,
    answer,
    type: 'number-bonds-50',
    fact
  };
}

/**
 * Doubles
 * Practice doubling numbers from 1 to 20
 * Format: "double 7 = ?" or "7 + 7 = ?"
 */
function generateDoublesQuestion(): Question {
  const num = Math.floor(Math.random() * 20) + 1; // 1 to 20
  const answer = num * 2;
  
  // Randomly choose format
  const format = Math.floor(Math.random() * 2);
  
  let text: string;
  
  if (format === 0) {
    text = `Double ${num} = ?`;
  } else {
    text = `${num} + ${num} = ?`;
  }
  
  return {
    id: crypto.randomUUID(),
    text,
    answer,
    type: 'doubles',
    fact: `double${num}=${answer}`
  };
}

/**
 * Halves
 * Practice finding half of even numbers from 2 to 40
 * Format: "half of 24 = ?" or "24 ÷ 2 = ?"
 */
function generateHalvesQuestion(): Question {
  // Generate even numbers from 2 to 40
  const num = (Math.floor(Math.random() * 20) + 1) * 2; // 2, 4, 6, ..., 40
  const answer = num / 2;
  
  // Randomly choose format
  const format = Math.floor(Math.random() * 2);
  
  let text: string;
  
  if (format === 0) {
    text = `Half of ${num} = ?`;
  } else {
    text = `${num} ÷ 2 = ?`;
  }
  
  return {
    id: crypto.randomUUID(),
    text,
    answer,
    type: 'halves',
    fact: `half${num}=${answer}`
  };
}

/**
 * Square Numbers
 * Practice squares from 1×1 to 12×12
 * Format: "7² = ?" or "7 × 7 = ?"
 */
function generateSquaresQuestion(): Question {
  const num = Math.floor(Math.random() * 12) + 1; // 1 to 12
  const answer = num * num;
  
  // Randomly choose format
  const format = Math.floor(Math.random() * 2);
  
  let text: string;
  
  if (format === 0) {
    text = `${num}² = ?`;
  } else {
    text = `${num} × ${num} = ?`;
  }
  
  return {
    id: crypto.randomUUID(),
    text,
    answer,
    type: 'squares',
    fact: `${num}²=${answer}`
  };
}

/**
 * Generate a question specifically for a topic type
 * Useful for Daily Dash and topic suggestions
 */
export function generateQuestionForTopic(topic: TopicType, options: Omit<QuestionGeneratorOptions, 'selectedTopics' | 'allowedOperations'> = {}): Question {
  if (isSpecialTopic(topic)) {
    return generateSpecialTopicQuestion(topic);
  }
  
  // It's a basic operation
  return generateQuestion({
    ...options,
    allowedOperations: [topic as Operation]
  });
}