---
title: Curriculum Alignment – Accessibility
description: Accessibility considerations for curriculum progress features.
feature: curriculum-alignment
last-updated: 2025-12-04
version: 1.0.0
related-files:
  - ./README.md
  - ../../accessibility/guidelines.md
dependencies:
  - accessibility-guidelines
status: planned
---

# Curriculum Alignment – Accessibility

## Overview

All curriculum alignment features must meet WCAG 2.1 AA standards. This document outlines specific accessibility requirements for the curriculum progress UI.

## Country & Year Selection

### Keyboard Navigation
- All country options accessible via arrow keys
- Tab focuses on the selector, Enter/Space activates
- Year/Grade selector updates immediately when country changes

### Screen Reader Support
- Country selector announces: "Select your country. [Current selection]"
- Year selector announces: "Select year or grade. [Current selection], expected for ages [age range]"
- Auto-derived year should announce: "Year 3 selected based on age. Press Enter to change."

### Labels
- Clear visible labels for both selectors
- Helper text explains purpose: "This helps us show progress relevant to your local curriculum"

## Curriculum Status Badge

### Color Independence
- Status is never conveyed by color alone
- Icons accompany each status:
  - ✓ On Track (checkmark)
  - ⬆ Ahead (up arrow)
  - ⚡ Needs Focus (lightning bolt)
- Text label always present: "On Track", "Ahead", "Needs Focus"

### Contrast
- All three status variants meet 4.5:1 contrast ratio
- Works in both light and dark modes

## Skill Progress Grid

### Screen Reader Announcements
- Each skill card announces: "[Skill name]. [Proficiency status]. [Accuracy] percent accuracy."
- Core vs extension skills clearly distinguished: "Core skill" or "Extension skill" prefix
- Grid navigation: "Skill 3 of 10"

### Keyboard Navigation
- Grid navigable with arrow keys
- Tab moves between skill cards
- Enter opens skill detail modal

### Visual Design
- Proficiency indicators use patterns/icons, not just color
- Sufficient size for touch targets (minimum 44×44px)
- Clear focus indicators on hover/focus

## Progress Charts

### Alternative Text
- Progress bars have aria-valuenow, aria-valuemin, aria-valuemax
- Example: "Core skills progress: 7 of 10 proficient, 70 percent"
- Provide text summary for complex visualizations

### Screen Reader Summary
- Include hidden summary: "You have mastered 7 of 10 core skills for Year 3. Focus areas: 3 times table, 4 times table."

## Curriculum Detail View

### Heading Structure
- Clear heading hierarchy (h1: Child's Curriculum Progress, h2: Core Skills, h2: Extension Skills)
- Skip link to main content

### Focus Management
- Opening skill detail modal traps focus appropriately
- Closing modal returns focus to triggering element
- Page sections can be navigated with skip links

## Testing Checklist

- [ ] Test with VoiceOver (macOS/iOS)
- [ ] Test with NVDA (Windows)
- [ ] Test with keyboard only (no mouse)
- [ ] Verify color contrast with automated tools
- [ ] Test at 200% zoom
- [ ] Test with reduced motion preference
- [ ] Test with high contrast mode
