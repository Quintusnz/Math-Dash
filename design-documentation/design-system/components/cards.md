---
title: Cards
description: Specifications for content containers used for topics, profiles, and summaries
feature: Design System
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../tokens/colors.md
  - ../tokens/spacing.md
  - ../tokens/typography.md
dependencies: []
status: approved
---

# Cards

## Overview
Cards are the fundamental building blocks of the Math Dash UI. They group related information and actions, such as a Topic selection or a Player Profile.

## Variants

### 1. Topic Card
**Usage**: Selection of math topics (e.g., "2x Table").
**Visuals**:
- **Background**: `color-white` or `color-surface-raised`.
- **Border**: `1px solid color-neutral-200`.
- **Radius**: `radius-lg` (16px).
- **Shadow**: `shadow-sm`.
- **Content**: Icon/Illustration (Top/Left), Title (Bold), Progress Bar (Bottom).
**States**:
- **Hover**: Lift (`transform-y -4px`), `shadow-md`, Border `color-primary`.
- **Locked**: Overlay with Lock Icon, Grayscale, Opacity 80%.

### 2. Profile Card
**Usage**: User selection on launch.
**Visuals**:
- **Layout**: Vertical stack.
- **Content**: Large Avatar Circle, Name, Level/Badge.
- **Interaction**: Entire card is clickable.

### 3. Stat Card
**Usage**: Dashboard metrics (e.g., "Total Score", "Time Played").
**Visuals**:
- **Background**: `color-primary-light` (subtle tint).
- **Content**: Label (`text-caption`), Big Value (`text-h2`), Trend Icon.

### 4. Action Card / Game Mode
**Usage**: Selecting "Time Trial" vs "Practice".
**Visuals**:
- **Background**: Gradient or Solid Color.
- **Text**: White (high contrast).
- **Style**: Bold, poster-like appearance.

## Specifications

- **Padding**: `space-md` (16px) to `space-lg` (24px).
- **Corner Radius**: Consistent `radius-lg` (12px-16px) to feel friendly.
- **Borders**: Generally used to define edges on white backgrounds.

## Interaction

- **Clickable Area**: The entire card should be the touch target.
- **Feedback**: Visual ripple or scale effect on touch down.

## Accessibility

- **Focus**: The entire card should receive focus ring.
- **Screen Readers**: Read the card content as a coherent unit. Use `aria-labelledby` for the title.
- **Contrast**: Ensure text on colored cards meets 4.5:1.
