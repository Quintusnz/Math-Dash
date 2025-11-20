import { Question } from "../stores/useGameStore";
import { MasteryRecord } from "../db";

export type Difficulty = 'easy' | 'medium' | 'hard';

export function generateQuestion(
  difficulty: Difficulty = 'easy', 
  weakFacts: MasteryRecord[] = []
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
      
      return {
        id: crypto.randomUUID(),
        text: `${num1} ${sym} ${num2}`,
        answer,
        type,
        fact: weakFact.fact
      };
    }
  }

  const type = getRandomType(difficulty);
  let num1, num2, answer;

  switch (type) {
    case 'addition':
      [num1, num2] = getNumbers(difficulty);
      answer = num1 + num2;
      break;
    case 'subtraction':
      [num1, num2] = getNumbers(difficulty);
      // Ensure positive result for now
      if (num1 < num2) [num1, num2] = [num2, num1];
      answer = num1 - num2;
      break;
    case 'multiplication':
      [num1, num2] = getNumbers(difficulty, true); // Smaller numbers for multiplication
      answer = num1 * num2;
      break;
    case 'division':
      // Generate multiplication first then reverse it
      [num2, answer] = getNumbers(difficulty, true);
      num1 = num2 * answer;
      break;
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

function getRandomType(difficulty: Difficulty): Question['type'] {
  const types: Question['type'][] = ['addition', 'subtraction'];
  if (difficulty !== 'easy') types.push('multiplication');
  if (difficulty === 'hard') types.push('division');
  
  return types[Math.floor(Math.random() * types.length)];
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
