export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Map of number words to their integer values
const NUMBER_MAP: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100
};

// Common homophones or misinterpretations
const ALIASES: Record<string, number> = {
  'to': 2, 'too': 2, 'tu': 2,
  'for': 4, 'fore': 4, 'fo': 4,
  'ate': 8, 'ait': 8,
  'won': 1,
  'tree': 3, 'free': 3,
  'sex': 6,
  'tin': 10,
  'nighty': 90,
  'ninty': 90,
  'hunred': 100,
  'oh': 0, 'owe': 0,
  'sicks': 6, 'sivven': 7, 'fife': 5,
  'tirty': 30, 'pity': 50, 'sixty': 60,
  'hundreds': 100
};

// Generate a list of all number words 0-100 for the grammar
export function generateNumberGrammar(): string {
  const words = Object.keys(NUMBER_MAP);
  // Add compound numbers like "twenty-one"
  for (let i = 21; i < 100; i++) {
    if (i % 10 !== 0) {
      const tens = Math.floor(i / 10) * 10;
      const ones = i % 10;
      const tensWord = Object.keys(NUMBER_MAP).find(key => NUMBER_MAP[key] === tens);
      const onesWord = Object.keys(NUMBER_MAP).find(key => NUMBER_MAP[key] === ones);
      if (tensWord && onesWord) {
        words.push(`${tensWord} ${onesWord}`);
        words.push(`${tensWord}-${onesWord}`); // Also support hyphenated
      }
    }
  }
  
  // JSGF format
  return `#JSGF V1.0; grammar numbers; public <number> = ${words.join(' | ')} ;`;
}

// Parse compound numbers from words (supports 0-999 with simple phrases)
function parseCompoundWords(words: string[]): number | null {
  let total = 0;
  let current = 0;

  for (const raw of words) {
    const w = raw.toLowerCase();
    const val = NUMBER_MAP[w] ?? ALIASES[w];
    if (val !== undefined) {
      if (val === 100) {
        // handle "x hundred"
        current = (current || 1) * 100;
      } else {
        current += val;
      }
    }
  }

  total += current;
  return isNaN(total) ? null : total;
}

export function getClosestNumber(text: string): { number: number; confidence: number } | null {
  const cleanText = text.toLowerCase().trim();

  // 1) Direct digit match
  const digitMatch = cleanText.match(/-?\d+/);
  if (digitMatch) {
    return { number: parseInt(digitMatch[0], 10), confidence: 1.0 };
  }

  // 2) Try to parse compounds like "twenty three", "one hundred and five"
  const tokens = cleanText.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
  if (tokens.length) {
    const compound = parseCompoundWords(tokens);
    if (compound !== null) {
      return { number: compound, confidence: 0.92 };
    }
  }

  // 3) Check exact words and aliases
  if (NUMBER_MAP[cleanText] !== undefined) return { number: NUMBER_MAP[cleanText], confidence: 1.0 };
  if (ALIASES[cleanText] !== undefined) return { number: ALIASES[cleanText], confidence: 0.9 };

  // 4) Fuzzy match against known words
  let bestMatch: { number: number; distance: number } | null = null;
  const wordsToCheck = { ...NUMBER_MAP, ...ALIASES };
  const inputWords = tokens.length ? tokens : cleanText.split(/\s+/);

  for (const inputWord of inputWords) {
    if (inputWord.length < 2 && inputWord !== 'a' && inputWord !== 'i') continue;

    for (const [word, value] of Object.entries(wordsToCheck)) {
      const dist = levenshteinDistance(inputWord, word);
      
      const maxLength = Math.max(inputWord.length, word.length);
      const similarity = 1 - (dist / maxLength);

      if (similarity > 0.68) {
        if (!bestMatch || dist < bestMatch.distance) {
          bestMatch = { number: value, distance: dist };
        }
      }
    }
  }

  if (bestMatch) {
    return { number: bestMatch.number, confidence: 1 - (bestMatch.distance * 0.2) };
  }

  return null;
}
