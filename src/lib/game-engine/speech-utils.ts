/**
 * Speech Recognition Utilities for Math Dash
 * 
 * Enhanced number parsing with:
 * - Expected answer biasing (we know the correct answer!)
 * - Expanded phonetic aliases for accent support
 * - Multi-language number word support
 * - Fuzzy matching with Levenshtein distance
 */

export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

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

// ============================================================================
// NUMBER WORD MAPPINGS
// ============================================================================

// Core English number words
const NUMBER_MAP: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 
  'eighty': 80, 'ninety': 90, 'hundred': 100,
  // Common informal
  'a': 1, // "a hundred" = 100
};

// Extended aliases for homophones, mishearings, and accent variations
// Organized by the number they represent
const ALIASES: Record<string, number> = {
  // 0 - Zero
  'oh': 0, 'owe': 0, 'o': 0, 'nought': 0, 'nil': 0, 'null': 0,
  
  // 1 - One
  'won': 1, 'wan': 1, 'un': 1,
  
  // 2 - Two  
  'to': 2, 'too': 2, 'tu': 2, 'tew': 2, 'true': 2,
  
  // 3 - Three
  'tree': 3, 'free': 3, 'thee': 3, 'tri': 3,
  
  // 4 - Four
  'for': 4, 'fore': 4, 'fo': 4, 'ford': 4, 'fourth': 4, 'door': 4,
  
  // 5 - Five
  'fife': 5, 'hive': 5, 'fie': 5, 'vive': 5,
  
  // 6 - Six
  'sex': 6, 'sicks': 6, 'seeks': 6, 'sic': 6, 'sick': 6,
  
  // 7 - Seven  
  'sivven': 7, 'heaven': 7, 'severn': 7, 'saven': 7,
  
  // 8 - Eight
  'ate': 8, 'ait': 8, 'ape': 8, 'hate': 8, 'weight': 8, 'wait': 8,
  
  // 9 - Nine
  'nein': 9, 'line': 9, 'mine': 9, 'fine': 9, 'dine': 9, 'vine': 9,
  
  // 10 - Ten (expanded for accents and common mishearings)
  'tin': 10, 'tan': 10, 'den': 10, 'pen': 10, 'hen': 10, 
  'tenn': 10, 'then': 10, 'when': 10, 'ben': 10, 'ken': 10,
  'tend': 10, 'tent': 10, 'tens': 10, 'men': 10, 'yen': 10,
  'din': 10, 'thin': 10, 'ton': 10, 'teen': 10, 'tense': 10,
  
  // 11 - Eleven
  'levin': 11, 'elevin': 11, 'leven': 11,
  
  // 12 - Twelve
  'twelf': 12, 'twelv': 12, 'twell': 12,
  
  // 13 - Thirteen (often confused with 30)
  'therteen': 13, 'tirteen': 13, 'thurteen': 13,
  
  // 14 - Fourteen (often confused with 40)
  'forteen': 14, 'fourten': 14,
  
  // 15 - Fifteen (often confused with 50)
  'fiften': 15, 'fiveteen': 15,
  
  // 16-19
  'sixtene': 16, 'sixtin': 16,
  'seventen': 17, 'seventin': 17,
  'eighten': 18, 'aiteen': 18, 'eightteen': 18,
  'nineten': 19, 'nintin': 19, 'ninetin': 19,
  
  // 20 - Twenty
  'tweny': 20, 'twinty': 20, 'twenny': 20, 'plenty': 20,
  
  // 30 - Thirty
  'tirty': 30, 'thiry': 30, 'thurty': 30, 'dirty': 30, 'flirty': 30,
  
  // 40 - Forty
  'fourty': 40, 'farty': 40, 'party': 40, 'hearty': 40,
  
  // 50 - Fifty
  'fiffy': 50, 'fitty': 50, 'nifty': 50, 'shifty': 50,
  
  // 60 - Sixty
  'sicksty': 60, 'sickty': 60,
  
  // 70 - Seventy
  'seveny': 70, 'sevnty': 70, 'seventee': 70,
  
  // 80 - Eighty
  'eightie': 80, 'atey': 80, 'eightee': 80, 'aidy': 80,
  
  // 90 - Ninety
  'nighty': 90, 'ninty': 90, 'nineties': 90,
  
  // 100
  'hunred': 100, 'hunderd': 100, 'hundread': 100, 'hundreds': 100,
  
  // Negative indicator
  'minus': -1, 'negative': -1,
};

// ============================================================================
// NUMBER TO WORDS CONVERSION (for expected answer biasing)
// ============================================================================

const ONES_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS_WORDS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS_WORDS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/**
 * Convert a number to its word representation(s)
 * Returns multiple variations to match against
 */
export function numberToWords(num: number): string[] {
  if (num < 0) {
    const positiveWords = numberToWords(Math.abs(num));
    return positiveWords.map(w => `minus ${w}`).concat(positiveWords.map(w => `negative ${w}`));
  }
  
  if (num < 10) {
    return [ONES_WORDS[num]];
  }
  
  if (num < 20) {
    return [TEENS_WORDS[num - 10]];
  }
  
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    if (ones === 0) {
      return [TENS_WORDS[tens]];
    }
    // Return multiple formats: "twenty three", "twenty-three", "twentythree"
    return [
      `${TENS_WORDS[tens]} ${ONES_WORDS[ones]}`,
      `${TENS_WORDS[tens]}-${ONES_WORDS[ones]}`,
      `${TENS_WORDS[tens]}${ONES_WORDS[ones]}`,
    ];
  }
  
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    const hundredPart = hundreds === 1 ? 'one hundred' : `${ONES_WORDS[hundreds]} hundred`;
    
    if (remainder === 0) {
      return [hundredPart, `${hundreds} hundred`];
    }
    
    const remainderWords = numberToWords(remainder);
    const results: string[] = [];
    for (const rw of remainderWords) {
      results.push(`${hundredPart} ${rw}`);
      results.push(`${hundredPart} and ${rw}`);
    }
    return results;
  }
  
  // For larger numbers, just return the digit string
  return [num.toString()];
}

/**
 * Get common mishearing variations of a number
 * Used for biasing recognition towards expected answer
 */
export function getNumberVariations(num: number): string[] {
  const words = numberToWords(num);
  const variations = new Set<string>(words);
  
  // Add digit string
  variations.add(num.toString());
  
  // Add common mishearings based on the number
  if (num === 2) variations.add('to').add('too');
  if (num === 4) variations.add('for').add('fore');
  if (num === 8) variations.add('ate');
  
  // Teens/tens confusion pairs
  if (num === 13) variations.add('thirty');
  if (num === 30) variations.add('thirteen');
  if (num === 14) variations.add('forty');
  if (num === 40) variations.add('fourteen');
  if (num === 15) variations.add('fifty');
  if (num === 50) variations.add('fifteen');
  if (num === 16) variations.add('sixty');
  if (num === 60) variations.add('sixteen');
  if (num === 17) variations.add('seventy');
  if (num === 70) variations.add('seventeen');
  if (num === 18) variations.add('eighty');
  if (num === 80) variations.add('eighteen');
  if (num === 19) variations.add('ninety');
  if (num === 90) variations.add('nineteen');
  
  return Array.from(variations);
}

// ============================================================================
// GRAMMAR GENERATION FOR VOSK
// ============================================================================

/**
 * Build a Vosk-compatible grammar string (JSON array format)
 * This restricts the recognizer to only listen for number-related words,
 * dramatically improving accuracy for our math game use case.
 * 
 * Format: '["word1", "word2", "phrase one", "[unk]"]'
 * The [unk] token allows for unknown words to be recognized as filler
 * 
 * PERFORMANCE NOTES (from Vosk source code analysis):
 * - Grammar compiles to an FST (Finite State Transducer) at recognizer init
 * - No hard limit on phrase count; practical limit depends on phrase complexity
 * - Numbers are ideal: short phrases, limited vocabulary (~30 unique words)
 * - 1000+ phrases is fine for numbers; would be slower for long sentences
 * - FST initialization is one-time; recognition speed barely affected
 * 
 * Current implementation: 0-1000 as individual phrases + compound forms
 */
export function buildNumberGrammar(): string {
  const phrases = new Set<string>();
  
  // Base number words (these are the building blocks)
  const ones = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
  
  // Add all base words individually (helps with partial recognition)
  ones.forEach(w => phrases.add(w));
  teens.forEach(w => phrases.add(w));
  tens.filter(w => w).forEach(w => phrases.add(w));
  phrases.add("hundred");
  phrases.add("thousand");
  phrases.add("and"); // Common in "one hundred and twenty"
  
  // Generate 0-19
  ones.forEach(w => phrases.add(w));
  teens.forEach(w => phrases.add(w));
  
  // Generate 20-99 as compound phrases
  for (let t = 2; t <= 9; t++) {
    phrases.add(tens[t]); // "twenty", "thirty", etc.
    for (let o = 1; o <= 9; o++) {
      phrases.add(`${tens[t]} ${ones[o]}`); // "twenty one", "twenty two", etc.
    }
  }
  
  // Generate 100-999 with various speaking patterns
  for (let h = 1; h <= 9; h++) {
    const hundredPart = h === 1 ? "one hundred" : `${ones[h]} hundred`;
    phrases.add(hundredPart); // "one hundred", "two hundred", etc.
    
    // X hundred and Y (1-19)
    for (let i = 1; i <= 19; i++) {
      const lowWord = i < 10 ? ones[i] : teens[i - 10];
      phrases.add(`${hundredPart} ${lowWord}`);        // "one hundred one"
      phrases.add(`${hundredPart} and ${lowWord}`);    // "one hundred and one"
    }
    
    // X hundred and YY (20-99)
    for (let t = 2; t <= 9; t++) {
      phrases.add(`${hundredPart} ${tens[t]}`);        // "one hundred twenty"
      phrases.add(`${hundredPart} and ${tens[t]}`);    // "one hundred and twenty"
      
      for (let o = 1; o <= 9; o++) {
        const compound = `${tens[t]} ${ones[o]}`;
        phrases.add(`${hundredPart} ${compound}`);      // "one hundred twenty one"
        phrases.add(`${hundredPart} and ${compound}`);  // "one hundred and twenty one"
      }
    }
  }
  
  // SHORTHAND PATTERNS (common in casual speech, like telling time)
  // "seven forty five" = 745, "three twenty" = 320
  for (let h = 1; h <= 9; h++) {
    // X + teens: "seven twelve" = 712
    for (let i = 10; i <= 19; i++) {
      phrases.add(`${ones[h]} ${teens[i - 10]}`);
    }
    
    // X + tens: "seven forty" = 740
    for (let t = 2; t <= 9; t++) {
      phrases.add(`${ones[h]} ${tens[t]}`);
      
      // X + tens + ones: "seven forty five" = 745
      for (let o = 1; o <= 9; o++) {
        phrases.add(`${ones[h]} ${tens[t]} ${ones[o]}`);
      }
    }
  }
  
  // Add "one thousand" for edge case
  phrases.add("one thousand");
  phrases.add("thousand");
  
  // Add negative number support
  phrases.add("minus");
  phrases.add("negative");
  
  // Add [unk] to handle unknown words gracefully
  phrases.add("[unk]");
  
  const result = Array.from(phrases);
  console.log(`[Vosk Grammar] Generated ${result.length} phrases for number recognition`);
  
  return JSON.stringify(result);
}

// ============================================================================
// NUMBER PARSING
// ============================================================================

// Parse compound numbers from words (supports 0-999 with simple phrases)
// Handles patterns like:
//   - "twenty three" = 23
//   - "one hundred twenty three" = 123
//   - "seven forty five" = 745 (shorthand without "hundred")
//   - "five hundred" = 500
function parseCompoundWords(words: string[]): number | null {
  let total = 0;
  let current = 0;
  let isNegative = false;
  let lastWasSmallDigit = false; // Track if last number was 1-9 (potential hundreds digit)

  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase();
    
    // Handle negative indicators
    if (w === 'minus' || w === 'negative') {
      isNegative = true;
      continue;
    }
    
    // Skip filler words
    if (w === 'and' || w === 'um' || w === 'uh' || w === 'like') {
      continue;
    }
    
    const val = NUMBER_MAP[w] ?? ALIASES[w];
    if (val !== undefined && val >= 0) {
      
      if (val === 100) {
        // "x hundred" - multiply current by 100
        current = (current || 1) * 100;
        lastWasSmallDigit = false;
        
      } else if (val === 1000) {
        // "x thousand"
        current = (current || 1) * 1000;
        lastWasSmallDigit = false;
        
      } else if (val >= 20 && val < 100 && val % 10 === 0) {
        // Tens word: "twenty", "thirty", etc.
        
        if (lastWasSmallDigit && current > 0 && current < 10) {
          // Pattern: "seven forty" = 740 (shorthand for "seven hundred forty")
          // This handles "seven forty five" = 745
          current = current * 100 + val;
        } else if (current >= 100) {
          // "one hundred twenty" = 120
          current += val;
        } else {
          // Starting fresh with a tens word
          current = val;
        }
        lastWasSmallDigit = false;
        
      } else if (val >= 10 && val < 20) {
        // Teens: "ten", "eleven", ... "nineteen"
        
        if (lastWasSmallDigit && current > 0 && current < 10) {
          // Pattern: "seven twelve" = 712 (shorthand)
          current = current * 100 + val;
        } else if (current >= 100 && current % 100 === 0) {
          // "one hundred twelve" = 112
          current += val;
        } else {
          current = val;
        }
        lastWasSmallDigit = false;
        
      } else if (val >= 1 && val <= 9) {
        // Single digit: "one" through "nine"
        
        if (current >= 20 && current < 100 && current % 10 === 0) {
          // "twenty" + "three" = 23
          current += val;
        } else if (current >= 100 && current % 10 === 0) {
          // "one hundred twenty" + "three" = 123
          // or "one hundred" + "three" = 103
          current += val;
        } else if (current === 0) {
          current = val;
          lastWasSmallDigit = true;
          continue; // Don't reset lastWasSmallDigit
        } else {
          // Edge case - just add
          current += val;
        }
        lastWasSmallDigit = false;
        
      } else if (val === 0) {
        // "zero" - only meaningful alone or at start
        if (current === 0) {
          current = 0;
        }
        lastWasSmallDigit = false;
      }
    } else {
      lastWasSmallDigit = false;
    }
  }

  total += current;
  
  if (isNaN(total)) return null;
  return isNegative ? -total : total;
}

/**
 * Parse a text string to a number without any bias
 * Returns the parsed number and confidence level
 */
export function getClosestNumber(text: string): { number: number; confidence: number } | null {
  const cleanText = text.toLowerCase().trim();

  // 1) Direct digit match (highest confidence)
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
  if (NUMBER_MAP[cleanText] !== undefined) {
    return { number: NUMBER_MAP[cleanText], confidence: 1.0 };
  }
  if (ALIASES[cleanText] !== undefined) {
    return { number: ALIASES[cleanText], confidence: 0.9 };
  }

  // 4) Fuzzy match against known words
  let bestMatch: { number: number; distance: number } | null = null;
  const wordsToCheck = { ...NUMBER_MAP, ...ALIASES };
  const inputWords = tokens.length ? tokens : cleanText.split(/\s+/);

  for (const inputWord of inputWords) {
    if (inputWord.length < 2 && inputWord !== 'a') continue;

    for (const [word, value] of Object.entries(wordsToCheck)) {
      if (value < 0) continue; // Skip special markers like "minus"
      
      const dist = levenshteinDistance(inputWord, word);
      const maxLength = Math.max(inputWord.length, word.length);
      const similarity = 1 - (dist / maxLength);

      if (similarity > 0.65) {
        if (!bestMatch || dist < bestMatch.distance) {
          bestMatch = { number: value, distance: dist };
        }
      }
    }
  }

  if (bestMatch) {
    const confidence = Math.max(0.5, 1 - (bestMatch.distance * 0.15));
    return { number: bestMatch.number, confidence };
  }

  return null;
}

// ============================================================================
// EXPECTED ANSWER BIASING - THE KEY INNOVATION
// ============================================================================

export interface ParseResult {
  number: number;
  confidence: number;
  matchedExpected: boolean;
  rawText: string;
}

/**
 * Parse text with bias towards an expected answer
 * 
 * This is the key function for voice input in Math Dash:
 * - We know the correct answer before the child speaks
 * - If we hear anything that could reasonably be the expected answer, accept it
 * - This dramatically improves accuracy for our use case
 * 
 * @param text - The transcribed speech text
 * @param expectedAnswer - The correct answer we're expecting
 * @param alternatives - Optional: additional transcription alternatives to check
 * @returns ParseResult with the parsed number and match information
 */
export function parseWithExpectedAnswer(
  text: string,
  expectedAnswer: number,
  alternatives: string[] = []
): ParseResult {
  const allTexts = [text, ...alternatives].map(t => t.toLowerCase().trim());
  const expectedVariations = getNumberVariations(expectedAnswer);
  const expectedStr = expectedAnswer.toString();
  
  // Check all alternatives for matches
  for (const transcript of allTexts) {
    // 1) EXACT MATCH - Digit string in transcript
    if (transcript.includes(expectedStr)) {
      return {
        number: expectedAnswer,
        confidence: 1.0,
        matchedExpected: true,
        rawText: transcript
      };
    }
    
    // 2) EXACT WORD MATCH - Expected word form appears in transcript
    for (const variation of expectedVariations) {
      if (transcript.includes(variation)) {
        return {
          number: expectedAnswer,
          confidence: 0.98,
          matchedExpected: true,
          rawText: transcript
        };
      }
    }
    
    // 3) PARSE AND CHECK - Parse the transcript and see if it equals expected
    const parsed = getClosestNumber(transcript);
    if (parsed && parsed.number === expectedAnswer) {
      return {
        number: expectedAnswer,
        confidence: Math.max(parsed.confidence, 0.9),
        matchedExpected: true,
        rawText: transcript
      };
    }
    
    // 4) FUZZY MATCH TO EXPECTED - Check if transcript is phonetically close
    const tokens = transcript.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
    const joinedTokens = tokens.join(' ');
    
    for (const variation of expectedVariations) {
      const distance = levenshteinDistance(joinedTokens, variation);
      const maxLen = Math.max(joinedTokens.length, variation.length);
      const similarity = 1 - (distance / maxLen);
      
      // If 70%+ similar to expected, accept it
      if (similarity > 0.7) {
        return {
          number: expectedAnswer,
          confidence: similarity,
          matchedExpected: true,
          rawText: transcript
        };
      }
    }
  }
  
  // 6) NO MATCH TO EXPECTED - Return best parsed number from all alternatives
  let bestResult: ParseResult | null = null;
  
  for (const transcript of allTexts) {
    const parsed = getClosestNumber(transcript);
    if (parsed && (!bestResult || parsed.confidence > bestResult.confidence)) {
      bestResult = {
        number: parsed.number,
        confidence: parsed.confidence,
        matchedExpected: false,
        rawText: transcript
      };
    }
  }
  
  if (bestResult) {
    return bestResult;
  }
  
  // 7) COMPLETE FAILURE - Return null-ish result
  return {
    number: NaN,
    confidence: 0,
    matchedExpected: false,
    rawText: text
  };
}

/**
 * Check if text could plausibly be the expected answer
 * Lower threshold check for real-time feedback
 */
export function couldBeExpected(text: string, expectedAnswer: number): boolean {
  const cleanText = text.toLowerCase().trim();
  const expectedVariations = getNumberVariations(expectedAnswer);
  
  // Check for digit string
  if (cleanText.includes(expectedAnswer.toString())) {
    return true;
  }
  
  // Check for word variations
  for (const variation of expectedVariations) {
    if (cleanText.includes(variation)) {
      return true;
    }
    // Fuzzy check
    const similarity = 1 - (levenshteinDistance(cleanText, variation) / Math.max(cleanText.length, variation.length));
    if (similarity > 0.6) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// CONFIDENCE THRESHOLDS
// ============================================================================

export const CONFIDENCE_THRESHOLDS = {
  // When we match the expected answer - be lenient
  EXPECTED_ACCEPT: 0.6,    // Lower threshold since we know the answer
  
  // When we clearly hear a different number - still accept it
  // The game needs to know the user said a wrong answer!
  WRONG_ANSWER_ACCEPT: 0.85,  // Higher threshold - must be confident it's a real number
  
  // Below this, don't accept (probably noise or unclear speech)
  MINIMUM_CONFIDENCE: 0.5,
} as const;

/**
 * Determine if a parse result should be accepted and submitted to the game
 * 
 * KEY INSIGHT: We need to submit BOTH correct AND incorrect answers!
 * - Correct answers get marked as correct by the game
 * - Wrong answers get marked as incorrect by the game
 * - Only reject when we can't confidently parse ANY number
 * 
 * This ensures voice mode has proper accuracy tracking.
 */
export function shouldAcceptResult(result: ParseResult, hasExpectedAnswer: boolean): boolean {
  if (isNaN(result.number)) return false;
  
  // Below minimum confidence - don't accept (probably noise)
  if (result.confidence < CONFIDENCE_THRESHOLDS.MINIMUM_CONFIDENCE) {
    return false;
  }
  
  if (result.matchedExpected) {
    // We matched the expected answer - accept with lower threshold
    return result.confidence >= CONFIDENCE_THRESHOLDS.EXPECTED_ACCEPT;
  }
  
  // We heard a number that DOESN'T match the expected answer
  // This is a WRONG answer - we should still submit it so the game
  // can mark it as incorrect. But require higher confidence to avoid
  // submitting mishearings.
  return result.confidence >= CONFIDENCE_THRESHOLDS.WRONG_ANSWER_ACCEPT;
}
