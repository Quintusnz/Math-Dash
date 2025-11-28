# Voice Input Solution for Math Dash

> **Document Purpose:** This document tracks our research, implementation progress, and future plans for voice-based answer input in Math Dash. It serves as a reference for continuing development.

**Last Updated:** November 26, 2025  
**Status:** Phase 1 Implementation In Progress

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Research Findings](#research-findings)
4. [Solution Options](#solution-options)
5. [Implementation Plan (Phased Approach)](#implementation-plan-phased-approach)
6. [Technical Details](#technical-details)
7. [Dynamic Answer Biasing](#dynamic-answer-biasing)
8. [Multi-Language & Accent Support](#multi-language--accent-support)
9. [Implementation Progress](#implementation-progress)
10. [Testing Checklist](#testing-checklist)
11. [Known Limitations](#known-limitations)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

Math Dash needs robust voice input to let kids call out answers verbally. Previous implementation using basic Web Speech API failed to recognize inputs reliably. This document outlines a phased approach to implement robust, local-first voice recognition that:

- Works across different accents (global deployment)
- Uses the known correct answer to improve recognition accuracy
- Minimizes/eliminates server calls where possible
- Provides excellent UX for children

---

## Problem Statement

### Previous Issues
1. **Poor recognition accuracy** - The basic Web Speech API implementation didn't reliably recognize number inputs
2. **Server dependency** - Chrome's default speech recognition sends audio to Google servers
3. **No answer context** - Previous implementation didn't leverage the fact that we know the correct answer
4. **Single-word challenges** - Short utterances like "4" or "7" are acoustically brief and easily misheard
5. **Children's voices** - Kids have higher-pitched voices that may be less accurately recognized

### Requirements
- ✅ Local processing (no server calls) where possible
- ✅ Works with children's voices
- ✅ Supports multiple accents (global deployment)
- ✅ Fast response time (game is time-sensitive)
- ✅ Graceful fallback when voice isn't available

---

## Research Findings

### Web Speech API Capabilities

| Feature | Chrome Desktop | Chrome Mobile | Safari | Firefox | Edge |
|---------|---------------|---------------|--------|---------|------|
| Web Speech API | ✅ | ✅ | ✅ (webkit) | ❌ | ✅ |
| `processLocally` | ✅ (139+) | ❌ | ❌ | ❌ | ✅ (139+) |
| `phrases` (biasing) | ✅ (142+) | ❌ | ❌ | ❌ | ✅ (142+) |

### Key Findings

1. **Grammars are deprecated** - `SpeechGrammarList` has no effect on modern browsers
2. **New `phrases` API** - Chrome 142+ supports `SpeechRecognitionPhrase` for contextual biasing
3. **On-device processing** - Chrome 139+ supports `processLocally = true` (desktop only)
4. **Language packs** - On-device recognition requires downloadable language packs (~50MB)
5. **Alternative: Vosk-Browser** - WebAssembly-based, fully offline, but requires model download

### Children's Voice Considerations
- Higher pitch (fundamental frequency 250-400 Hz vs adult 100-200 Hz)
- Shorter utterance duration
- More variable pronunciation
- May speak softer or louder

---

## Solution Options

### Option A: Enhanced Web Speech API (SELECTED FOR PHASE 1)
**Approach:** Improve existing implementation with better parsing and dynamic answer biasing

**Pros:**
- ✅ No additional dependencies
- ✅ Works on most browsers
- ✅ Minimal code changes
- ✅ Can leverage known correct answer

**Cons:**
- ❌ Server-based in most cases
- ❌ Won't work offline
- ❌ Variable accuracy with accents

### Option B: Chrome On-Device Recognition (PHASE 2)
**Approach:** Use `processLocally = true` with `phrases` biasing

**Pros:**
- ✅ 100% local processing
- ✅ Works offline after language pack download
- ✅ Can boost expected answer numbers

**Cons:**
- ❌ Chrome/Edge desktop only
- ❌ Requires language pack download
- ❌ Experimental APIs

### Option C: Vosk-Browser WebAssembly (PHASE 3 - OPTIONAL)
**Approach:** Use Vosk's WebAssembly build for true offline recognition

**Pros:**
- ✅ True offline support
- ✅ Cross-browser
- ✅ Can customize vocabulary

**Cons:**
- ❌ 50MB model download
- ❌ Higher memory usage
- ❌ More complex integration
- ❌ Package not actively maintained

---

## Implementation Plan (Phased Approach)

### Phase 1: Enhanced Web Speech API ✅ IN PROGRESS
**Goal:** Improve recognition accuracy using the known correct answer

**Changes:**
1. **Pass expected answer to SpeechInput** - The correct answer number
2. **Dynamic biasing** - Prioritize parsing the expected answer
3. **Expanded phonetic aliases** - Handle more accent variations
4. **Multi-alternative processing** - Check all recognition alternatives
5. **Lower confidence threshold for expected answer** - If we hear something close to the expected answer, accept it
6. **Improved feedback** - Show what was heard, indicate when answer matches

**Key Insight:** We know the correct answer! If the speech recognizer returns anything that could reasonably be interpreted as that number, we accept it.

### Phase 2: Chrome On-Device (Future)
**Goal:** Enable true local processing on supported browsers

**Changes:**
1. Detect `processLocally` support
2. Check/install language packs
3. Use `SpeechRecognitionPhrase` for number biasing
4. Graceful fallback to server-based

### Phase 3: Vosk Integration (Optional Future)
**Goal:** True offline cross-browser support

**Changes:**
1. Bundle small numbers-only Vosk model
2. Service worker for model caching
3. Web Worker for processing

---

## Technical Details

### Question Type (Reference)
```typescript
export interface Question {
  id: string
  text: string
  answer: number  // <-- THE CORRECT ANSWER (e.g., 42)
  type: Operation
  fact: string    // e.g. "7x8"
}
```

### SpeechInput Props Enhancement
```typescript
interface SpeechInputProps {
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  expectedAnswer?: number;  // NEW: The correct answer to bias towards
  lang?: string;            // NEW: Language code for recognition
}
```

### Recognition Strategy
```
1. Start listening
2. Receive speech alternatives (up to 5)
3. For each alternative:
   a. Parse to number using expanded aliases
   b. Check if it matches expected answer
   c. If match found with confidence > 0.5, accept immediately
4. If no match to expected, check if any parse has high confidence (> 0.8)
5. Submit best guess or wait for clearer input
```

---

## Dynamic Answer Biasing

### The Key Advantage
We know the correct answer BEFORE the child speaks. This allows us to:

1. **Lower confidence threshold** for the expected answer
2. **Check phonetic similarity** to expected answer's word form
3. **Accept close matches** - "forty too" → 42 if expected answer is 42
4. **Prioritize expected in alternatives** - If expected appears in any alternative, use it

### Implementation
```typescript
// Example: Expected answer is 42
// Child says "forty-two" but speech API returns "four to" 

// Old approach: Parse "four to" → 4 (wrong)
// New approach: 
//   1. Check if expected (42) sounds like any interpretation
//   2. "forty" + "two" → Could be 42
//   3. Match found! Accept as 42
```

### Phonetic Matching
Numbers can be misheard in predictable ways:

| Number | Common Mishearings |
|--------|-------------------|
| 2 | to, too, tu |
| 4 | for, fore, door |
| 6 | sex, sicks |
| 7 | heaven, seven |
| 8 | ate, eight, ait |
| 10 | tin, ten |
| 13 | thirty (in some accents) |
| 14 | forty (in some accents) |
| 15 | fifty |
| 40 | fourteen, forty |
| 50 | fifteen, fifty |

---

## Multi-Language & Accent Support

### Strategy
1. **Use browser's language** - `navigator.language` for recognition
2. **Expand alias tables** - Include accent-specific variations
3. **Fuzzy matching** - Levenshtein distance for close matches
4. **Number-only vocabulary** - Reduces confusion with non-number words

### Accent Variations (Examples)

**British vs American:**
- "Forty" pronunciation varies
- "Twenty" can sound like "twenny"

**Indian English:**
- Number pronunciation often clearer
- Different stress patterns

**Australian:**
- "Eight" pronounced differently
- Rising intonation

### Future: Language-Specific Parsers
```typescript
// Could add per-language number word maps
const NUMBER_MAPS: Record<string, Record<string, number>> = {
  'en-US': { 'zero': 0, 'one': 1, ... },
  'en-GB': { 'zero': 0, 'one': 1, ... },
  'en-AU': { 'zero': 0, 'one': 1, ... },
  'es-ES': { 'cero': 0, 'uno': 1, ... },
  // etc.
}
```

---

## Implementation Progress

### Phase 1 Checklist

- [ ] **Documentation** (this file)
- [ ] **Enhanced `speech-utils.ts`**
  - [ ] Expand phonetic aliases
  - [ ] Add `parseNumberWithBias(text, expectedAnswer)` function
  - [ ] Add multi-language number mappings
  - [ ] Improve fuzzy matching
- [ ] **Updated `SpeechInput.tsx`**
  - [ ] Add `expectedAnswer` prop
  - [ ] Implement biased recognition logic
  - [ ] Improve visual feedback
  - [ ] Add "heard vs expected" display
- [ ] **Integration in `play/page.tsx`**
  - [ ] Pass `currentQuestion.answer` to SpeechInput
  - [ ] Handle voice input mode selection
- [ ] **GameSetup voice option**
  - [ ] Ensure voice mode is selectable
  - [ ] Show browser support warning if needed
- [ ] **Testing**
  - [ ] Test with various numbers (single digit, teens, tens, compounds)
  - [ ] Test with different accents (if possible)
  - [ ] Test error recovery

### Files Modified

| File | Status | Changes |
|------|--------|---------|
| `Docs/voice-solution.md` | ✅ Created | This documentation |
| `src/lib/game-engine/speech-utils.ts` | 🔄 Pending | Enhanced parsing |
| `src/components/game/SpeechInput.tsx` | 🔄 Pending | Expected answer biasing |
| `src/app/(app)/play/page.tsx` | 🔄 Pending | Voice input integration |
| `src/components/game/setup/GameSetup.tsx` | 🔄 Pending | Voice mode option |

---

## Testing Checklist

### Numbers to Test
- [ ] Single digits: 0-9
- [ ] Teens: 10-19
- [ ] Tens: 20, 30, 40, 50, 60, 70, 80, 90
- [ ] Compounds: 21-99 (non-tens)
- [ ] Three digits: 100, 144, etc.
- [ ] Negative numbers (if applicable)

### Edge Cases
- [ ] Background noise
- [ ] Soft speech
- [ ] Loud speech
- [ ] Fast speech
- [ ] Slow/hesitant speech
- [ ] "Um" and filler words

### Browsers
- [ ] Chrome Desktop
- [ ] Chrome Mobile
- [ ] Safari Desktop
- [ ] Safari Mobile (iOS)
- [ ] Edge
- [ ] Firefox (should show unsupported message)

---

## Known Limitations

### ⚠️ CRITICAL: Internet Required (Phase 1)

**The Web Speech API in most browsers sends audio to cloud servers for recognition.**

This means:
- Voice input **will NOT work offline** in Phase 1
- Network errors will occur if internet is unavailable
- Users will see: "Voice needs internet. Check your connection or use Number Pad."

**Solutions:**
1. **Chrome 139+** supports `processLocally: true` for on-device recognition (we attempt this)
2. **Phase 2/3** will implement Vosk-Browser for true offline support
3. Always provide fallback to Number Pad or Multiple Choice

### Other Limitations

1. **No Firefox support** - Web Speech API not available in Firefox
2. **Microphone permission** - User must grant access on first use
3. **Quiet environments work best** - Background noise degrades accuracy
4. **Short words are hard** - Single digit numbers (1-9) are brief and challenging
5. **Children's voices** - Higher pitch may affect recognition accuracy

### Network Error Troubleshooting

If users see frequent network errors:
1. Check internet connection
2. Try a different network (school networks may block Google APIs)
3. Update Chrome to 139+ for on-device recognition
4. Use Number Pad input as reliable fallback

---

## Future Enhancements

### Phase 2+ Ideas
1. **Pronunciation hints** - Show "Say: forty-two" prompts
2. **Voice calibration** - Let user say a few numbers to calibrate
3. **Retry with emphasis** - "I heard 'four'. Did you mean 42? Say again."
4. **Multi-modal input** - Combine voice with tap confirmation
5. **Answer suggestions** - If unsure, show "Did you say X or Y?"

### Metrics to Track
- Voice recognition success rate
- Average time to recognize
- Most commonly misheard numbers
- User preference (voice vs numpad vs choice)

---

## Code Reference

### Current Question Flow
```
GameSetup → startGame() → generateQuestion() → currentQuestion
                                                    ↓
                                            Question.answer (known!)
                                                    ↓
                              SpeechInput receives expectedAnswer
                                                    ↓
                                    Voice → Parse → Match expected?
                                                    ↓
                                              Yes → Submit
                                              No → Keep listening
```

### Key Functions
- `generateQuestion()` - Creates question with known answer
- `getClosestNumber(text)` - Parses text to number
- `parseNumberWithBias(text, expected)` - NEW: Parse with bias towards expected

---

## Session Notes

### November 26, 2025
- Initial research completed
- Documented three solution options
- Selected Phase 1 (Enhanced Web Speech API) for implementation
- Key insight: Use expected answer to improve recognition

**Phase 1 Implementation Complete:**
- ✅ Enhanced `speech-utils.ts` with expected answer biasing
  - Extended NUMBER_MAP (0-100+)
  - Added 40+ phonetic aliases for accents/homophones
  - Added `numberToWords()` conversion function
  - Added `getExpectedAnswerVariants()` for generating all spoken forms
  - Added `parseNumberWithBias()` for biased recognition
  - Updated `getClosestNumber()` with optional bias parameter
- ✅ Rewrote `SpeechInput.tsx` component
  - Added `expectedAnswer` prop for dynamic biasing
  - Enhanced UI with Mic/MicOff visual states
  - Lowered confidence threshold (0.5 with bias, 0.8 without)
  - Improved status messages for user feedback
- ✅ Updated `SpeechInput.module.css` with enhanced styles
- ✅ Added 'voice' to `InputMode` type in `useGameStore.ts`
- ✅ Integrated `SpeechInput` in `play/page.tsx` with `expectedAnswer={currentQuestion?.answer}`
- ✅ Added voice option to `GameSetup.tsx` input method selection (step 3)
- ✅ Updated summary display to show "Voice" when selected

**Ready for Testing:**
- Voice input is now selectable in game setup
- Recognition leverages known correct answer for improved accuracy
- Should work on Chrome 33+, Edge 79+, Safari 14.1+, Opera 27+
- Firefox NOT supported (no SpeechRecognition API)

**Next Steps:**
1. Test with actual users (kids of various ages)
2. Fine-tune confidence thresholds based on testing
3. Consider Phase 2: Chrome on-device recognition (Chrome 139+)
4. Consider Phase 3: Vosk-Browser for true offline support

---

### November 27, 2025 - Vosk Implementation

**Problem Discovered:**
- Web Speech API consistently failing with "network" errors
- The API requires internet connection to Google's servers
- Not suitable for offline-first PWA requirement

**Solution Implemented: Vosk-Browser**

Vosk-Browser provides **true offline speech recognition** using WebAssembly.

**Files Created/Modified:**
- ✅ `src/lib/vosk/vosk-service.ts` - Service for managing Vosk model
- ✅ `src/components/game/VoskSpeechInput.tsx` - New component using Vosk
- ✅ `src/app/(app)/play/page.tsx` - Updated to use VoskSpeechInput

**How It Works:**
1. First load downloads the Vosk model (~40MB) from Alphacephei CDN
2. Model is cached by browser for subsequent uses
3. All recognition happens locally via WebAssembly
4. No network calls needed after initial model download

**Model Used:**
- `vosk-model-small-en-us-0.15` (40MB compressed)
- Optimized for mobile/lightweight use
- Word Error Rate: ~10% on standard benchmarks
- Supports 16kHz audio input

**Architecture:**
```
User speaks → Microphone → AudioContext → ScriptProcessorNode
                                              ↓
                                    Vosk KaldiRecognizer
                                              ↓
                                    result/partialresult events
                                              ↓
                                    parseWithExpectedAnswer()
                                              ↓
                                    onAnswer callback
```

**Key Benefits:**
- ✅ Works completely offline (after model download)
- ✅ No network errors
- ✅ Privacy - audio never leaves device
- ✅ Lower latency than cloud APIs
- ✅ Works in any modern browser with WebAssembly

**Current Status:**
- Vosk integration complete
- Ready for testing

---

*This document should be updated as implementation progresses.*

