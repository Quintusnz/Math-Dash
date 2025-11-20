---
title: Accessibility Testing Procedures
description: Protocols for testing Math Dash accessibility compliance
feature: Accessibility
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ./guidelines.md
  - ./compliance.md
dependencies: []
status: approved
---

# Accessibility Testing Procedures

## Overview
To ensure Math Dash is inclusive for all children, we employ a rigorous testing strategy combining automated tools and manual verification.

## 1. Automated Testing

### Tools
- **Lighthouse (Chrome)**: Run audits on every build. Target score: 100.
- **axe-core**: Integrated into the CI/CD pipeline for unit tests.
- **ESLint plugin-jsx-a11y**: Static analysis for React/JSX code.

### Scope
- Color contrast ratios.
- Missing ARIA labels.
- Duplicate IDs.
- Heading hierarchy.

## 2. Manual Testing Checklist

### Keyboard Navigation
- [ ] **Tab Order**: Can you navigate through all interactive elements logically?
- [ ] **Focus Visible**: Is the focus indicator clearly visible on all elements?
- [ ] **No Traps**: Can you navigate into and *out of* all components (modals, games)?
- [ ] **Shortcuts**: Do custom shortcuts conflict with browser/screen reader keys?

### Screen Readers
**Test with**: NVDA (Windows), VoiceOver (Mac/iOS Web), TalkBack (Android Web).

- [ ] **Meaningful Content**: Do images have alt text? Do buttons have labels?
- [ ] **Dynamic Updates**: Are score changes and timer updates announced (politely)?
- [ ] **Feedback**: Is "Correct/Incorrect" feedback announced immediately?
- [ ] **Hidden Content**: Is off-screen content properly hidden (`aria-hidden`)?

### Zoom & Scaling
- [ ] **200% Zoom**: Does the layout break at 200% browser zoom?
- [ ] **Text Resizing**: Does the text scale without overlapping?

### Color & Motion
- [ ] **Grayscale Test**: Is the game playable in black and white? (Don't rely on color alone).
- [ ] **Reduced Motion**: Does the app respect `prefers-reduced-motion`?

## 3. User Testing
- Conduct sessions with children who have diverse abilities (if possible).
- Observe frustration points in navigation and gameplay.
