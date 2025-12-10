---
title: Buttons
description: Specifications for button components including variants, states, and usage
feature: Design System
last-updated: 2025-11-19
version: 1.0.0
related-files: 
  - ../tokens/colors.md
  - ../tokens/typography.md
  - ../tokens/spacing.md
dependencies: []
status: approved
---

# Buttons

## Overview
Buttons are the primary interactive elements in Ready Steady Math. They must be large, colorful, and tactile to appeal to children and ensure easy interaction on touch devices.

## Variants

### 1. Primary Button
**Usage**: The main action on a screen (e.g., "Play", "Start", "Submit").
**Visuals**:
- **Background**: `color-primary` (e.g., Bright Blue/Green)
- **Text**: `color-white`
- **Border**: None or subtle shade darker
- **Shadow**: `shadow-md` (elevated feel)

### 2. Secondary Button
**Usage**: Alternative actions (e.g., "Settings", "Back", "Retry").
**Visuals**:
- **Background**: `color-secondary-light` or `color-white`
- **Text**: `color-primary`
- **Border**: `2px solid color-primary`
- **Shadow**: `shadow-sm`

### 3. Ghost / Text Button
**Usage**: Low priority actions (e.g., "Cancel", "Skip").
**Visuals**:
- **Background**: Transparent
- **Text**: `color-neutral-600`
- **Border**: None
- **Shadow**: None

### 4. Game Action Button
**Usage**: Specific gameplay inputs (e.g., Answer Options).
**Visuals**:
- **Background**: `color-white`
- **Text**: `color-neutral-900` (Large)
- **Border**: `2px solid color-neutral-200`
- **Shadow**: `shadow-md`
- **Active/Selected**: Changes to `color-primary` or `color-accent`

## States

| State | Visual Change | Interaction |
|-------|---------------|-------------|
| **Default** | Standard styling | - |
| **Hover** | Brightness +10%, Lift (transform -2px) | Cursor: pointer |
| **Active** | Brightness -10%, Depress (transform +1px), Shadow reduced | Scale 0.98 |
| **Focus** | `ring-4` with `color-focus-ring` (Blue/Yellow) | - |
| **Disabled** | Opacity 50%, Grayscale, No shadow | Cursor: not-allowed |
| **Loading** | Text hidden, Spinner visible centered | Pointer events none |

## Sizes

| Size | Height | Padding X | Font Size | Icon Size |
|------|--------|-----------|-----------|-----------|
| **Small** | 32px | 12px | 14px | 16px |
| **Medium** | 48px | 24px | 16px | 20px |
| **Large** | 64px | 32px | 20px | 24px |
| **Jumbo** | 80px | 48px | 24px | 32px |

*Note: Jumbo size is specifically for main menu "Play" buttons.*

## Specifications

- **Border Radius**: `radius-full` (Pill shape) for Primary/Secondary. `radius-lg` (12px-16px) for Game Action buttons.
- **Typography**: `text-button` (Bold, slightly wide tracking).
- **Iconography**: Icons can be placed left or right of text with `space-xs` gap.

## Accessibility

- **Touch Target**: Minimum 44x44px (Mobile).
- **Contrast**: Text must maintain 4.5:1 contrast against background.
- **Labels**: Aria-label required if button contains only an icon.
- **Keyboard**: Full tab support with visible focus ring.

## Do's and Don'ts

- **Do** use the Primary button only once per view (usually).
- **Do** use consistent wording (Verb + Noun, e.g., "Start Game").
- **Don't** use two Primary buttons side-by-side.
- **Don't** make buttons look like non-interactive badges.
