import { Question, NumberRange, RangeType } from "../stores/useGameStore";
import { MasteryRecord } from "../db";

export type Difficulty = 'easy' | 'medium' | 'hard';

// Options for question generation
export interface QuestionGeneratorOptions {
  difficulty?: Difficulty;
  weakFacts?: MasteryRecord[];
  allowedOperations?: Question['type'][];
  selectedNumbers?: number[]; // For multiplication/division (times tables)
  numberRange?: NumberRange;  // For addition/subtraction
}

export function generateQuestion(options: QuestionGeneratorOptions = {}): Question {
  const {
    difficulty = 'easy',
    weakFacts = [],
    allowedOperations = ['addition', 'subtraction', 'multiplication', 'division'],
    selectedNumbers = [],
    numberRange
  } = options;

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
      const num1 = parseInt(n1);
      const num2 = parseInt(n2);
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
        return {
          id: crypto.randomUUID(),
          text: `${num1} ${sym} ${num2}`,
          answer,
          type,
          fact: weakFact.fact
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
        num1 = target;
        // For multiplication, we usually practice 1-12 tables against 1-12
        num2 = Math.floor(Math.random() * 12) + 1;
        if (Math.random() > 0.5) [num1, num2] = [num2, num1];
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
