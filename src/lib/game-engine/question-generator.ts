import { Question } from "../stores/useGameStore";
import { MasteryRecord } from "../db";

export type Difficulty = 'easy' | 'medium' | 'hard';

export function generateQuestion(
  difficulty: Difficulty = 'easy', 
  weakFacts: MasteryRecord[] = [],
  allowedOperations: Question['type'][] = ['addition', 'subtraction', 'multiplication', 'division'],
  selectedNumbers: number[] = []
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
      const num1 = parseInt(n1);
      const num2 = parseInt(n2);
      let answer = 0;
      let type: Question['type'] = 'addition';
      
      if (sym === '+') { answer = num1 + num2; type = 'addition'; }
      else if (sym === '-') { answer = num1 - num2; type = 'subtraction'; }
      else if (sym === '×') { answer = num1 * num2; type = 'multiplication'; }
      else if (sym === '÷') { answer = num1 / num2; type = 'division'; }
      
      // Only use weak fact if it matches allowed operations AND selected numbers (if any)
      const matchesNumbers = selectedNumbers.length === 0 || 
        (type === 'addition' && (selectedNumbers.includes(num1) || selectedNumbers.includes(num2))) ||
        (type === 'multiplication' && (selectedNumbers.includes(num1) || selectedNumbers.includes(num2))) ||
        (type === 'subtraction' && selectedNumbers.includes(num2)) || // Practice subtracting X
        (type === 'division' && selectedNumbers.includes(num2)); // Practice dividing by X

      if (allowedOperations.includes(type) && matchesNumbers) {
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

  const type = getRandomType(difficulty, allowedOperations);
  let num1, num2, answer;

  // Helper to get a number from selected list or random
  const getTargetNumber = () => {
    if (selectedNumbers.length > 0) {
      return selectedNumbers[Math.floor(Math.random() * selectedNumbers.length)];
    }
    return null;
  };

  switch (type) {
    case 'addition': {
      const target = getTargetNumber();
      if (target !== null) {
        num1 = target;
        [num2] = getNumbers(difficulty); // Get random other number
        // Randomize order
        if (Math.random() > 0.5) [num1, num2] = [num2, num1];
      } else {
        [num1, num2] = getNumbers(difficulty);
      }
      answer = num1 + num2;
      break;
    }
    case 'subtraction': {
      const target = getTargetNumber();
      if (target !== null) {
        // Practice subtracting BY target (e.g. X - 5)
        num2 = target;
        const [other] = getNumbers(difficulty);
        num1 = other + num2; // Ensure positive result
      } else {
        [num1, num2] = getNumbers(difficulty);
        if (num1 < num2) [num1, num2] = [num2, num1];
      }
      answer = num1 - num2;
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

function getRandomType(difficulty: Difficulty, allowedOperations: Question['type'][]): Question['type'] {
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
