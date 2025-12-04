import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateQuestion, 
  clearQuestionHistory, 
  clearMultiplierTracking 
} from '@/lib/game-engine/question-generator';

describe('Question Generator', () => {
  beforeEach(() => {
    // Reset state before each test
    clearQuestionHistory();
    clearMultiplierTracking();
  });

  describe('Anti-repeat logic', () => {
    it('should not repeat the same multiplication question within 3 questions', () => {
      const questions: string[] = [];
      
      // Generate 20 questions with selected number 5 (5 times table)
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion({
          allowedOperations: ['multiplication'],
          selectedNumbers: [5]
        });
        questions.push(q.text);
      }
      
      // Check that no question appears twice in any window of 3
      for (let i = 0; i < questions.length - 2; i++) {
        const window = questions.slice(i, i + 3);
        const uniqueInWindow = new Set(window);
        expect(uniqueInWindow.size).toBe(3);
      }
    });

    it('should not repeat the same addition question within 3 questions', () => {
      const questions: string[] = [];
      
      // Generate 20 questions with a small range to increase collision likelihood
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion({
          allowedOperations: ['addition'],
          numberRange: {
            preset: 'starter',
            min: 1,
            max: 5,
            rangeType: 'operand',
            allowNegatives: false
          }
        });
        questions.push(q.text);
      }
      
      // Check that no question appears twice in any window of 3
      for (let i = 0; i < questions.length - 2; i++) {
        const window = questions.slice(i, i + 3);
        const uniqueInWindow = new Set(window);
        // Note: For addition, a+b and b+a are considered the same due to normalization
        expect(uniqueInWindow.size).toBe(3);
      }
    });
  });

  describe('Multiplication table format', () => {
    it('should always show times table number as second operand', () => {
      // Test for 5 times table
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion({
          allowedOperations: ['multiplication'],
          selectedNumbers: [5]
        });
        
        // Parse the question text (e.g., "3 × 5")
        const match = q.text.match(/(\d+)\s*×\s*(\d+)/);
        expect(match).not.toBeNull();
        
        if (match) {
          const [, num1, num2] = match;
          // The table number (5) should always be the second operand
          expect(parseInt(num2)).toBe(5);
        }
      }
    });

    it('should work for different times tables', () => {
      const tables = [3, 7, 9, 12];
      
      for (const table of tables) {
        clearQuestionHistory();
        clearMultiplierTracking();
        
        for (let i = 0; i < 10; i++) {
          const q = generateQuestion({
            allowedOperations: ['multiplication'],
            selectedNumbers: [table]
          });
          
          const match = q.text.match(/(\d+)\s*×\s*(\d+)/);
          expect(match).not.toBeNull();
          
          if (match) {
            const [, , num2] = match;
            expect(parseInt(num2)).toBe(table);
          }
        }
      }
    });
  });

  describe('Spread logic for multiplication', () => {
    it('should use all multipliers 1-12 before repeating', () => {
      const multipliersUsed: number[] = [];
      
      // Generate 12 questions for 6 times table
      for (let i = 0; i < 12; i++) {
        const q = generateQuestion({
          allowedOperations: ['multiplication'],
          selectedNumbers: [6]
        });
        
        const match = q.text.match(/(\d+)\s*×\s*(\d+)/);
        if (match) {
          multipliersUsed.push(parseInt(match[1]));
        }
      }
      
      // All 12 multipliers (1-12) should be used exactly once
      const uniqueMultipliers = new Set(multipliersUsed);
      expect(uniqueMultipliers.size).toBe(12);
      
      // Check all numbers 1-12 are present
      for (let i = 1; i <= 12; i++) {
        expect(uniqueMultipliers.has(i)).toBe(true);
      }
    });
  });

  describe('Question history reset', () => {
    it('should reset history when clearQuestionHistory is called', () => {
      // Generate some questions
      const firstQuestion = generateQuestion({
        allowedOperations: ['multiplication'],
        selectedNumbers: [2]
      });
      
      // Clear history
      clearQuestionHistory();
      
      // The same question should now be possible again
      // (though not guaranteed due to randomness)
      // This test just ensures no errors occur
      const afterClear = generateQuestion({
        allowedOperations: ['multiplication'],
        selectedNumbers: [2]
      });
      
      expect(afterClear.id).not.toBe(firstQuestion.id);
    });
  });
});
